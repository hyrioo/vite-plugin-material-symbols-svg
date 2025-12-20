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
export type IconConfig = {
    sizes: readonly OpticalSize[];
    weights?: readonly Weight[];
    fills?: readonly Fill[];
    themes?: readonly Theme[];
};
/**
 * A type that hints to the IDE that the string is a relative file path.
 */
type RelativePath = `./${string}` | `../${string}`;
export type DefineCustomMap = Record<string, Partial<Readonly<Record<OpticalSize, unknown | RelativePath | Promise<{
    default: string;
}> | {
    default: string;
}>>>>;
/**
 * defineIcons
 * - symbols: the Material Symbols configuration per icon
 * - custom: optional custom icons map
 * - defaults: optional default config applied to all symbol entries
 */
export declare function defineIcons<S extends Partial<Record<MaterialSymbolIcon, Partial<IconConfig>>>, C extends DefineCustomMap = Record<never, never>, D extends Partial<IconConfig> | undefined = undefined>(symbols: S, custom?: C, defaults?: D): {
    readonly Symbols: S;
    readonly Custom: C;
    readonly Default: D;
};
export type DefinedIcons = ReturnType<typeof defineIcons>;
export {};
