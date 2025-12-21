// Root package entry for the Vite plugin
// Provide both default and named exports for the plugin function

export { materialSymbolsSvg } from './src/plugin/plugin';
export type { MaterialSymbolsPluginOptions } from './src/plugin/plugin';
export { defineIcons } from './src/plugin/registry';
export { configureSymbolConfig, symbolConfig, isProduction } from './src/shared/config';
