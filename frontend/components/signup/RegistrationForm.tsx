import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from '../icons/SpinnerIcon';

export interface RegistrationFormData {
    fullName: string;
    email: string;
    phone: string;
    countryCode: string;
    password: string;
}

interface RegistrationFormProps {
    onSubmit: (data: RegistrationFormData) => void;
    isLoading: boolean;
    error: string | null;
}

const countryCodes = [
    { name: 'Kenya', code: '+254' },
    { name: 'Uganda', code: '+256' },
    { name: 'Tanzania', code: '+255' },
    { name: 'Rwanda', code: '+250' },
];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, isLoading, error: apiError }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        countryCode: '+254',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isFormValid, setIsFormValid] = useState(false);

    const validateField = (name: string, value: string) => {
        let error = '';
        switch (name) {
            case 'fullName':
                if (!value) error = 'Full name is required.';
                break;
            case 'email':
                if (!value) error = 'Email is required.';
                else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid.';
                break;
            case 'phone':
                if (value && !/^\d{9}$/.test(value)) error = 'Phone number must be 9 digits.';
                break;
            case 'password':
                if (!value) error = 'Password is required.';
                else if (value.length < 6) error = 'Password must be at least 6 characters.';
                break;
            case 'confirmPassword':
                if (!value) error = 'Please confirm your password.';
                else if (value !== formData.password) error = 'Passwords do not match.';
                break;
            default:
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    useEffect(() => {
        const hasErrors = Object.values(errors).some(error => error !== '');
        const requiredFields = ['fullName', 'email', 'password', 'confirmPassword'];
        const hasEmptyRequiredFields = requiredFields.some(field => !formData[field as keyof typeof formData]);
        setIsFormValid(!hasErrors && !hasEmptyRequiredFields);
    }, [formData, errors]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        validateField(name, value);
        if (name === 'password') {
            validateField('confirmPassword', formData.confirmPassword);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) {
            const { confirmPassword, ...submissionData } = formData;
            onSubmit(submissionData);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-semibold text-center mb-6">Create Your Account</h2>
            <form onSubmit={handleSubmit} className="space-y-3 max-w-lg mx-auto">
                <div>
                    <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Full Name / Company Name</label>
                    <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} required className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" placeholder="e.g., John Doe or ABC Properties" />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>
                <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" placeholder="you@example.com" />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                    <div className="flex">
                        <select name="countryCode" value={formData.countryCode} onChange={handleChange} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-l-lg focus:ring-green-500 focus:border-green-500 block p-2.5">
                            {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code} ({c.name})</option>)}
                        </select>
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-r-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" placeholder="712345678 (optional)" />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} required className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} required className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" />
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>

                {apiError && <p className="text-sm text-red-500 dark:text-red-400 text-center">{apiError}</p>}

                <div className="pt-4">
                    <button type="submit" disabled={isLoading || !isFormValid} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center">
                        {isLoading ? <SpinnerIcon /> : 'Register'}
                    </button>
                </div>
            </form>
        </div>
    );
};
