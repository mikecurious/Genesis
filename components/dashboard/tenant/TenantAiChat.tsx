
import React, { useState } from 'react';
import { type Tenant, type MaintenanceRequest, Role } from '../../../types';
import { generateTenantChatResponse } from '../../../services/geminiService';
import { ChatInput } from '../../ChatInput';
import { ChatMessage } from '../../ChatMessage';

interface TenantAiChatProps {
    tenant: Tenant;
    maintenanceRequests: MaintenanceRequest[];
}

export const TenantAiChat: React.FC<TenantAiChatProps> = ({ tenant, maintenanceRequests }) => {
    const [messages, setMessages] = useState<{ id: string; role: Role; text: string; }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (text: string) => {
        const userMessage = { id: Date.now().toString(), role: Role.USER, text };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const responseText = await generateTenantChatResponse(text, tenant, maintenanceRequests);
            const aiMessage = { id: (Date.now() + 1).toString(), role: Role.MODEL, text: responseText };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage = { id: (Date.now() + 1).toString(), role: Role.MODEL, text: "I'm having trouble connecting right now." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative h-full min-h-[60vh] flex flex-col bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex-1 overflow-y-auto pb-24">
                {messages.length === 0 && (
                    <div className="text-center p-8 text-gray-500">
                        <p>Welcome! Ask me anything about your tenancy, payments, or maintenance requests.</p>
                    </div>
                )}
                {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                {isLoading && <ChatMessage message={{ id: 'loading', role: Role.MODEL, text: '...' }} isLoading={true} />}
            </div>
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} placeholder="Ask a question..." />
        </div>
    );
};
