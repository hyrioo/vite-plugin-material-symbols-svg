import w from "node:path";
import h from "node:fs/promises";
const y = {
  sizes: [20, 24, 40, 48],
  weights: [400],
  fills: [0],
  themes: ["rounded"]
};
function u(e) {
  return Array.from(new Set(e));
}
async function N(e) {
  await h.mkdir(e, { recursive: !0 });
}
async function T(e) {
  try {
    return await h.access(e), !0;
  } catch {
    return !1;
  }
}
function D(e, t) {
  const s = e === 400 ? "" : `wght${e}`, i = t === 0 ? "" : `fill${t}`, n = `${s}${i}`;
  return n.length ? n : "default";
}
function L(e, t, s, i) {
  return `https://fonts.gstatic.com/s/i/short-term/release/materialsymbols${e || ""}/${t}/${s}/${i}px.svg`;
}
function B(e, t, s, i) {
  const n = Number.isFinite(s) ? `.w${s}` : "", c = Number.isFinite(i) ? `.s${i}` : "";
  return `${e}${t === 1 ? "-fill" : ""}${n}${c}.svg`;
}
async function G(e) {
  try {
    const t = await h.readFile(e, "utf8");
    t.startsWith("<svg") && t.includes("</svg>") || await h.rm(e, { force: !0 });
  } catch {
  }
}
async function H(e, t, s) {
  const i = [];
  let n = 0;
  const c = async () => {
    for (; n < e.length; ) {
      const a = n++;
      i[a] = await s(e[a], a);
    }
  }, l = Array.from({ length: Math.min(t, e.length) }, c);
  return await Promise.all(l), i;
}
function x(e, t) {
  const s = e && e.length ? e : t;
  return u(Array.from(s).map((i) => Number(i)).filter((i) => Number.isFinite(i)));
}
function q(e, t) {
  const s = e && e.length ? e : t, i = Array.from(s).map((n) => n === !0 ? 1 : n === !1 ? 0 : Number(n) === 1 ? 1 : 0);
  return u(i);
}
function K(e, t) {
  const s = e && e.length ? e : t, i = ["rounded", "outlined", "sharp"], n = Array.from(s).map((c) => String(c)).filter((c) => i.includes(c));
  return u(n);
}
function k(e) {
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
      const i = w.resolve(
        s,
        "node_modules",
        "@hyrioo",
        "vite-plugin-material-symbols-svg",
        ".temp",
        "symbols"
      );
      try {
        await N(w.resolve(s, "node_modules", "@hyrioo", "vite-plugin-material-symbols-svg", ".temp"));
      } catch {
      }
      const n = w.resolve(s, "node_modules", "@hyrioo", "vite-plugin-material-symbols-svg", ".temp", "versions.json");
      try {
        if (!await T(n)) {
          const o = await fetch("https://fonts.gstatic.com/s/i/materialicons/metadata.json");
          if (o.ok) {
            const f = await o.text();
            await h.writeFile(n, f);
          } else t.strict ? this.error(`[material-symbols-svg] Failed to fetch metadata: HTTP ${o.status}`) : this.warn(`[material-symbols-svg] Failed to fetch metadata: HTTP ${o.status}`);
        }
      } catch (r) {
        const o = r instanceof Error ? r.message : String(r);
        t.strict ? this.error(`[material-symbols-svg] Metadata prefetch failed: ${o}`) : this.warn(`[material-symbols-svg] Metadata prefetch failed: ${o}`);
      }
      const c = e.icons, l = [];
      for (const [r, o] of Object.entries(c)) {
        const f = x(o.sizes, y.sizes), A = x(o.weights, y.weights), I = q(o.fills, y.fills), U = K(o.themes, y.themes);
        for (const v of u(U)) {
          await N(w.resolve(i, v));
          for (const S of u(A))
            for (const F of u(I))
              for (const z of u(f)) {
                const _ = D(S, F), W = L(v, r, _, z), C = w.resolve(i, v, B(r, F, S, z));
                l.push({ url: W, file: C });
              }
        }
      }
      let a = 0, g = 0, d = 0;
      await H(l, t.concurrency, async (r) => {
        try {
          if (await T(r.file)) {
            g++;
            return;
          }
          const o = await fetch(r.url);
          if (!o.ok) throw new Error(`HTTP ${o.status}`);
          const f = await o.text();
          if (!f.startsWith("<svg")) throw new Error("Not an SVG");
          await h.writeFile(r.file, f), await G(r.file), d++;
        } catch (o) {
          a++;
          const f = o instanceof Error ? o.message : String(o);
          this.warn(`[material-symbols-svg] Failed ${r.url} -> ${r.file}: ${f}`);
        }
      });
      const m = `[material-symbols-svg] Done. Saved: ${d}, Skipped: ${g}, Failed: ${a}`;
      a > 0 && t.strict ? this.error(m) : this.info(m);
    }
  };
}
const V = /* @__PURE__ */ Object.assign({}), Y = /* @__PURE__ */ Object.assign({}), E = /* @__PURE__ */ new Map(), $ = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), M = "rounded", O = 0, j = 200;
function b(e) {
  return `${e.theme}::${e.icon}::${e.fill}::${e.weight}::${e.size}`;
}
function J(e) {
  const t = e.replace(/\\/g, "/").match(/symbols\/(rounded|outlined|sharp)\/([^/]+)\.svg$/);
  if (!t) return null;
  const s = t[1], i = t[2], [n, ...c] = i.split(".");
  let l = n, a = 0;
  n.endsWith("-fill") && (l = n.slice(0, -5), a = 1);
  let g = 400, d = 24;
  for (const m of c)
    if (m.startsWith("w")) {
      const r = Number(m.slice(1));
      Number.isFinite(r) && (g = r);
    } else if (m.startsWith("s")) {
      const r = Number(m.slice(1));
      Number.isFinite(r) && (d = r);
    }
  return { theme: s, icon: l, fill: a, weight: g, size: d };
}
function P(e) {
  const t = e.match(/viewBox="([^"]+)"/i), s = e.match(/<path[^>]*\sd="([^"]+)"[^>]*>/i);
  return !t || !s ? null : { viewBox: t[1], d: s[1] };
}
for (const [e, t] of Object.entries(V)) {
  const s = J(e);
  if (!s) continue;
  const i = P(t);
  i && E.set(b(s), i);
}
function ee(e) {
  const t = b(e), s = $.get(t);
  if (s) return s;
  const i = `${e.icon}::${e.size}`, n = p.get(i);
  return n || E.get(t);
}
function Q(e, t) {
  const s = {
    icon: e.icon,
    size: e.size,
    theme: e.theme ?? M,
    fill: e.fill ?? O,
    weight: Number(e.weight ?? j)
  };
  $.set(b(s), t), p.set(`${s.icon}::${s.size}`, t);
}
function te(e) {
  const t = {
    icon: e.icon,
    size: e.size,
    theme: e.theme ?? M,
    fill: e.fill ?? O,
    weight: Number(e.weight ?? j)
  };
  $.delete(b(t)), p.delete(`${t.icon}::${t.size}`);
}
function R(e, t) {
  const s = P(t);
  if (!s) throw new Error("[icons/registry] Failed to parse raw SVG: missing viewBox or path d");
  Q(e, s);
}
function se(e) {
  for (const [t, s] of Object.entries(e)) {
    let i;
    for (const [n, c] of Object.entries(Y))
      if (n.replace(/\\/g, "/").endsWith(`/${t}.svg`)) {
        i = c;
        break;
      }
    if (!(typeof i != "string" || !i.includes("<svg")))
      for (const n of Object.keys(s)) {
        const c = Number(n);
        Number.isFinite(c) && R({ icon: t, size: c }, i);
      }
  }
}
function ie(e, t, s, i) {
  for (const n of t)
    R({ icon: e, size: n, ...i }, s(n));
}
function ne(e, t) {
  return {
    Symbols: e,
    Custom: t ?? {}
  };
}
export {
  se as autoRegisterCustom,
  k as default,
  ne as defineIcons,
  ee as getSymbol,
  k as materialSymbolsSvg,
  ie as registerMultipleSizes,
  R as registerRawSymbol,
  Q as registerSymbol,
  te as unregisterSymbol
};
//# sourceMappingURL=index.js.map
