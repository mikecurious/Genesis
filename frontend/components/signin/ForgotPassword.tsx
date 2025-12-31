import React, { useState } from 'react';
import { SpinnerIcon } from '../icons/SpinnerIcon';

interface ForgotPasswordProps {
    onBackToLogin: () => void;
    onSubmit: (email: string) => Promise<void>;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin, onSubmit }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const validate = () => {
        if (!email) {
            setError('Email is required.');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email is invalid.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setError('');

        try {
            await onSubmit(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-8 flex flex-col items-center justify-center pt-16">
                <div className="w-full max-w-md animate-fade-in-up">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-6 md:p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check Your Email</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
                            </p>
                            <button
                                onClick={onBackToLogin}
                                className="text-green-600 dark:text-green-400 font-medium hover:underline"
                            >
                                ← Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-8 flex flex-col items-center justify-center pt-16">
            <div className="w-full max-w-md animate-fade-in-up">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">Forgot Password?</h1>
                    <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                        Enter your email to receive a password reset link.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={validate}
                                required
                                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                                placeholder="your@email.com"
                            />
                            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? <SpinnerIcon /> : 'Send Reset Link'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-6">
                        <button
                            onClick={onBackToLogin}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                        >
                            ← Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
