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
import type { IconConfig, SymbolKey, SymbolSvg } from './registry';

type Theme = 'rounded' | 'outlined' | 'sharp';

// Input shape created by defineIcons()
export type IconsInput = {
    Symbols: Record<string, {
        sizes?: readonly number[];
        weights?: readonly number[];
        // Accept booleans or numeric literals; normalize later to 0|1
        fills?: readonly (boolean | 0 | 1)[];
        themes?: readonly ('rounded' | 'outlined' | 'sharp')[]
    }>;
    Custom?: Record<string, Partial<Readonly<Record<number, unknown | `./${string}` | `../${string}`>>>>;
    Default?: Partial<IconConfig>;
};

const IconDefaultConfig = {
    sizes: [20, 24, 40, 48] as const,
    weights: [400] as const,
    fills: [0] as const,
    themes: ['rounded'] as const,
};

export interface MaterialSymbolsPluginOptions {
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

export default function materialSymbolsSvg(iconsDef: IconsInput, opts: MaterialSymbolsPluginOptions = {}): Plugin {
    const options = {
        concurrency: opts.concurrency ?? 8,
        strict: opts.strict ?? false,
        enabled: opts.enabled ?? true,
        cleanRemoved: opts.cleanRemoved ?? false,
    } as Required<MaterialSymbolsPluginOptions>;

    if (!iconsDef || !iconsDef.Symbols) {
        throw new Error('[material-symbols-svg] First parameter must be the return value of defineIcons()');
    }

    let root = '';
    return {
        name: 'material-symbols-svg',
        configResolved(config) {
            root = config.root || process.cwd();
        },
        config(config) {
            // Add alias for /symbols to point to our temp folder
            const symbolsPath = path.resolve(
                root || process.cwd(),
                'node_modules',
                '@hyrioo',
                'vite-plugin-material-symbols-svg',
                '.temp',
                'symbols',
            );
            const alias = config.resolve?.alias || {};
            const symbolsAlias = { find: '/symbols', replacement: symbolsPath };
            
            const newAlias = Array.isArray(alias) 
                ? [...alias, symbolsAlias]
                : { ...alias, '/symbols': symbolsPath };

            return {
                resolve: {
                    alias: newAlias,
                },
            };
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
            // Overwrite the placeholder that is shipped in dist/icons.d.ts so
            // consumers always pick up the augmentation via ./icons.d.ts next to index.d.ts
            const distDir = path.resolve(root, 'node_modules', '@hyrioo', 'vite-plugin-material-symbols-svg', 'dist');
            const iconsDtsFile = path.resolve(distDir, 'icons.d.ts');
            const registryTypesFile = path.resolve(distDir, 'registry-types.d.ts');
            const registryMapFile = path.resolve(distDir, 'registry-map.js');
            try {
                // Only fetch if file missing
                if (!(await exists(versionsFile))) {
                    this.info('[material-symbols-svg] Fetching Material Symbols metadata...');
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
                                const famsAny = (icon && (icon as any)['unsupported_families']) as any;
                                const families: any[] = Array.isArray(famsAny) ? famsAny : [];
                                let skip = false;
                                for (const fam of families) {
                                    if (String(fam).toLowerCase().includes('symbols')) {
                                        skip = true;
                                        break;
                                    }
                                }
                                if (skip) continue;
                                const name = String((icon as any)?.name || '');
                                if (!name) continue;
                                versions[name] = (icon as any)?.version;
                            }
                            // Sort map by key
                            const sorted = Object.fromEntries(Object.entries(versions).sort((a, b) => a[0].localeCompare(b[0])));
                            const versionsContent = JSON.stringify(sorted, null, 2);

                            let existingVersions = '';
                            try {
                                existingVersions = await fs.readFile(versionsFile, 'utf-8');
                            } catch {
                                // ignore
                            }

                            if (existingVersions !== versionsContent) {
                                await fs.writeFile(versionsFile, versionsContent);
                            }

                            // Generate icons.d.ts with union of names (from metadata)
                            try {
                                const names = Object.keys(sorted);
                                const union = names
                                    .map((n) => `'${n.replace(/'/g, '\\\'')}'`)
                                    .join(' | ');
                                const banner = `// This file is auto-generated by vite-plugin-material-symbols-svg\n// Do not edit manually.\n`;
                                const content = `${banner}export type MaterialSymbolIcon = ${union};\n`;
                                try {
                                    await fs.mkdir(distDir, {recursive: true});

                                    let existing = '';
                                    try {
                                        existing = await fs.readFile(iconsDtsFile, 'utf-8');
                                    } catch {
                                        // ignore
                                    }

                                    if (existing !== content) {
                                        await fs.writeFile(iconsDtsFile, content);
                                        const now = new Date();
                                        await fs.utimes(iconsDtsFile, now, now).catch(() => {});
                                    }
                                } catch (ee) {
                                    // If writing to dist fails (e.g., read-only file system), warn and continue.
                                    const m2 = ee instanceof Error ? ee.message : String(ee);
                                    this.warn(`[material-symbols-svg] Failed to overwrite dist/icons.d.ts: ${m2}`);
                                }
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

                // Always generate registry-types.d.ts (IconKey) based on consumer-provided icons
                // (outside of metadata fetch block so it updates even if metadata is already cached)
                try {
                    const banner = `// This file is auto-generated by vite-plugin-material-symbols-svg\n// Do not edit manually.\n`;
                    const symKeys = Object.keys(iconsDef.Symbols || {});
                    const customKeys = Object.keys(iconsDef.Custom || {});
                    const all = Array.from(new Set([...symKeys, ...customKeys]));
                    const keyUnion = all.length
                        ? all.map((n) => `'${n.replace(/'/g, '\\\'')}'`).join(' | ')
                        : 'string';
                    const content2 = `${banner}export type IconKey = ${keyUnion};\n`;
                    await fs.mkdir(distDir, { recursive: true });

                    // Only write if changed to avoid unnecessary IDE re-indexing/watcher triggers
                    let existing = '';
                    try {
                        existing = await fs.readFile(registryTypesFile, 'utf-8');
                    } catch (e) {
                        // ignore
                    }

                    if (existing !== content2) {
                        await fs.writeFile(registryTypesFile, content2);
                        // Some IDEs (like PHPStorm) might need a nudge to see changes in node_modules.
                        // Updating the mtime can sometimes help trigger the file watcher.
                        const now = new Date();
                        await fs.utimes(registryTypesFile, now, now).catch(() => {});
                    }
                } catch (ee) {
                    const m2 = ee instanceof Error ? ee.message : String(ee);
                    this.warn(`[material-symbols-svg] Failed to write dist/registry-types.d.ts: ${m2}`);
                }

                // Generate registry-map.js that imports all required SVGs
                try {
                    const banner = `// This file is auto-generated by vite-plugin-material-symbols-svg\n// Do not edit manually.\n`;
                    const imports: string[] = [];
                    const mapEntries: string[] = [];
                    const defaults = iconsDef.Default ?? {};

                    let i = 0;
                    for (const [icon, meta] of Object.entries(iconsDef.Symbols || {})) {
                        const sizes = normalizeNums((meta.sizes ?? defaults.sizes) as unknown as readonly unknown[] | undefined, IconDefaultConfig.sizes);
                        const weights = normalizeNums((meta.weights ?? defaults.weights) as unknown as readonly unknown[] | undefined, IconDefaultConfig.weights);
                        const fills = normalizeFills((meta.fills ?? (defaults.fills as any)) as any, IconDefaultConfig.fills);
                        const themes = normalizeThemes((meta.themes ?? defaults.themes) as unknown as readonly unknown[] | undefined, IconDefaultConfig.themes);

                        for (const theme of unique(themes)) {
                            for (const weight of unique(weights)) {
                                for (const fill of unique(fills)) {
                                    for (const size of unique(sizes)) {
                                        const filename = toFilename(icon, fill as 0 | 1, weight, size);
                                        const importPath = `/symbols/${theme}/${filename}?raw`;
                                        const varName = `i${i++}`;
                                        imports.push(`import ${varName} from '${importPath}';`);
                                        mapEntries.push(`  '${theme}/${filename}': ${varName},`);
                                    }
                                }
                            }
                        }
                    }

                    // Add custom icons to the map if they are relative paths
                    for (const [icon, sizesObj] of Object.entries(iconsDef.Custom || {})) {
                        for (const [sizeKey, value] of Object.entries(sizesObj || {})) {
                            if (typeof value === 'string' && (value.startsWith('./') || value.startsWith('../'))) {
                                const varName = `i${i++}`;
                                imports.push(`import ${varName} from '${value}?raw';`);
                                mapEntries.push(`  'custom/${icon}/${sizeKey}': ${varName},`);
                            }
                        }
                    }

                    const mapContent = `${banner}${imports.join('\n')}\n\nexport default {\n${mapEntries.join('\n')}\n};\n`;

                    let existing = '';
                    try {
                        existing = await fs.readFile(registryMapFile, 'utf-8');
                    } catch (e) {
                        // ignore
                    }

                    if (existing !== mapContent) {
                        await fs.writeFile(registryMapFile, mapContent);
                        const now = new Date();
                        await fs.utimes(registryMapFile, now, now).catch(() => {});
                    }
                } catch (ee) {
                    const m2 = ee instanceof Error ? ee.message : String(ee);
                    this.warn(`[material-symbols-svg] Failed to write dist/registry-map.js: ${m2}`);
                }
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                if (options.strict) this.error(`[material-symbols-svg] Metadata prefetch failed: ${msg}`); else this.warn(`[material-symbols-svg] Metadata prefetch failed: ${msg}`);
            }

            const iconsMap = iconsDef.Symbols;
            const defaults = iconsDef.Default ?? {};
            const tasks: {url: string; file: string}[] = [];

            for (const [icon, meta] of Object.entries(iconsMap)) {
                // Merge with defaults using normalization helpers
                const sizes = normalizeNums((meta.sizes ?? defaults.sizes) as unknown as readonly unknown[] | undefined, IconDefaultConfig.sizes);
                const weights = normalizeNums((meta.weights ?? defaults.weights) as unknown as readonly unknown[] | undefined, IconDefaultConfig.weights);
                const fills = normalizeFills((meta.fills ?? (defaults.fills as any)) as any, IconDefaultConfig.fills);
                const themes = normalizeThemes((meta.themes ?? defaults.themes) as unknown as readonly unknown[] | undefined, IconDefaultConfig.themes);

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

            if (import.meta.env?.DEV) {
                this.info(`[material-symbols-svg] Registry entries generated: ${tasks.length}`);
            }
        },
    };
}
