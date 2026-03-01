from fastapi import APIRouter, Request, Query, HTTPException, BackgroundTasks
from fastapi.responses import PlainTextResponse
from sqlalchemy import select
import os
import hmac
import hashlib
import json
from database import async_session
from models import User, Package, Booking, AuditLog
from services.ai_service import parse_user_message, generate_response
from services.pricing_service import calculate_price
from services.whatsapp_service import (
    send_whatsapp_message,
    download_media,
    upload_media,
    send_whatsapp_audio,
)
from services.voice_service import transcribe_audio, text_to_speech

router = APIRouter()

# In-memory cache to prevent processing the same webhook event multiple times
PROCESSED_MESSAGES = set()
MAX_PROCESSED_MESSAGES = 1000

STATES = {
    'START': 'START',
    'AWAITING_NAME': 'AWAITING_NAME',
    'AWAITING_CITY_FROM': 'AWAITING_CITY_FROM',
    'AWAITING_CITY_TO': 'AWAITING_CITY_TO',
    'AWAITING_PICKUP_ADDRESS': 'AWAITING_PICKUP_ADDRESS',
    'AWAITING_DELIVERY_ADDRESS': 'AWAITING_DELIVERY_ADDRESS',
    'AWAITING_DESCRIPTION': 'AWAITING_DESCRIPTION',
    'AWAITING_BOOKING_OPTION': 'AWAITING_BOOKING_OPTION',
}


async def send_reply(from_phone: str, text: str, reply_as_audio: bool = False):
    """Send reply as audio ONLY (if voice was used), or text ONLY."""
    if reply_as_audio:
        try:
            audio_path = await text_to_speech(text, lang="ar")
            if audio_path:
                media_id = await upload_media(audio_path)
                await send_whatsapp_audio(from_phone, media_id)
                # Clean up temp file
                os.unlink(audio_path)
                print(f"[Bot] 🔊 Audio reply sent to {from_phone}")
                return  # Skip sending the text message!
        except Exception as e:
            print(f"[Bot] ⚠️ Audio reply failed (falling back to text): {e}")

    # Default / Fallback: Send text
    await send_whatsapp_message(from_phone, text)


async def get_user_status_text(user_id: str, db) -> str:
    """Helper to fetch and format active package statuses."""
    stmt = select(Package).where(Package.userId == user_id).order_by(Package.createdAt.desc())
    result = await db.execute(stmt)
    packages = result.scalars().all()
    
    if not packages:
        return "ما لقينا حتى شي طلب مسجل بسميتك حاليا. 📦"
    
    text = "ها هو فين واصلين الطلبات ديالك: 🚚\n"
    for p in packages[:3]: # Show last 3
        status_map = {
            'PENDING': 'نتسناو التأكيد ⏳',
            'WAITING_FOR_GROUP': 'فالمغزن، كنتسناو الغروب 📦',
            'PICKED_UP': 'خداتو الشاحنة 🚚',
            'EN_ROUTE': 'عن طريق التوصيل 📍',
            'DELIVERED': 'وصل الحمد لله ✅',
        }
        status_txt = status_map.get(p.status, p.status)
        text += f"\n- طلب #{p.id}: من {p.cityFrom} لـ {p.cityTo} ({status_txt})"
    
    return text

