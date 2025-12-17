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

export type SymbolsIconsMap = Record<string, {
    sizes?: readonly number[];
    weights?: readonly number[];
    // Accept booleans or numeric literals; normalize later to 0|1
    fills?: readonly (boolean | 0 | 1)[];
    themes?: readonly ('rounded' | 'outlined' | 'sharp')[]
}>;

const IconDefaultConfig = {
    sizes: [20, 24, 40, 48] as const,
    weights: [400] as const,
    fills: [0] as const,
    themes: ['rounded'] as const,
};

export interface MaterialSymbolsPluginOptions {
    icons: SymbolsIconsMap;          // required — pass the exported Icons object directly
    concurrency?: number;
    strict?: boolean;                // fail build when downloads fail
    enabled?: boolean;
    cleanRemoved?: boolean;          // (reserved) not implemented yet
}

function unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
}

async function ensureDir(dir: string) {
    await fs.mkdir(dir, {recursive: true});
}

async function exists(p: string) {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
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
        if (!ok) await fs.rm(file, {force: true});
    } catch { /* ignore */
    }
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
    const runners = Array.from({length: Math.min(limit, items.length)}, run);
    await Promise.all(runners);
    return ret;
}

// Normalize helpers to keep typing strict and avoid Array.from overload issues
function normalizeNums(input: readonly unknown[] | undefined, fallback: readonly number[]): number[] {
    const src = input && input.length ? input : fallback;
    return unique(Array.from(src as readonly unknown[])
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n))) as number[];
}

function normalizeFills(input: readonly (boolean | 0 | 1)[] | undefined, fallback: readonly (0 | 1)[]): (0 | 1)[] {
    const src = input && input.length ? input : fallback;
    const arr = Array.from(src).map((v) => {
        if (v === true) return 1;
        if (v === false) return 0;
        const n = Number(v);
        return n === 1 ? 1 : 0;
    }) as (0 | 1)[];
    return unique(arr) as (0 | 1)[];
}

function normalizeThemes(input: readonly unknown[] | undefined, fallback: readonly Theme[]): Theme[] {
    const src = input && input.length ? input : fallback;
    const allowed: Theme[] = ['rounded', 'outlined', 'sharp'];
    const arr = Array.from(src as readonly unknown[])
        .map((t) => String(t) as Theme)
        .filter((t): t is Theme => allowed.includes(t));
    return unique(arr);
}

