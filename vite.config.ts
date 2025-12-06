import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Барлық env мәндерін алу
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/ai-foto/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],

    // Мұнда тек керекті айнымалыларды ғана экспорттаймыз
    // process.env.* орнына import.meta.env.* қолданған дұрыс
    define: {
      __API_KEY__: JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
