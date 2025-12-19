import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'index.ts',
        'registry-map': 'registry-map.ts',
      },
      name: 'VitePluginMaterialSymbolsSvg',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (entryName === 'registry-map') return 'registry-map.js';
        return `${entryName}.${format === 'es' ? 'js' : 'cjs'}`;
      },
    },
    rollupOptions: {
      external: [
        'vite',
        './registry-map.js',
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
