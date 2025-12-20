
import React from 'react';
import { type Message, type Listing, Role } from '../../../types';
import { UserIcon } from '../../icons/UserIcon';
import { AiIcon } from '../../icons/AiIcon';
import { AgentChatInput } from '../AgentChatInput';

interface OwnerClientChatProps {
    interactionChats: Record<string, Message[]>;
    listings: Listing[];
    humanTakeoverChats: Record<string, boolean>;
    onTakeoverChat: (propertyId: string) => void;
    onSendAgentMessage: (propertyId: string, text: string) => void;
}

const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
    if (message.isSystemMessage) {
        return (
            <div className="text-center my-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">{message.text}</p>
            </div>
        )
    }

    return (
        <div className={`flex items-start gap-2.5 my-2 ${message.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
            {message.role === Role.MODEL && (
                <div className="w-6 h-6 flex-shrink-0 rounded-full bg-indigo-500 flex items-center justify-center self-start">
                    <AiIcon className="h-4 w-4" />
                </div>
            )}
            <div className="flex flex-col">
                 {message.senderName && message.role === Role.MODEL && (
                     <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-0.5">{message.senderName}</p>
                 )}
                <div className={`flex flex-col gap-1 max-w-[320px] leading-1.5 p-2 border-gray-200 dark:border-gray-700 ${
                    message.role === Role.USER 
                    ? 'bg-blue-100 dark:bg-blue-900/50 rounded-s-xl rounded-ee-xl' 
                    : 'bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl'
                }`}>
                    <p className="text-sm font-normal text-gray-900 dark:text-white">{message.text}</p>
                </div>
            </div>
             {message.role === Role.USER && (
                <div className="w-6 h-6 flex-shrink-0 rounded-full bg-gray-500 flex items-center justify-center self-start">
                    <UserIcon className="h-4 w-4" />
                </div>
            )}
        </div>
    );
};

export const OwnerClientChat: React.FC<OwnerClientChatProps> = ({ interactionChats, listings, humanTakeoverChats, onTakeoverChat, onSendAgentMessage }) => {
    const activeChats = Object.entries(interactionChats).filter((entry): entry is [string, Message[]] => entry[1].length > 0);

    return (
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-fade-in-up">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Live Client Interactions</h2>
            {activeChats.length === 0 ? (
                 <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No active client chats right now.</p>
                    <p className="text-sm mt-1">When a user connects with one of your properties, the AI-driven conversation will appear here in real-time.</p>
                </div>
            ) : (
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {activeChats.map(([propertyId, messages]) => {
                        const property = listings.find(l => l.id === propertyId);
                        const isTakeover = humanTakeoverChats[propertyId];
                        return (
                             <div key={propertyId} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white">
                                        Chat for: <span className="text-indigo-600 dark:text-indigo-400">{property?.title || 'Unknown Property'}</span>
                                    </h3>
                                    {!isTakeover && (
                                        <button 
                                            onClick={() => onTakeoverChat(propertyId)}
                                            className="bg-green-600 text-white font-semibold py-1 px-3 rounded-lg hover:bg-green-700 transition-colors text-xs"
                                        >
                                            Take Over Chat
                                        </button>
                                    )}
                                </div>
                                <div>
                                    {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
                                </div>
                                {isTakeover && (
                                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <AgentChatInput onSendMessage={(text) => onSendAgentMessage(propertyId, text)} />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};
