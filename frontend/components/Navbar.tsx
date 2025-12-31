
import React from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { Logo } from './Logo';

interface NavbarProps {
  onMenuClick: () => void;
  onGoToAgentPortal: () => void;
  onFeaturesClick: () => void;
  onLogoClick: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  currentView?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuClick,
  onGoToAgentPortal,
  onFeaturesClick,
  onLogoClick,
  theme,
  onToggleTheme,
  currentView,
  onLogout
}) => {
  const isDashboard = currentView === 'dashboard';

  return (
    <nav className="absolute top-0 left-0 right-0 z-20 bg-white/80 dark:bg-black/10 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          <div className="flex items-center gap-3">
            {/* Hamburger menu on the left for dashboard */}
            {isDashboard && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              >
                <MenuIcon />
              </button>
            )}

            <button onClick={onLogoClick} className="flex items-center">
              <Logo variant="navbar" />
            </button>
          </div>

          {!isDashboard && (
            <div className="hidden md:flex items-center space-x-4">
              <button onClick={onFeaturesClick} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">Features</button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {isDashboard && onLogout ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium shadow-lg"
              >
                <LogoutIcon />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <button
                onClick={onGoToAgentPortal}
                className="text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium shadow-lg"
              >
                Agent Portal
              </button>
            )}

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>

            {!isDashboard && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <MenuIcon />
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};