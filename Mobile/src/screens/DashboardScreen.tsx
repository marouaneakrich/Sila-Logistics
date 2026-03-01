import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MapPin, Package, Star, Calendar, Clock, Home, ClipboardList, User } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import { COLORS, SIZES, FONTS } from '../theme';

export default function DashboardScreen({ navigation }: any) {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarContainer}>
                        {/* Avatar Placeholder */}
                        <View style={styles.avatar} />
                        <View style={styles.onlineStatus} />
                    </View>
                    <View>
                        <Text style={styles.statusText}>ONLINE</Text>
                        <Text style={styles.userName}>Ministère de la Transition Numérique et de la Réforme de l'Administration</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.notificationBtn}>
                    <Bell color={COLORS.textSecondary} size={24} />
                    <View style={styles.notificationBadge} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Package color={COLORS.primary} size={24} />
                        <Text style={styles.statLabel}>Total Pickups</Text>
                        <Text style={styles.statValue}>12</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Earnings</Text>
                        <Text style={styles.statValueEarnings}>$142.50</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Star color={COLORS.primary} size={24} fill={COLORS.primary} />
                        <Text style={styles.statLabel}>Rating</Text>
                        <Text style={styles.statValue}>4.9</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Available Pickups</Text>

                {/* Map Integration — tap to go fullscreen */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('Map')}
                    style={styles.mapContainer}
                >
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={{
                            latitude: 31.6295,
                            longitude: -7.9811,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        pitchEnabled={false}
                        rotateEnabled={false}
                    >
                        <Marker
                            coordinate={{ latitude: 31.6295, longitude: -7.9811 }}
                            title="Pickup Location"
                            description="Ourika Valley"
                        >
                            <View style={{ backgroundColor: COLORS.primary, padding: 5, borderRadius: 20 }}>
                                <MapPin color={COLORS.white} size={20} />
                            </View>
                        </Marker>
                    </MapView>
                    {/* Tap hint overlay */}
                    <View style={styles.mapOverlay}>
                        <Text style={styles.mapOverlayText}>Tap to expand map</Text>
                    </View>
                </TouchableOpacity>

                {/* Action Card */}
                <View style={styles.actionCard}>
                    <View style={styles.actionHeader}>
                        <View style={styles.tagContainer}>
                            <Text style={styles.tagText}>IMMEDIATE PICKUP</Text>
                        </View>
                        <Text style={styles.priceText}>$18.50</Text>
                    </View>

                    <Text style={styles.locationTitle}>Ourika Valley</Text>

                    <View style={styles.detailsRow}>
                        <MapPin size={20} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                        <View>
                            <Text style={styles.detailLabel}>Distance</Text>
                            <Text style={styles.detailValue}>2km away (15 mins)</Text>
                        </View>
                    </View>

                    <View style={styles.detailsRow}>
                        <Package size={20} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                        <View>
                            <Text style={styles.detailLabel}>Parcel Type</Text>
                            <Text style={styles.detailValue}>Large Box (12kg)</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.acceptBtn} onPress={() => navigation.navigate('Scanner')}>
                        <Text style={styles.acceptBtnText}>Accept Pickup</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.otherRequestsHeader}>
                    <Text style={styles.sectionTitleSmall}>Other nearby requests</Text>
                    <TouchableOpacity><Text style={styles.viewAllText}>View all</Text></TouchableOpacity>
                </View>

                <View style={styles.secondaryCard}>
                    <View style={styles.secondaryDetails}>
                        <MapPin size={20} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                        <View>
                            <Text style={styles.secondaryLocation}>Marrakech Plaza</Text>
                            <Text style={styles.secondaryDistance}>4.5km • Medium Parcel</Text>
                        </View>
                    </View>
                </View>

                {/* Make space for bottom nav */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
                    <Home color={COLORS.primary} size={24} />
                    <Text style={[styles.navText, { color: COLORS.primary }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Scanner')}>
                    <ClipboardList color={COLORS.textSecondary} size={24} />
                    <Text style={[styles.navText, { color: COLORS.textSecondary }]}>My Tasks</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                    <User color={COLORS.textSecondary} size={24} />
                    <Text style={[styles.navText, { color: COLORS.textSecondary }]}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
        paddingBottom: 20,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 12,
        position: 'relative',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.border,
    },
    onlineStatus: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderWidth: 2,
        borderColor: COLORS.background,
    },
    statusText: {
        ...FONTS.small,
        color: COLORS.primary,
        fontWeight: '700',
        marginBottom: 2,
    },
    userName: {
        ...FONTS.small,
        color: COLORS.text,
        fontWeight: '600',
        maxWidth: 200,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        position: 'relative',
    },
    notificationBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        position: 'absolute',
        top: 12,
        right: 12,
    },
    scrollContent: {
        paddingHorizontal: SIZES.padding,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: 16,
        alignItems: 'center',
        width: '31%',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statLabel: {
        ...FONTS.small,
        color: COLORS.textSecondary,
        marginTop: 8,
        marginBottom: 4,
    },
    statValue: {
        ...FONTS.h3,
        color: COLORS.text,
    },
    statValueEarnings: {
        ...FONTS.h3,
        color: COLORS.text,
        fontSize: 18,
    },
    sectionTitle: {
        ...FONTS.h2,
        color: COLORS.text,
        marginBottom: 16,
    },
    mapContainer: {
        height: 160,
        borderRadius: SIZES.radiusL,
        backgroundColor: COLORS.white,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    actionCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusL,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 24,
    },
    actionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tagContainer: {
        backgroundColor: '#FFF4E5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        ...FONTS.small,
        color: COLORS.secondary,
        fontWeight: '700',
    },
    priceText: {
        ...FONTS.h2,
        color: COLORS.primary,
    },
    locationTitle: {
        ...FONTS.h1,
        color: COLORS.text,
        marginBottom: 20,
        fontSize: 22,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailLabel: {
        ...FONTS.small,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    detailValue: {
        ...FONTS.body1,
        color: COLORS.text,
        fontWeight: '500',
    },
    acceptBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    acceptBtnText: {
        ...FONTS.h3,
        color: COLORS.white,
    },
    otherRequestsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitleSmall: {
        ...FONTS.body1,
        fontWeight: '600',
        color: COLORS.text,
    },
    viewAllText: {
        ...FONTS.body2,
        color: COLORS.primary,
        fontWeight: '500',
    },
    secondaryCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    secondaryDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    secondaryLocation: {
        ...FONTS.body1,
        color: COLORS.text,
        fontWeight: '500',
        marginBottom: 2,
    },
    secondaryDistance: {
        ...FONTS.small,
        color: COLORS.textSecondary,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    navItem: {
        alignItems: 'center',
    },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapOverlayText: {
        ...FONTS.body2,
        color: COLORS.white,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        fontWeight: '600',
    },
    navText: {
        ...FONTS.small,
        color: COLORS.textSecondary,
        marginTop: 6,
    }
});
