import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from database import async_session, engine, Base
from models import Driver

async def seed():
    async with engine.begin() as conn:
        # This will create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)
    
    async with async_session() as session:
        # Check if test driver already exists
        from sqlalchemy import select
        stmt = select(Driver).where(Driver.phone == "0123456789")
        result = await session.execute(stmt)
        if result.scalar_one_or_none():
            print("Test driver already exists.")
            return

        test_driver = Driver(
            id=str(uuid.uuid4()),
            phone="0123456789",
            fullName="Youssef Labnine",
            vehicleInfo="Renault Kangoo",
            isActive=True,
            earnings=142.50,
            rating=4.9
        )
        session.add(test_driver)
        await session.commit()
        print(f"Test driver created: {test_driver.fullName} ({test_driver.phone})")

if __name__ == "__main__":
    asyncio.run(seed())
