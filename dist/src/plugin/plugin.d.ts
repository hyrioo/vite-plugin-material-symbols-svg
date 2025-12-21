import type { Plugin } from 'vite';
import { type DefinedIcons as IconsInput } from './registry';
export interface MaterialSymbolsPluginOptions {
    concurrency?: number;
    strict?: boolean;
    enabled?: boolean;
    debug?: boolean;
}
export declare function materialSymbolsSvg(iconsDef: IconsInput, opts?: MaterialSymbolsPluginOptions): Plugin;
