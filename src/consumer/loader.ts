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
const REGISTRY = new Map<string, Record<number, SymbolSvg>>();

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


export function getSymbol(k: SymbolKey): Record<OpticalSize, SymbolSvg> | undefined {
    const key = keyOf(k);
    const cKey = customKeyOf(k);

    // 1. Check parsed cache
    let available = REGISTRY.get(key) || REGISTRY.get(cKey);

    if (!available) {
        // 2. Check raw map
        const rawGroup = RAW_MAP[key] || RAW_MAP[cKey];
        if (rawGroup) {
            available = {};
            for (const [s, svg] of Object.entries(rawGroup)) {
                const parsed = parseSvg(svg as string);
                if (parsed) {
                    available[Number(s)] = parsed;
                }
            }
            REGISTRY.set(rawGroup === RAW_MAP[key] ? key : cKey, available);
        } else if (symbolConfig.debug) {
            console.warn(`[material-symbols-svg] Symbol not found: ${key}`);
        }
    }

    return available;
}
