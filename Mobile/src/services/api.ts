import axios from 'axios';

// For Android emulator, localhost is 10.0.2.2.
// For iOS/Physical devices, use your computer's local IP.
export const API_BASE_URL = 'http://10.0.2.2:3002'; // Default for Android emulator

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
