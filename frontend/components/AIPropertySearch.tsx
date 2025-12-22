import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getGreeting } from '../services/aiChatService';
import { ChatInput } from './ChatInput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  properties?: any[];
  suggestions?: string[];
}

export const AIPropertySearch: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get initial greeting
    const initGreeting = async () => {
      try {
        const result = await getGreeting();
        if (result.success) {
          setMessages([{
            id: 'greeting',
            role: 'assistant',
            text: result.message,
            suggestions: ['Show me apartments for rent in Westlands', 'I want to buy a 3-bedroom house', 'Find properties under 50,000 KSh']
          }]);
        }
      } catch (error) {
        console.error('Failed to get greeting:', error);
      }
    };

    initGreeting();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      text
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send to AI service
      const result = await sendChatMessage(text);

      // Add AI response
      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: result.message,
        properties: result.properties || [],
        suggestions: result.suggestions || []
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🏠 AI Property Search
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Ask me anything about properties in natural language
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto pb-32"
      >
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
                }`}
              >
                {/* Message Text */}
                <div className="whitespace-pre-wrap">{message.text}</div>

                {/* Properties */}
                {message.properties && message.properties.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {message.properties.map((property) => (
                      <div
                        key={property._id}
                        onClick={() => handlePropertyClick(property)}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex gap-3">
                          {/* Property Image */}
                          {property.imageUrls && property.imageUrls[0] && (
                            <img
                              src={property.imageUrls[0]}
                              alt={property.title}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          )}

                          {/* Property Info */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {property.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              📍 {property.location}
                            </p>
                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                              💰 {property.price}
                            </p>
                            {property.bedrooms && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                🛏️ {property.bedrooms} bed • 🚿 {property.bathrooms} bath
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                      Suggestions:
                    </p>
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-sm px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder="Ask about properties, like 'Show me 2-bedroom apartments in Kilimani'"
      />

      {/* Property Details Modal */}
      {selectedProperty && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProperty(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Property Image */}
            {selectedProperty.imageUrls && selectedProperty.imageUrls[0] && (
              <img
                src={selectedProperty.imageUrls[0]}
                alt={selectedProperty.title}
                className="w-full h-64 object-cover rounded-t-2xl"
              />
            )}

            <div className="p-6">
              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedProperty.title}
              </h2>

              {/* Location & Price */}
              <div className="flex items-center gap-4 mb-4">
                <p className="text-gray-600 dark:text-gray-400">
                  📍 {selectedProperty.location}
                </p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedProperty.price}
                </p>
              </div>

              {/* Details */}
              {selectedProperty.bedrooms && (
                <div className="flex gap-4 mb-4">
                  <span className="text-gray-700 dark:text-gray-300">
                    🛏️ {selectedProperty.bedrooms} Bedrooms
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    🚿 {selectedProperty.bathrooms} Bathrooms
                  </span>
                  {selectedProperty.propertyType && (
                    <span className="text-gray-700 dark:text-gray-300">
                      🏠 {selectedProperty.propertyType}
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {selectedProperty.description}
              </p>

              {/* Amenities */}
              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    ✨ Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {selectedProperty.createdBy && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Contact
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>{selectedProperty.createdBy.role}:</strong> {selectedProperty.createdBy.name}
                  </p>
                  {selectedProperty.createdBy.phone && (
                    <p className="text-gray-700 dark:text-gray-300">
                      📞 {selectedProperty.createdBy.phone}
                    </p>
                  )}
                  {selectedProperty.createdBy.email && (
                    <p className="text-gray-700 dark:text-gray-300">
                      ✉️ {selectedProperty.createdBy.email}
                    </p>
                  )}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedProperty(null)}
                className="mt-6 w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
