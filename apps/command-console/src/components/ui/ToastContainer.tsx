import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotificationStore, type NotificationType, type Notification } from '@/stores/notificationStore';

const TOAST_STYLES: Record<NotificationType, string> = {
    info: 'bg-[#0f172a] border-white/10 text-text-primary',
    success: 'bg-[#064e3b] border-safe/30 text-safe-light',
    warning: 'bg-[#78350f] border-warning/30 text-warning-light',
    error: 'bg-[#7f1d1d] border-severe/30 text-severe-light',
};

// Returns the icon element, optionally with custom color
const getToastIcon = (notification: Notification): React.ReactNode => {
    const { type, accentColor } = notification;

    // Use custom accent color if provided (for info type)
    if (type === 'info' && accentColor) {
        return <Info size={18} style={{ color: accentColor }} />;
    }

    // Default icons
    switch (type) {
        case 'info': return <Info size={18} className="text-accent-cyan" />;
        case 'success': return <CheckCircle size={18} className="text-safe" />;
        case 'warning': return <AlertTriangle size={18} className="text-warning" />;
        case 'error': return <AlertCircle size={18} className="text-severe" />;
    }
};

export const ToastContainer: React.FC = () => {
    const notifications = useNotificationStore((state) => state.notifications);
    const dismiss = useNotificationStore((state) => state.dismiss);

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            {notifications.map((n) => (
                <div
                    key={n.id}
                    className={`
                        pointer-events-auto flex items-center gap-3 min-w-[320px] max-w-[420px] p-4 rounded-lg border backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-right-10 duration-300
                        ${TOAST_STYLES[n.type]}
                    `}
                    style={n.accentColor ? { borderColor: `${n.accentColor}30` } : undefined}
                >
                    <div className="flex-shrink-0">{getToastIcon(n)}</div>
                    <p className="flex-1 text-[13px] font-medium leading-tight">{n.message}</p>
                    <button
                        onClick={() => dismiss(n.id)}
                        className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};
