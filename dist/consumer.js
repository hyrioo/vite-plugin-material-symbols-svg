import RAW_MAP from "./loader-map.js";
const REGISTRY = /* @__PURE__ */ new Map();
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
      {
        console.log(`[material-symbols-svg] getSymbol: parsed and cached "${key}"`);
      }
      return symbol;
    }
  }
  {
    console.warn(`[material-symbols-svg] getSymbol: NOT found "${key}"`);
  }
  return void 0;
}
function defineIcons(symbols, custom, defaults) {
  {
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
          if (svgString) {
            const parsed = parseSvg(svgString);
            if (parsed) {
              REGISTRY.set(keyOf(key), parsed);
              {
                console.log(`[material-symbols-svg] Custom icon registered: ${keyOf(key)}`);
              }
            }
          }
        };
        if (value instanceof Promise) {
          value.then(handleSvg).catch((err) => {
            {
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
export {
  defineIcons,
  getSymbol
};
//# sourceMappingURL=consumer.js.map
