import path from "path"
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ command, mode }) => {
  // Load environment variables based on the mode
  const env = loadEnv(mode, process.cwd(), '')

  // Use console.warn for more visibility
  console.warn('Vite config is being executed');
  console.warn('VITE_API_URL:', env.VITE_API_URL);
  console.warn('VITE_API_SECURE:', env.VITE_API_SECURE);
  console.warn('VITE_PORT:', env.VITE_PORT);

  return {
    plugins: [
      react(),
      {
        name: 'log-env',
        configResolved(config) {
          console.warn('Final resolved Vite config:', {
            VITE_API_URL: config.env.VITE_API_URL,
            VITE_API_SECURE: config.env.VITE_API_SECURE,
            VITE_PORT: config.env.VITE_PORT,
          });
        },
      },
    ],
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
      open: true,
      proxy: {
        '/graphql': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          secure: env.VITE_API_SECURE === 'true',
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
})