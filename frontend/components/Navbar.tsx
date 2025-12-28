
import React from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { LogoutIcon } from './icons/LogoutIcon';

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
    <nav className="absolute top-0 left-0 right-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          <div className="flex items-center gap-4">
            {/* Hamburger menu on the left for dashboard */}
            {isDashboard && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                aria-label="Toggle menu"
              >
                <MenuIcon />
              </button>
            )}

            <button onClick={onLogoClick} className="flex items-center gap-2 group transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/50 transform group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MyGF AI
              </span>
            </button>
          </div>

          {!isDashboard && (
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={onFeaturesClick}
                className="text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                Features
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            {isDashboard && onLogout ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-red-500/30 transition-all duration-200 transform hover:scale-105"
              >
                <LogoutIcon />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <button
                onClick={onGoToAgentPortal}
                className="text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 transform hover:scale-105"
              >
                Agent Portal
              </button>
            )}

            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 transform hover:rotate-12"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>

            {!isDashboard && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                aria-label="Toggle menu"
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