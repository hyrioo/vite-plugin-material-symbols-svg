"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const path = require("node:path");
const fs = require("node:fs/promises");
const __vite_import_meta_env__$1 = {};
const IconDefaultConfig = {
  sizes: [20, 24, 40, 48],
  weights: [400],
  fills: [0],
  themes: ["rounded"]
};
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
function axesString(weight, fill) {
  const w = weight === 400 ? "" : `wght${weight}`;
  const f = fill === 0 ? "" : `fill${fill}`;
  const s = `${w}${f}`;
  return s.length ? s : "default";
}
function buildSymbolUrl(theme, icon, axes, size) {
  const themePart = theme || "";
  return `https://fonts.gstatic.com/s/i/short-term/release/materialsymbols${themePart}/${icon}/${axes}/${size}px.svg`;
}
function toFilename(icon, fill, weight, size) {
  const w = Number.isFinite(weight) ? `.w${weight}` : "";
  const s = Number.isFinite(size) ? `.s${size}` : "";
  const fillPart = fill === 1 ? "-fill" : "";
  return `${icon}${fillPart}${w}${s}.svg`;
}
async function removeIfNotSvg(file) {
  try {
    const str = await fs.readFile(file, "utf8");
    const ok = str.startsWith("<svg") && str.includes("</svg>");
    if (!ok) await fs.rm(file, { force: true });
  } catch {
  }
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
function normalizeNums(input, fallback) {
  const src = input && input.length ? input : fallback;
  return unique(Array.from(src).map((n) => Number(n)).filter((n) => Number.isFinite(n)));
}
function normalizeFills(input, fallback) {
  const src = input && input.length ? input : fallback;
  const arr = Array.from(src).map((v) => {
    if (v === true) return 1;
    if (v === false) return 0;
    const n = Number(v);
    return n === 1 ? 1 : 0;
  });
  return unique(arr);
}
function normalizeThemes(input, fallback) {
  const src = input && input.length ? input : fallback;
  const allowed = ["rounded", "outlined", "sharp"];
  const arr = Array.from(src).map((t) => String(t)).filter((t) => allowed.includes(t));
  return unique(arr);
}
function materialSymbolsSvg(iconsDef, opts = {}) {
  const options = {
    concurrency: opts.concurrency ?? 8,
    strict: opts.strict ?? false,
    enabled: opts.enabled ?? true,
    cleanRemoved: opts.cleanRemoved ?? false
  };
  if (!iconsDef || !iconsDef.Symbols) {
    throw new Error("[material-symbols-svg] First parameter must be the return value of defineIcons()");
  }
  let root = "";
  return {
    name: "material-symbols-svg",
    configResolved(config) {
      root = config.root || process.cwd();
    },
    config(config) {
      var _a;
      const symbolsPath = path.resolve(
        root || process.cwd(),
        "node_modules",
        "@hyrioo",
        "vite-plugin-material-symbols-svg",
        ".temp",
        "symbols"
      );
      const alias = ((_a = config.resolve) == null ? void 0 : _a.alias) || {};
      const symbolsAlias = { find: "/symbols", replacement: symbolsPath };
      const newAlias = Array.isArray(alias) ? [...alias, symbolsAlias] : { ...alias, "/symbols": symbolsPath };
      return {
        resolve: {
          alias: newAlias
        }
      };
    },
    async buildStart() {
      if (!options.enabled) return;
      const outBase = path.resolve(
        root,
        "node_modules",
        "@hyrioo",
        "vite-plugin-material-symbols-svg",
        ".temp",
        "symbols"
      );
      try {
        await ensureDir(path.resolve(root, "node_modules", "@hyrioo", "vite-plugin-material-symbols-svg", ".temp"));
      } catch {
      }
      const versionsDir = path.resolve(root, "node_modules", "@hyrioo", "vite-plugin-material-symbols-svg", ".temp");
      const versionsFile = path.resolve(versionsDir, "versions.json");
      const distDir = path.resolve(root, "node_modules", "@hyrioo", "vite-plugin-material-symbols-svg", "dist");
      const iconsDtsFile = path.resolve(distDir, "icons.d.ts");
      const registryTypesFile = path.resolve(distDir, "registry-types.d.ts");
      const registryMapFile = path.resolve(distDir, "registry-map.js");
      try {
        if (!await exists(versionsFile)) {
          this.info("[material-symbols-svg] Fetching Material Symbols metadata...");
          const metaUrl = "https://fonts.google.com/metadata/icons?key=material_symbols&incomplete=true";
          const res = await fetch(metaUrl);
          if (res.ok) {
            let txt = await res.text();
            if (txt.startsWith(")]}'")) {
              const i = txt.indexOf("\n");
              if (i !== -1) txt = txt.substring(i + 1);
            }
            let parsed;
            try {
              parsed = JSON.parse(txt);
            } catch (e) {
              if (options.strict) this.error("[material-symbols-svg] Failed to parse metadata JSON");
              else this.warn("[material-symbols-svg] Failed to parse metadata JSON");
              parsed = null;
            }
            if (parsed && Array.isArray(parsed.icons)) {
              const versions = {};
              for (const icon of parsed.icons) {
                const famsAny = icon && icon["unsupported_families"];
                const families = Array.isArray(famsAny) ? famsAny : [];
                let skip = false;
                for (const fam of families) {
                  if (String(fam).toLowerCase().includes("symbols")) {
                    skip = true;
                    break;
                  }
                }
                if (skip) continue;
                const name = String((icon == null ? void 0 : icon.name) || "");
                if (!name) continue;
                versions[name] = icon == null ? void 0 : icon.version;
              }
              const sorted = Object.fromEntries(Object.entries(versions).sort((a, b) => a[0].localeCompare(b[0])));
              const versionsContent = JSON.stringify(sorted, null, 2);
              let existingVersions = "";
              try {
                existingVersions = await fs.readFile(versionsFile, "utf-8");
              } catch {
              }
              if (existingVersions !== versionsContent) {
                await fs.writeFile(versionsFile, versionsContent);
              }
              try {
                const names = Object.keys(sorted);
                const union = names.map((n) => `'${n.replace(/'/g, "\\'")}'`).join(" | ");
                const banner = `// This file is auto-generated by vite-plugin-material-symbols-svg
// Do not edit manually.
`;
                const content = `${banner}export type MaterialSymbolIcon = ${union};
`;
                try {
                  await fs.mkdir(distDir, { recursive: true });
                  let existing = "";
                  try {
                    existing = await fs.readFile(iconsDtsFile, "utf-8");
                  } catch {
                  }
                  if (existing !== content) {
                    await fs.writeFile(iconsDtsFile, content);
                    const now = /* @__PURE__ */ new Date();
                    await fs.utimes(iconsDtsFile, now, now).catch(() => {
                    });
                  }
                } catch (ee) {
                  const m2 = ee instanceof Error ? ee.message : String(ee);
                  this.warn(`[material-symbols-svg] Failed to overwrite dist/icons.d.ts: ${m2}`);
                }
              } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                this.warn(`[material-symbols-svg] Failed to write icons.d.ts: ${msg}`);
              }
            } else {
              await fs.writeFile(versionsFile, txt);
            }
          } else if (options.strict) {
            this.error(`[material-symbols-svg] Failed to fetch metadata: HTTP ${res.status}`);
          } else {
            this.warn(`[material-symbols-svg] Failed to fetch metadata: HTTP ${res.status}`);
          }
        }
        try {
          const banner = `// This file is auto-generated by vite-plugin-material-symbols-svg
// Do not edit manually.
`;
          const symKeys = Object.keys(iconsDef.Symbols || {});
          const customKeys = Object.keys(iconsDef.Custom || {});
          const all = Array.from(/* @__PURE__ */ new Set([...symKeys, ...customKeys]));
          const keyUnion = all.length ? all.map((n) => `'${n.replace(/'/g, "\\'")}'`).join(" | ") : "string";
          const content2 = `${banner}export type IconKey = ${keyUnion};
`;
          await fs.mkdir(distDir, { recursive: true });
          let existing = "";
          try {
            existing = await fs.readFile(registryTypesFile, "utf-8");
          } catch (e) {
          }
          if (existing !== content2) {
            await fs.writeFile(registryTypesFile, content2);
            const now = /* @__PURE__ */ new Date();
            await fs.utimes(registryTypesFile, now, now).catch(() => {
            });
          }
        } catch (ee) {
          const m2 = ee instanceof Error ? ee.message : String(ee);
          this.warn(`[material-symbols-svg] Failed to write dist/registry-types.d.ts: ${m2}`);
        }
        try {
          const banner = `// This file is auto-generated by vite-plugin-material-symbols-svg
// Do not edit manually.
`;
          const imports = [];
          const mapEntries = [];
          const defaults2 = iconsDef.Default ?? {};
          let i = 0;
          for (const [icon, meta] of Object.entries(iconsDef.Symbols || {})) {
            const sizes = normalizeNums(meta.sizes ?? defaults2.sizes, IconDefaultConfig.sizes);
            const weights = normalizeNums(meta.weights ?? defaults2.weights, IconDefaultConfig.weights);
            const fills = normalizeFills(meta.fills ?? defaults2.fills, IconDefaultConfig.fills);
            const themes = normalizeThemes(meta.themes ?? defaults2.themes, IconDefaultConfig.themes);
            for (const theme of unique(themes)) {
              for (const weight of unique(weights)) {
                for (const fill of unique(fills)) {
                  for (const size of unique(sizes)) {
                    const filename = toFilename(icon, fill, weight, size);
                    const importPath = `/symbols/${theme}/${filename}?raw`;
                    const varName = `i${i++}`;
                    imports.push(`import ${varName} from '${importPath}';`);
                    mapEntries.push(`  '${theme}::${icon}::${fill}::${weight}::${size}': ${varName},`);
                  }
                }
              }
            }
          }
          for (const [icon, sizesObj] of Object.entries(iconsDef.Custom || {})) {
            for (const [sizeKey, value] of Object.entries(sizesObj || {})) {
              if (typeof value === "string" && (value.startsWith("./") || value.startsWith("../"))) {
                const varName = `i${i++}`;
                imports.push(`import ${varName} from '${value}?raw';`);
                mapEntries.push(`  'rounded::${icon}::0::200::${sizeKey}': ${varName},`);
              }
            }
          }
          const mapContent = `${banner}${imports.join("\n")}

export default {
${mapEntries.join("\n")}
};
`;
          let existing = "";
          try {
            existing = await fs.readFile(registryMapFile, "utf-8");
          } catch (e) {
          }
          if (existing !== mapContent) {
            await fs.writeFile(registryMapFile, mapContent);
            const now = /* @__PURE__ */ new Date();
            await fs.utimes(registryMapFile, now, now).catch(() => {
            });
          }
        } catch (ee) {
          const m2 = ee instanceof Error ? ee.message : String(ee);
          this.warn(`[material-symbols-svg] Failed to write dist/registry-map.js: ${m2}`);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (options.strict) this.error(`[material-symbols-svg] Metadata prefetch failed: ${msg}`);
        else this.warn(`[material-symbols-svg] Metadata prefetch failed: ${msg}`);
      }
      const iconsMap = iconsDef.Symbols;
      const defaults = iconsDef.Default ?? {};
      const tasks = [];
      for (const [icon, meta] of Object.entries(iconsMap)) {
        const sizes = normalizeNums(meta.sizes ?? defaults.sizes, IconDefaultConfig.sizes);
        const weights = normalizeNums(meta.weights ?? defaults.weights, IconDefaultConfig.weights);
        const fills = normalizeFills(meta.fills ?? defaults.fills, IconDefaultConfig.fills);
        const themes = normalizeThemes(meta.themes ?? defaults.themes, IconDefaultConfig.themes);
        for (const theme of unique(themes)) {
          await ensureDir(path.resolve(outBase, theme));
          for (const weight of unique(weights)) {
            for (const fill of unique(fills)) {
              for (const size of unique(sizes)) {
                const axes = axesString(weight, fill);
                const url = buildSymbolUrl(theme, icon, axes, size);
                const file = path.resolve(outBase, theme, toFilename(icon, fill, weight, size));
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
          if (await exists(t.file)) {
            skipped++;
            return;
          }
          const res = await fetch(t.url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const svg = await res.text();
          if (!svg.startsWith("<svg")) throw new Error("Not an SVG");
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
      if (failed > 0 && options.strict) this.error(summary);
      else this.info(summary);
      const IS_DEV2 = typeof process !== "undefined" && process.env.NODE_ENV !== "production" || typeof __vite_import_meta_env__$1 !== "undefined" && false;
      if (IS_DEV2) {
        this.info(`[material-symbols-svg] Registry entries generated: ${tasks.length}`);
      }
    }
  };
}
const __vite_import_meta_env__ = {};
const REGISTRY = /* @__PURE__ */ new Map();
let RAW_MAP = {};
const IS_DEV = typeof process !== "undefined" && process.env.NODE_ENV !== "production" || typeof __vite_import_meta_env__ !== "undefined" && false;
if (typeof window !== "undefined" || globalThis.VITE_CLIENT) {
  import("./registry-map.js").then((m) => {
    RAW_MAP = m.default || {};
    if (IS_DEV) {
      console.log(`[material-symbols-svg] registry-map.js loaded with ${Object.keys(RAW_MAP).length} symbols`);
    }
  }).catch((err) => {
    if (IS_DEV) {
      console.error("[material-symbols-svg] Failed to load registry-map.js", err);
    }
  });
}
const DEFAULT_THEME = "rounded";
const DEFAULT_FILL = 0;
const DEFAULT_WEIGHT = 200;
function keyOf(k) {
  return `${k.theme}::${k.icon}::${k.fill}::${k.weight}::${k.size}`;
}
function parseSvg(svg) {
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/i);
  const pathMatch = svg.match(/<path[^>]*\sd="([^"]+)"[^>]*>/i);
  if (!viewBoxMatch || !pathMatch) return null;
  return { viewBox: viewBoxMatch[1], d: pathMatch[1] };
}
function getSymbol(k) {
  const key = keyOf(k);
  let symbol = REGISTRY.get(key);
  if (symbol) return symbol;
  const raw = RAW_MAP[key];
  if (raw) {
    symbol = parseSvg(raw) || void 0;
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
  return void 0;
}
function defineIcons(symbols, custom, defaults) {
  if (IS_DEV) {
    const symbolCount = Object.keys(symbols || {}).length;
    const customCount = Object.keys(custom || {}).length;
    console.log(`[material-symbols-svg] defineIcons: symbols=${symbolCount}, custom=${customCount}`);
  }
  if (custom && (typeof window !== "undefined" || globalThis.VITE_CLIENT)) {
    for (const [icon, sizes] of Object.entries(custom)) {
      for (const [sizeStr, value] of Object.entries(sizes || {})) {
        const size = Number(sizeStr);
        const key = {
          icon,
          theme: DEFAULT_THEME,
          fill: DEFAULT_FILL,
          weight: DEFAULT_WEIGHT,
          size
        };
        const handleSvg = (raw) => {
          const svgString = typeof raw === "string" ? raw : raw == null ? void 0 : raw.default;
          if (svgString && typeof svgString === "string") {
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
          value.then(handleSvg).catch((err) => {
            if (IS_DEV) {
              console.error(`[material-symbols-svg] Failed to load custom icon: ${icon} (${size})`, err);
            }
          });
        } else if (value && typeof value === "object" && "default" in value) {
          handleSvg(value);
        } else if (typeof value === "string" && value.includes("<svg")) {
          handleSvg(value);
        }
      }
    }
  }
  return {
    Symbols: symbols,
    Custom: custom ?? {},
    Default: defaults ?? void 0
  };
}
exports.default = materialSymbolsSvg;
exports.defineIcons = defineIcons;
exports.getSymbol = getSymbol;
exports.materialSymbolsSvg = materialSymbolsSvg;
//# sourceMappingURL=index.cjs.map
