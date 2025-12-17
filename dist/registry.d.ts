export type Theme = 'rounded' | 'outlined' | 'sharp';
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
