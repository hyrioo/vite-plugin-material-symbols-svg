import { k as keyOf, c as customKeyOf, p as parseSvg, s as symbolConfig } from "./config-Pn2OSTF5.js";
import { d } from "./config-Pn2OSTF5.js";
import RAW_MAP from "./loader-map.js";
const REGISTRY = /* @__PURE__ */ new Map();
function getSymbol(k) {
  const key = keyOf(k);
  const cKey = customKeyOf(k);
  let available = REGISTRY.get(key) || REGISTRY.get(cKey);
  if (!available) {
    const rawGroup = RAW_MAP[key] || RAW_MAP[cKey];
    if (rawGroup) {
      available = {};
      for (const [s, svg] of Object.entries(rawGroup)) {
        const parsed = parseSvg(svg);
        if (parsed) {
          available[Number(s)] = parsed;
        }
      }
      REGISTRY.set(rawGroup === RAW_MAP[key] ? key : cKey, available);
    } else if (symbolConfig.debug) {
      console.warn(`[material-symbols-svg] Symbol not found: ${key}`);
    }
  }
  return available;
}
export {
  d as configureSymbolConfig,
  getSymbol,
  symbolConfig
};
//# sourceMappingURL=consumer.js.map
