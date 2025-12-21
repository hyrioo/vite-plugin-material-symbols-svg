// SVG registry used by the Vue icon component
// Belongs to the vite-plugin package

import {
    type DefineCustomMap,
    type DefinedIcons,
    type Filled,
    type IconConfig,
    type OpticalSize,
    type SymbolKey,
    type SymbolSvg,
    type Theme,
    type Weight,
} from '../shared/types';
import { customKeyOf, keyOf, parseSvg } from '../shared/utils';
import { symbolConfig } from '../shared/config';
import RAW_MAP from './loader-map.js';

// Internal registry map (parsed cache)
const REGISTRY = new Map<string, SymbolSvg>();

export type {
    OpticalSize,
    Weight,
    Filled,
    Theme,
    IconConfig,
    DefinedIcons,
    SymbolKey,
    SymbolSvg,
    DefineCustomMap,
};

export function getSymbol(k: SymbolKey): SymbolSvg | undefined {
    let key = keyOf(k);

    // 1. Check parsed cache
    let symbol = REGISTRY.get(key);
    if (symbol) return symbol;

    // 2. Check raw map
    let raw = RAW_MAP[key];

    // 3. Fallback to custom icon key format if not found
    if (!raw) {
        const cKey = customKeyOf(k);
        symbol = REGISTRY.get(cKey);
        if (symbol) return symbol;

        raw = RAW_MAP[cKey];
        if (raw) {
            key = cKey;
        }
    }

    if (raw) {
        symbol = parseSvg(raw) || undefined;
        if (symbol) {
            REGISTRY.set(key, symbol);
            return symbol;
        }
    }

    if (symbolConfig.debug) {
        console.warn(`[material-symbols-svg] Symbol not found "${key}"`);
    }
    return undefined;
}
