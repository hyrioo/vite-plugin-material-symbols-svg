import path from 'node:path';
import fs from 'node:fs/promises';
import type { Plugin } from 'vite';
import { fetchVersions } from './meta';
import { axesString, buildSymbolUrl, downloadSymbols, Theme, toFilename } from './symbols';
import {
    generateConsumerFiles,
    IconDefaultConfig,
    IconsInput,
    normalizeFills,
    normalizeNums,
    normalizeThemes,
    unique,
} from './registry';

export interface MaterialSymbolsPluginOptions {
    concurrency?: number;
    strict?: boolean;                // fail build when downloads fail
    enabled?: boolean;
}

async function ensureDir(dir: string) {
    await fs.mkdir(dir, {recursive: true});
}

export default function materialSymbolsSvg(iconsDef: IconsInput, opts: MaterialSymbolsPluginOptions = {}): Plugin {
    const options = {
        concurrency: opts.concurrency ?? 8,
        strict: opts.strict ?? false,
        enabled: opts.enabled ?? true,
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
            const symbolsPath = path.resolve(
                root || process.cwd(),
                'node_modules',
                '@hyrioo',
                'vite-plugin-material-symbols-svg',
                '.temp',
                'symbols',
            );
            const alias = config.resolve?.alias || {};
            const symbolsAlias = {find: '/symbols', replacement: symbolsPath};

            const newAlias = Array.isArray(alias)
                ? [...alias, symbolsAlias]
                : {...alias, '/symbols': symbolsPath};

            return {
                resolve: {
                    alias: newAlias,
                },
            };
        },
        async buildStart() {
            if (!options.enabled) return;

            const tempDir = path.resolve(root, 'node_modules', '@hyrioo', 'vite-plugin-material-symbols-svg', '.temp');
            const outBase = path.resolve(tempDir, 'symbols');
            const srcConsumerDir = path.resolve(root, 'node_modules', '@hyrioo', 'vite-plugin-material-symbols-svg', 'src', 'consumer');

            const versionsFile = path.resolve(tempDir, 'versions.json');

            // These are the new consumer files
            const iconsTsFile = path.resolve(srcConsumerDir, 'icons.ts');
            const loaderTypesFile = path.resolve(srcConsumerDir, 'loader-types.ts');
            const loaderMapFile = path.resolve(srcConsumerDir, 'loader-map.ts');

            await ensureDir(tempDir);

            // 1. Fetch metadata and generate icons.ts
            await fetchVersions(this, versionsFile, iconsTsFile, {strict: options.strict});

            // 2. Generate consumer loader files (loader-types.ts, loader-map.ts)
            await generateConsumerFiles(this, iconsDef, loaderTypesFile, loaderMapFile, srcConsumerDir);

            // 3. Prepare download tasks
            const iconsMap = iconsDef.Symbols;
            const defaults = iconsDef.Default ?? {};
            const tasks: {url: string; file: string}[] = [];

            for (const [icon, meta] of Object.entries(iconsMap)) {
                const sizes = normalizeNums((meta.sizes ?? defaults.sizes), IconDefaultConfig.sizes);
                const weights = normalizeNums((meta.weights ?? defaults.weights), IconDefaultConfig.weights);
                const fills = normalizeFills((meta.fills ?? defaults.fills), IconDefaultConfig.fills);
                const themes = normalizeThemes((meta.themes ?? defaults.themes), IconDefaultConfig.themes);

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

            // 4. Download icons
            this.warn(`[material-symbols-svg] Downloading symbols`);
            const result = await downloadSymbols(tasks, options.concurrency, this);

            const summary = `[material-symbols-svg] Done. Saved: ${result.saved}, Skipped: ${result.skipped}, Failed: ${result.failed}`;
            if (result.failed > 0 && options.strict) this.error(summary); else this.info(summary);
        },
    };
}
