
import React, { useState } from 'react';
import { SendIcon } from '../icons/SendIcon';

interface AgentChatInputProps {
  onSendMessage: (text: string) => void;
  isSending?: boolean;
}

export const AgentChatInput: React.FC<AgentChatInputProps> = ({ onSendMessage, isSending = false }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  const isDisabled = isSending;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message to the client..."
        className="w-full pr-12 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none transition-shadow text-sm"
        disabled={isDisabled}
      />
      <button
        type="submit"
        disabled={isDisabled || !text.trim()}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-green-600 rounded-md text-white hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors focus:outline-none"
        aria-label="Send message"
      >
        <SendIcon className="h-4 w-4" />
      </button>
    </form>
  );
};
