import type { Plugin } from 'vite';
export type SymbolsIconsMap = Record<string, {
    sizes?: readonly number[];
    weights?: readonly number[];
    fills?: readonly (boolean | 0 | 1)[];
    themes?: readonly ('rounded' | 'outlined' | 'sharp')[];
}>;
export interface MaterialSymbolsPluginOptions {
    icons: SymbolsIconsMap;
    concurrency?: number;
    strict?: boolean;
    enabled?: boolean;
    cleanRemoved?: boolean;
}
export default function materialSymbolsSvg(opts: MaterialSymbolsPluginOptions): Plugin;
