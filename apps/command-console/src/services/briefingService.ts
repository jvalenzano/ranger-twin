/**
 * Briefing Service
 *
 * Connects the Command Console to the RANGER API Gateway.
 * Handles:
 * 1. WebSocket connection for real-time briefing events.
 * 2. Chat queries to the Recovery Coordinator.
 * 3. Subscription management for UI components.
 */

import { AgentBriefingEvent } from '@/types/briefing';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

class BriefingService {
    private socket: WebSocket | null = null;
    private listeners: Set<(event: AgentBriefingEvent) => void> = new Set();
    private sessionId: string;
    private reconnectTimeout: number = 2000;
    private maxReconnectAttempts: number = 5;
    private reconnectAttempts: number = 0;

    constructor() {
        // Session ID should be persistent for a user session
        // In a real app, this would come from auth or a session store
        this.sessionId = localStorage.getItem('ranger_session_id') || this.generateSessionId();
        localStorage.setItem('ranger_session_id', this.sessionId);
    }

    private generateSessionId(): string {
        return Math.random().toString(36).substring(2, 15);
    }

    /**
     * Connect to the WebSocket
     */
    connect(): void {
        if (this.socket?.readyState === WebSocket.OPEN) return;

        const url = `${WS_BASE_URL}/ws/briefings/${this.sessionId}`;
        console.log(`[BriefingService] Connecting to ${url}`);

        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('[BriefingService] WebSocket Connected');
            this.reconnectAttempts = 0;
        };

        this.socket.onmessage = (message) => {
            try {
                const data = JSON.parse(message.data);

                // Handle heartbeat logic if needed (gateways sends ping)
                if (data.type === 'ping') {
                    this.socket?.send(JSON.stringify({ type: 'pong' }));
                    return;
                }

                // Assume it's an AgentBriefingEvent
                if (data.event_id) {
                    this.emit(data as AgentBriefingEvent);
                }
            } catch (error) {
                console.error('[BriefingService] Failed to parse message:', error);
            }
        };

        this.socket.onclose = (event) => {
            console.log(`[BriefingService] WebSocket Closed: ${event.code} ${event.reason}`);
            this.handleReconnect();
        };

        this.socket.onerror = (error) => {
            console.error('[BriefingService] WebSocket Error:', error);
        };
    }

    private handleReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[BriefingService] Reconnecting in ${this.reconnectTimeout}ms (Attempt ${this.reconnectAttempts})`);
            setTimeout(() => this.connect(), this.reconnectTimeout);
        }
    }

    /**
     * Subscribe to events
     */
    subscribe(callback: (event: AgentBriefingEvent) => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    private emit(event: AgentBriefingEvent): void {
        this.listeners.forEach((callback) => callback(event));
    }

    /**
     * Send a chat query to the Recovery Coordinator
     */
    async chat(query: string): Promise<string> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    query: query
                })
            });

            if (!response.ok) {
                throw new Error(`Chat request failed: ${response.status}`);
            }

            const data = await response.json();
            return data.answer;
        } catch (error) {
            console.error('[BriefingService] Chat error:', error);
            throw error;
        }
    }

    /**
     * Trigger a demo sequence from the backend
     */
    async triggerDemo(): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/ws/briefings/demo/${this.sessionId}`);
            if (!response.ok) {
                throw new Error(`Demo trigger failed: ${response.status}`);
            }
            console.log('[BriefingService] Demo sequence triggered');
        } catch (error) {
            console.error('[BriefingService] Demo error:', error);
        }
    }

    /**
   * Trigger burn analysis for a sector
   */
    async triggerBurnAnalysis(areaId: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/burn/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    area_id: areaId
                })
            });
            if (!response.ok) throw new Error(`Burn analysis failed: ${response.status}`);
        } catch (error) {
            console.error('[BriefingService] Burn analysis error:', error);
        }
    }

    /**
     * Trigger trail assessment
     */
    async triggerTrailAssessment(trailId: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/trail/assess`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    trail_id: trailId
                })
            });
            if (!response.ok) throw new Error(`Trail assessment failed: ${response.status}`);
        } catch (error) {
            console.error('[BriefingService] Trail assessment error:', error);
        }
    }

    /**
   * Trigger timber cruise assessment
   */
    async triggerTimberCruise(plotId: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/timber/cruise`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    plot_id: plotId
                })
            });
            if (!response.ok) throw new Error(`Timber cruise failed: ${response.status}`);
        } catch (error) {
            console.error('[BriefingService] Timber cruise error:', error);
        }
    }

    /**
     * Trigger NEPA review
     */
    async triggerNepaReview(projectId: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/nepa/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    project_id: projectId
                })
            });
            if (!response.ok) throw new Error(`NEPA review failed: ${response.status}`);
        } catch (error) {
            console.error('[BriefingService] NEPA review error:', error);
        }
    }

    getSessionId(): string {
        return this.sessionId;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

export const briefingService = new BriefingService();
export default briefingService;
