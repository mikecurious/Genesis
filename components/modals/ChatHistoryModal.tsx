import React from 'react';
import { type Tenant, type Message, Role } from '../../types';
import { AiIcon } from '../icons/AiIcon';
import { UserIcon } from '../icons/UserIcon';

interface ChatHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: Tenant | null;
    messages: Message[];
}

const HistoryChatBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isTenant = message.role === Role.USER;
    
    return (
        <div className={`flex items-start gap-2.5 my-2 ${isTenant ? 'justify-end' : 'justify-start'}`}>
            {!isTenant && (
                <div className="w-6 h-6 flex-shrink-0 rounded-full bg-indigo-500 flex items-center justify-center self-start">
                    <AiIcon className="h-4 w-4" />
                </div>
            )}
            <div className={`flex flex-col gap-1 max-w-[80%] leading-1.5 p-3 border-gray-200 dark:border-gray-700 ${
                isTenant 
                ? 'bg-blue-100 dark:bg-blue-900/50 rounded-s-xl rounded-ee-xl' 
                : 'bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl'
            }`}>
                <p className="text-sm font-normal text-gray-900 dark:text-white">{message.text}</p>
            </div>
             {isTenant && (
                <div className="w-6 h-6 flex-shrink-0 rounded-full bg-gray-500 flex items-center justify-center self-start">
                    <UserIcon className="h-4 w-4" />
                </div>
            )}
        </div>
    );
};

export const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({ isOpen, onClose, tenant, messages }) => {
    if (!isOpen || !tenant) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col animate-fade-in-up">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Chat History with {tenant.name}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto">
                    {messages.length > 0 ? (
                        messages.map(msg => <HistoryChatBubble key={msg.id} message={msg} />)
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No chat history found for this tenant.</p>
                    )}
                </div>
            </div>
        </div>
    );
};