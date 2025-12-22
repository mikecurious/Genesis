import React, { useState } from 'react';
import { SpinnerIcon } from '../icons/SpinnerIcon';

interface TenantSignInProps {
    onSignIn: (email: string, pass: string) => Promise<void>;
    onGoToAgentSignIn: () => void;
    onForgotPassword: () => void;
    isLoading: boolean;
    error: string | null;
}

export const TenantSignIn: React.FC<TenantSignInProps> = ({ onSignIn, onGoToAgentSignIn, onForgotPassword, isLoading, error: apiError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '' });

    const validate = () => {
        const newErrors = { email: '', password: '' };
        if (!email) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid.';
        }
        if (!password) {
            newErrors.password = 'Password is required.';
        }
        setErrors(newErrors);
        return !newErrors.email && !newErrors.password;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSignIn(email, password);
        }
    };

    const isFormValid = !errors.email && !errors.password && email && password;

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-8 flex flex-col items-center justify-center pt-16">
            <div className="w-full max-w-md animate-fade-in-up">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">Tenant Portal</h1>
                    <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Sign in to manage your tenancy.</p>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={validate}
                                required
                                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                placeholder="tenant@example.com"
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={validate}
                                required
                                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                            <div className="text-right mt-1">
                                <button
                                    type="button"
                                    onClick={onForgotPassword}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>

                        {apiError && <p className="text-sm text-red-500 dark:text-red-400 text-center">{apiError}</p>}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading || !isFormValid}
                                className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? <SpinnerIcon /> : 'Sign In'}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    Not a tenant?{' '}
                    <button onClick={onGoToAgentSignIn} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                        Agent Portal
                    </button>
                </p>
            </div>
        </div>
    );
};
