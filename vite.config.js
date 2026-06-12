import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compress from 'vite-plugin-compression';

export default defineConfig({
  plugins: [react(), compress({ brotli: true })],
  base: '/independent-website/',
  build: {
    cssCodeSplit: true,
    minify: 'esbuild',
    outDir: '.',
  },
});