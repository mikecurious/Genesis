import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3001,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
            secure: false,
          },
          '/uploads': {
            target: 'http://localhost:5000',
            changeOrigin: true,
            secure: false,
          },
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'services': path.resolve(__dirname, './services'),
          'components': path.resolve(__dirname, './components'),
          'pages': path.resolve(__dirname, './pages'),
          'hooks': path.resolve(__dirname, './hooks'),
          'types': path.resolve(__dirname, './types')
        }
      }
    };
});
