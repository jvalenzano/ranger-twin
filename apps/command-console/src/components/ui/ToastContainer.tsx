import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotificationStore, type NotificationType } from '@/stores/notificationStore';

const TOAST_STYLES: Record<NotificationType, string> = {
    info: 'bg-[#0f172a] border-accent-cyan/20 text-text-primary',
    success: 'bg-[#064e3b] border-safe/30 text-safe-light',
    warning: 'bg-[#78350f] border-warning/30 text-warning-light',
    error: 'bg-[#7f1d1d] border-severe/30 text-severe-light',
};

const TOAST_ICONS: Record<NotificationType, React.ReactNode> = {
    info: <Info size={18} className="text-accent-cyan" />,
    success: <CheckCircle size={18} className="text-safe" />,
    warning: <AlertTriangle size={18} className="text-warning" />,
    error: <AlertCircle size={18} className="text-severe" />,
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
                >
                    <div className="flex-shrink-0">{TOAST_ICONS[n.type]}</div>
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
