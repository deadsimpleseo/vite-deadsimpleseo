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
});
