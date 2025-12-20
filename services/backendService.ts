import { Listing, User, UserRole } from '../types';

// Use relative URL to leverage Vite's proxy configuration
// In development: Vite proxy forwards /api to http://localhost:5000/api
// In production: This will use the same domain as the frontend
const API_URL = '/api';

// Helper to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const backendService = {
    // Auth
    async login(email: string, password: string): Promise<{ token: string, user: User }> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        return data;
    },

    async register(userData: any): Promise<{ token: string, user: User }> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Registration failed');
        return data;
    },

    async getMe(): Promise<{ user: User }> {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { ...getAuthHeader() }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch user');
        return data;
    },

    // Properties
    async getProperties(filters: any = {}): Promise<Listing[]> {
        // Convert filters to query string
        const queryParams = new URLSearchParams();
        if (filters.location) queryParams.append('location', filters.location);
        if (filters.minPrice) queryParams.append('price[gte]', filters.minPrice);
        if (filters.maxPrice) queryParams.append('price[lte]', filters.maxPrice);
        if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms);

        const response = await fetch(`${API_URL}/properties?${queryParams.toString()}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch properties');

        // Map backend property to frontend Listing type
        return data.data.map((p: any) => ({
            id: p._id,
            title: p.title,
            description: p.description,
            location: p.location,
            price: p.price,
            imageUrls: p.imageUrls,
            bedrooms: p.bedrooms || 0, // Assuming backend has this or we default
            bathrooms: p.bathrooms || 0,
            amenities: p.amenities || [],
            agent: {
                name: 'Agent', // Backend might populate this
                contact: 'Contact',
                image: 'default-agent.jpg'
            },
            isPromoted: p.boosted === true
        }));
    },

    async createProperty(propertyData: FormData): Promise<Listing> {
        const response = await fetch(`${API_URL}/properties`, {
            method: 'POST',
            headers: { ...getAuthHeader() }, // Don't set Content-Type for FormData
            body: propertyData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create property');
        return data.data;
    },

    // Users (for Admin/Agent)
    async getUsers(): Promise<User[]> {
        const response = await fetch(`${API_URL}/users`, {
            headers: { ...getAuthHeader() }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch users');
        return data.data;
    }
};
