
import React, { useState } from 'react';
import { SpinnerIcon } from '../icons/SpinnerIcon';

interface VerificationScreenProps {
    email: string;
    onVerify: (otp: string) => void;
    isLoading: boolean;
    error: string | null;
}

export const VerificationScreen: React.FC<VerificationScreenProps> = ({ email, onVerify, isLoading, error }) => {
    const [otp, setOtp] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.trim()) {
            onVerify(otp);
        }
    };
    
    return (
        <div className="text-center animate-fade-in-up">
            <h2 className="text-2xl font-semibold mb-2">Verify Your Account</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
                We've sent a verification code to your email address: <strong className="text-gray-900 dark:text-white">{email}</strong>. Please enter the code below to continue.
            </p>
            
            <form onSubmit={handleSubmit} className="max-w-xs mx-auto">
                <label htmlFor="otp" className="sr-only">Verification Code</label>
                <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    maxLength={6}
                    className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-2xl tracking-[0.5em] text-center rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-4"
                    disabled={isLoading}
                />

                {error && <p className="text-sm text-red-500 dark:text-red-400 text-center mt-4">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-wait flex items-center justify-center"
                >
                    {isLoading ? <SpinnerIcon /> : 'Verify Account'}
                </button>
            </form>

            <p className="text-xs text-gray-500 mt-4">
                Didn't receive a code? <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Resend code</a>.
            </p>
        </div>
    );
};
