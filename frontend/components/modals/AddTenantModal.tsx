
import React, { useState, useEffect, FormEvent } from 'react';
import { propertyService } from '../../services/apiService';

interface Property {
    _id: string;
    title: string;
    location: string;
}

interface AddTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTenant: (tenantData: { propertyId: string; name: string; unit: string; email: string; phone: string; }) => void;
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({ isOpen, onClose, onAddTenant }) => {
    const [propertyId, setPropertyId] = useState('');
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProperties();
        }
    }, [isOpen]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const response = await propertyService.getProperties();
            setProperties(response.data.data || []);
        } catch (error) {
            console.error('Error fetching properties:', error);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onAddTenant({ propertyId, name, unit, email, phone });
        // Clear form for next time
        setPropertyId('');
        setName('');
        setUnit('');
        setEmail('');
        setPhone('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Tenant</h3>
                    <button onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="property" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Select Property</label>
                            <select
                                id="property"
                                value={propertyId}
                                onChange={(e) => setPropertyId(e.target.value)}
                                required
                                disabled={loading}
                                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                            >
                                <option value="">
                                    {loading ? 'Loading properties...' : 'Choose a property'}
                                </option>
                                {properties.map((property) => (
                                    <option key={property._id} value={property._id}>
                                        {property.title} - {property.location}
                                    </option>
                                ))}
                            </select>
                            {!loading && properties.length === 0 && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    No properties found. Please create a property first.
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="unit" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Unit/Apartment Number</label>
                            <input type="text" id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" placeholder="e.g., Apt 3B, Unit 12" />
                        </div>
                        <div>
                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tenant Full Name</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" placeholder="John Doe" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tenant Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" placeholder="tenant@example.com" />
                        </div>
                         <div>
                            <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tenant Phone</label>
                            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" placeholder="+254712345678" />
                        </div>
                    </div>
                    <div className="flex items-center justify-end pt-6 mt-4 border-t border-gray-200 dark:border-gray-600 rounded-b">
                        <button type="button" onClick={onClose} className="text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3">Cancel</button>
                        <button type="submit" className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Add & Invite Tenant</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
