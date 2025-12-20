import type { Plugin } from 'vite';
import { IconsInput } from './registry';
export interface MaterialSymbolsPluginOptions {
    concurrency?: number;
    strict?: boolean;
    enabled?: boolean;
}
export default function materialSymbolsSvg(iconsDef: IconsInput, opts?: MaterialSymbolsPluginOptions): Plugin;
