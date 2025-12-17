import type { Plugin } from 'vite';
export type SymbolsIconsMap = Record<string, {
    sizes?: readonly number[];
    weights?: readonly number[];
    fills?: readonly boolean[];
    themes?: readonly ('rounded' | 'outlined' | 'sharp')[];
}>;
export interface MaterialSymbolsPluginOptions {
    icons: SymbolsIconsMap;
    outDir?: string;
    concurrency?: number;
    strict?: boolean;
    enabled?: boolean;
    cleanRemoved?: boolean;
}
export default function materialSymbolsSvg(opts: MaterialSymbolsPluginOptions): Plugin;
