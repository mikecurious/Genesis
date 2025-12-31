import React, { useState } from 'react';
import { SpinnerIcon } from '../icons/SpinnerIcon';

interface ResetPasswordProps {
    token: string;
    onBackToLogin: () => void;
    onSubmit: (token: string, newPassword: string) => Promise<void>;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ token, onBackToLogin, onSubmit }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const validate = () => {
        if (!newPassword) {
            setError('Password is required.');
            return false;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return false;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
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
            await onSubmit(token, newPassword);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrength = () => {
        if (!newPassword) return { text: '', color: '' };
        if (newPassword.length < 6) return { text: 'Too short', color: 'text-red-500' };
        if (newPassword.length < 8) return { text: 'Weak', color: 'text-orange-500' };
        if (newPassword.length < 12) return { text: 'Good', color: 'text-yellow-500' };
        return { text: 'Strong', color: 'text-green-500' };
    };

    const strength = getPasswordStrength();

    if (success) {
        return (
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-8 flex flex-col items-center justify-center pt-16">
                <div className="w-full max-w-md animate-fade-in-up">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-6 md:p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset Successful!</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Your password has been successfully reset. You can now sign in with your new password.
                            </p>
                            <button
                                onClick={onBackToLogin}
                                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Go to Login
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
                    <h1 className="text-4xl font-bold tracking-tight">Reset Password</h1>
                    <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                        Enter your new password below.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                onBlur={validate}
                                required
                                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                                placeholder="••••••••"
                            />
                            {newPassword && (
                                <p className={`text-xs mt-1 ${strength.color}`}>
                                    Password strength: {strength.text}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onBlur={validate}
                                required
                                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading || !newPassword || !confirmPassword}
                                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? <SpinnerIcon /> : 'Reset Password'}
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
