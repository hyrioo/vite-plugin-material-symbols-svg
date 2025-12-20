import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'index.ts',
        consumer: 'consumer.ts',
        'loader-map': 'src/consumer/loader-map.js',
      },
      name: 'VitePluginMaterialSymbolsSvg',
      formats: ['es'],
      fileName: (format, entryName) => {
        if (entryName === 'loader-map') {
          return format === 'es' ? 'loader-map.js' : 'loader-map.cjs';
        }
        return `${entryName}.${format === 'es' ? 'js' : 'cjs'}`;
      },
    },
    rollupOptions: {
      external: [
        'vite',
        './src/consumer/loader-map.ts',
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
