import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'index.ts',
        'loader-map': 'src/consumer/loader-map.ts',
      },
      name: 'VitePluginMaterialSymbolsSvg',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (entryName === 'loader-map') return 'loader-map.js';
        return `${entryName}.${format === 'es' ? 'js' : 'cjs'}`;
      },
    },
    rollupOptions: {
      external: [
        'vite',
        './loader-map.js',
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
    minify: false,
    outDir: 'dist',
    emptyOutDir: true,
  },
});
