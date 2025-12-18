import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'index.ts',
      name: 'VitePluginMaterialSymbolsSvg',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: [
        'vite',
        './registry-map',
        // Node built-ins that might be referenced by plugin utilities
        'node:fs',
        'node:fs/promises',
        'node:path',
        'node:url',
        'fs',
        'path',
      ],
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
  },
});
