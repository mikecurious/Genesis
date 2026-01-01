
import axios from 'axios';
import type { User, Listing, Tenant, MaintenanceRequest, Lead } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.baseURL + config.url,
        hasToken: !!token,
        headers: config.headers
    });
    return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.data);
        return response;
    },
    (error) => {
        console.error('API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

// Auth Service
export const authService = {
    register: async (userData: { name: string; email: string; password: string; phone: string }) => {
        return api.post('/api/auth/register', userData);
    },
    verify: async (data: { email: string; otp: string }) => {
        return api.post('/api/auth/verify', data);
    },
    setupAccount: async (data: { role: string; plan: string }, token: string) => {
        return api.put('/api/auth/setup', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    signup: async (userData: any) => {
        return api.post('/api/auth/signup', userData);
    },
    login: async (credentials: { email: string; password: string }) => {
        return api.post('/api/auth/login', credentials);
    },
    getMe: async () => {
        return api.get('/api/auth/me');
    },
    googleSignIn: async (credential: string) => {
        return api.post('/api/auth/google', { credential });
    },
    forgotPassword: async (email: string) => {
        return api.post('/api/auth/forgot-password', { email });
    },
    resetPassword: async (token: string, newPassword: string) => {
        return api.post('/api/auth/reset-password', { token, newPassword });
    },
};

// User Service
export const userService = {
    getTenants: async () => {
        return api.get('/api/tenants/my-tenants');
    },
    inviteTenant: async (tenantData: any) => {
        return api.post('/api/tenants/add', tenantData);
    },
    updateProfile: async (userId: string, updates: Partial<User>) => {
        return api.put(`/api/users/${userId}`, updates);
    },
};

// Property Service
export const propertyService = {
    getProperties: async () => {
        return api.get('/api/properties');
    },
    createProperty: async (propertyData: any) => {
        const formData = new FormData();

        // Append text fields
        Object.keys(propertyData).forEach(key => {
            if (key !== 'images') {
                formData.append(key, propertyData[key]);
            }
        });

        // Append images
        if (propertyData.images && propertyData.images.length > 0) {
            propertyData.images.forEach((image: File) => {
                formData.append('imageUrls', image);
            });
        }

        return api.post('/api/properties', formData);
    },
    updateProperty: async (propertyId: string, updates: Partial<Omit<Listing, 'id' | 'imageUrls'>>) => {
        return api.put(`/api/properties/${propertyId}`, updates);
    },
    deleteProperty: async (propertyId: string) => {
        return api.delete(`/api/properties/${propertyId}`);
    },
};

// Maintenance Service
export const maintenanceService = {
    getRequests: async () => {
        return api.get('/api/maintenance');
    },
    createRequest: async (requestData: { description: string }) => {
        return api.post('/api/maintenance', requestData);
    },
};

// Lead Service
export const leadService = {
    getLeads: async (filters?: { status?: string; dealType?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.dealType) params.append('dealType', filters.dealType);

        return api.get(`/api/leads?${params.toString()}`);
    },
    getLeadById: async (leadId: string) => {
        return api.get(`/api/leads/${leadId}`);
    },
    updateLead: async (leadId: string, updates: { status?: string; notes?: string }) => {
        return api.put(`/api/leads/${leadId}`, updates);
    },
    deleteLead: async (leadId: string) => {
        return api.delete(`/api/leads/${leadId}`);
    },
    getLeadStats: async () => {
        return api.get('/api/leads/stats');
    },
};

// Notification API Service (for backend notifications)
export const notificationApiService = {
    getNotifications: async (page: number = 1, limit: number = 10) => {
        return api.get(`/api/notifications?page=${page}&limit=${limit}`);
    },
    getUnreadCount: async () => {
        return api.get('/api/notifications/unread-count');
    },
    markAsRead: async (notificationId: string) => {
        return api.put(`/api/notifications/${notificationId}/read`);
    },
    markAllAsRead: async () => {
        return api.put('/api/notifications/mark-all-read');
    },
};

export default api;
