import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildFormat = async (format: 'es' | 'cjs') => {
  return defineConfig({
    plugins: [react()],
    build: {
      lib: {
        entry: {
          index: resolve(__dirname, 'src/index.ts'),
        },
        formats: [format],
        fileName: () => 'index.js',
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', 'marked'],
        output: {
          preserveModules: false,
          exports: 'named',
          minifyInternalExports: false,
        },
      },
      minify: false,
      outDir: `dist/${format === 'es' ? 'esm' : 'cjs'}`,
      emptyOutDir: format === 'es',
    },
  });
};

export default buildFormat(process.env.FORMAT as 'es' | 'cjs' || 'es');
