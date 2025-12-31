
import React from 'react';
import { UserIcon } from './icons/UserIcon';
import { PlusIcon } from './icons/PlusIcon';
import { type User, type ChatUser, type Conversation, UserRole } from '../types';
import { LogoutIcon } from './icons/LogoutIcon';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isUserLoggedIn: boolean;
  currentUser: User | null;
  chatUser: ChatUser | null;
  onHomeClick: () => void;
  onFeaturesClick: () => void;
  onDashboardClick: () => void;
  onLogout: () => void;
  conversations: Record<string, Conversation>;
  currentConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
}

const NavItem: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button onClick={onClick} className="block w-full text-left px-4 py-2 text-md text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700/50">
    {children}
  </button>
);

const ConversationItem: React.FC<{ children: React.ReactNode; onClick: () => void; isActive: boolean; }> = ({ children, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700/50 truncate transition-colors ${isActive ? 'bg-gray-200 dark:bg-gray-700 font-semibold' : ''}`}>
    {children}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  setIsOpen, 
  isUserLoggedIn,
  currentUser,
  chatUser, 
  onHomeClick, 
  onFeaturesClick, 
  onDashboardClick,
  onLogout,
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation
}) => {
  
  const getUserDisplayName = () => {
    if (currentUser?.name) return currentUser.name;
    if (chatUser?.name) return chatUser.name;
    return "Guest User";
  };
  
  const getUserStatusText = () => {
    if (currentUser?.role) return currentUser.role;
    if (chatUser) return "Property Seeker";
    return "Sign in to save history";
  };
  
  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900/70 backdrop-blur-lg z-40 transform transition-transform md:relative md:translate-x-0 md:flex-shrink-0 border-r border-gray-200 dark:border-gray-700/50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
           <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
          </div>
          <nav className="p-4 space-y-2">
            <NavItem onClick={onNewChat}>New Chat</NavItem>
            <NavItem onClick={onFeaturesClick}>Features</NavItem>
            {isUserLoggedIn && currentUser?.role !== UserRole.Tenant && <NavItem onClick={onDashboardClick}>Dashboard</NavItem>}
            {isUserLoggedIn && currentUser?.role === UserRole.Tenant && <NavItem onClick={onDashboardClick}>My Dashboard</NavItem>}
          </nav>
          
          <div className="flex items-center justify-between h-12 px-4 border-t border-gray-200 dark:border-gray-700/50">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Conversations</h2>
            <button onClick={onNewChat} className="p-1 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <PlusIcon />
            </button>
          </div>
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {Object.values(conversations).reverse().map((convo: Conversation) => (
                <ConversationItem 
                  key={convo.id}
                  isActive={convo.id === currentConversationId}
                  onClick={() => onSelectConversation(convo.id)}
                >
                  {convo.title}
                </ConversationItem>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{getUserDisplayName()}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400">{getUserStatusText()}</span>
              </div>
              {isUserLoggedIn && (
                <button onClick={onLogout} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Logout">
                  <LogoutIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};