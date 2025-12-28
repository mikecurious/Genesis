
import React, { useRef, useState, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { type Message, Role, type Listing } from '../types';
import { UserIcon } from './icons/UserIcon';
import { AiIcon } from './icons/AiIcon';
import { AgentIcon } from './icons/AgentIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { formatPrice } from '../utils/formatPrice';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  onConnect?: (property: Listing) => void;
  onOpenImageViewer?: (imageUrls: string[]) => void;
}

const LoadingDots: React.FC = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
  </div>
);

const PropertyCard: React.FC<{
  property: Listing;
  onConnect?: (property: Listing) => void;
  onImageClick?: () => void;
}> = ({ property, onConnect, onImageClick }) => (
  <div className="w-full bg-white dark:bg-gray-800/50 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-transparent flex flex-col">
    {/* Image section */}
    <button onClick={onImageClick} className="w-full h-40 block focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-t-xl relative group">
      <img
        className="w-full h-full object-cover"
        src={property.imageUrls[0] || `https://picsum.photos/seed/${encodeURIComponent(property.title)}/400/300`}
        alt={property.title}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute bottom-2 left-4 text-left">
        <h3 className="font-bold text-white text-lg drop-shadow-md">{property.title}</h3>
        <p className="text-xs text-gray-200 drop-shadow-sm">{property.location}</p>
      </div>
    </button>

    {/* Content section */}
    <div className="p-4 flex flex-col flex-grow">
      <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-lg">{formatPrice(property.price, property.currency)}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3 flex-grow">{property.description}</p>

      {/* Agent Info & Action */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <AgentIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{property.agentName}</p>
            <p className="text-xs text-gray-500">{property.agentContact}</p>
          </div>
        </div>
        <button
          onClick={() => onConnect?.(property)}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Connect Now
        </button>
      </div>
    </div>
  </div>
);

const GroundingSources: React.FC<{ metadata: any }> = ({ metadata }) => {
  const chunks = metadata?.groundingChunks;
  if (!chunks || chunks.length === 0) return null;

  const sources = chunks
    .map((chunk: any) => chunk.web || chunk.maps)
    .filter(Boolean)
    .filter((source: any, index: number, self: any[]) =>
      index === self.findIndex((s) => s.uri === source.uri) // Deduplicate sources
    );

  if (sources.length === 0) return null;

  return (
    <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-500/50">
      <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Sources:</h4>
      <ol className="list-decimal list-inside text-xs space-y-1">
        {sources.slice(0, 3).map((source: any, index: number) => (
          <li key={index}>
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline truncate"
              title={source.title}
            >
              {source.title || new URL(source.uri).hostname}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
};


export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false, onConnect, onOpenImageViewer }) => {
  const isUser = message.role === Role.USER;
  const hasProperties = message.properties && message.properties.length > 0;
  const hasGrounding = message.groundingMetadata && message.groundingMetadata.groundingChunks?.length > 0;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const buffer = 1; // 1px buffer for floating point inaccuracies
      const hasOverflow = el.scrollWidth > el.clientWidth + buffer;
      setCanScrollLeft(el.scrollLeft > buffer);
      setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - buffer);
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      checkScrollButtons();
      el.addEventListener('scroll', checkScrollButtons, { passive: true });
      const resizeObserver = new ResizeObserver(checkScrollButtons);
      resizeObserver.observe(el);

      return () => {
        el.removeEventListener('scroll', checkScrollButtons);
        resizeObserver.unobserve(el);
      };
    }
  }, [hasProperties, checkScrollButtons, message.properties]); // Re-check when properties change

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.8;
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (message.isSystemMessage) {
    return (
      <div className="text-center my-3 animate-fade-in-up">
        <p className="text-xs text-gray-500 dark:text-gray-400 italic bg-gray-100 dark:bg-gray-800/50 inline-block px-3 py-1 rounded-full">{message.text}</p>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-4 my-4 animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-indigo-500 flex items-center justify-center self-start">
          <AiIcon />
        </div>
      )}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && message.senderName && (
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 ml-3 mb-0.5">{message.senderName}</p>
        )}
        <div
          className={`rounded-2xl ${isUser
            ? 'bg-blue-600 text-white rounded-br-none max-w-xl p-4'
            : `bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-bl-none ${hasProperties ? 'max-w-4xl p-0 overflow-hidden' : 'max-w-xl p-4'}`
            }`}
        >
          {isLoading && !message.text ? (
            <div className="p-4"><LoadingDots /></div>
          ) : (
            <>
              <div className={`whitespace-pre-wrap prose dark:prose-invert prose-p:my-0 ${hasProperties ? 'p-4' : ''}`}>
                {message.text.split('\n').map((line, index) => {
                  // Convert **bold** to <strong> and sanitize to prevent XSS
                  const htmlContent = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || '\u00A0';
                  const sanitized = DOMPurify.sanitize(htmlContent, {
                    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
                    ALLOWED_ATTR: []
                  });
                  return <p key={index} className="text-inherit" dangerouslySetInnerHTML={{ __html: sanitized }}></p>;
                })}
              </div>

              {hasGrounding && !hasProperties && (
                <div className="p-4 pt-0">
                  <GroundingSources metadata={message.groundingMetadata} />
                </div>
              )}

              {hasProperties && (
                <div className="px-4 pt-2 pb-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {message.properties?.map((prop) => (
                      <PropertyCard
                        key={prop.id}
                        property={prop}
                        onConnect={onConnect}
                        onImageClick={() => onOpenImageViewer?.(prop.imageUrls)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-500 dark:bg-gray-600 flex items-center justify-center self-start">
          <UserIcon />
        </div>
      )}
    </div>
  );
};