import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        'vite',
        'fs',
        'fs/promises',
        'path',
        '@babel/parser',
        '@babel/traverse',
        'marked',
        'gray-matter',
        'deadsimpleseo-react',
      ],
      output: {
        preserveModules: false,
        exports: 'named',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
