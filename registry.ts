/// <reference types="vite/client" />
// SVG registry used by the Vue icon component
// Belongs to the vite-plugin package

// Local copies of the minimal types to avoid coupling to the Vue package
export type OpticalSize = 20 | 24 | 40 | 48;
export type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700;
export type Fill = boolean;
export type Theme = 'rounded' | 'outlined' | 'sharp';

// Typing hook: Consumers (or the plugin's generator) can augment this interface
// via declaration merging to provide strongly-typed icon names.
// See: .temp/icons.d.ts which declares a module augmentation for this package.
export interface __MaterialSymbolIconIndex {}
export type MaterialSymbolIcon = keyof __MaterialSymbolIconIndex extends string
  ? keyof __MaterialSymbolIconIndex
  : string;

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
const symbolFiles = import.meta.glob('/symbols/**/**/*.svg', {
  as: 'raw',
  eager: true,
}) as Record<string, string>;

// Also load raw custom icons from the custom folder
const customFiles = import.meta.glob('/custom/**/*.svg', {
  as: 'raw',
  eager: true,
}) as Record<string, string>;

// Internal registry maps
const REGISTRY = new Map<string, SymbolSvg>(); // symbols (file-based)
const CUSTOM_REGISTRY = new Map<string, SymbolSvg>(); // exact axes (optional)
const CUSTOM_SIMPLE = new Map<string, SymbolSvg>(); // icon+size only (axis-agnostic)

const DEFAULT_THEME: Theme = 'rounded';
const DEFAULT_FILL: 0 | 1 = 0;
const DEFAULT_WEIGHT = 200;

function keyOf(k: SymbolKey): string {
  return `${k.theme}::${k.icon}::${k.fill}::${k.weight}::${k.size}`;
}

function parseFilename(filePath: string): SymbolKey | null {
  // Example: /.../symbols/rounded/folder.w200.s24.svg or folder-fill.w200.s24.svg
  const m = filePath.replace(/\\/g, '/').match(/symbols\/(rounded|outlined|sharp)\/([^/]+)\.svg$/);
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
  const key = keyOf(k);
  const exact = CUSTOM_REGISTRY.get(key);
  if (exact) return exact;
  const simpleKey = `${k.icon}::${k.size}`;
  const simple = CUSTOM_SIMPLE.get(simpleKey);
  if (simple) return simple;
  return REGISTRY.get(key);
}

export function registerSymbol(k: Partial<SymbolKey> & { icon: string; size: number }, svg: SymbolSvg): void {
  const full: SymbolKey = {
    icon: k.icon,
    size: k.size,
    theme: (k.theme ?? DEFAULT_THEME) as Theme,
    fill: (k.fill ?? DEFAULT_FILL) as 0 | 1,
    weight: Number(k.weight ?? DEFAULT_WEIGHT),
  };
  CUSTOM_REGISTRY.set(keyOf(full), svg);
  CUSTOM_SIMPLE.set(`${full.icon}::${full.size}`, svg);
}

export function unregisterSymbol(k: Partial<SymbolKey> & { icon: string; size: number }): void {
  const full: SymbolKey = {
    icon: k.icon,
    size: k.size,
    theme: (k.theme ?? DEFAULT_THEME) as Theme,
    fill: (k.fill ?? DEFAULT_FILL) as 0 | 1,
    weight: Number(k.weight ?? DEFAULT_WEIGHT),
  };
  CUSTOM_REGISTRY.delete(keyOf(full));
  CUSTOM_SIMPLE.delete(`${full.icon}::${full.size}`);
}

export function registerRawSymbol(k: Partial<SymbolKey> & { icon: string; size: number }, rawSvg: string): void {
  const parsed = parseSvg(rawSvg);
  if (!parsed) throw new Error('[icons/registry] Failed to parse raw SVG: missing viewBox or path d');
  registerSymbol(k, parsed);
}

// Helper to auto-register custom icons from a map of sizes
export function autoRegisterCustom(map: Record<string, Readonly<Record<number, unknown>>>): void {
  // customFiles contains raw SVGs keyed by file path; match by file name `${icon}.svg`
  for (const [iconName, sizesObj] of Object.entries(map)) {
    let raw: string | undefined;
    for (const [p, content] of Object.entries(customFiles)) {
      if (p.replace(/\\/g, '/').endsWith(`/${iconName}.svg`)) {
        raw = content;
        break;
      }
    }
    if (typeof raw !== 'string' || !raw.includes('<svg')) continue;
    for (const sizeKey of Object.keys(sizesObj)) {
      const size = Number(sizeKey);
      if (!Number.isFinite(size)) continue;
      registerRawSymbol({ icon: iconName, size }, raw);
    }
  }
}

// Convenience: register multiple optical sizes for a single custom icon
export function registerMultipleSizes(
  icon: string,
  sizes: readonly number[],
  resolveRawSvg: (size: number) => string,
  options?: Partial<Pick<SymbolKey, 'theme' | 'fill' | 'weight'>>,
): void {
  for (const s of sizes) {
    registerRawSymbol({ icon, size: s, ...options }, resolveRawSvg(s));
  }
}

export type IconConfig = {
  sizes: readonly OpticalSize[];
  weights?: readonly Weight[];
  fills?: readonly Fill[];
  themes?: readonly Theme[];
};

// defineIcons helper to create strongly typed maps
// A map of custom icons where each icon may specify any subset of optical sizes
// Example: { spark: { 24: svg24 }, brand: { 20: svg20, 40: svg40 } }
export type DefineCustomMap = Record<string, Partial<Readonly<Record<OpticalSize, unknown>>>>;
export function defineIcons<
    S extends Partial<Record<MaterialSymbolIcon, Partial<IconConfig>>>,
    C extends DefineCustomMap = Record<never, never>
>(symbols: S, custom?: C) {
  return {
    Symbols: symbols,
    Custom: (custom ?? ({} as C)),
  } as const;
}

