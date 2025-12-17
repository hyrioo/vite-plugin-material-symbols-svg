import y from "node:path";
import g from "node:fs/promises";
function w(e) {
  return Array.from(new Set(e));
}
async function P(e) {
  await g.mkdir(e, { recursive: !0 });
}
async function W(e) {
  try {
    return await g.access(e), !0;
  } catch {
    return !1;
  }
}
function L(e, t) {
  const s = e === 400 ? "" : `wght${e}`, i = t === 0 ? "" : `fill${t}`, o = `${s}${i}`;
  return o.length ? o : "default";
}
function U(e, t, s, i) {
  return `https://fonts.gstatic.com/s/i/short-term/release/materialsymbols${e || ""}/${t}/${s}/${i}px.svg`;
}
function _(e, t, s, i) {
  const o = Number.isFinite(s) ? `.w${s}` : "", l = Number.isFinite(i) ? `.s${i}` : "";
  return `${e}${t === 1 ? "-fill" : ""}${o}${l}.svg`;
}
async function B(e) {
  try {
    const t = await g.readFile(e, "utf8");
    t.startsWith("<svg") && t.includes("</svg>") || await g.rm(e, { force: !0 });
  } catch {
  }
}
async function C(e, t, s) {
  const i = [];
  let o = 0;
  const l = async () => {
    for (; o < e.length; ) {
      const f = o++;
      i[f] = await s(e[f], f);
    }
  }, a = Array.from({ length: Math.min(t, e.length) }, l);
  return await Promise.all(a), i;
}
function Y(e) {
  const t = {
    concurrency: e.concurrency ?? 8,
    strict: e.strict ?? !1,
    enabled: e.enabled ?? !0,
    cleanRemoved: e.cleanRemoved ?? !1
  };
  if (!e || !e.icons)
    throw new Error("[material-symbols-svg] options.icons is required");
  let s = "";
  return {
    name: "material-symbols-svg",
    configResolved(i) {
      s = i.root || process.cwd();
    },
    async buildStart() {
      if (!t.enabled) return;
      const i = y.resolve(
        s,
        "node_modules",
        "@hyrioo",
        "vite-plugin-material-symbols-svg",
        ".temp",
        "symbols"
      ), o = e.icons, l = [];
      for (const [c, n] of Object.entries(o)) {
        const u = (n.sizes && n.sizes.length ? Array.from(n.sizes) : []).map((r) => Number(r)).filter((r) => Number.isFinite(r)), O = (n.weights && n.weights.length ? Array.from(n.weights) : []).map((r) => Number(r)).filter((r) => Number.isFinite(r)), T = (n.fills && n.fills.length ? Array.from(n.fills) : []).map((r) => Number(r)).filter((r) => r === 0 || r === 1), A = n.themes && n.themes.length ? Array.from(n.themes) : [];
        for (const r of w(A)) {
          await P(y.resolve(i, r));
          for (const $ of w(O))
            for (const v of w(T))
              for (const S of w(u)) {
                const R = L($, v), j = U(r, c, R, S), I = y.resolve(i, r, _(c, v, $, S));
                l.push({ url: j, file: I });
              }
        }
      }
      let a = 0, f = 0, m = 0;
      await C(l, t.concurrency, async (c) => {
        try {
          if (await W(c.file)) {
            f++;
            return;
          }
          const n = await fetch(c.url);
          if (!n.ok) throw new Error(`HTTP ${n.status}`);
          const u = await n.text();
          if (!u.startsWith("<svg")) throw new Error("Not an SVG");
          await g.writeFile(c.file, u), await B(c.file), m++;
        } catch (n) {
          a++;
          const u = n instanceof Error ? n.message : String(n);
          this.warn(`[material-symbols-svg] Failed ${c.url} -> ${c.file}: ${u}`);
        }
      });
      const h = `[material-symbols-svg] Done. Saved: ${m}, Skipped: ${f}, Failed: ${a}`;
      a > 0 && t.strict ? this.error(h) : this.info(h);
    }
  };
}
const D = /* @__PURE__ */ Object.assign({}), G = /* @__PURE__ */ Object.assign({}), F = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), N = "rounded", z = 0, E = 200;
function b(e) {
  return `${e.theme}::${e.icon}::${e.fill}::${e.weight}::${e.size}`;
}
function H(e) {
  const t = e.replace(/\\/g, "/").match(/symbols\/(rounded|outlined|sharp)\/([^/]+)\.svg$/);
  if (!t) return null;
  const s = t[1], i = t[2], [o, ...l] = i.split(".");
  let a = o, f = 0;
  o.endsWith("-fill") && (a = o.slice(0, -5), f = 1);
  let m = 400, h = 24;
  for (const c of l)
    if (c.startsWith("w")) {
      const n = Number(c.slice(1));
      Number.isFinite(n) && (m = n);
    } else if (c.startsWith("s")) {
      const n = Number(c.slice(1));
      Number.isFinite(n) && (h = n);
    }
  return { theme: s, icon: a, fill: f, weight: m, size: h };
}
function x(e) {
  const t = e.match(/viewBox="([^"]+)"/i), s = e.match(/<path[^>]*\sd="([^"]+)"[^>]*>/i);
  return !t || !s ? null : { viewBox: t[1], d: s[1] };
}
for (const [e, t] of Object.entries(D)) {
  const s = H(e);
  if (!s) continue;
  const i = x(t);
  i && F.set(b(s), i);
}
function J(e) {
  const t = b(e), s = d.get(t);
  if (s) return s;
  const i = `${e.icon}::${e.size}`, o = p.get(i);
  return o || F.get(t);
}
function q(e, t) {
  const s = {
    icon: e.icon,
    size: e.size,
    theme: e.theme ?? N,
    fill: e.fill ?? z,
    weight: Number(e.weight ?? E)
  };
  d.set(b(s), t), p.set(`${s.icon}::${s.size}`, t);
}
function Q(e) {
  const t = {
    icon: e.icon,
    size: e.size,
    theme: e.theme ?? N,
    fill: e.fill ?? z,
    weight: Number(e.weight ?? E)
  };
  d.delete(b(t)), p.delete(`${t.icon}::${t.size}`);
}
function M(e, t) {
  const s = x(t);
  if (!s) throw new Error("[icons/registry] Failed to parse raw SVG: missing viewBox or path d");
  q(e, s);
}
function X(e) {
  for (const [t, s] of Object.entries(e)) {
    let i;
    for (const [o, l] of Object.entries(G))
      if (o.replace(/\\/g, "/").endsWith(`/${t}.svg`)) {
        i = l;
        break;
      }
    if (!(typeof i != "string" || !i.includes("<svg")))
      for (const o of Object.keys(s)) {
        const l = Number(o);
        Number.isFinite(l) && M({ icon: t, size: l }, i);
      }
  }
}
function Z(e, t, s, i) {
  for (const o of t)
    M({ icon: e, size: o, ...i }, s(o));
}
function k(e, t) {
  return {
    Symbols: e,
    Custom: t ?? {}
  };
}
export {
  X as autoRegisterCustom,
  Y as default,
  k as defineIcons,
  J as getSymbol,
  Y as materialSymbolsSvg,
  Z as registerMultipleSizes,
  M as registerRawSymbol,
  q as registerSymbol,
  Q as unregisterSymbol
};
//# sourceMappingURL=index.js.map
