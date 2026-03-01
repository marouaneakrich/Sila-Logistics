import { create } from 'zustand';
import { API_BASE_URL } from '../config/api';

export interface Task {
    id: number;
    cityFrom: string;
    cityTo: string;
    pickupAddress: string;
    deliveryAddress: string;
    weightKg: number;
    fragile: boolean;
    status: string;
    createdAt: string;
}

interface TaskState {
    tasks: Task[];
    loading: boolean;
    fetchTasks: (driverId: string) => Promise<void>;
    pendingCount: () => number;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    loading: false,
    fetchTasks: async (driverId: string) => {
        set({ loading: true });
        try {
            const response = await fetch(`${API_BASE_URL}/api/drivers/${driverId}/tasks`);
            if (response.ok) {
                const data = await response.json();
                set({ tasks: Array.isArray(data) ? data : [], loading: false });
            } else {
                set({ loading: false });
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            set({ loading: false });
        }
    },
    pendingCount: () => get().tasks.filter(t => t.status !== 'DELIVERED').length,
}));