async def handle_message(from_phone: str, body_text: str, reply_as_audio: bool = False):
    """Refactored: Intent-driven state machine."""
    try:
        await send_whatsapp_message(from_phone, "⏳ جاري التفكير...")
    except: pass

    async with async_session() as db:
        try:
            # 1. Get/Create User
            stmt = select(User).where(User.phone == from_phone)
            result = await db.execute(stmt)
            user = result.scalars().first()
            if not user:
                user = User(id=from_phone, phone=from_phone, conversationState=STATES['START'])
                db.add(user)
                # Audit log for new user
                log = AuditLog(action="New user registered", actorId=from_phone)
                db.add(log)
                await db.commit()
                await db.refresh(user)

            # 2. AI Parsing (Every Message)
            parsed = await parse_user_message(body_text)
            intent = parsed.intent
            print(f"[Bot] Detected Intent: {intent} (State: {user.conversationState})")

            # 3. Handle Global Intents (Status, Cancel, Price)
            if intent == 'status_inquiry':
                reply_text = await get_user_status_text(user.id, db)
                await send_reply(from_phone, reply_text, reply_as_audio)
                return

            if intent == 'cancel_order':
                user.conversationState = STATES['START']
                await db.commit()
                await send_reply(from_phone, "صافي، حبسنا الطلب. إلا بغيتي تبدا من جديد، غير كتب ليا. 🛑", reply_as_audio)
                return

            # 4. State Machine (with intent-driven transitions)
            reply_text = ""
            context = f"User: {user.fullName or 'Unknown'}. State: {user.conversationState}. From: {user.cityFrom or '?'} to {user.cityTo or '?'}"
            state = user.conversationState

            if state == STATES['START'] or intent == 'delivery_request':
                # Restart flow if they want to send something
                user.conversationState = STATES['AWAITING_NAME']
                reply_text = await generate_response(body_text, context, "Greet and ask for full name to start registration.")

            elif state == STATES['AWAITING_NAME']:
                user.fullName = body_text
                user.conversationState = STATES['AWAITING_CITY_FROM']
                reply_text = await generate_response(body_text, context, "Ask for the city they are sending FROM.")

            elif state == STATES['AWAITING_CITY_FROM']:
                user.cityFrom = parsed.city_from or body_text
                user.conversationState = STATES['AWAITING_CITY_TO']
                reply_text = await generate_response(body_text, context, "Ask for destination city.")

            elif state == STATES['AWAITING_CITY_TO']:
                user.cityTo = parsed.city_to or body_text
                user.conversationState = STATES['AWAITING_PICKUP_ADDRESS']
                reply_text = await generate_response(body_text, context, "Ask for specific pickup address neighborhood.")

            elif state == STATES['AWAITING_PICKUP_ADDRESS']:
                user.pickupAddress = parsed.pickup_address or body_text
                user.conversationState = STATES['AWAITING_DELIVERY_ADDRESS']
                reply_text = await generate_response(body_text, context, "Ask for delivery address.")

            elif state == STATES['AWAITING_DELIVERY_ADDRESS']:
                user.deliveryAddress = parsed.delivery_address or body_text
                user.conversationState = STATES['AWAITING_DESCRIPTION']
                reply_text = await generate_response(body_text, context, "Ask for parcel weight and if it is fragile.")

            elif state == STATES['AWAITING_DESCRIPTION']:
                weight = parsed.weight_kg or 2.0
                fragile = bool(parsed.fragile)
                
                solo_price = calculate_price({'cityFrom': user.cityFrom or '', 'cityTo': user.cityTo or '', 'weightKg': weight, 'fragile': fragile, 'type': 'SOLO'})
                group_price = calculate_price({'cityFrom': user.cityFrom or '', 'cityTo': user.cityTo or '', 'weightKg': weight, 'fragile': fragile, 'type': 'GROUP'})
                
                new_pkg = Package(
                    userId=user.id, weightKg=weight, fragile=fragile,
                    cityFrom=user.cityFrom or '', cityTo=user.cityTo or '',
                    pickupAddress=user.pickupAddress or '', deliveryAddress=user.deliveryAddress or '',
                    status='PENDING'
                )
                db.add(new_pkg)
                await db.flush()
                
                price_context = f"SOLO: {solo_price} MAD, GROUP: {group_price} MAD."
                reply_text = await generate_response(body_text, price_context, "Show prices and ask to choose 1 (Solo) or 2 (Group).")
                user.conversationState = STATES['AWAITING_BOOKING_OPTION']

            elif state == STATES['AWAITING_BOOKING_OPTION']:
                choice = 'SOLO' if ('1' in body_text or 'solo' in body_text.lower() or intent == 'solo_confirmation') else 'GROUP'
                stmt = select(Package).where(Package.userId == user.id).order_by(Package.createdAt.desc())
                res = await db.execute(stmt)
                last_pkg = res.scalars().first()
                
                if last_pkg:
                    cost = calculate_price({'cityFrom': last_pkg.cityFrom, 'cityTo': last_pkg.cityTo, 'weightKg': last_pkg.weightKg, 'fragile': last_pkg.fragile, 'type': choice})
                    booking = Booking(packageId=last_pkg.id, type=choice, estimatedCost=cost, status='CONFIRMED')
                    db.add(booking)
                    if choice == 'GROUP': last_pkg.status = 'WAITING_FOR_GROUP'
                    else: last_pkg.status = 'PENDING' # Confirmed but waiting for driver
                    
                    # Audit log for booking
                    log = AuditLog(action=f"Confirmed {choice} booking", actorId=user.id)
                    db.add(log)
                
                reply_text = await generate_response(body_text, f"Choice: {choice}", "Confirm booking and say goodbye.")
                user.conversationState = STATES['START']

            else:
                reply_text = await generate_response(body_text, context, "Introduce yourself and offer help.")
                user.conversationState = STATES['START']

            await db.commit()
        except Exception as e:
            print(f"[Bot] ❌ Error: {e}")
            import traceback; traceback.print_exc()
            await send_reply(from_phone, "سمح ليا، كاين واحد المشكل تقني. عاود صيفط ميساج عافاك. 🛠️", reply_as_audio)
            import traceback
            traceback.print_exc()


