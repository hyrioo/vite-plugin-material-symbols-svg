#!/usr/bin/env node
// Download Material Symbols SVGs with configurable themes, sizes, weights, and fills
// Saves into: frontend/src/shared/icons/symbols/<theme>/<icon>[-fill].svg

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Defaults aligned with Material Symbols
const DEFAULT_THEMES = ['rounded']; // allowed: outlined, rounded, sharp
const DEFAULT_SIZES = [24]; // allowed examples: 20, 24, 40, 48
const DEFAULT_WEIGHTS = [200]; // 100..700 step 100
const DEFAULT_FILLS = [0]; // 0 or 1
// By default, download to a temp folder inside the installed package under node_modules
// node_modules/@hyrioo/vite-plugin-material-symbols-svg/.temp/{symbols,versions.json}
const DEFAULT_PKG_DIR = __dirname;
const DEFAULT_TEMP_DIR = path.resolve(DEFAULT_PKG_DIR, '.temp');
const DEFAULT_DIR = path.resolve(DEFAULT_TEMP_DIR, 'symbols');
const DEFAULT_VERSIONS_FILE = path.resolve(DEFAULT_TEMP_DIR, 'versions.json');

// Minimal CLI parser
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, vRaw] = a.split('=');
      const key = k.replace(/^--/, '');
      if (vRaw !== undefined) {
        args[key] = vRaw;
      } else {
        const n = argv[i + 1];
        if (!n || n.startsWith('--')) {
          args[key] = true;
        } else {
          args[key] = n;
          i++;
        }
      }
    } else if (a === '-h' || a === '--help') {
      args.help = true;
    }
  }
  return args;
}

function asList(val, defaults) {
  if (val === undefined) return [...defaults];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
  return [val];
}

function asNumList(val, defaults) {
  return asList(val, defaults).map((v) => Number(v)).filter((n) => Number.isFinite(n));
}

function unique(arr) {
  return Array.from(new Set(arr));
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function removeIfNotSvg(file) {
  try {
    const buf = await fs.readFile(file);
    const str = buf.toString();
    const ok = str.startsWith('<svg') && str.includes('</svg>');
    if (!ok) await fs.rm(file, { force: true });
  } catch {
    // ignore
  }
}

function buildSymbolUrl(theme, icon, axes, size) {
  // theme: '', 'outlined', 'rounded', 'sharp' (empty for default, but we won’t use empty here)
  // axes: 'default' or concatenation like 'wght300fill1'
  const themePart = theme || '';
  return `https://fonts.gstatic.com/s/i/short-term/release/materialsymbols${themePart}/${icon}/${axes}/${size}px.svg`;
}

function axesString(weight, fill) {
  const w = weight === 400 ? '' : `wght${weight}`;
  const f = fill === 0 ? '' : `fill${fill}`;
  const s = `${w}${f}`;
  return s.length ? s : 'default';
}

function toFilename(icon, fill, weight, size) {
  const w = Number.isFinite(weight) ? `.w${weight}` : '';
  const s = Number.isFinite(size) ? `.s${size}` : '';
  const fillPart = fill === 1 ? '-fill' : '';
  return `${icon}${fillPart}${w}${s}.svg`;
}

async function withConcurrency(items, limit, worker) {
  const ret = [];
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

async function readIconsList(arg, inlineIcons) {
  if (inlineIcons && inlineIcons.length) return unique(inlineIcons);
  if (!arg) {
    // Try versions.json default first
    if (await exists(DEFAULT_VERSIONS_FILE)) {
      const raw = await fs.readFile(DEFAULT_VERSIONS_FILE, 'utf8');
      try {
        const map = JSON.parse(raw);
        if (map && typeof map === 'object') return unique(Object.keys(map));
      } catch {
        // fall through to icons.txt
      }
    }
    // fallback to tools/material-symbols/icons.txt if present
    const fallback = path.resolve(__dirname, 'icons.txt');
    if (await exists(fallback)) {
      const txt = await fs.readFile(fallback, 'utf8');
      return unique(txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean));
    }
    throw new Error('No icons provided. Use --icon x, --icons path/to/list.txt, or ensure versions.json exists.');
  }
  const full = path.resolve(process.cwd(), arg);
  const content = await fs.readFile(full, 'utf8');
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return unique(parsed.map((s) => String(s)));
    if (parsed && typeof parsed === 'object') return unique(Object.keys(parsed));
  } catch {
    // not JSON, treat as newline-delimited
  }
  return unique(content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean));
}

