/**
 * Notification Store - Custom Zustand-based toast system
 * 
 * Provides a lightweight, zero-dependency notification system for RANGER.
 * Consistent with existing store patterns.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    duration?: number;
    accentColor?: string; // Optional custom color for the icon (hex value)
}

interface NotificationState {
    notifications: Notification[];

    // Actions
    notify: (message: string, type?: NotificationType, duration?: number, accentColor?: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number, accentColor?: string) => void;
    dismiss: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
    devtools(
        (set, get) => ({
            notifications: [],

            notify: (message, type = 'info', duration = 2500, accentColor) => {
                const id = Math.random().toString(36).substring(2, 9);
                const newNotification: Notification = { id, message, type, duration, accentColor };

                set((state) => ({
                    notifications: [...state.notifications, newNotification],
                }));

                // Auto-dismiss if duration is set
                if (duration > 0) {
                    setTimeout(() => {
                        get().dismiss(id);
                    }, duration);
                }
            },

            success: (message, duration) => get().notify(message, 'success', duration ?? 3000),
            error: (message, duration) => get().notify(message, 'error', duration ?? 5000),
            info: (message, duration, accentColor) => get().notify(message, 'info', duration ?? 2500, accentColor),

            dismiss: (id) => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }));
            },
        }),
        { name: 'notification-store' }
    )
);
