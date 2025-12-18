import type { Plugin } from 'vite';
import type { IconConfig } from './registry';
export type IconsInput = {
    Symbols: Record<string, {
        sizes?: readonly number[];
        weights?: readonly number[];
        fills?: readonly (boolean | 0 | 1)[];
        themes?: readonly ('rounded' | 'outlined' | 'sharp')[];
    }>;
    Custom?: Record<string, Partial<Readonly<Record<number, unknown | `./${string}` | `../${string}`>>>>;
    Default?: Partial<IconConfig>;
};
export interface MaterialSymbolsPluginOptions {
    concurrency?: number;
    strict?: boolean;
    enabled?: boolean;
    cleanRemoved?: boolean;
}
export default function materialSymbolsSvg(iconsDef: IconsInput, opts?: MaterialSymbolsPluginOptions): Plugin;
