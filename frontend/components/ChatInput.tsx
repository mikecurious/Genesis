
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from './icons/SendIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { RecordingIcon } from './icons/RecordingIcon';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isBlocked?: boolean;
  placeholder?: string;
  isListening?: boolean;
  onToggleListening?: () => void;
  value?: string;
  onChange?: (text: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  isBlocked = false,
  placeholder,
  isListening,
  onToggleListening,
  value,
  onChange
}) => {
  // Internal state fallback if not controlled
  const [internalText, setInternalText] = useState('');

  const text = value !== undefined ? value : internalText;
  const setText = onChange || setInternalText;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 150); // Max height ~6 lines
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      if (!value) {
        setText('');
      } else if (onChange) {
        onChange('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isDisabled = isLoading || isBlocked || isListening;

  const getPlaceholderText = () => {
    if (isListening) return "Listening...";
    if (placeholder) return placeholder;
    if (isBlocked) return "Please sign in to continue your conversation";
    return "Ask about properties, or click the mic to talk...";
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent backdrop-blur-sm animate-fade-in">
      <div className="mx-auto max-w-4xl">
        <form onSubmit={handleSubmit} className="relative group">

          {/* Animated Gradient Border (The "ACCIO" Magic) */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200 animate-tilt"></div>

          {/* Main Container */}
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl leading-none flex items-center">

            {/* Inner Glass Layer */}
            <div className="w-full relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/10 shadow-2xl">

              {/* Microphone Button */}
              <button
                type="button"
                onClick={onToggleListening}
                className={`absolute left-4 md:left-5 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all duration-300 ${isListening
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : 'text-gray-400 hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                title={isListening ? "Stop voice input" : "Start voice input (Beta)"}
                disabled={isLoading || isBlocked}
              >
                {isListening ? <RecordingIcon /> : <MicrophoneIcon />}
              </button>

              {/* Expandable Textarea */}
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={getPlaceholderText()}
                rows={1}
                className="w-full pl-16 md:pl-20 pr-16 md:pr-20 py-5 md:py-6 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none text-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '72px', maxHeight: '180px' }}
                disabled={isDisabled}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={isDisabled || !text.trim()}
                className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500 ${text.trim() && !isDisabled
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_30px_rgba(99,102,241,0.8)] scale-100 rotate-0'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 scale-90 rotate-90 opacity-50 cursor-not-allowed'
                  }`}
              >
                <SendIcon className={`w-5 h-5 ${text.trim() && !isDisabled ? 'animate-pulse' : ''}`} />
              </button>
            </div>
          </div>

          {/* Helper Text & Char Count */}
          <div className="absolute -bottom-8 left-0 right-0 px-6 flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Press Enter to send
            </span>
            <span className={`${text.length > 0 ? 'text-indigo-500 dark:text-indigo-400' : ''}`}>
              {text.length} chars
            </span>
          </div>
        </form>
      </div>

      <style>{`
        .animate-tilt {
          animation: tilt 10s infinite linear;
        }
        @keyframes tilt {
          0%, 50%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(0.5deg);
          }
          75% {
            transform: rotate(-0.5deg);
          }
        }
      `}</style>
    </div>
  );
};
