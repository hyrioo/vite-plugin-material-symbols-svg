import type { Plugin } from 'vite';
import type { IconConfig } from './registry';
export type IconsInput = {
    readonly Symbols: Record<string, {
        readonly sizes?: readonly number[];
        readonly weights?: readonly number[];
        readonly fills?: readonly (boolean | 0 | 1)[];
        readonly themes?: readonly ('rounded' | 'outlined' | 'sharp')[];
    }>;
    readonly Custom?: Record<string, Partial<Readonly<Record<number, unknown>>>>;
    readonly Default?: Partial<IconConfig>;
};
export interface MaterialSymbolsPluginOptions {
    concurrency?: number;
    strict?: boolean;
    enabled?: boolean;
    cleanRemoved?: boolean;
}
export default function materialSymbolsSvg(iconsDefOrPath: IconsInput | string, opts?: MaterialSymbolsPluginOptions): Plugin;
