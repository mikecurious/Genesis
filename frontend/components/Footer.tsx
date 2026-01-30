import React from "react";

interface FooterProps {
  onPrivacyClick: () => void;
  onTermsClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onPrivacyClick, onTermsClick }) => {
  return (
    <footer className="bg-white/80 dark:bg-black/10 backdrop-blur-md border-t border-gray-200 dark:border-white/10 py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2026 Genesis Real Estate Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={onPrivacyClick}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline"
            >
              Privacy Policy
            </button>
            <span className="text-gray-400 dark:text-gray-600">|</span>
            <button
              onClick={onTermsClick}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
