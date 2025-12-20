import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/ai-chat`;

export interface PropertySearchResult {
  success: boolean;
  message: string;
  properties?: any[];
  count?: number;
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: string;
    location?: string;
    priceType?: string;
  };
  suggestions?: string[];
  type?: 'greeting' | 'help' | 'search' | 'acknowledgment';
}

export interface PropertyDetailsResult {
  success: boolean;
  message: string;
  property?: any;
  contactInfo?: {
    agent: string;
    role: string;
    email?: string;
    phone?: string;
  };
}

/**
 * Send a message to the AI chat service
 */
export const sendChatMessage = async (message: string): Promise<PropertySearchResult> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/message`, { message });
    return response.data;
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to connect to AI service. Please try again.',
      properties: [],
      count: 0,
      suggestions: ['Try refreshing the page', 'Check your internet connection']
    };
  }
};

/**
 * Search for properties using natural language
 */
export const searchProperties = async (query: string): Promise<PropertySearchResult> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/search`, { query });
    return response.data;
  } catch (error: any) {
    console.error('Property Search Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to search properties. Please try again.',
      properties: [],
      count: 0
    };
  }
};

/**
 * Get AI greeting message
 */
export const getGreeting = async (): Promise<PropertySearchResult> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/greeting`);
    return response.data;
  } catch (error: any) {
    console.error('Greeting Error:', error);
    return {
      success: false,
      message: 'Hello! I can help you find properties. What are you looking for?'
    };
  }
};

/**
 * Get property details with AI assistance
 */
export const getPropertyDetails = async (propertyId: string): Promise<PropertyDetailsResult> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/property/${propertyId}`);
    return response.data;
  } catch (error: any) {
    console.error('Property Details Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get property details.'
    };
  }
};

/**
 * Get conversation context (requires authentication)
 */
export const getConversationContext = async (token: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/context`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    console.error('Context Error:', error);
    return { success: false, context: null };
  }
};

/**
 * Clear conversation context (requires authentication)
 */
export const clearConversationContext = async (token: string): Promise<any> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/context`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    console.error('Clear Context Error:', error);
    return { success: false };
  }
};

/**
 * Format property data for display
 */
export const formatPropertyForChat = (property: any): string => {
  let text = `**${property.title}**\n\n`;
  text += `📍 **Location:** ${property.location}\n`;
  text += `💰 **Price:** ${property.price}`;

  if (property.priceType === 'rental') {
    text += ' per month';
  }
  text += '\n\n';

  if (property.bedrooms) {
    text += `🛏️ **Bedrooms:** ${property.bedrooms}\n`;
  }
  if (property.bathrooms) {
    text += `🚿 **Bathrooms:** ${property.bathrooms}\n`;
  }
  if (property.propertyType) {
    text += `🏠 **Type:** ${property.propertyType}\n`;
  }

  text += `\n${property.description}\n`;

  if (property.amenities && property.amenities.length > 0) {
    text += `\n✨ **Amenities:** ${property.amenities.join(', ')}`;
  }

  return text;
};
