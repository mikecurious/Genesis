/**
 * WebSocket Service for Real-Time Updates
 * Handles Socket.IO connections and real-time event broadcasting
 */

const socketIO = require('socket.io');

class WebSocketService {
    constructor() {
        this.io = null;
        this.userSockets = new Map(); // userId -> socketId mapping
    }

    /**
     * Initialize Socket.IO with HTTP server
     */
    initialize(server) {
        this.io = socketIO(server, {
            cors: {
                origin: process.env.CLIENT_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true
            },
            pingTimeout: 60000,
            pingInterval: 25000
        });

        this.setupEventHandlers();
        console.log('✅ WebSocket service initialized');
    }

    /**
     * Setup Socket.IO event handlers
     */
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Client connected: ${socket.id}`);

            // Handle user authentication
            socket.on('authenticate', (userId) => {
                if (userId) {
                    socket.userId = userId;
                    this.userSockets.set(userId, socket.id);
                    socket.join(`user:${userId}`); // Join user-specific room
                    console.log(`✅ User ${userId} authenticated with socket ${socket.id}`);

                    // Send connection confirmation
                    socket.emit('authenticated', { userId, socketId: socket.id });
                }
            });

            // Handle joining property-specific rooms
            socket.on('join_property', (propertyId) => {
                socket.join(`property:${propertyId}`);
                console.log(`📍 Socket ${socket.id} joined property room: ${propertyId}`);
            });

            // Handle leaving property rooms
            socket.on('leave_property', (propertyId) => {
                socket.leave(`property:${propertyId}`);
                console.log(`📍 Socket ${socket.id} left property room: ${propertyId}`);
            });

            // Handle chat messages
            socket.on('chat:message', (data) => {
                const { propertyId, message } = data;
                // Broadcast to property room
                socket.to(`property:${propertyId}`).emit('chat:new_message', message);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                if (socket.userId) {
                    this.userSockets.delete(socket.userId);
                    console.log(`❌ User ${socket.userId} disconnected`);
                }
                console.log(`❌ Client disconnected: ${socket.id}`);
            });

            // Handle errors
            socket.on('error', (error) => {
                console.error(`⚠️ Socket error for ${socket.id}:`, error);
            });
        });
    }

    /**
     * Send notification to specific user
     */
    sendNotificationToUser(userId, notification) {
        if (!this.io) {
            console.warn('WebSocket not initialized');
            return false;
        }

        this.io.to(`user:${userId}`).emit('notification:new', notification);
        console.log(`📬 Notification sent to user ${userId}:`, notification.title);
        return true;
    }

    /**
     * Broadcast notification to multiple users
     */
    broadcastNotification(userIds, notification) {
        if (!this.io) {
            console.warn('WebSocket not initialized');
            return false;
        }

        userIds.forEach(userId => {
            this.sendNotificationToUser(userId, notification);
        });
        return true;
    }

    /**
     * Send lead update to property owner
     */
    sendLeadUpdate(ownerId, lead) {
        if (!this.io) {
            console.warn('WebSocket not initialized');
            return false;
        }

        this.io.to(`user:${ownerId}`).emit('lead:new', lead);
        console.log(`📊 Lead update sent to owner ${ownerId}`);
        return true;
    }

    /**
     * Send property update to all viewers
     */
    sendPropertyUpdate(propertyId, update) {
        if (!this.io) {
            console.warn('WebSocket not initialized');
            return false;
        }

        this.io.to(`property:${propertyId}`).emit('property:updated', update);
        console.log(`🏠 Property update sent for ${propertyId}`);
        return true;
    }

    /**
     * Send chat message update
     */
    sendChatMessage(propertyId, message) {
        if (!this.io) {
            console.warn('WebSocket not initialized');
            return false;
        }

        this.io.to(`property:${propertyId}`).emit('chat:new_message', message);
        return true;
    }

    /**
     * Get online users count
     */
    getOnlineUsersCount() {
        return this.userSockets.size;
    }

    /**
     * Check if user is online
     */
    isUserOnline(userId) {
        return this.userSockets.has(userId);
    }

    /**
     * Get all connected sockets
     */
    getConnectedSockets() {
        if (!this.io) return [];
        return Array.from(this.io.sockets.sockets.keys());
    }
}

// Export singleton instance
module.exports = new WebSocketService();
