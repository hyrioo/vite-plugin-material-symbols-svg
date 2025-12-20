/// <reference types="vite/client" />
// SVG registry used by the Vue icon component
// Belongs to the vite-plugin package

import type { MaterialSymbolIcon } from './icons';

// Local copies of the minimal types to avoid coupling to the Vue package
export type OpticalSize = 20 | 24 | 40 | 48;
export type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700;
export type Fill = boolean;
export type Theme = 'rounded' | 'outlined' | 'sharp';

export interface SymbolSvg {
  d: string;
  viewBox: string;
}

export interface SymbolKey {
  icon: string;
  theme: Theme;
  fill: 0 | 1;
  weight: number;
  size: number; // optical size in px
}

// Internal registry map (parsed cache)
const REGISTRY = new Map<string, SymbolSvg>();
let RAW_MAP: Record<string, string> = {};

const IS_DEV = true;

// Eagerly load the registry map in browser/Vite environments
if (typeof window !== 'undefined' || (globalThis as any).VITE_CLIENT) {
  // @ts-ignore
  import('./loader-map.ts').then(m => {
    RAW_MAP = m.default || {};
    if (IS_DEV) {
      console.log(`[material-symbols-svg] loader-map.ts loaded with ${Object.keys(RAW_MAP).length} symbols`);
    }
  }).catch((err) => {
    if (IS_DEV) {
      console.error('[material-symbols-svg] Failed to load loader-map.ts', err);
    }
  });
}

const DEFAULT_THEME: Theme = 'rounded';
const DEFAULT_FILL: 0 | 1 = 0;
const DEFAULT_WEIGHT = 200;

function keyOf(k: SymbolKey): string {
  return `${k.theme}::${k.icon}::${k.fill}::${k.weight}::${k.size}`;
}

function parseSvg(svg: string): SymbolSvg | null {
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/i);
  const pathMatch = svg.match(/<path[^>]*\sd="([^"]+)"[^>]*>/i);
  if (!viewBoxMatch || !pathMatch) return null;
  return { viewBox: viewBoxMatch[1], d: pathMatch[1] };
}

export function getSymbol(k: SymbolKey): SymbolSvg | undefined {
  const key = keyOf(k);
  
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

export type IconConfig = {
  sizes: readonly OpticalSize[];
  weights?: readonly Weight[];
  fills?: readonly Fill[];
  themes?: readonly Theme[];
};

/**
 * A type that hints to the IDE that the string is a relative file path.
 */
type RelativePath = `./${string}` | `../${string}`;

// defineIcons helper to create strongly typed maps
// A map of custom icons where each icon may specify any subset of optical sizes
// Example: { spark: { 24: svg24 }, brand: { 20: svg20, 40: svg40 } }
export type DefineCustomMap = Record<
  string,
  Partial<Readonly<Record<OpticalSize, unknown | RelativePath | Promise<{ default: string }> | { default: string }>>>
>;
/**
 * defineIcons
 * - symbols: the Material Symbols configuration per icon
 * - custom: optional custom icons map
 * - defaults: optional default config applied to all symbol entries
 */
export function defineIcons<
  S extends Partial<Record<MaterialSymbolIcon, Partial<IconConfig>>>,
  C extends DefineCustomMap = Record<never, never>,
  D extends Partial<IconConfig> | undefined = undefined
>(symbols: S, custom?: C, defaults?: D) {
  if (IS_DEV) {
    const symbolCount = Object.keys(symbols || {}).length;
    const customCount = Object.keys(custom || {}).length;
    console.log(`[material-symbols-svg] defineIcons: symbols=${symbolCount}, custom=${customCount}`);
  }

  // Register custom icons if they are provided as modules or promises
  if (custom && (typeof window !== 'undefined' || (globalThis as any).VITE_CLIENT)) {
    for (const [icon, sizes] of Object.entries(custom)) {
      for (const [sizeStr, value] of Object.entries(sizes || {})) {
        const size = Number(sizeStr) as OpticalSize;
        const key: SymbolKey = {
          icon,
          theme: DEFAULT_THEME,
          fill: DEFAULT_FILL,
          weight: DEFAULT_WEIGHT,
          size,
        };

        const handleSvg = (raw: unknown) => {
          const svgString = (typeof raw === 'string' ? raw : (raw as any)?.default) as string;
          if (svgString && typeof svgString === 'string') {
            const parsed = parseSvg(svgString);
            if (parsed) {
              REGISTRY.set(keyOf(key), parsed);
              if (IS_DEV) {
                console.log(`[material-symbols-svg] Custom icon registered: ${keyOf(key)}`);
              }
            }
          }
        };

        if (value instanceof Promise) {
          value.then(handleSvg).catch(err => {
            if (IS_DEV) {
              console.error(`[material-symbols-svg] Failed to load custom icon: ${icon} (${size})`, err);
            }
          });
        } else if (value && typeof value === 'object' && 'default' in value) {
          handleSvg(value);
        } else if (typeof value === 'string' && value.includes('<svg')) {
          handleSvg(value);
        }
      }
    }
  }

  return {
    Symbols: symbols,
    Custom: (custom ?? ({} as C)),
    Default: (defaults ?? (undefined as D)),
  } as const;
}

// Shape of the object returned by defineIcons() — used by the Vite plugin typing
export type DefinedIcons = ReturnType<typeof defineIcons>;
