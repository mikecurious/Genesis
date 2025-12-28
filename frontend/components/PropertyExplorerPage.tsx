import React, { useState, useRef, useEffect } from 'react';
import { type Listing, type Message, Role } from '../types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { LeadCaptureForm } from './LeadCaptureForm';
import { generateInitialPitch, generateInteractionResponse } from '../services/geminiService';
import { PropertyActionsSection } from './propertyActions/PropertyActionsSection';
import { MortgageCalculatorPanel } from './propertyActions/MortgageCalculatorPanel';
import { ValuationPanel } from './propertyActions/ValuationPanel';
import { VerificationPanel } from './propertyActions/VerificationPanel';
import { LandSearchPanel } from './propertyActions/LandSearchPanel';
import { ScheduleViewingPanel } from './propertyActions/ScheduleViewingPanel';
import { formatPrice } from '../utils/formatPrice';

interface PropertyExplorerPageProps {
    property: Listing;
    onBack: () => void;
    messages?: Message[];
    onSendMessage?: (propertyId: string, message: Message) => void;
}

export const PropertyExplorerPage: React.FC<PropertyExplorerPageProps> = ({
    property,
    onBack,
    messages: sharedMessages = [],
    onSendMessage
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [localMessages, setLocalMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [dealType, setDealType] = useState<'purchase' | 'rental' | 'viewing'>('viewing');
    const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);

    // Property Actions Panel States
    const [showMortgagePanel, setShowMortgagePanel] = useState(false);
    const [showValuationPanel, setShowValuationPanel] = useState(false);
    const [showVerificationPanel, setShowVerificationPanel] = useState(false);
    const [showLandSearchPanel, setShowLandSearchPanel] = useState(false);
    const [showScheduleViewingPanel, setShowScheduleViewingPanel] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const messages = sharedMessages.length > 0 ? sharedMessages : localMessages;
    const images = property.imageUrls && property.imageUrls.length > 0
        ? property.imageUrls
        : ['/placeholder-property.jpg'];

    const hasInitialized = useRef(false);

    useEffect(() => {
        if (messages.length === 0 && !hasInitialized.current) {
            hasInitialized.current = true;
            const initializePitch = async () => {
                setIsLoading(true);
                try {
                    const initialPitch = await generateInitialPitch(property);
                    const pitchMessage = { ...initialPitch, id: `pitch_${Date.now()}` };
                    if (onSendMessage) {
                        onSendMessage(property.id, pitchMessage);
                    } else {
                        setLocalMessages([pitchMessage]);
                    }
                } catch (error) {
                    console.error('Failed to generate initial pitch:', error);
                    const fallbackMessage: Message = {
                        id: 'fallback',
                        role: Role.MODEL,
                        text: `Welcome! I'm excited to show you this amazing property: ${property.title}. What would you like to know about it?`
                    };
                    if (onSendMessage) {
                        onSendMessage(property.id, fallbackMessage);
                    } else {
                        setLocalMessages([fallbackMessage]);
                    }
                } finally {
                    setIsLoading(false);
                }
            };
            initializePitch();
        }
    }, [property, messages.length, onSendMessage]);

    useEffect(() => {
        if (chatContainerRef.current) {
            // Add a small delay to ensure DOM is updated, then smooth scroll
            setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTo({
                        top: chatContainerRef.current.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: Role.USER,
            text,
        };

        if (onSendMessage) {
            onSendMessage(property.id, userMessage);
        } else {
            setLocalMessages(prev => [...prev, userMessage]);
        }

        setIsLoading(true);

        try {
            const aiResponse = await generateInteractionResponse(text, property, messages);
            if (aiResponse.metadata?.dealClosure && aiResponse.metadata.dealType) {
                setDealType(aiResponse.metadata.dealType);
                setShowLeadForm(true);
            }
            if (onSendMessage) {
                onSendMessage(property.id, aiResponse);
            } else {
                setLocalMessages(prev => [...prev, aiResponse]);
            }
        } catch (error) {
            console.error('Error generating response:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: Role.MODEL,
                text: "I apologize, I'm having trouble responding right now. Please try again.",
            };
            if (onSendMessage) {
                onSendMessage(property.id, errorMessage);
            } else {
                setLocalMessages(prev => [...prev, errorMessage]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeadSubmit = async (leadData: any) => {
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: property.id,
                    client: leadData.client,
                    dealType: leadData.dealType,
                    conversationHistory: messages
                }),
            });

            if (!response.ok) throw new Error('Failed to submit lead');

            const successMessage: Message = {
                id: `success_${Date.now()}`,
                role: Role.MODEL,
                text: `Thank you! Your ${dealType} request has been submitted successfully. The property owner will contact you shortly at ${leadData.client.whatsappNumber}. We've also sent a confirmation to ${leadData.client.email}.`,
                isSystemMessage: true
            };

            if (onSendMessage) {
                onSendMessage(property.id, successMessage);
            } else {
                setLocalMessages(prev => [...prev, successMessage]);
            }

            setShowLeadForm(false);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to submit lead');
        }
    };

    const handlePrevImage = () => {
        setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
        setZoomLevel(1);
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
        setZoomLevel(1);
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.5, 3));
        setIsZoomed(true);
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.5, 1));
        if (zoomLevel <= 1.5) setIsZoomed(false);
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
        setIsZoomed(false);
    };

    return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="font-medium hidden sm:inline">Back</span>
                    </button>

                    {/* Toggle Menu Button */}
                    <button
                        onClick={() => setIsLeftPanelVisible(!isLeftPanelVisible)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                        title={isLeftPanelVisible ? "Hide Property Details" : "Show Property Details"}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <h1 className="text-lg font-semibold text-gray-800 dark:text-white truncate max-w-md hidden md:block">
                    {property.title}
                </h1>
                <div className="w-24"></div>
            </header>

            {/* Main Content - 70/30 Split or Full Width Chat */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                {/* Left Panel: Property Showcase (70% or Hidden) */}
                <div className={`${isLeftPanelVisible ? 'flex' : 'hidden'} flex-col bg-white dark:bg-gray-900 overflow-y-auto overflow-x-hidden custom-scrollbar border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 transition-all duration-300 w-full lg:w-[70%] max-h-[50vh] lg:max-h-none`}>
                    {/* Image Gallery */}
                    <div className="relative bg-black flex items-center justify-center min-h-[300px] lg:h-[55vh]">
                        <img
                            ref={imageRef}
                            src={images[currentImageIndex]}
                            alt={property.title}
                            className="max-w-full max-h-full object-contain transition-transform duration-300"
                            style={{
                                transform: `scale(${zoomLevel})`,
                                cursor: isZoomed ? 'move' : 'default'
                            }}
                        />

                        {/* Image Controls */}
                        {images.length > 1 && (
                            <>
                                <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all backdrop-blur-sm">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all backdrop-blur-sm">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </>
                        )}

                        {/* Zoom Controls */}
                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <button onClick={handleZoomOut} className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg></button>
                            <button onClick={handleResetZoom} className="bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">{Math.round(zoomLevel * 100)}%</button>
                            <button onClick={handleZoomIn} className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></button>
                        </div>

                        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                            {currentImageIndex + 1} / {images.length}
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="bg-gray-900 p-3 flex gap-2 overflow-x-auto custom-scrollbar">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => { setCurrentImageIndex(index); setZoomLevel(1); }}
                                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${index === currentImageIndex ? 'border-indigo-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Property Details */}
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{property.title}</h2>
                                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {property.location}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{formatPrice(property.price, property.currency)}</p>
                                <p className="text-sm text-gray-500">{property.priceType === 'rental' ? 'per month' : ''}</p>
                            </div>
                        </div>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{property.description}</p>
                        </div>

                        {/* Property Actions Section */}
                        <PropertyActionsSection
                            property={property}
                            onOpenMortgage={() => setShowMortgagePanel(true)}
                            onOpenValuation={() => setShowValuationPanel(true)}
                            onOpenVerification={() => setShowVerificationPanel(true)}
                            onOpenLandSearch={() => setShowLandSearchPanel(true)}
                            onScheduleViewing={() => setShowScheduleViewingPanel(true)}
                        />
                    </div>
                </div>

                {/* Right Panel: Deal Closing Chat (30% or Full Width) */}
                <div className={`${isLeftPanelVisible ? 'w-full lg:w-[30%]' : 'w-full'} flex flex-col bg-white dark:bg-gray-800 flex-1 lg:h-auto border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 shadow-2xl z-10 relative transition-all duration-300 min-h-[400px]`}>

                    {/* "Closing Room" Header */}
                    <div className="p-4 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white shadow-md flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-900 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">Deal Assistant</h3>
                                <p className="text-xs text-indigo-200 font-medium uppercase tracking-wider">Ready to Negotiate</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar - Quick Actions */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 flex gap-2 overflow-x-auto border-b border-indigo-100 dark:border-indigo-900/50 flex-shrink-0 scrollbar-hide">
                        <button
                            onClick={() => handleSendMessage("I'd like to schedule a viewing")}
                            className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors shadow-sm"
                        >
                            📅 Schedule Viewing
                        </button>
                        <button
                            onClick={() => handleSendMessage("What's the best price?")}
                            className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors shadow-sm"
                        >
                            💰 Negotiate Price
                        </button>
                        <button
                            onClick={() => handleSendMessage("I want to make an offer")}
                            className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Make Offer
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-gray-50 dark:bg-gray-900 custom-scrollbar pb-40"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {messages.map(msg => (
                            <ChatMessage
                                key={msg.id}
                                message={msg}
                                onConnect={() => { }}
                                onOpenImageViewer={() => { }}
                            />
                        ))}
                        {isLoading && (
                            <ChatMessage
                                message={{ id: 'loading', role: Role.MODEL, text: '...' }}
                                isLoading={true}
                            />
                        )}
                        <div className="w-full shrink-0 h-32" />
                    </div>

                    {/* Chat Input - Floating Style */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-800 dark:via-gray-800 dark:to-transparent pt-8 pb-2 px-2">
                        <ChatInput
                            onSendMessage={handleSendMessage}
                            isLoading={isLoading}
                            placeholder="Ask to close the deal..."
                        />
                    </div>
                </div>
            </div>

            {/* Lead Form Modal */}
            {showLeadForm && (
                <LeadCaptureForm
                    propertyId={property.id}
                    propertyTitle={property.title}
                    dealType={dealType}
                    conversationHistory={messages}
                    onSubmit={handleLeadSubmit}
                    onCancel={() => setShowLeadForm(false)}
                />
            )}

            {/* Property Action Panels */}
            <MortgageCalculatorPanel
                isOpen={showMortgagePanel}
                onClose={() => setShowMortgagePanel(false)}
                property={property}
            />

            <ValuationPanel
                isOpen={showValuationPanel}
                onClose={() => setShowValuationPanel(false)}
                property={property}
            />

            <VerificationPanel
                isOpen={showVerificationPanel}
                onClose={() => setShowVerificationPanel(false)}
                property={property}
            />

            <LandSearchPanel
                isOpen={showLandSearchPanel}
                onClose={() => setShowLandSearchPanel(false)}
                property={property}
            />

            <ScheduleViewingPanel
                isOpen={showScheduleViewingPanel}
                onClose={() => setShowScheduleViewingPanel(false)}
                property={property}
            />
        </div>
    );
};
