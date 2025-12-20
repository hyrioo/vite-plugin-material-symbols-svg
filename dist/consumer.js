import { k as keyOf, p as parseSvg } from "./utils-Bn2O7Hbn.js";
import RAW_MAP from "./loader-map.js";
const REGISTRY = /* @__PURE__ */ new Map();
function getSymbol(k) {
  const key = keyOf(k);
  {
    console.log(`[material-symbols-svg] Get symbol:`, key);
  }
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
export {
  getSymbol
};
//# sourceMappingURL=consumer.js.map