async def handle_audio_message(from_phone: str, audio_id: str):
    """Handle incoming voice message: transcribe → process → reply with audio."""
    try:
        print(f"[Bot] 🎤 Received voice message from {from_phone}, media_id: {audio_id}")

        # Send typing indicator
        await send_whatsapp_message(from_phone, "🎤 جاري الاستماع للرسالة الصوتية...")

        # Download the audio
        audio_bytes = await download_media(audio_id)

        # Transcribe
        transcribed_text = await transcribe_audio(audio_bytes)

        if not transcribed_text.strip():
            await send_whatsapp_message(from_phone, "⚠️ ما قدرتش نفهم الرسالة الصوتية. عاود حاول ولا كتب لينا. 📝")
            return

        print(f"[Bot] 🎤→📝 Transcribed: '{transcribed_text}'")

        # Process as normal text message, but reply with audio too
        await handle_message(from_phone, transcribed_text, reply_as_audio=True)

    except Exception as e:
        print(f"[Bot] ❌ Voice processing error: {e}")
        import traceback
        traceback.print_exc()
        await send_whatsapp_message(from_phone, "⚠️ مشكل فالرسالة الصوتية. عاود حاول ولا كتب لينا. 📝")


@router.post("/webhook")
async def webhook_post(request: Request, background_tasks: BackgroundTasks):
    print("[Webhook] ===== POST /webhook received =====")
    raw_body = await request.body()

    # Signature verification
    signature = request.headers.get("x-hub-signature-256")
    app_secret = os.getenv("WHATSAPP_APP_SECRET")
    if app_secret and signature:
        try:
            sha_name, sig_hash = signature.split("=", 1)
            if sha_name == "sha256":
                expected = hmac.new(app_secret.encode(), raw_body, hashlib.sha256).hexdigest()
                if not hmac.compare_digest(sig_hash, expected):
                    print("[Webhook] ⚠️ Signature mismatch (allowing for debug)")
        except Exception as e:
            print(f"[Webhook] Signature check error: {e}")

    try:
        body = json.loads(raw_body)
    except Exception:
        return {"error": "Invalid JSON"}

    print(f"[Webhook] object={body.get('object')}, entries={len(body.get('entry', []))}")

    if body.get("object") == "whatsapp_business_account" and "entry" in body:
        for entry in body["entry"]:
            for change in entry.get("changes", []):
                messages = change.get("value", {}).get("messages", [])
                for message in messages:
                    msg_id = message.get("id", "")
                    from_phone = message.get("from")
                    msg_type = message.get("type", "text")

                    print(f"[Webhook] 📨 Message type='{msg_type}' from={from_phone} id={msg_id}")
                    
                    if not msg_id or not from_phone:
                        continue

                    # Deduplicate: if we already processed this message ID, ignore it.
                    if msg_id in PROCESSED_MESSAGES:
                        print(f"[Webhook] ♻️ Duplicate message ignored: {msg_id}")
                        continue
                    
                    PROCESSED_MESSAGES.add(msg_id)
                    if len(PROCESSED_MESSAGES) > MAX_PROCESSED_MESSAGES:
                        # Simple LRU: clear cache if it grows too large
                        PROCESSED_MESSAGES.clear()

                    if msg_type == "audio" and message.get("audio", {}).get("id"):
                        audio_id = message["audio"]["id"]
                        print(f"[Webhook] 🎤 Voice message from {from_phone}, audio_id: {audio_id}")
                        background_tasks.add_task(handle_audio_message, from_phone, audio_id)

                    elif msg_type == "text":
                        text_body = message.get("text", {}).get("body")
                        if text_body:
                            print(f"[Webhook] 💬 Text from {from_phone}: '{text_body}'")
                            background_tasks.add_task(handle_message, from_phone, text_body)

                    else:
                        print(f"[Webhook] ⚠️ Unhandled message type: {msg_type}")

    return "EVENT_RECEIVED"


@router.get("/webhook")
async def webhook_get(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    print(f"[Webhook] GET verification: mode={hub_mode}")
    verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN")
    if hub_mode == "subscribe" and hub_verify_token == verify_token:
        print("[Webhook] ✅ Verification successful!")
        return PlainTextResponse(content=hub_challenge)
    print("[Webhook] ❌ Verification failed")
    raise HTTPException(status_code=403, detail="Forbidden")
