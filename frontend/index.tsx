
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap with GoogleOAuthProvider only if client ID is provided
const AppWithProviders = googleClientId ? (
  <GoogleOAuthProvider clientId={googleClientId}>
    <App />
  </GoogleOAuthProvider>
) : (
  <>
    <App />
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '10px 15px',
      background: '#FFA500',
      color: 'white',
      borderRadius: '8px',
      fontSize: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      zIndex: 9999
    }}>
      ⚠️ Google OAuth not configured. Some features may be limited.
    </div>
  </>
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      {AppWithProviders}
    </ErrorBoundary>
  </React.StrictMode>
);
