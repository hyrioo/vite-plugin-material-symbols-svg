import { type DefineCustomMap, type DefinedIcons, type Filled, type IconConfig, type OpticalSize, type SymbolKey, type SymbolSvg, type Theme, type Weight } from '../shared/types';
export type { OpticalSize, Weight, Filled, Theme, IconConfig, DefinedIcons, SymbolKey, SymbolSvg, DefineCustomMap, };
export declare function getSymbol(k: SymbolKey): Record<OpticalSize, SymbolSvg> | undefined;
