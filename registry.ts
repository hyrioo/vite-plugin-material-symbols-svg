/// <reference types="vite/client" />
// SVG registry used by the Vue icon component
// Belongs to the vite-plugin package

// Local copies of the minimal types to avoid coupling to the Vue package
export type OpticalSize = 20 | 24 | 40 | 48;
export type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700;
export type Fill = boolean;
export type Theme = 'rounded' | 'outlined' | 'sharp';

// Strongly-typed icon names come from generated ./icons.d.ts (overwritten in dev)
// Ship placeholder: export type MaterialSymbolIcon = string;
import type { MaterialSymbolIcon } from './icons';

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

// Internal registry map
const REGISTRY = new Map<string, SymbolSvg>(); // symbols (file-based)

const IS_DEV = (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') || 
               (typeof (import.meta as any).env !== 'undefined' && (import.meta as any).env.DEV);

// Eagerly load all Symbols SVGs as raw strings at build time
if (typeof window !== 'undefined' || (globalThis as any).VITE_CLIENT) {
  // @ts-ignore
  import('./registry-map.js').then(m => {
    const symbolFiles = (m.default || {}) as Record<string, string>;
    const keys = Object.keys(symbolFiles);
    if (IS_DEV) {
      console.log(`[material-symbols-svg] Loading registry-map.js with ${keys.length} symbols`);
    }
    // Build the symbols registry
    let count = 0;
    for (const [pathName, rawSvg] of Object.entries(symbolFiles)) {
      const meta = parseFilename(pathName);
      if (!meta) continue;
      const parsed = parseSvg(rawSvg);
      if (!parsed) continue;
      REGISTRY.set(keyOf(meta), parsed);
      count++;
    }
    if (IS_DEV) {
      console.log(`[material-symbols-svg] Registry populated with ${count} symbols`);
    }
  }).catch((err) => {
    if (IS_DEV) {
      console.error('[material-symbols-svg] Failed to load registry-map.js', err);
    }
    // registry-map.js might not exist or fail to load in non-browser environments
  });
}

const DEFAULT_THEME: Theme = 'rounded';
const DEFAULT_FILL: 0 | 1 = 0;
const DEFAULT_WEIGHT = 200;

function keyOf(k: SymbolKey): string {
  return `${k.theme}::${k.icon}::${k.fill}::${k.weight}::${k.size}`;
}

function parseFilename(filePath: string): SymbolKey | null {
  // Example: rounded/folder.w200.s24.svg or folder-fill.w200.s24.svg
  // Custom example: custom/spark/24
  const normalized = filePath.replace(/\\/g, '/');

  if (normalized.startsWith('custom/')) {
    const parts = normalized.split('/');
    if (parts.length < 3) return null;
    const icon = parts[1];
    const size = Number(parts[2]);
    if (isNaN(size)) return null;
    return {
      theme: DEFAULT_THEME,
      icon,
      fill: DEFAULT_FILL,
      weight: DEFAULT_WEIGHT,
      size,
    };
  }

  const m = normalized.match(/(rounded|outlined|sharp)\/([^/]+)\.svg$/);
  if (!m) return null;
  const theme = m[1] as Theme;
  const filename = m[2];
  const [base, ...suffixes] = filename.split('.');
  let icon = base;
  let fill: 0 | 1 = 0;
  if (base.endsWith('-fill')) {
    icon = base.slice(0, -'-fill'.length);
    fill = 1;
  }
  let weight = 400;
  let size = 24;
  for (const s of suffixes) {
    if (s.startsWith('w')) {
      const n = Number(s.slice(1));
      if (Number.isFinite(n)) weight = n;
    } else if (s.startsWith('s')) {
      const n = Number(s.slice(1));
      if (Number.isFinite(n)) size = n;
    }
  }
  return { theme, icon, fill, weight, size };
}

function parseSvg(svg: string): SymbolSvg | null {
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/i);
  const pathMatch = svg.match(/<path[^>]*\sd="([^"]+)"[^>]*>/i);
  if (!viewBoxMatch || !pathMatch) return null;
  return { viewBox: viewBoxMatch[1], d: pathMatch[1] };
}

// Build the symbols registry at module init
// (Removed static build, moved to dynamic import above)

export function getSymbol(k: SymbolKey): SymbolSvg | undefined {
  const key = keyOf(k);
  const symbol = REGISTRY.get(key);
  if (IS_DEV) {
    if (symbol) {
      console.log(`[material-symbols-svg] getSymbol: found "${key}"`);
    } else {
      console.warn(`[material-symbols-svg] getSymbol: NOT found "${key}"`);
    }
  }
  return symbol;
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
  Partial<Readonly<Record<OpticalSize, unknown | RelativePath>>>
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
  return {
    Symbols: symbols,
    Custom: (custom ?? ({} as C)),
    Default: (defaults ?? (undefined as D)),
  } as const;
}

// Shape of the object returned by defineIcons() — used by the Vite plugin typing
export type DefinedIcons = ReturnType<typeof defineIcons>;

