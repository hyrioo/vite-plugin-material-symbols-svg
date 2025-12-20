import { k as keyOf, c as customKeyOf, p as parseSvg } from "./utils-Jy7vWe-6.js";
import RAW_MAP from "./loader-map.js";
const REGISTRY = /* @__PURE__ */ new Map();
function getSymbol(k) {
  let key = keyOf(k);
  {
    console.log(`[material-symbols-svg] Get symbol:`, key);
  }
  let symbol = REGISTRY.get(key);
  if (symbol) return symbol;
  let raw = RAW_MAP[key];
  if (!raw) {
    const cKey = customKeyOf(k);
    {
      console.log(`[material-symbols-svg] Get symbol (fallback to custom):`, cKey);
    }
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
export {
  getSymbol
};
//# sourceMappingURL=consumer.js.map
