import React, { useState, useRef } from 'react';
import { LandSearchRequest } from '../../../types';

interface LandSearchRequestProps {
    userId: string;
}

export const LandSearchRequestComponent: React.FC<LandSearchRequestProps> = ({ userId }) => {
    const [parcelNumber, setParcelNumber] = useState('');
    const [location, setLocation] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [requests, setRequests] = useState<LandSearchRequest[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!parcelNumber || !location) {
            alert('Please provide parcel number and location');
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('parcelNumber', parcelNumber);
        formData.append('location', location);
        if (selectedFile) {
            formData.append('document', selectedFile);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/verification/land-search`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                alert('Land search request submitted successfully!');
                setParcelNumber('');
                setLocation('');
                setSelectedFile(null);
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
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/verification/land-search`, {
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

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
        return badges[status as keyof typeof badges] || badges.pending;
    };

    return (
        <div className="space-y-6">
            {/* Request Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submit Land Search Request</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Parcel Number *
                        </label>
                        <input
                            type="text"
                            value={parcelNumber}
                            onChange={(e) => setParcelNumber(e.target.value)}
                            placeholder="e.g., LR 209/12345"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Location *
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., Nairobi, Westlands"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Supporting Document (Optional)
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                        />
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Choose File
                            </button>
                            {selectedFile && (
                                <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    {selectedFile.name}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFile(null)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {submitting ? 'Submitting...' : 'Submit Request'}
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
                                            <h4 className="font-medium text-gray-900 dark:text-white">Parcel: {request.parcelNumber}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                                                {request.status.replace('-', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Location: {request.location}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            Submitted: {new Date(request.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {request.status === 'completed' && request.results && (
                                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Results</h5>
                                        {request.results.ownershipHistory && request.results.ownershipHistory.length > 0 && (
                                            <div className="mb-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ownership History:</span>
                                                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 ml-4">
                                                    {request.results.ownershipHistory.map((owner, idx) => (
                                                        <li key={idx}>{owner}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {request.results.boundaries && (
                                            <div className="mb-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Boundaries:</span>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{request.results.boundaries}</p>
                                            </div>
                                        )}
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
