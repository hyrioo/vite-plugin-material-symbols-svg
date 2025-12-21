function keyOf(k) {
  return `${k.theme}::${k.icon}::${k.filled}::${k.weight}::${k.size}`;
}
function customKeyOf(k) {
  return `custom::${k.icon}::_::_::${k.size}`;
}
function parseSvg(svg) {
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/i);
  const pathMatch = svg.match(/<path[^>]*\sd="([^"]+)"[^>]*>/i);
  if (!viewBoxMatch || !pathMatch) return null;
  return { viewBox: viewBoxMatch[1], d: pathMatch[1] };
}
function unique(arr) {
  return Array.from(new Set(arr));
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
  const arr = Array.from(src).map((t) => String(t).toLowerCase()).filter((t) => allowed.includes(t));
  return unique(arr);
}
let _config = {
  debug: typeof process !== "undefined" && process.env.NODE_ENV !== "production"
};
function configureSymbolConfig(overrides) {
  _config = {
    ..._config,
    ...overrides
  };
}
const symbolConfig = {
  get debug() {
    return _config.debug;
  }
};
export {
  normalizeFills as a,
  normalizeThemes as b,
  customKeyOf as c,
  configureSymbolConfig as d,
  keyOf as k,
  normalizeNums as n,
  parseSvg as p,
  symbolConfig as s,
  unique as u
};
//# sourceMappingURL=config-BFYDHr0U.js.map
