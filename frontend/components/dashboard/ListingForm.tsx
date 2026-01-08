
import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { type Listing, type ListingDocuments, type NewListingInput, UserRole, type UserRoleType } from '../../types';
import { SparklesIcon } from '../icons/SparklesIcon';
import { generatePropertyDescription } from '../../services/geminiService';

interface ListingFormProps {
    isOpen: boolean;
    onClose: () => void;
    onAddListing: (listing: NewListingInput) => void;
    onRequireVerification?: () => void;
    userRole?: UserRoleType; // Updated to accept UserRoleType
}

const initialFormState: Omit<Listing, 'id' | 'agentName' | 'agentContact' | 'createdBy' | 'imageUrls'> = {
    title: '',
    description: '',
    location: '',
    price: '',
    priceType: 'rental', // Default to rental
    tags: [],
};

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; placeholder?: string; type?: string; required?: boolean; as?: 'textarea' }> =
    ({ label, name, value, onChange, placeholder, type = 'text', required = true, as }) => (
        <div>
            <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            {as === 'textarea' ? (
                <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={3} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" />
            ) : (
                <input type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" />
            )}
        </div>
    );

const MAX_IMAGES = 5;

export const ListingForm: React.FC<ListingFormProps> = ({ isOpen, onClose, onAddListing, onRequireVerification, userRole }) => {
    const [formState, setFormState] = useState(initialFormState);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Document upload states
    const [titleDeed, setTitleDeed] = useState<File | null>(null);
    const [saleAgreement, setSaleAgreement] = useState<File | null>(null);
    const [kraPin, setKraPin] = useState<File | null>(null);
    const [ownershipDocs, setOwnershipDocs] = useState<File[]>([]);
    const [valuationReport, setValuationReport] = useState<File | null>(null);

    // Set default priceType based on user role
    useEffect(() => {
        if (userRole === UserRole.PropertySeller) {
            setFormState(prev => ({ ...prev, priceType: 'sale' }));
        } else if (userRole === UserRole.Landlord) {
            setFormState(prev => ({ ...prev, priceType: 'rental' }));
        }
    }, [userRole]);

    useEffect(() => {
        // Cleanup object URLs on unmount or when modal closes
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const remainingSlots = MAX_IMAGES - imageFiles.length;
            const filesToProcess = files.slice(0, remainingSlots);

            setImageFiles(prev => [...prev, ...filesToProcess]);

            const newPreviews = filesToProcess.map(file => URL.createObjectURL(file as Blob));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        const urlToRemove = imagePreviews[indexToRemove];
        URL.revokeObjectURL(urlToRemove);
        setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
        setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleAddTag = (tagToAdd: string) => {
        const trimmedTag = tagToAdd.trim().replace(/,/g, "");
        if (trimmedTag && !formState.tags?.includes(trimmedTag)) {
            setFormState(prev => ({ ...prev, tags: [...(prev.tags || []), trimmedTag] }));
        }
        setTagInput('');
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag(tagInput);
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormState(prev => ({ ...prev, tags: prev.tags?.filter(tag => tag !== tagToRemove) }));
    };

    const handleGenerateDescription = async () => {
        setIsGenerating(true);
        try {
            const description = await generatePropertyDescription({
                title: formState.title,
                location: formState.location,
                price: formState.price,
                tags: formState.tags || [],
            });
            setFormState(prev => ({ ...prev, description }));
        } catch (error) {
            console.error("Failed to generate description", error);
            alert("Sorry, we couldn't generate a description at this time. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log('Form submitted');
        console.log('Form State:', formState);
        console.log('Image Files:', imageFiles);

        if (imageFiles.length === 0) {
            console.error('No images selected!');
            alert('Please select at least one image.');
            return;
        }

        const documents: ListingDocuments = {
            titleDeed,
            saleAgreement,
            kraPin,
            ownershipDocs,
            valuationReport,
        };

        const hasRequiredDocuments = Boolean(titleDeed && saleAgreement && kraPin);

        try {
            onAddListing({
                ...formState,
                images: imageFiles,
                documents,
                hasRequiredDocuments,
            });
            console.log('onAddListing called');

            setFormState(initialFormState);
            setImageFiles([]);
            setImagePreviews([]);
            setTagInput('');
            setTitleDeed(null);
            setSaleAgreement(null);
            setKraPin(null);
            setOwnershipDocs([]);
            setValuationReport(null);
            onClose(); // Close modal on submit

            if (!hasRequiredDocuments && onRequireVerification) {
                onRequireVerification();
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] animate-fade-in-up">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add a New Property Listing</h3>
                    <button onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" /></svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
                    <div className="space-y-4">
                        <InputField label="Property Title" name="title" value={formState.title} onChange={handleChange} placeholder="e.g., Modern 2-Bedroom in Kilimani" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Location" name="location" value={formState.location} onChange={handleChange} placeholder="e.g., Kilimani, Nairobi" />

                            {/* Pricing Type Selector - Only for Agent */}
                            {userRole === UserRole.Agent && (
                                <div>
                                    <label htmlFor="priceType" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Listing Type</label>
                                    <select
                                        id="priceType"
                                        name="priceType"
                                        value={formState.priceType}
                                        onChange={handleChange}
                                        className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                                    >
                                        <option value="sale">For Sale</option>
                                        <option value="rental">Monthly Rental</option>
                                    </select>
                                </div>
                            )}

                            {/* Dynamic Price Label */}
                            <InputField
                                label={formState.priceType === 'sale' ? 'Price' : 'Monthly Rent'}
                                name="price"
                                value={formState.price}
                                onChange={handleChange}
                                placeholder={formState.priceType === 'sale' ? 'e.g., 15,000,000 KSh' : 'e.g., 60,000 KSh/month'}
                            />
                        </div>

                        <div>
                            <label htmlFor="tags" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tags / Keywords</label>
                            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                                {formState.tags?.map(tag => (
                                    <div key={tag} className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/50 text-indigo-800 dark:text-indigo-200 text-xs font-medium pl-2.5 pr-1 py-1 rounded-full">
                                        <span>{tag}</span>
                                        <button type="button" onClick={() => handleRemoveTag(tag)} className="text-green-500 hover:text-green-700 focus:outline-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <input
                                    type="text"
                                    id="tags"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder="Add a tag..."
                                    className="flex-grow bg-transparent focus:outline-none text-gray-900 dark:text-white text-sm p-1"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">e.g., modern, furnished, pet-friendly (Press Enter or comma to add)</p>
                        </div>

                        <div className="relative">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 hover:underline disabled:opacity-50 disabled:cursor-wait">
                                    <SparklesIcon className="w-4 h-4" />
                                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                                </button>
                            </div>
                            <textarea id="description" name="description" value={formState.description} onChange={handleChange} placeholder="Describe the key features of the property, or let AI generate it for you." required rows={5} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Property Images</label>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 ${imageFiles.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-4 text-gray-400 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" /></svg>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                    </div>
                                    <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} disabled={imageFiles.length >= MAX_IMAGES} />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">You can upload up to {MAX_IMAGES} images. ({imageFiles.length}/{MAX_IMAGES})</p>
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                                    {imagePreviews.map((src, index) => (
                                        <div key={src} className="relative group">
                                            <img src={src} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded-md" />
                                            <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-0 right-0 m-1 bg-red-600/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Document Uploads Section */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Property Documents (Optional)</h4>
                            <div className="space-y-3">
                                {/* Title Deed */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Title Deed
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setTitleDeed(e.target.files?.[0] || null)}
                                        className="block w-full text-sm text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
                                    />
                                    {titleDeed && <p className="mt-1 text-xs text-green-600 dark:text-green-400">✓ {titleDeed.name}</p>}
                                </div>

                                {/* Sale Agreement */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Sale Agreement
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setSaleAgreement(e.target.files?.[0] || null)}
                                        className="block w-full text-sm text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
                                    />
                                    {saleAgreement && <p className="mt-1 text-xs text-green-600 dark:text-green-400">✓ {saleAgreement.name}</p>}
                                </div>

                                {/* KRA PIN / ID (Kenya) */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        KRA PIN / ID (if Kenya)
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setKraPin(e.target.files?.[0] || null)}
                                        className="block w-full text-sm text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
                                    />
                                    {kraPin && <p className="mt-1 text-xs text-green-600 dark:text-green-400">✓ {kraPin.name}</p>}
                                </div>

                                {/* Ownership Documents */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Ownership Documents
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        multiple
                                        onChange={(e) => setOwnershipDocs(e.target.files ? Array.from(e.target.files) : [])}
                                        className="block w-full text-sm text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
                                    />
                                    {ownershipDocs.length > 0 && (
                                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                            ✓ {ownershipDocs.length} file(s) selected
                                        </p>
                                    )}
                                </div>

                                {/* Valuation Report */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Valuation Report
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setValuationReport(e.target.files?.[0] || null)}
                                        className="block w-full text-sm text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
                                    />
                                    {valuationReport && <p className="mt-1 text-xs text-green-600 dark:text-green-400">✓ {valuationReport.name}</p>}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Accepted formats: PDF, JPG, JPEG, PNG
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-end pt-6 mt-4 border-t border-gray-200 dark:border-gray-600 rounded-b">
                        <button type="button" onClick={onClose} className="text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3">Cancel</button>
                        <button type="submit" className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Add Listing</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
