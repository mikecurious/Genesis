/**
 * Frontend WebSocket Client Service
 * Manages Socket.IO connection and real-time event handling
 */

import { io, Socket } from 'socket.io-client';

class WebSocketClient {
    private socket: Socket | null = null;
    private userId: string | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private listeners: Map<string, Set<Function>> = new Map();

    /**
     * Initialize WebSocket connection
     */
    connect(userId: string) {
        if (this.socket?.connected) {
            console.log('✅ WebSocket already connected');
            return;
        }

        this.userId = userId;
        const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        this.socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        this.setupEventHandlers();
        this.authenticate();
    }

    /**
     * Setup Socket.IO event handlers
     */
    private setupEventHandlers() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('🔌 WebSocket connected:', this.socket?.id);
            this.reconnectAttempts = 0;
            this.authenticate();
            this.emit('connection:status', { connected: true });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
            this.emit('connection:status', { connected: false, reason });
        });

        this.socket.on('connect_error', (error) => {
            console.error('⚠️ WebSocket connection error:', error);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('❌ Max reconnection attempts reached');
                this.emit('connection:failed', { error: 'Max reconnection attempts reached' });
            }
        });

        this.socket.on('authenticated', (data) => {
            console.log('✅ WebSocket authenticated:', data);
            this.emit('authenticated', data);
        });

        // Real-time event listeners
        this.socket.on('notification:new', (notification) => {
            console.log('📬 New notification received:', notification);
            this.emit('notification:new', notification);
        });

        this.socket.on('lead:new', (lead) => {
            console.log('📊 New lead received:', lead);
            this.emit('lead:new', lead);
        });

        this.socket.on('property:updated', (update) => {
            console.log('🏠 Property updated:', update);
            this.emit('property:updated', update);
        });

        this.socket.on('chat:new_message', (message) => {
            console.log('💬 New chat message:', message);
            this.emit('chat:new_message', message);
        });
    }

    /**
     * Authenticate user with server
     */
    private authenticate() {
        if (this.socket && this.userId) {
            this.socket.emit('authenticate', this.userId);
        }
    }

    /**
     * Join a property room
     */
    joinProperty(propertyId: string) {
        if (this.socket?.connected) {
            this.socket.emit('join_property', propertyId);
            console.log(`📍 Joined property room: ${propertyId}`);
        }
    }

    /**
     * Leave a property room
     */
    leaveProperty(propertyId: string) {
        if (this.socket?.connected) {
            this.socket.emit('leave_property', propertyId);
            console.log(`📍 Left property room: ${propertyId}`);
        }
    }

    /**
     * Send chat message
     */
    sendChatMessage(propertyId: string, message: any) {
        if (this.socket?.connected) {
            this.socket.emit('chat:message', { propertyId, message });
        }
    }

    /**
     * Subscribe to events
     */
    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback);

        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }

    /**
     * Emit event to listeners
     */
    private emit(event: string, data: any) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.userId = null;
            this.listeners.clear();
            console.log('❌ WebSocket disconnected manually');
        }
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            connected: this.isConnected(),
            socketId: this.socket?.id,
            userId: this.userId,
            reconnectAttempts: this.reconnectAttempts,
        };
    }
}

// Export singleton instance
export const websocketClient = new WebSocketClient();
