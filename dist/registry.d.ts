export type OpticalSize = 20 | 24 | 40 | 48;
export type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700;
export type Fill = boolean;
export type Theme = 'rounded' | 'outlined' | 'sharp';
import type { MaterialSymbolIcon } from './icons';
export interface SymbolSvg {
    d: string;
    viewBox: string;
}
export interface SymbolKey {
    icon: string;
    theme: Theme;
    fill: 0 | 1;
    weight: number;
    size: number;
}
export declare function getSymbol(k: SymbolKey): SymbolSvg | undefined;
export declare function registerSymbol(k: Partial<SymbolKey> & {
    icon: string;
    size: number;
}, svg: SymbolSvg): void;
export declare function unregisterSymbol(k: Partial<SymbolKey> & {
    icon: string;
    size: number;
}): void;
export declare function registerRawSymbol(k: Partial<SymbolKey> & {
    icon: string;
    size: number;
}, rawSvg: string): void;
export declare function autoRegisterCustom(map: Record<string, Readonly<Record<number, unknown>>>): void;
export declare function registerMultipleSizes(icon: string, sizes: readonly number[], resolveRawSvg: (size: number) => string, options?: Partial<Pick<SymbolKey, 'theme' | 'fill' | 'weight'>>): void;
export type IconConfig = {
    sizes: readonly OpticalSize[];
    weights?: readonly Weight[];
    fills?: readonly Fill[];
    themes?: readonly Theme[];
};
export type DefineCustomMap = Record<string, Partial<Readonly<Record<OpticalSize, unknown>>>>;
export declare function defineIcons<S extends Partial<Record<MaterialSymbolIcon, Partial<IconConfig>>>, C extends DefineCustomMap = Record<never, never>>(symbols: S, custom?: C): {
    readonly Symbols: S;
    readonly Custom: C;
};
