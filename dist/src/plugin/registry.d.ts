import type { PluginContext } from 'rollup';
export type Theme = 'rounded' | 'outlined' | 'sharp';
export interface IconsInput {
    Symbols: Record<string, {
        sizes?: readonly number[];
        weights?: readonly number[];
        fills?: readonly (boolean | 0 | 1)[];
        themes?: readonly Theme[];
    }>;
    Custom?: Record<string, any>;
    Default?: any;
}
export declare function unique<T>(arr: T[]): T[];
export declare function normalizeNums(input: readonly unknown[] | undefined, fallback: readonly number[]): number[];
export declare function normalizeFills(input: readonly (boolean | 0 | 1)[] | undefined, fallback: readonly (0 | 1)[]): (0 | 1)[];
export declare function normalizeThemes(input: readonly unknown[] | undefined, fallback: readonly Theme[]): Theme[];
export declare const IconDefaultConfig: {
    sizes: readonly [20, 24, 40, 48];
    weights: readonly [400];
    fills: readonly [0];
    themes: readonly ["rounded"];
};
export declare function generateConsumerFiles(ctx: PluginContext, iconsDef: IconsInput, loaderTypesFile: string, loaderMapFile: string, distDir: string): Promise<void>;
