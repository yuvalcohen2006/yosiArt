import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Manual chunking only applies to the client bundle. During the SSR
  // pass (vite-react-ssg's pre-render build) react / react-dom are
  // externalised, and Rollup refuses to put externals into manualChunks.
  build: isSsrBuild
    ? {}
    : {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'framer-motion': ['framer-motion'],
              lightbox: ['yet-another-react-lightbox'],
              i18n: [
                'i18next',
                'react-i18next',
                'i18next-browser-languagedetector',
              ],
              sanity: ['@sanity/client', '@sanity/image-url'],
            },
          },
        },
      },
}));
