// SVG registry used by the Vue icon component
// Belongs to the vite-plugin package

import {
    type DefineCustomMap,
    type DefinedIcons,
    type Fill,
    type IconConfig,
    type OpticalSize,
    type SymbolKey,
    type SymbolSvg,
    type Theme,
    type Weight,
} from '../shared/types';
import { keyOf, parseSvg } from '../shared/utils';
import RAW_MAP from './loader-map.js';

// Internal registry map (parsed cache)
const REGISTRY = new Map<string, SymbolSvg>();

const IS_DEV = true;

export type {
    OpticalSize,
    Weight,
    Fill,
    Theme,
    IconConfig,
    DefinedIcons,
    SymbolKey,
    SymbolSvg,
    DefineCustomMap,
};

export function getSymbol(k: SymbolKey): SymbolSvg | undefined {
    const key = keyOf(k);
    if (IS_DEV) {
        console.log(`[material-symbols-svg] Get symbol:`, key);
    }
    
    // 1. Check parsed cache
    let symbol = REGISTRY.get(key);
    if (symbol) return symbol;

    // 2. Check raw map
    const raw = RAW_MAP[key];
    if (raw) {
        symbol = parseSvg(raw) || undefined;
        if (symbol) {
            REGISTRY.set(key, symbol);
            if (IS_DEV) {
                console.log(`[material-symbols-svg] getSymbol: parsed and cached "${key}"`);
            }
            return symbol;
        }
    }

    if (IS_DEV) {
        console.warn(`[material-symbols-svg] getSymbol: NOT found "${key}"`);
    }
    return undefined;
}
