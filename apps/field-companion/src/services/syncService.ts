export interface SyncPacket {
    id: string;
    type: 'TELEMETRY' | 'VOICE_NOTE' | 'DETECTION';
    timestamp: string;
    payload: any;
    status: 'PENDING' | 'SYNCED' | 'FAILED';
}

class SyncService {
    private queue: SyncPacket[] = [];
    private listeners: ((packets: SyncPacket[]) => void)[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        const saved = localStorage.getItem('ranger_sync_queue');
        if (saved) {
            try {
                this.queue = JSON.parse(saved);
            } catch (e) {
                console.error('[SyncService] Failed to load queue:', e);
            }
        }
    }

    private saveToStorage() {
        localStorage.setItem('ranger_sync_queue', JSON.stringify(this.queue));
        this.notify();
    }

    private notify() {
        this.listeners.forEach(fn => fn([...this.queue]));
    }

    public subscribe(fn: (packets: SyncPacket[]) => void) {
        this.listeners.push(fn);
        fn([...this.queue]);
        return () => {
            this.listeners = this.listeners.filter(l => l !== l);
        };
    }

    public enqueue(type: SyncPacket['type'], payload: any) {
        const packet: SyncPacket = {
            id: `pkt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            timestamp: new Date().toISOString(),
            payload,
            status: 'PENDING',
        };
        this.queue.push(packet);
        this.saveToStorage();

        // Auto-trigger sync if "online" (demo simulation)
        if (Math.random() > 0.3) {
            this.syncAll();
        }
    }

    public async syncAll() {
        const pending = this.queue.filter(p => p.status !== 'SYNCED');
        if (pending.length === 0) return;

        // Simulate network latency
        await new Promise(r => setTimeout(r, 1500));

        this.queue = this.queue.map(p => {
            if (p.status === 'PENDING') {
                return { ...p, status: 'SYNCED' };
            }
            return p;
        });

        this.saveToStorage();
    }

    public clearSynced() {
        this.queue = this.queue.filter(p => p.status !== 'SYNCED');
        this.saveToStorage();
    }
}

export const syncService = new SyncService();
