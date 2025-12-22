import { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { analyzePropertyImage } from '../services/visionService';

interface ImageGalleryProps {
    images: string[];
    enableAICaptions?: boolean;
    enableZoom?: boolean;
    onImageChange?: (index: number) => void;
}

interface ImageAnalysis {
    description: string;
    features: string[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
    images,
    enableAICaptions = false,
    enableZoom = true,
    onImageChange
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [aiCaptions, setAiCaptions] = useState<Map<number, ImageAnalysis>>(new Map());
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Analyze current image for AI captions
    useEffect(() => {
        if (enableAICaptions && !aiCaptions.has(currentIndex)) {
            analyzeCurrentImage();
        }
    }, [currentIndex, enableAICaptions]);

    const analyzeCurrentImage = async () => {
        setIsAnalyzing(true);
        try {
            const analysis = await analyzePropertyImage(images[currentIndex]);
            setAiCaptions(prev => new Map(prev).set(currentIndex, {
                description: analysis.description,
                features: analysis.features
            }));
        } catch (error) {
            console.error('Image analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const nextImage = () => {
        const newIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(newIndex);
        onImageChange?.(newIndex);
    };

    const prevImage = () => {
        const newIndex = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(newIndex);
        onImageChange?.(newIndex);
    };

    const goToImage = (index: number) => {
        setCurrentIndex(index);
        onImageChange?.(index);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'Escape') setIsFullscreen(false);
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentIndex]);

    const currentCaption = aiCaptions.get(currentIndex);

    return (
        <div className={`image-gallery ${isFullscreen ? 'fullscreen' : ''}`}>
            {/* Main Image Display */}
            <div className="gallery-main">
                {enableZoom ? (
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.5}
                        maxScale={4}
                        centerOnInit
                    >
                        <TransformComponent>
                            <img
                                src={images[currentIndex]}
                                alt={`Property image ${currentIndex + 1}`}
                                className="gallery-image"
                            />
                        </TransformComponent>
                    </TransformWrapper>
                ) : (
                    <img
                        src={images[currentIndex]}
                        alt={`Property image ${currentIndex + 1}`}
                        className="gallery-image"
                    />
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            className="gallery-nav gallery-nav-prev"
                            onClick={prevImage}
                            aria-label="Previous image"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button
                            className="gallery-nav gallery-nav-next"
                            onClick={nextImage}
                            aria-label="Next image"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Fullscreen Toggle */}
                <button
                    className="gallery-fullscreen"
                    onClick={toggleFullscreen}
                    aria-label="Toggle fullscreen"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        {isFullscreen ? (
                            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" strokeWidth="2" />
                        ) : (
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" strokeWidth="2" />
                        )}
                    </svg>
                </button>

                {/* Image Counter */}
                <div className="gallery-counter">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>

            {/* AI Caption */}
            {enableAICaptions && (
                <div className="gallery-caption">
                    {isAnalyzing ? (
                        <div className="caption-loading">
                            <div className="spinner"></div>
                            <span>AI analyzing image...</span>
                        </div>
                    ) : currentCaption ? (
                        <div className="caption-content">
                            <p className="caption-description">{currentCaption.description}</p>
                            {currentCaption.features.length > 0 && (
                                <div className="caption-features">
                                    {currentCaption.features.map((feature, idx) => (
                                        <span key={idx} className="feature-tag">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="gallery-thumbnails">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToImage(index)}
                            aria-label={`Go to image ${index + 1}`}
                        >
                            <img src={image} alt={`Thumbnail ${index + 1}`} />
                        </button>
                    ))}
                </div>
            )}

            <style>{`
                .image-gallery {
                    position: relative;
                    width: 100%;
                    background: #000;
                    border-radius: 12px;
                    overflow: hidden;
                }

                .image-gallery.fullscreen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    z-index: 9999;
                    border-radius: 0;
                }

                .gallery-main {
                    position: relative;
                    width: 100%;
                    height: 500px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                }

                .fullscreen .gallery-main {
                    height: calc(100vh - 200px);
                }

                .gallery-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }

                .gallery-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.9);
                    border: none;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    z-index: 10;
                }

                .gallery-nav:hover {
                    background: rgba(255, 255, 255, 1);
                    transform: translateY(-50%) scale(1.1);
                }

                .gallery-nav-prev {
                    left: 16px;
                }

                .gallery-nav-next {
                    right: 16px;
                }

                .gallery-fullscreen {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: rgba(255, 255, 255, 0.9);
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    z-index: 10;
                }

                .gallery-fullscreen:hover {
                    background: rgba(255, 255, 255, 1);
                }

                .gallery-counter {
                    position: absolute;
                    bottom: 16px;
                    right: 16px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                }

                .gallery-caption {
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 100px;
                }

                .caption-loading {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    justify-content: center;
                }

                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .caption-description {
                    margin: 0 0 12px 0;
                    font-size: 15px;
                    line-height: 1.6;
                }

                .caption-features {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .feature-tag {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 13px;
                    backdrop-filter: blur(10px);
                }

                .gallery-thumbnails {
                    display: flex;
                    gap: 8px;
                    padding: 16px;
                    background: #1a1a1a;
                    overflow-x: auto;
                    scrollbar-width: thin;
                }

                .thumbnail {
                    flex-shrink: 0;
                    width: 80px;
                    height: 60px;
                    border: 2px solid transparent;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: none;
                    padding: 0;
                }

                .thumbnail:hover {
                    border-color: rgba(255, 255, 255, 0.5);
                    transform: scale(1.05);
                }

                .thumbnail.active {
                    border-color: #667eea;
                    transform: scale(1.1);
                }

                .thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            `}</style>
        </div>
    );
};
