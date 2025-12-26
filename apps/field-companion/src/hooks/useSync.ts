import { useState, useEffect } from 'react';
import { syncService, type SyncPacket } from '@/services/syncService';

export const useSync = () => {
    const [packets, setPackets] = useState<SyncPacket[]>([]);

    useEffect(() => {
        return syncService.subscribe((newPackets: SyncPacket[]) => {
            setPackets(newPackets);
        });
    }, []);

    const pendingCount = packets.filter(p => p.status === 'PENDING').length;
    const syncedCount = packets.filter(p => p.status === 'SYNCED').length;
    const isSyncing = packets.some(p => p.status === 'PENDING');

    return {
        packets,
        pendingCount,
        syncedCount,
        isSyncing,
        clearSynced: () => syncService.clearSynced(),
        syncAll: () => syncService.syncAll(),
    };
};
