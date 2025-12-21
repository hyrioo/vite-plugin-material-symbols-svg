import { k as keyOf, c as customKeyOf, p as parseSvg } from "./config-DSPLkg-3.js";
import { d, s } from "./config-DSPLkg-3.js";
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
      for (const [s2, svg] of Object.entries(rawGroup)) {
        const parsed = parseSvg(svg);
        if (parsed) {
          available[Number(s2)] = parsed;
        }
      }
      REGISTRY.set(rawGroup === RAW_MAP[key] ? key : cKey, available);
    }
  }
  return available;
}
export {
  d as configureSymbolConfig,
  getSymbol,
  s as symbolConfig
};
//# sourceMappingURL=consumer.js.map
