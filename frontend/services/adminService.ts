import api from './apiService';

export const adminService = {
    // Analytics
    async getAnalytics() {
        const response = await api.get('/api/admin/analytics');
        return response.data;
    },

    async getActivityLogs() {
        const response = await api.get('/api/admin/activity');
        return response.data;
    },

    // User Management
    async getAllUsers() {
        const response = await api.get('/api/admin/users');
        return response.data;
    },

    async updateUser(userId: string, updates: any) {
        const response = await api.put(`/api/admin/users/${userId}`, updates);
        return response.data;
    },

    async deleteUser(userId: string) {
        const response = await api.delete(`/api/admin/users/${userId}`);
        return response.data;
    },

    async suspendUser(userId: string, reason?: string) {
        const response = await api.post(`/api/admin/users/${userId}/suspend`, { reason });
        return response.data;
    },

    async reactivateUser(userId: string) {
        const response = await api.post(`/api/admin/users/${userId}/reactivate`);
        return response.data;
    },

    async verifyUser(userId: string) {
        const response = await api.post(`/api/admin/users/${userId}/verify`);
        return response.data;
    },

    // Property Management
    async getAllProperties() {
        const response = await api.get('/api/admin/properties');
        return response.data;
    },

    async moderateProperty(propertyId: string, action: 'approve' | 'reject' | 'flag', note?: string) {
        const response = await api.post(`/api/admin/properties/${propertyId}/moderate`, { action, note });
        return response.data;
    },

    async deleteProperty(propertyId: string) {
        const response = await api.delete(`/api/admin/properties/${propertyId}`);
        return response.data;
    },

    // Lead Management
    async getAllLeads() {
        const response = await api.get('/api/admin/leads');
        return response.data;
    },

    // System Operations
    async sendAnnouncement(message: string) {
        const response = await api.post('/api/admin/announcements', { message });
        return response.data;
    },

    async createSurveyor(data: { name: string; email: string; password: string; phone?: string }) {
        const response = await api.post('/api/admin/create-surveyor', data);
        return response.data;
    },
};
