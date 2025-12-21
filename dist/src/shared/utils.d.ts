import { type SymbolKey, type SymbolSvg, type Theme } from './types';
export declare function keyOf(k: SymbolKey): string;
export declare function customKeyOf(k: Pick<SymbolKey, 'icon'>): string;
export declare function parseSvg(svg: string): SymbolSvg | null;
export declare function unique<T>(arr: T[]): T[];
export declare function normalizeNums(input: readonly unknown[] | undefined, fallback: readonly number[]): number[];
export declare function normalizeFills(input: readonly (boolean | 0 | 1)[] | undefined, fallback: readonly (0 | 1)[]): (0 | 1)[];
export declare function normalizeThemes(input: readonly unknown[] | undefined, fallback: readonly Theme[]): Theme[];
