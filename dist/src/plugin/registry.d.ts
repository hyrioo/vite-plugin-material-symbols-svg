import type { PluginContext } from 'rollup';
import { type DefineCustomMap, type DefinedIcons, type Filled, type IconConfig, type OpticalSize, type SymbolKey, type SymbolSvg, type Theme, type Weight } from '../shared/types';
import { MaterialSymbolIcon } from './icons';
export type { OpticalSize, Weight, Filled, Theme, SymbolKey, SymbolSvg, IconConfig, DefinedIcons, DefineCustomMap };
/**
 * defineIcons
 * - symbols: the Material Symbols configuration per icon
 * - custom: optional custom icons map
 * - defaults: optional default config applied to all symbol entries
 */
export declare function defineIcons<S extends Partial<Record<MaterialSymbolIcon, Partial<IconConfig>>>, C extends DefineCustomMap = {}, D extends Partial<IconConfig> = {}>(symbols: S, custom: C, defaults: D): DefinedIcons;
export declare const IconDefaultConfig: {
    sizes: readonly [20, 24, 40, 48];
    weights: readonly [400];
    fills: readonly [0];
    themes: readonly ["rounded"];
};
export declare function generateConsumerFiles(ctx: PluginContext, iconsDef: DefinedIcons, loaderTypesFile: string, loaderMapFile: string, distDir: string): Promise<void>;
