import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: {
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL),
      'process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          lading: path.resolve(__dirname, 'lading-page/index.html'),
          sell: path.resolve(__dirname, 'lading-page/sell.html'),
          guide: path.resolve(__dirname, 'lading-page/guide.html'),
        },
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-mantine': ['@mantine/core', '@mantine/hooks'],
            'vendor-ui': ['lucide-react', 'framer-motion', 'motion'],
            'vendor-charts': ['recharts'],
            'vendor-infra': ['@supabase/supabase-js'],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
    },
  };
});
