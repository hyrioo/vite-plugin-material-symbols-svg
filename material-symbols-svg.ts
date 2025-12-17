/*
 * Vite plugin to auto-download Material Symbols defined via an in-memory Icons map
 * Saves into: src/shared/icons/symbols/<theme>/<icon>[-fill].w{weight}.s{size}.svg
 *
 * Usage (vite.config.ts):
 *   import Icons from './src/shared/icons/loader';
 *   import materialSymbolsSvg from './src/vite-plugins/material-symbols-svg';
 *   export default defineConfig({
 *     plugins: [
 *       MaterialSymbolsPlugin({
 *         icons: Icons,
 *         outDir: 'src/shared/icons/symbols',
 *         concurrency: 10,
 *         strict: false,
 *         enabled: true,
 *       })
 *     ]
 *   });
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import type { Plugin } from 'vite';
import type { PluginContext } from 'rollup';

type Theme = 'rounded' | 'outlined' | 'sharp';

export type SymbolsIconsMap = Record<string, { sizes?: readonly number[]; weights?: readonly number[]; fills?: readonly boolean[]; themes?: readonly ('rounded' | 'outlined' | 'sharp')[] }>;

export interface MaterialSymbolsPluginOptions {
  icons: SymbolsIconsMap;          // required — pass the exported Icons object directly
  outDir?: string;                 // relative to project root
  concurrency?: number;
  strict?: boolean;                // fail build when downloads fail
  enabled?: boolean;
  cleanRemoved?: boolean;          // (reserved) not implemented yet
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function exists(p: string) {
  try { await fs.access(p); return true; } catch { return false; }
}

function axesString(weight: number, fill: 0 | 1) {
  const w = weight === 400 ? '' : `wght${weight}`;
  const f = fill === 0 ? '' : `fill${fill}`;
  const s = `${w}${f}`;
  return s.length ? s : 'default';
}

function buildSymbolUrl(theme: Theme, icon: string, axes: string, size: number) {
  const themePart = theme || '';
  return `https://fonts.gstatic.com/s/i/short-term/release/materialsymbols${themePart}/${icon}/${axes}/${size}px.svg`;
}

function toFilename(icon: string, fill: 0 | 1, weight: number, size: number) {
  const w = Number.isFinite(weight) ? `.w${weight}` : '';
  const s = Number.isFinite(size) ? `.s${size}` : '';
  const fillPart = fill === 1 ? '-fill' : '';
  return `${icon}${fillPart}${w}${s}.svg`;
}

async function removeIfNotSvg(file: string) {
  try {
    const str = await fs.readFile(file, 'utf8');
    const ok = str.startsWith('<svg') && str.includes('</svg>');
    if (!ok) await fs.rm(file, { force: true });
  } catch { /* ignore */ }
}

async function withConcurrency<T, R>(items: T[], limit: number, worker: (item: T, i: number) => Promise<R>) {
  const ret: R[] = [];
  let idx = 0;
  const run = async () => {
    while (idx < items.length) {
      const i = idx++;
      ret[i] = await worker(items[i], i);
    }
  };
  const runners = Array.from({ length: Math.min(limit, items.length) }, run);
  await Promise.all(runners);
  return ret;
}

export default function materialSymbolsSvg(opts: MaterialSymbolsPluginOptions): Plugin {
  const options = {
    outDir: opts.outDir ?? 'src/shared/icons/symbols',
    concurrency: opts.concurrency ?? 8,
    strict: opts.strict ?? false,
    enabled: opts.enabled ?? true,
    cleanRemoved: opts.cleanRemoved ?? false,
  } as Required<Omit<MaterialSymbolsPluginOptions, 'icons'>>;

  if (!opts || !opts.icons) {
    throw new Error('[material-symbols-svg] options.icons is required');
  }

  let root = '';
  return {
    name: 'material-symbols-svg',
    configResolved(config) {
      root = config.root || process.cwd();
    },
    async buildStart(this: PluginContext) {
      if (!options.enabled) return;

      const outBase = path.resolve(root, options.outDir);
      const iconsMap = opts.icons as SymbolsIconsMap;
      const tasks: { url: string; file: string }[] = [];

      for (const [icon, meta] of Object.entries(iconsMap)) {
        const sizes = (meta.sizes && meta.sizes.length ? Array.from(meta.sizes) : []).map((n) => Number(n)).filter((n) => Number.isFinite(n));
        const weights = (meta.weights && meta.weights.length ? Array.from(meta.weights) : []).map((n) => Number(n)).filter((n) => Number.isFinite(n));
        const fills = (meta.fills && meta.fills.length ? Array.from(meta.fills) : []).map((n) => Number(n)).filter((n): n is 0 | 1 => n === 0 || n === 1);
        const themes = (meta.themes && meta.themes.length ? Array.from(meta.themes) : []) as Theme[];

        for (const theme of unique(themes)) {
          await ensureDir(path.resolve(outBase, theme));
          for (const weight of unique(weights)) {
            for (const fill of unique(fills)) {
              for (const size of unique(sizes)) {
                const axes = axesString(weight, fill);
                const url = buildSymbolUrl(theme as Theme, icon, axes, size);
                const file = path.resolve(outBase, theme, toFilename(icon, fill as 0 | 1, weight, size));
                tasks.push({ url, file });
              }
            }
          }
        }
      }

      let failed = 0;
      let skipped = 0;
      let saved = 0;

      await withConcurrency(tasks, options.concurrency, async (t) => {
        try {
          if (await exists(t.file)) { skipped++; return; }
          const res = await fetch(t.url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const svg = await res.text();
          if (!svg.startsWith('<svg')) throw new Error('Not an SVG');
          await fs.writeFile(t.file, svg);
          await removeIfNotSvg(t.file);
          saved++;
        } catch (e) {
          failed++;
          const msg = e instanceof Error ? e.message : String(e);
          this.warn(`[material-symbols-svg] Failed ${t.url} -> ${t.file}: ${msg}`);
        }
      });

      const summary = `[material-symbols-svg] Done. Saved: ${saved}, Skipped: ${skipped}, Failed: ${failed}`;
      if (failed > 0 && options.strict) this.error(summary); else this.info(summary);
    },
  };
}
