import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import deadSimpleSEO from 'vite-deadsimpleseo';

export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [
    react(),
    deadSimpleSEO({
      pagesDir: 'src/seo-pages',
      markdown: true,
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        posthog: 'src/assets/js/posthog-simple.mjs',
        banner: 'src/assets/js/banner-simple.mjs'
      }
    }
  }
});
