// Root package entry for the Vite plugin
// Provide both default and named exports for the plugin function

export { default as materialSymbolsSvg } from './src/plugin/plugin';
export type { MaterialSymbolsPluginOptions } from './src/plugin/plugin';
export type { MaterialSymbolIcon } from './src/consumer/icons';
export {
    defineIcons,
    getSymbol,
} from './src/consumer/loader';
export type {
    OpticalSize,
    Weight,
    Fill,
    Theme,
    IconConfig,
    DefinedIcons,
    SymbolKey,
    SymbolSvg,
} from './src/consumer/loader';
export type { IconKey } from './src/consumer/loader-types';