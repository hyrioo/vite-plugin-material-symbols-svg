import w from "node:path";
import h from "node:fs/promises";
const b = {
  sizes: [20, 24, 40, 48],
  weights: [400],
  fills: [0],
  themes: ["rounded"]
};
function u(e) {
  return Array.from(new Set(e));
}
async function x(e) {
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
      const l = n++;
      i[l] = await s(e[l], l);
    }
  }, f = Array.from({ length: Math.min(t, e.length) }, c);
  return await Promise.all(f), i;
}
function E(e, t) {
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
        await x(w.resolve(s, "node_modules", "@hyrioo", "vite-plugin-material-symbols-svg", ".temp"));
      } catch {
      }
      const n = w.resolve(s, "node_modules", "@hyrioo", "vite-plugin-material-symbols-svg", ".temp", "versions.json");
      try {
        if (!await T(n)) {
          const o = await fetch("https://fonts.google.com/metadata/icons?key=material_symbols&incomplete=true");
          if (o.ok) {
            let a = await o.text();
            if (a.startsWith(")]}'")) {
              const y = a.indexOf(`
`);
              y !== -1 && (a = a.substring(y + 1));
            }
            await h.writeFile(n, a);
          } else t.strict ? this.error(`[material-symbols-svg] Failed to fetch metadata: HTTP ${o.status}`) : this.warn(`[material-symbols-svg] Failed to fetch metadata: HTTP ${o.status}`);
        }
      } catch (r) {
        const o = r instanceof Error ? r.message : String(r);
        t.strict ? this.error(`[material-symbols-svg] Metadata prefetch failed: ${o}`) : this.warn(`[material-symbols-svg] Metadata prefetch failed: ${o}`);
      }
      const c = e.icons, f = [];
      for (const [r, o] of Object.entries(c)) {
        const a = E(o.sizes, b.sizes), y = E(o.weights, b.weights), A = q(o.fills, b.fills), I = K(o.themes, b.themes);
        for (const p of u(I)) {
          await x(w.resolve(i, p));
          for (const F of u(y))
            for (const z of u(A))
              for (const N of u(a)) {
                const U = D(F, z), W = L(p, r, U, N), C = w.resolve(i, p, B(r, z, F, N));
                f.push({ url: W, file: C });
              }
        }
      }
      let l = 0, g = 0, d = 0;
      await H(f, t.concurrency, async (r) => {
        try {
          if (await T(r.file)) {
            g++;
            return;
          }
          const o = await fetch(r.url);
          if (!o.ok) throw new Error(`HTTP ${o.status}`);
          const a = await o.text();
          if (!a.startsWith("<svg")) throw new Error("Not an SVG");
          await h.writeFile(r.file, a), await G(r.file), d++;
        } catch (o) {
          l++;
          const a = o instanceof Error ? o.message : String(o);
          this.warn(`[material-symbols-svg] Failed ${r.url} -> ${r.file}: ${a}`);
        }
      });
      const m = `[material-symbols-svg] Done. Saved: ${d}, Skipped: ${g}, Failed: ${l}`;
      l > 0 && t.strict ? this.error(m) : this.info(m);
    }
  };
}
const V = /* @__PURE__ */ Object.assign({}), Y = /* @__PURE__ */ Object.assign({}), M = /* @__PURE__ */ new Map(), $ = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), O = "rounded", j = 0, P = 200;
function v(e) {
  return `${e.theme}::${e.icon}::${e.fill}::${e.weight}::${e.size}`;
}
function J(e) {
  const t = e.replace(/\\/g, "/").match(/symbols\/(rounded|outlined|sharp)\/([^/]+)\.svg$/);
  if (!t) return null;
  const s = t[1], i = t[2], [n, ...c] = i.split(".");
  let f = n, l = 0;
  n.endsWith("-fill") && (f = n.slice(0, -5), l = 1);
  let g = 400, d = 24;
  for (const m of c)
    if (m.startsWith("w")) {
      const r = Number(m.slice(1));
      Number.isFinite(r) && (g = r);
    } else if (m.startsWith("s")) {
      const r = Number(m.slice(1));
      Number.isFinite(r) && (d = r);
    }
  return { theme: s, icon: f, fill: l, weight: g, size: d };
}
function R(e) {
  const t = e.match(/viewBox="([^"]+)"/i), s = e.match(/<path[^>]*\sd="([^"]+)"[^>]*>/i);
  return !t || !s ? null : { viewBox: t[1], d: s[1] };
}
for (const [e, t] of Object.entries(V)) {
  const s = J(e);
  if (!s) continue;
  const i = R(t);
  i && M.set(v(s), i);
}
function ee(e) {
  const t = v(e), s = $.get(t);
  if (s) return s;
  const i = `${e.icon}::${e.size}`, n = S.get(i);
  return n || M.get(t);
}
function Q(e, t) {
  const s = {
    icon: e.icon,
    size: e.size,
    theme: e.theme ?? O,
    fill: e.fill ?? j,
    weight: Number(e.weight ?? P)
  };
  $.set(v(s), t), S.set(`${s.icon}::${s.size}`, t);
}
function te(e) {
  const t = {
    icon: e.icon,
    size: e.size,
    theme: e.theme ?? O,
    fill: e.fill ?? j,
    weight: Number(e.weight ?? P)
  };
  $.delete(v(t)), S.delete(`${t.icon}::${t.size}`);
}
function _(e, t) {
  const s = R(t);
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
        Number.isFinite(c) && _({ icon: t, size: c }, i);
      }
  }
}
function ie(e, t, s, i) {
  for (const n of t)
    _({ icon: e, size: n, ...i }, s(n));
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
  _ as registerRawSymbol,
  Q as registerSymbol,
  te as unregisterSymbol
};
//# sourceMappingURL=index.js.map
