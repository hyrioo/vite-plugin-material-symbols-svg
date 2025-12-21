import { k as keyOf, c as customKeyOf, p as parseSvg, s as symbolConfig } from "./config-BFYDHr0U.js";
import { d } from "./config-BFYDHr0U.js";
import RAW_MAP from "./loader-map.js";
const REGISTRY = /* @__PURE__ */ new Map();
function getSymbol(k) {
  let key = keyOf(k);
  let symbol = REGISTRY.get(key);
  if (symbol) return symbol;
  let raw = RAW_MAP[key];
  if (!raw) {
    const cKey = customKeyOf(k);
    symbol = REGISTRY.get(cKey);
    if (symbol) return symbol;
    raw = RAW_MAP[cKey];
    if (raw) {
      key = cKey;
    }
  }
  if (raw) {
    symbol = parseSvg(raw) || void 0;
    if (symbol) {
      REGISTRY.set(key, symbol);
      return symbol;
    }
  }
  if (symbolConfig.debug) {
    console.warn(`[material-symbols-svg] Symbol not found "${key}"`);
  }
  return void 0;
}
export {
  d as configureSymbolConfig,
  getSymbol,
  symbolConfig
};
//# sourceMappingURL=consumer.js.map
