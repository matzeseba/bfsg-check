import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dashboard läuft im Dev auf 5183 und proxyt /api an die Engine (127.0.0.1:4870).
// Build nutzt relative Base './', da die Engine dist/ statisch ausliefert.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5183,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4870',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
