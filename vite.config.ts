import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'node18',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'storage-layout-fetcher',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`,
    },
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: /^[^\/\.].*/,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
