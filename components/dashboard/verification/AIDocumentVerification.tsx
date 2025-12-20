import React, { useState, useRef } from 'react';
import { DocumentVerification } from '../../../types';

interface AIDocumentVerificationProps {
    userId: string;
}

export const AIDocumentVerification: React.FC<AIDocumentVerificationProps> = ({ userId }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState<'title_deed' | 'sale_agreement' | 'id_document' | 'other'>('title_deed');
    const [uploading, setUploading] = useState(false);
    const [verifications, setVerifications] = useState<DocumentVerification[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('document', selectedFile);
        formData.append('documentType', documentType);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/verification/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                alert('Document uploaded successfully! Verification in progress...');
                setSelectedFile(null);
                loadVerifications();
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const loadVerifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/verification/documents`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setVerifications(data.data);
            }
        } catch (error) {
            console.error('Load error:', error);
        }
    };

    React.useEffect(() => {
        loadVerifications();
    }, []);

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            verified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            potential_issue: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
        return badges[status as keyof typeof badges] || badges.pending;
    };

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Document</h3>

                {/* Document Type Selector */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Document Type
                    </label>
                    <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="title_deed">Title Deed</option>
                        <option value="sale_agreement">Sale Agreement</option>
                        <option value="id_document">ID Document</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Drag & Drop Area */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                    />

                    {selectedFile ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">{selectedFile.name}</span>
                            </div>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? 'Uploading...' : 'Upload & Verify'}
                                </button>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
                                >
                                    Click to upload
                                </button>
                                <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PDF, JPG, PNG up to 10MB</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Verification History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verification History</h3>

                {verifications.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No verifications yet</p>
                ) : (
                    <div className="space-y-4">
                        {verifications.map((verification) => (
                            <div key={verification.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-medium text-gray-900 dark:text-white">{verification.fileName}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(verification.status)}`}>
                                                {verification.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Type: {verification.documentType.replace('_', ' ')}
                                        </p>
                                        {verification.extractedData && (
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                {verification.extractedData.ownerName && (
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Owner:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white font-medium">{verification.extractedData.ownerName}</span>
                                                    </div>
                                                )}
                                                {verification.extractedData.lrNumber && (
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">LR Number:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white font-medium">{verification.extractedData.lrNumber}</span>
                                                    </div>
                                                )}
                                                {verification.extractedData.size && (
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Size:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white font-medium">{verification.extractedData.size}</span>
                                                    </div>
                                                )}
                                                {verification.extractedData.location && (
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white font-medium">{verification.extractedData.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
