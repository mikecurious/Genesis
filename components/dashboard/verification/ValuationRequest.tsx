import React, { useState, useRef } from 'react';
import { ValuationRequest, Listing } from '../../../types';

interface ValuationRequestProps {
    userId: string;
    userProperties?: Listing[];
}

export const ValuationRequestComponent: React.FC<ValuationRequestProps> = ({ userId, userProperties = [] }) => {
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [manualDetails, setManualDetails] = useState({
        location: '',
        size: '',
        type: '',
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [requests, setRequests] = useState<ValuationRequest[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPropertyId && (!manualDetails.location || !manualDetails.size || !manualDetails.type)) {
            alert('Please select a property or provide manual details');
            return;
        }

        setSubmitting(true);
        const formData = new FormData();

        if (selectedPropertyId) {
            formData.append('propertyId', selectedPropertyId);
        } else {
            formData.append('propertyDetails', JSON.stringify(manualDetails));
        }

        selectedFiles.forEach((file) => {
            formData.append('documents', file);
        });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/verification/valuation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                alert('Valuation request submitted successfully!');
                setSelectedPropertyId('');
                setManualDetails({ location: '', size: '', type: '' });
                setSelectedFiles([]);
                loadRequests();
            } else {
                alert('Submission failed: ' + data.message);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const loadRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/verification/valuation`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (error) {
            console.error('Load error:', error);
        }
    };

    React.useEffect(() => {
        loadRequests();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(files => files.filter((_, i) => i !== index));
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        };
        return badges[status as keyof typeof badges] || badges.pending;
    };

    return (
        <div className="space-y-6">
            {/* Request Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submit Valuation Request</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Property Selection */}
                    {userProperties.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Your Property (Optional)
                            </label>
                            <select
                                value={selectedPropertyId}
                                onChange={(e) => setSelectedPropertyId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">-- Or enter details manually below --</option>
                                {userProperties.map((property) => (
                                    <option key={property.id} value={property.id}>
                                        {property.title} - {property.location}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Manual Property Details */}
                    {!selectedPropertyId && (
                        <>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Property Details</h4>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            value={manualDetails.location}
                                            onChange={(e) => setManualDetails({ ...manualDetails, location: e.target.value })}
                                            placeholder="e.g., Nairobi, Westlands"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                            required={!selectedPropertyId}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            Size *
                                        </label>
                                        <input
                                            type="text"
                                            value={manualDetails.size}
                                            onChange={(e) => setManualDetails({ ...manualDetails, size: e.target.value })}
                                            placeholder="e.g., 1/4 acre, 2000 sqft"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                            required={!selectedPropertyId}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            Property Type *
                                        </label>
                                        <input
                                            type="text"
                                            value={manualDetails.type}
                                            onChange={(e) => setManualDetails({ ...manualDetails, type: e.target.value })}
                                            placeholder="e.g., Residential, Commercial, Land"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                            required={!selectedPropertyId}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Document Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Supporting Documents (Optional, up to 5 files)
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Choose Files
                        </button>

                        {selectedFiles.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded">
                                        <span>{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {submitting ? 'Submitting...' : 'Submit Valuation Request'}
                    </button>
                </form>
            </div>

            {/* Request History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Request History</h3>

                {requests.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No requests yet</p>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div key={request.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {request.propertyDetails?.location || 'Property Valuation'}
                                            </h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                                                {request.status.replace('-', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        {request.propertyDetails && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {request.propertyDetails.type} • {request.propertyDetails.size}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            Submitted: {new Date(request.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {request.status === 'completed' && request.estimatedValue && (
                                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <h5 className="font-medium text-green-900 dark:text-green-300 mb-2">Estimated Value</h5>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {request.estimatedValue.currency} {request.estimatedValue.amount.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                                            Confidence: {request.estimatedValue.confidence}%
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
