// Root package entry for the Vite plugin
// Provide both default and named exports for the plugin function

export { default } from './material-symbols-svg';
export { default as materialSymbolsSvg } from './material-symbols-svg';
export type { MaterialSymbolsPluginOptions, SymbolsIconsMap } from './material-symbols-svg';
export {
    defineIcons,
    getSymbol,
    registerSymbol,
    unregisterSymbol,
    registerRawSymbol,
    registerMultipleSizes,
    autoRegisterCustom,
} from './registry';
export type {
    OpticalSize,
    Weight,
    Fill,
    Theme,
    IconConfig,
} from './registry';