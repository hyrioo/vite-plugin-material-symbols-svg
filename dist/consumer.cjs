"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const utils = require("./utils-DIvLxux2.cjs");
const loaderMap = require("./loader-map.cjs");
const REGISTRY = /* @__PURE__ */ new Map();
function getSymbol(k) {
  const key = utils.keyOf(k);
  {
    console.log(`[material-symbols-svg] Get symbol:`, key);
  }
  let symbol = REGISTRY.get(key);
  if (symbol) return symbol;
  const raw = loaderMap[key];
  if (raw) {
    symbol = utils.parseSvg(raw) || void 0;
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
exports.getSymbol = getSymbol;
//# sourceMappingURL=consumer.cjs.map
