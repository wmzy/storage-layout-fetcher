import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'node18',
    commonjsOptions: {
      // esmExternals: ['p-throttle'],
      // esmExternals: true,
    },
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
      output: {
        interop: 'esModule',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
