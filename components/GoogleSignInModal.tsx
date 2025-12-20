
import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface GoogleSignInModalProps {
    onSignIn: (credential: string) => void;
    onSkip: () => void;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({ onSignIn, onSkip }) => {
    const handleSuccess = (credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
            onSignIn(credentialResponse.credential);
        }
    };

    const handleError = () => {
        console.error('Google Sign-In failed');
        alert('Google Sign-In failed. Please try again.');
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
            <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-full max-w-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Sign In for More Benefits</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2 mb-4 text-center text-sm">
                    Unlock exclusive features by signing in with Google
                </p>

                {/* Benefits List */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        What you'll get:
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span><strong>Chat History</strong> - Access your conversations anytime, anywhere</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span><strong>Property Updates</strong> - Get notified about new listings & price changes</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span><strong>Investment Opportunities</strong> - Early access to high-ROI properties</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span><strong>Personalized Recommendations</strong> - AI-powered property matches</span>
                        </li>
                    </ul>
                </div>

                {/* Google Sign-In Button */}
                <div className="flex justify-center mb-4">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        useOneTap={false}
                        theme="outline"
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                    />
                </div>

                {/* Skip Option */}
                <button
                    onClick={onSkip}
                    className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium py-2 transition-colors"
                >
                    Continue without signing in
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};
