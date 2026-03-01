import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronRight,
    Settings,
    Truck,
    History,
    LogOut,
    Home,
    ClipboardList,
    User,
    Star,
    Package,
    Banknote
} from 'lucide-react-native';
import { COLORS, SIZES, FONTS } from '../theme';
import { mockDriver } from '../data/mockData';

export default function ProfileScreen({ navigation }: any) {
    const initials = mockDriver.name.split(' ').map(n => n[0]).join('');

    const menuItems = [
        { id: 'settings', title: 'Paramètres du compte', icon: <Settings size={20} color={COLORS.textSecondary} /> },
        { id: 'vehicle', title: 'Détails du véhicule', icon: <Truck size={20} color={COLORS.textSecondary} /> },
        { id: 'history', title: 'Historique des performances', icon: <History size={20} color={COLORS.textSecondary} /> },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.name}>{mockDriver.name}</Text>
                    <Text style={styles.email}>{mockDriver.email}</Text>

                    <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, mockDriver.isOnline ? styles.onlineDot : styles.offlineDot]} />
                        <Text style={styles.statusText}>{mockDriver.isOnline ? 'EN LIGNE' : 'HORS LIGNE'}</Text>
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#EBF5FF' }]}>
                            <Package size={20} color={COLORS.primary} />
                        </View>
                        <Text style={styles.statValue}>{mockDriver.totalPickups}</Text>
                        <Text style={styles.statLabel}>Livraisons</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#EBFFF1' }]}>
                            <Banknote size={20} color={COLORS.success} />
                        </View>
                        <Text style={styles.statValue}>{mockDriver.earnings.toFixed(0)} DH</Text>
                        <Text style={styles.statLabel}>Gains</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#FFF9EB' }]}>
                            <Star size={20} color="#FFB800" />
                        </View>
                        <Text style={styles.statValue}>{mockDriver.rating}</Text>
                        <Text style={styles.statLabel}>Score</Text>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIconWrapper}>
                                    {item.icon}
                                </View>
                                <Text style={styles.menuItemTitle}>{item.title}</Text>
                            </View>
                            <ChevronRight size={20} color={COLORS.border} />
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIconWrapper, { backgroundColor: '#FFF1F0' }]}>
                                <LogOut size={20} color="#F5222D" />
                            </View>
                            <Text style={[styles.menuItemTitle, { color: '#F5222D', fontWeight: 'bold' }]}>Déconnexion</Text>
                        </View>
                        <ChevronRight size={20} color={COLORS.border} />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
                    <Home color={COLORS.textSecondary} size={24} />
                    <Text style={[styles.navText, { color: COLORS.textSecondary }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Scanner')}>
                    <ClipboardList color={COLORS.textSecondary} size={24} />
                    <Text style={[styles.navText, { color: COLORS.textSecondary }]}>My Tasks</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                    <User color={COLORS.primary} size={24} />
                    <Text style={[styles.navText, { color: COLORS.primary }]}>Profile</Text>
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
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: COLORS.white,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    avatarText: {
        ...FONTS.h1,
        color: COLORS.white,
        fontSize: 40,
        fontWeight: '700',
    },
    name: {
        ...FONTS.h2,
        color: COLORS.text,
        marginBottom: 4,
    },
    email: {
        ...FONTS.body2,
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    onlineDot: {
        backgroundColor: COLORS.success,
    },
    offlineDot: {
        backgroundColor: COLORS.textSecondary,
    },
    statusText: {
        ...FONTS.small,
        color: COLORS.text,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        marginTop: -24,
    },
    statCard: {
        backgroundColor: COLORS.white,
        flex: 1,
        marginHorizontal: 4,
        padding: 16,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        ...FONTS.h3,
        color: COLORS.text,
        marginBottom: 2,
    },
    statLabel: {
        ...FONTS.small,
        color: COLORS.textSecondary,
    },
    menuContainer: {
        backgroundColor: COLORS.white,
        marginTop: 24,
        paddingHorizontal: SIZES.padding,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuItemTitle: {
        ...FONTS.body1,
        color: COLORS.text,
        fontWeight: '500',
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
        paddingBottom: 32,
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        ...FONTS.small,
        marginTop: 6,
    }
});
