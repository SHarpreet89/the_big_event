import path from "path";
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Fallbacks in case environment variables are not provided
  const apiUrl = env.VITE_API_URL || 'http://localhost:3001';
  const apiSecure = env.VITE_API_SECURE === 'true';
  const vitePort = parseInt(env.VITE_PORT) || 5173;

  console.warn('Vite config is being executed');
  console.warn('VITE_API_URL:', apiUrl);
  console.warn('VITE_API_SECURE:', apiSecure);
  console.warn('VITE_PORT:', vitePort);

  return {
    plugins: [
      react(),
      {
        name: 'log-env',
        configResolved(config) {
          console.warn('Final resolved Vite config:', {
            VITE_API_URL: apiUrl,
            VITE_API_SECURE: apiSecure,
            VITE_PORT: vitePort,
          });
        },
      },
    ],
    server: {
      port: vitePort,
      open: true,
      proxy: {
        '/graphql': {
          target: apiUrl,
          secure: apiSecure,
          changeOrigin: true,
        }
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
  }
});
