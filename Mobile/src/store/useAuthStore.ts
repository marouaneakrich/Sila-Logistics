import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface AuthState {
    isLoggedIn: boolean;
    phone: string | null;
    driver: any | null;
    login: (phone: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isLoggedIn: false,
            phone: null,
            driver: null,
            login: async (phone) => {
                try {
                    const res = await api.post('/api/drivers/login', { phone });
                    if (res.data && res.data.id) {
                        set({ isLoggedIn: true, phone, driver: res.data });
                        return { success: true };
                    }
                    return { success: false, message: 'Invalid response from server' };
                } catch (error: any) {
                    console.error('Login error:', error);
                    const message = error.response?.data?.detail || 'Une erreur est survenue lors de la connexion';
                    return { success: false, message };
                }
            },
            logout: () => set({ isLoggedIn: false, phone: null, driver: null }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
