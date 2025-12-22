import api from './apiService';

export const notificationService = {
    // Get notifications with pagination and filters
    getNotifications: async (page = 1, limit = 20, filters?: { type?: string; read?: boolean }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        if (filters?.type) params.append('type', filters.type);
        if (filters?.read !== undefined) params.append('read', filters.read.toString());

        return api.get(`/notifications?${params.toString()}`);
    },

    // Get unread notification count
    getUnreadCount: async () => {
        return api.get('/notifications/unread-count');
    },

    // Mark notification as read
    markAsRead: async (notificationId: string) => {
        return api.put(`/notifications/${notificationId}/read`);
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        return api.put('/notifications/read-all');
    },

    // Delete notification
    deleteNotification: async (notificationId: string) => {
        return api.delete(`/notifications/${notificationId}`);
    },
};