async function cleanTargets(baseDir, themes) {
  for (const theme of themes) {
    const dir = path.resolve(baseDir, theme);
    if (await exists(dir)) {
      const entries = await fs.readdir(dir);
      await Promise.all(entries.map((e) => fs.rm(path.join(dir, e), { recursive: true, force: true })));
    }
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`
Download Material Symbols SVGs

Usage:
  node tools/material-symbols/download-symbols.mjs [options]

Options:
  --themes rounded,outlined,sharp     Themes to download (default: rounded)
  --sizes 24,40,48                    Sizes in px (default: 24)
  --weights 100,200,...,700           Weights (default: 400)
  --fills 0,1                         Fill variations (default: 0,1)
  --icon name                         Icon name (can be repeated)
  --icons path                        Path to file with list (json array/object or newline list)
  --from-versions, --all              Load all icons from versions.json (default path)
  --versions path                     Custom versions.json path (when using --from-versions/--all)
  --dir path                          Output base dir (default: node_modules/@hyrioo/vite-plugin-material-symbols-svg/.temp/symbols)
  --clean                             Delete existing svgs in the selected themes before downloading
  -h, --help                          Show help
`);
    return;
  }

  const themes = unique(asList(args.themes, DEFAULT_THEMES)).map((t) => t.trim()).filter(Boolean);
  for (const t of themes) {
    if (!['outlined', 'rounded', 'sharp'].includes(t)) {
      throw new Error(`Invalid theme: ${t}. Allowed: outlined, rounded, sharp`);
    }
  }
  const sizes = unique(asNumList(args.sizes, DEFAULT_SIZES));
  const weights = unique(asNumList(args.weights, DEFAULT_WEIGHTS));
  const fills = unique(asNumList(args.fills, DEFAULT_FILLS)).filter((f) => f === 0 || f === 1);

  const inlineIcons = asList(args.icon, []);
  let icons;
  const baseDir = args.dir ? path.resolve(process.cwd(), args.dir) : DEFAULT_DIR;

  // when --from-versions/--all is set, or when no --icon/--icons provided, read versions.json
  const useVersions = !!(args['from-versions'] || args.all || (!inlineIcons.length && !args.icons));
  if (useVersions) {
    const versionsPath = args.versions
      ? path.resolve(process.cwd(), String(args.versions))
      : DEFAULT_VERSIONS_FILE;
    if (!(await exists(versionsPath))) {
      throw new Error(`versions.json not found at ${versionsPath}. Provide via --versions <path> or create the file.`);
    }
    const raw = await fs.readFile(versionsPath, 'utf8');
    let map;
    try {
      map = JSON.parse(raw);
    } catch (e) {
      throw new Error(`Failed to parse versions file ${versionsPath}: ${e.message}`);
    }
    if (!map || typeof map !== 'object') {
      throw new Error(`Invalid versions file format at ${versionsPath}. Expected an object of { iconName: version }`);
    }
    icons = unique(Object.keys(map));
  } else {
    icons = await readIconsList(args.icons, inlineIcons);
  }

  if (args.clean) {
    console.log('Cleaning target directories...');
    await cleanTargets(baseDir, themes);
  }

  for (const theme of themes) {
    await ensureDir(path.resolve(baseDir, theme));
  }

  const tasks = [];
  for (const theme of themes) {
    for (const icon of icons) {
      for (const weight of weights) {
        for (const fill of fills) {
          for (const size of sizes) {
            const axes = axesString(weight, fill);
            const url = buildSymbolUrl(theme, icon, axes, size);
            const file = path.resolve(baseDir, theme, toFilename(icon, fill, weight, size));
            tasks.push({ url, file, theme, icon, weight, fill, size });
          }
        }
      }
    }
  }

  console.log(`Planned downloads: ${tasks.length}`);
  let succeeded = 0;
  let skipped = 0;
  let failed = 0;

  await withConcurrency(tasks, 10, async (t) => {
    try {
      if (await exists(t.file)) {
        skipped++;
        return;
      }
      const res = await fetch(t.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const svg = await res.text();
      if (!svg.startsWith('<svg')) throw new Error('Not an SVG response');
      await fs.writeFile(t.file, svg);
      await removeIfNotSvg(t.file);
      succeeded++;
    } catch (e) {
      failed++;
      // Optional: verbose per failure
      // console.warn('Failed', t.url, '->', t.file, e?.message || e);
    }
  });

  console.log(`Done. Success: ${succeeded}, Skipped (existing): ${skipped}, Failed: ${failed}`);
  if (failed > 0) {
    console.warn('Some downloads failed. You may need to adjust icon names or parameters.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