export default function materialSymbolsSvg(opts: MaterialSymbolsPluginOptions): Plugin {
    const options = {
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

            // Always write to: <root>/node_modules/@hyrioo/vite-plugin-material-symbols-svg/.temp/symbols
            const outBase = path.resolve(
                root,
                'node_modules',
                '@hyrioo',
                'vite-plugin-material-symbols-svg',
                '.temp',
                'symbols',
            );

            // Ensure temp base exists and prefetch metadata when starting dev server
            try {
                await ensureDir(path.resolve(root, 'node_modules', '@hyrioo', 'vite-plugin-material-symbols-svg', '.temp'));
            } catch {
            }

            // Prefetch metadata (versions.json) on dev server start
            const versionsDir = path.resolve(root, 'node_modules', '@hyrioo', 'vite-plugin-material-symbols-svg', '.temp');
            const versionsFile = path.resolve(versionsDir, 'versions.json');
            const iconsDtsFile = path.resolve(versionsDir, 'icons.d.ts');
            try {
                // Only fetch if file missing
                if (!(await exists(versionsFile))) {
                    // Use the correct Material Symbols metadata endpoint; strip XSSI prefix
                    const metaUrl = 'https://fonts.google.com/metadata/icons?key=material_symbols&incomplete=true';
                    const res = await fetch(metaUrl);
                    if (res.ok) {
                        let txt = await res.text();
                        // The response starts with an XSSI guard like ")]}'" followed by a newline; remove the first line
                        if (txt.startsWith(')]}\'')) {
                            const i = txt.indexOf('\n');
                            if (i !== -1) txt = txt.substring(i + 1);
                        }
                        // Transform to { [iconName]: version } like versions.mjs does, filtering out non-symbols
                        let parsed: any;
                        try {
                            parsed = JSON.parse(txt);
                        } catch (e) {
                            if (options.strict) this.error('[material-symbols-svg] Failed to parse metadata JSON'); else this.warn('[material-symbols-svg] Failed to parse metadata JSON');
                            parsed = null;
                        }
                        if (parsed && Array.isArray(parsed.icons)) {
                            const versions: Record<string, string | number> = {};
                            for (const icon of parsed.icons) {
                                const families: any[] = Array.isArray(icon?.unsupported_families) ? icon.unsupported_families : [];
                                let skip = false;
                                for (const fam of families) {
                                    if (String(fam).toLowerCase().includes('symbols')) {
                                        skip = true;
                                        break;
                                    }
                                }
                                if (skip) continue;
                                const name = String(icon?.name || '');
                                if (!name) continue;
                                versions[name] = icon?.version;
                            }
                            // Sort map by key
                            const sorted = Object.fromEntries(Object.entries(versions).sort((a, b) => a[0].localeCompare(b[0])));
                            await fs.writeFile(versionsFile, JSON.stringify(sorted, null, 2));
                            // Generate icons.d.ts with union of names
                            try {
                                const names = Object.keys(sorted);
                                // Generate module augmentation so the package's exported types can pick up keys
                                // This avoids requiring direct imports from .temp in source files.
                                const entries = names
                                  .map((n) => `    '${n.replace(/'/g, "\\'")}': true;`)
                                  .join('\n');
                                const banner = `// This file is auto-generated by vite-plugin-material-symbols-svg\n// Do not edit manually.\n`;
                                const content = `${banner}declare module '@hyrioo/vite-plugin-material-symbols-svg' {\n  export interface __MaterialSymbolIconIndex {\n${entries}\n  }\n}\n`;
                                await fs.writeFile(iconsDtsFile, content);
                            } catch (e) {
                                // non-fatal
                                const msg = e instanceof Error ? e.message : String(e);
                                this.warn(`[material-symbols-svg] Failed to write icons.d.ts: ${msg}`);
                            }
                        } else {
                            // Fallback: save cleaned JSON for inspection
                            await fs.writeFile(versionsFile, txt);
                        }
                    } else if (options.strict) {
                        this.error(`[material-symbols-svg] Failed to fetch metadata: HTTP ${res.status}`);
                    } else {
                        this.warn(`[material-symbols-svg] Failed to fetch metadata: HTTP ${res.status}`);
                    }
                }
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                if (options.strict) this.error(`[material-symbols-svg] Metadata prefetch failed: ${msg}`); else this.warn(`[material-symbols-svg] Metadata prefetch failed: ${msg}`);
            }

            const iconsMap = opts.icons as SymbolsIconsMap;
            const tasks: {url: string; file: string}[] = [];

            for (const [icon, meta] of Object.entries(iconsMap)) {
                // Merge with defaults using normalization helpers
                const sizes = normalizeNums(meta.sizes as unknown as readonly unknown[] | undefined, IconDefaultConfig.sizes);
                const weights = normalizeNums(meta.weights as unknown as readonly unknown[] | undefined, IconDefaultConfig.weights);
                const fills = normalizeFills(meta.fills, IconDefaultConfig.fills);
                const themes = normalizeThemes(meta.themes as unknown as readonly unknown[] | undefined, IconDefaultConfig.themes);

                for (const theme of unique(themes)) {
                    await ensureDir(path.resolve(outBase, theme));
                    for (const weight of unique(weights)) {
                        for (const fill of unique(fills)) {
                            for (const size of unique(sizes)) {
                                const axes = axesString(weight, fill);
                                const url = buildSymbolUrl(theme as Theme, icon, axes, size);
                                const file = path.resolve(outBase, theme, toFilename(icon, fill as 0 | 1, weight, size));
                                tasks.push({url, file});
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
                    if (await exists(t.file)) {
                        skipped++;
                        return;
                    }
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
