import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppTheme } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ParcelPickupScreen from '../screens/ParcelPickupScreen';
import DeliverySuccessScreen from '../screens/DeliverySuccessScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
    Login: undefined;
    Dashboard: undefined;
    Scanner: undefined;
    ParcelPickup: undefined;
    DeliverySuccess: undefined;
    Map: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer theme={AppTheme}>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="Scanner" component={ScannerScreen} />
                <Stack.Screen name="ParcelPickup" component={ParcelPickupScreen} />
                <Stack.Screen name="DeliverySuccess" component={DeliverySuccessScreen} />
                <Stack.Screen name="Map" component={MapScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
