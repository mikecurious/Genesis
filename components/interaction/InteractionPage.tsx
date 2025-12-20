
import React, { useEffect, useRef } from 'react';
import { type Listing, type Message, Role } from '../../types';
import { ChatInput } from '../ChatInput';
import { ChatMessage } from '../ChatMessage';
import { PropertyDetails } from './PropertyDetails';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

interface InteractionPageProps {
    property: Listing;
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (text: string) => void;
    onBack: () => void;
    onOpenImageViewer: (images: string[], startIndex?: number) => void;
}

export const InteractionPage: React.FC<InteractionPageProps> = ({
    property,
    messages,
    isLoading,
    onSendMessage,
    onBack,
    onOpenImageViewer
}) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex-1 flex flex-col h-full pt-16 bg-white dark:bg-gray-900">
            <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700/50 flex-shrink-0 bg-white/80 dark:bg-gray-900/50 backdrop-blur-md absolute top-16 left-0 right-0 z-10">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-2">
                    <ArrowLeftIcon />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold text-lg truncate">{property.title}</h2>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        AI Sales Expert
                    </p>
                </div>
            </header>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-28 pt-20">
                <div className="mx-auto max-w-4xl w-full h-full flex flex-col justify-end">
                    {/* Property Details are now always at the top of the chat scroll */}
                    <div className="mb-4 animate-fade-in-up">
                        <PropertyDetails property={property} onOpenImageViewer={onOpenImageViewer} />
                    </div>

                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isLoading && messages.length > 0 && (
                        <ChatMessage
                            message={{ id: 'loading', role: Role.MODEL, text: '...' }}
                            isLoading={true}
                        />
                    )}
                    {/* Initial loading state before first message */}
                    {isLoading && messages.length === 0 && (
                        <div className="flex justify-center items-center p-8">
                            <p className="text-gray-500 dark:text-gray-400">The AI is preparing your personalized introduction...</p>
                        </div>
                    )}
                </div>
            </div>

            <ChatInput
                onSendMessage={onSendMessage}
                isLoading={isLoading}
                placeholder="Ask about this property or schedule a visit…"
            />
        </div>
    );
};