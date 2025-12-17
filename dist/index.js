import y from "node:path";
const g = {};
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
function I(e, t) {
  const s = e === 400 ? "" : `wght${e}`, i = t === 0 ? "" : `fill${t}`, r = `${s}${i}`;
  return r.length ? r : "default";
}
function L(e, t, s, i) {
  return `https://fonts.gstatic.com/s/i/short-term/release/materialsymbols${e || ""}/${t}/${s}/${i}px.svg`;
}
function U(e, t, s, i) {
  const r = Number.isFinite(s) ? `.w${s}` : "", a = Number.isFinite(i) ? `.s${i}` : "";
  return `${e}${t === 1 ? "-fill" : ""}${r}${a}.svg`;
}
async function B(e) {
  try {
    const t = await g.readFile(e, "utf8");
    t.startsWith("<svg") && t.includes("</svg>") || await g.rm(e, { force: !0 });
  } catch {
  }
}
async function G(e, t, s) {
  const i = [];
  let r = 0;
  const a = async () => {
    for (; r < e.length; ) {
      const f = r++;
      i[f] = await s(e[f], f);
    }
  }, l = Array.from({ length: Math.min(t, e.length) }, a);
  return await Promise.all(l), i;
}
function V(e) {
  const t = {
    outDir: e.outDir ?? "src/shared/icons/symbols",
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
      const i = y.resolve(s, t.outDir), r = e.icons, a = [];
      for (const [c, n] of Object.entries(r)) {
        const u = (n.sizes && n.sizes.length ? Array.from(n.sizes) : []).map((o) => Number(o)).filter((o) => Number.isFinite(o)), O = (n.weights && n.weights.length ? Array.from(n.weights) : []).map((o) => Number(o)).filter((o) => Number.isFinite(o)), T = (n.fills && n.fills.length ? Array.from(n.fills) : []).map((o) => Number(o)).filter((o) => o === 0 || o === 1), A = n.themes && n.themes.length ? Array.from(n.themes) : [];
        for (const o of w(A)) {
          await P(y.resolve(i, o));
          for (const p of w(O))
            for (const v of w(T))
              for (const S of w(u)) {
                const R = I(p, v), j = L(o, c, R, S), D = y.resolve(i, o, U(c, v, p, S));
                a.push({ url: j, file: D });
              }
        }
      }
      let l = 0, f = 0, m = 0;
      await G(a, t.concurrency, async (c) => {
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
          l++;
          const u = n instanceof Error ? n.message : String(n);
          this.warn(`[material-symbols-svg] Failed ${c.url} -> ${c.file}: ${u}`);
        }
      });
      const h = `[material-symbols-svg] Done. Saved: ${m}, Skipped: ${f}, Failed: ${l}`;
      l > 0 && t.strict ? this.error(h) : this.info(h);
    }
  };
}
const _ = /* @__PURE__ */ Object.assign({}), C = /* @__PURE__ */ Object.assign({}), F = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map(), $ = /* @__PURE__ */ new Map(), N = "rounded", z = 0, E = 200;
function b(e) {
  return `${e.theme}::${e.icon}::${e.fill}::${e.weight}::${e.size}`;
}
function H(e) {
  const t = e.replace(/\\/g, "/").match(/symbols\/(rounded|outlined|sharp)\/([^/]+)\.svg$/);
  if (!t) return null;
  const s = t[1], i = t[2], [r, ...a] = i.split(".");
  let l = r, f = 0;
  r.endsWith("-fill") && (l = r.slice(0, -5), f = 1);
  let m = 400, h = 24;
  for (const c of a)
    if (c.startsWith("w")) {
      const n = Number(c.slice(1));
      Number.isFinite(n) && (m = n);
    } else if (c.startsWith("s")) {
      const n = Number(c.slice(1));
      Number.isFinite(n) && (h = n);
    }
  return { theme: s, icon: l, fill: f, weight: m, size: h };
}
function x(e) {
  const t = e.match(/viewBox="([^"]+)"/i), s = e.match(/<path[^>]*\sd="([^"]+)"[^>]*>/i);
  return !t || !s ? null : { viewBox: t[1], d: s[1] };
}
for (const [e, t] of Object.entries(_)) {
  const s = H(e);
  if (!s) continue;
  const i = x(t);
  i && F.set(b(s), i);
}
function Y(e) {
  const t = b(e), s = d.get(t);
  if (s) return s;
  const i = `${e.icon}::${e.size}`, r = $.get(i);
  return r || F.get(t);
}
function q(e, t) {
  const s = {
    icon: e.icon,
    size: e.size,
    theme: e.theme ?? N,
    fill: e.fill ?? z,
    weight: Number(e.weight ?? E)
  };
  d.set(b(s), t), $.set(`${s.icon}::${s.size}`, t);
}
function J(e) {
  const t = {
    icon: e.icon,
    size: e.size,
    theme: e.theme ?? N,
    fill: e.fill ?? z,
    weight: Number(e.weight ?? E)
  };
  d.delete(b(t)), $.delete(`${t.icon}::${t.size}`);
}
function M(e, t) {
  const s = x(t);
  if (!s) throw new Error("[icons/registry] Failed to parse raw SVG: missing viewBox or path d");
  q(e, s);
}
function Q(e) {
  for (const [t, s] of Object.entries(e)) {
    let i;
    for (const [r, a] of Object.entries(C))
      if (r.replace(/\\/g, "/").endsWith(`/${t}.svg`)) {
        i = a;
        break;
      }
    if (!(typeof i != "string" || !i.includes("<svg")))
      for (const r of Object.keys(s)) {
        const a = Number(r);
        Number.isFinite(a) && M({ icon: t, size: a }, i);
      }
  }
}
function X(e, t, s, i) {
  for (const r of t)
    M({ icon: e, size: r, ...i }, s(r));
}
export {
  Q as autoRegisterCustom,
  Y as getSymbol,
  V as materialSymbolsSvg,
  X as registerMultipleSizes,
  M as registerRawSymbol,
  q as registerSymbol,
  J as unregisterSymbol
};
//# sourceMappingURL=index.js.map
