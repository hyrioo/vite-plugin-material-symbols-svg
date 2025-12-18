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
import symbolMap from './registry-map.js';

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

// Eagerly load all Symbols SVGs as raw strings at build time
const symbolFiles = (symbolMap || {}) as Record<string, string>;

// Internal registry map
const REGISTRY = new Map<string, SymbolSvg>(); // symbols (file-based)

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
for (const [pathName, rawSvg] of Object.entries(symbolFiles)) {
  const meta = parseFilename(pathName);
  if (!meta) continue;
  const parsed = parseSvg(rawSvg);
  if (!parsed) continue;
  REGISTRY.set(keyOf(meta), parsed);
}

export function getSymbol(k: SymbolKey): SymbolSvg | undefined {
  return REGISTRY.get(keyOf(k));
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
  return {
    Symbols: symbols,
    Custom: (custom ?? ({} as C)),
    Default: (defaults ?? (undefined as D)),
  } as const;
}

// Shape of the object returned by defineIcons() — used by the Vite plugin typing
export type DefinedIcons = ReturnType<typeof defineIcons>;

