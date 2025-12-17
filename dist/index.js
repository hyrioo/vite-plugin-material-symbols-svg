import u from "node:path";
const B = {};
function d(g) {
  return Array.from(new Set(g));
}
async function k(g) {
  await B.mkdir(g, { recursive: !0 });
}
async function R(g) {
  try {
    return await B.access(g), !0;
  } catch {
    return !1;
  }
}
function Q(g, I) {
  const i = g === 400 ? "" : `wght${g}`, e = I === 0 ? "" : `fill${I}`, C = `${i}${e}`;
  return C.length ? C : "default";
}
function F(g, I, i, e) {
  return `https://fonts.gstatic.com/s/i/short-term/release/materialsymbols${g || ""}/${I}/${i}/${e}px.svg`;
}
function U(g, I, i, e) {
  const C = Number.isFinite(i) ? `.w${i}` : "", t = Number.isFinite(e) ? `.s${e}` : "";
  return `${g}${I === 1 ? "-fill" : ""}${C}${t}.svg`;
}
async function D(g) {
  try {
    const I = await B.readFile(g, "utf8");
    I.startsWith("<svg") && I.includes("</svg>") || await B.rm(g, { force: !0 });
  } catch {
  }
}
async function T(g, I, i) {
  const e = [];
  let C = 0;
  const t = async () => {
    for (; C < g.length; ) {
      const c = C++;
      e[c] = await i(g[c], c);
    }
  }, n = Array.from({ length: Math.min(I, g.length) }, t);
  return await Promise.all(n), e;
}
function x(g) {
  const I = (() => {
    const n = new URL("data:text/javascript;base64,aW1wb3J0IHkgZnJvbSAibm9kZTpwYXRoIjsKY29uc3QgZyA9IHt9OwpmdW5jdGlvbiB3KGUpIHsKICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KGUpKTsKfQphc3luYyBmdW5jdGlvbiBJKGUpIHsKICBhd2FpdCBnLm1rZGlyKGUsIHsgcmVjdXJzaXZlOiAhMCB9KTsKfQphc3luYyBmdW5jdGlvbiBQKGUpIHsKICB0cnkgewogICAgcmV0dXJuIGF3YWl0IGcuYWNjZXNzKGUpLCAhMDsKICB9IGNhdGNoIHsKICAgIHJldHVybiAhMTsKICB9Cn0KZnVuY3Rpb24gVyhlLCB0KSB7CiAgY29uc3QgcyA9IGUgPT09IDQwMCA/ICIiIDogYHdnaHQke2V9YCwgaSA9IHQgPT09IDAgPyAiIiA6IGBmaWxsJHt0fWAsIHIgPSBgJHtzfSR7aX1gOwogIHJldHVybiByLmxlbmd0aCA/IHIgOiAiZGVmYXVsdCI7Cn0KZnVuY3Rpb24gTChlLCB0LCBzLCBpKSB7CiAgcmV0dXJuIGBodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tL3MvaS9zaG9ydC10ZXJtL3JlbGVhc2UvbWF0ZXJpYWxzeW1ib2xzJHtlIHx8ICIifS8ke3R9LyR7c30vJHtpfXB4LnN2Z2A7Cn0KZnVuY3Rpb24gVShlLCB0LCBzLCBpKSB7CiAgY29uc3QgciA9IE51bWJlci5pc0Zpbml0ZShzKSA/IGAudyR7c31gIDogIiIsIGEgPSBOdW1iZXIuaXNGaW5pdGUoaSkgPyBgLnMke2l9YCA6ICIiOwogIHJldHVybiBgJHtlfSR7dCA9PT0gMSA/ICItZmlsbCIgOiAiIn0ke3J9JHthfS5zdmdgOwp9CmFzeW5jIGZ1bmN0aW9uIEIoZSkgewogIHRyeSB7CiAgICBjb25zdCB0ID0gYXdhaXQgZy5yZWFkRmlsZShlLCAidXRmOCIpOwogICAgdC5zdGFydHNXaXRoKCI8c3ZnIikgJiYgdC5pbmNsdWRlcygiPC9zdmc+IikgfHwgYXdhaXQgZy5ybShlLCB7IGZvcmNlOiAhMCB9KTsKICB9IGNhdGNoIHsKICB9Cn0KYXN5bmMgZnVuY3Rpb24gQyhlLCB0LCBzKSB7CiAgY29uc3QgaSA9IFtdOwogIGxldCByID0gMDsKICBjb25zdCBhID0gYXN5bmMgKCkgPT4gewogICAgZm9yICg7IHIgPCBlLmxlbmd0aDsgKSB7CiAgICAgIGNvbnN0IGYgPSByKys7CiAgICAgIGlbZl0gPSBhd2FpdCBzKGVbZl0sIGYpOwogICAgfQogIH0sIGwgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiBNYXRoLm1pbih0LCBlLmxlbmd0aCkgfSwgYSk7CiAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKGwpLCBpOwp9CmZ1bmN0aW9uIFYoZSkgewogIGNvbnN0IHQgPSB7CiAgICBvdXREaXI6IGUub3V0RGlyID8/ICJzcmMvc2hhcmVkL2ljb25zL3N5bWJvbHMiLAogICAgY29uY3VycmVuY3k6IGUuY29uY3VycmVuY3kgPz8gOCwKICAgIHN0cmljdDogZS5zdHJpY3QgPz8gITEsCiAgICBlbmFibGVkOiBlLmVuYWJsZWQgPz8gITAsCiAgICBjbGVhblJlbW92ZWQ6IGUuY2xlYW5SZW1vdmVkID8/ICExCiAgfTsKICBpZiAoIWUgfHwgIWUuaWNvbnMpCiAgICB0aHJvdyBuZXcgRXJyb3IoIlttYXRlcmlhbC1zeW1ib2xzLXN2Z10gb3B0aW9ucy5pY29ucyBpcyByZXF1aXJlZCIpOwogIGxldCBzID0gIiI7CiAgcmV0dXJuIHsKICAgIG5hbWU6ICJtYXRlcmlhbC1zeW1ib2xzLXN2ZyIsCiAgICBjb25maWdSZXNvbHZlZChpKSB7CiAgICAgIHMgPSBpLnJvb3QgfHwgcHJvY2Vzcy5jd2QoKTsKICAgIH0sCiAgICBhc3luYyBidWlsZFN0YXJ0KCkgewogICAgICBpZiAoIXQuZW5hYmxlZCkgcmV0dXJuOwogICAgICBjb25zdCBpID0geS5yZXNvbHZlKHMsIHQub3V0RGlyKSwgciA9IGUuaWNvbnMsIGEgPSBbXTsKICAgICAgZm9yIChjb25zdCBbYywgbl0gb2YgT2JqZWN0LmVudHJpZXMocikpIHsKICAgICAgICBjb25zdCB1ID0gKG4uc2l6ZXMgJiYgbi5zaXplcy5sZW5ndGggPyBBcnJheS5mcm9tKG4uc2l6ZXMpIDogW10pLm1hcCgobykgPT4gTnVtYmVyKG8pKS5maWx0ZXIoKG8pID0+IE51bWJlci5pc0Zpbml0ZShvKSksIE8gPSAobi53ZWlnaHRzICYmIG4ud2VpZ2h0cy5sZW5ndGggPyBBcnJheS5mcm9tKG4ud2VpZ2h0cykgOiBbXSkubWFwKChvKSA9PiBOdW1iZXIobykpLmZpbHRlcigobykgPT4gTnVtYmVyLmlzRmluaXRlKG8pKSwgVCA9IChuLmZpbGxzICYmIG4uZmlsbHMubGVuZ3RoID8gQXJyYXkuZnJvbShuLmZpbGxzKSA6IFtdKS5tYXAoKG8pID0+IE51bWJlcihvKSkuZmlsdGVyKChvKSA9PiBvID09PSAwIHx8IG8gPT09IDEpLCBBID0gbi50aGVtZXMgJiYgbi50aGVtZXMubGVuZ3RoID8gQXJyYXkuZnJvbShuLnRoZW1lcykgOiBbXTsKICAgICAgICBmb3IgKGNvbnN0IG8gb2YgdyhBKSkgewogICAgICAgICAgYXdhaXQgSSh5LnJlc29sdmUoaSwgbykpOwogICAgICAgICAgZm9yIChjb25zdCBwIG9mIHcoTykpCiAgICAgICAgICAgIGZvciAoY29uc3QgdiBvZiB3KFQpKQogICAgICAgICAgICAgIGZvciAoY29uc3QgUyBvZiB3KHUpKSB7CiAgICAgICAgICAgICAgICBjb25zdCBSID0gVyhwLCB2KSwgaiA9IEwobywgYywgUiwgUyksIEQgPSB5LnJlc29sdmUoaSwgbywgVShjLCB2LCBwLCBTKSk7CiAgICAgICAgICAgICAgICBhLnB1c2goeyB1cmw6IGosIGZpbGU6IEQgfSk7CiAgICAgICAgICAgICAgfQogICAgICAgIH0KICAgICAgfQogICAgICBsZXQgbCA9IDAsIGYgPSAwLCBtID0gMDsKICAgICAgYXdhaXQgQyhhLCB0LmNvbmN1cnJlbmN5LCBhc3luYyAoYykgPT4gewogICAgICAgIHRyeSB7CiAgICAgICAgICBpZiAoYXdhaXQgUChjLmZpbGUpKSB7CiAgICAgICAgICAgIGYrKzsKICAgICAgICAgICAgcmV0dXJuOwogICAgICAgICAgfQogICAgICAgICAgY29uc3QgbiA9IGF3YWl0IGZldGNoKGMudXJsKTsKICAgICAgICAgIGlmICghbi5vaykgdGhyb3cgbmV3IEVycm9yKGBIVFRQICR7bi5zdGF0dXN9YCk7CiAgICAgICAgICBjb25zdCB1ID0gYXdhaXQgbi50ZXh0KCk7CiAgICAgICAgICBpZiAoIXUuc3RhcnRzV2l0aCgiPHN2ZyIpKSB0aHJvdyBuZXcgRXJyb3IoIk5vdCBhbiBTVkciKTsKICAgICAgICAgIGF3YWl0IGcud3JpdGVGaWxlKGMuZmlsZSwgdSksIGF3YWl0IEIoYy5maWxlKSwgbSsrOwogICAgICAgIH0gY2F0Y2ggKG4pIHsKICAgICAgICAgIGwrKzsKICAgICAgICAgIGNvbnN0IHUgPSBuIGluc3RhbmNlb2YgRXJyb3IgPyBuLm1lc3NhZ2UgOiBTdHJpbmcobik7CiAgICAgICAgICB0aGlzLndhcm4oYFttYXRlcmlhbC1zeW1ib2xzLXN2Z10gRmFpbGVkICR7Yy51cmx9IC0+ICR7Yy5maWxlfTogJHt1fWApOwogICAgICAgIH0KICAgICAgfSk7CiAgICAgIGNvbnN0IGggPSBgW21hdGVyaWFsLXN5bWJvbHMtc3ZnXSBEb25lLiBTYXZlZDogJHttfSwgU2tpcHBlZDogJHtmfSwgRmFpbGVkOiAke2x9YDsKICAgICAgbCA+IDAgJiYgdC5zdHJpY3QgPyB0aGlzLmVycm9yKGgpIDogdGhpcy5pbmZvKGgpOwogICAgfQogIH07Cn0KY29uc3QgRyA9IC8qIEBfX1BVUkVfXyAqLyBPYmplY3QuYXNzaWduKHt9KSwgXyA9IC8qIEBfX1BVUkVfXyAqLyBPYmplY3QuYXNzaWduKHt9KSwgRiA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGQgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCAkID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgTiA9ICJyb3VuZGVkIiwgeiA9IDAsIEUgPSAyMDA7CmZ1bmN0aW9uIGIoZSkgewogIHJldHVybiBgJHtlLnRoZW1lfTo6JHtlLmljb259Ojoke2UuZmlsbH06OiR7ZS53ZWlnaHR9Ojoke2Uuc2l6ZX1gOwp9CmZ1bmN0aW9uIEgoZSkgewogIGNvbnN0IHQgPSBlLnJlcGxhY2UoL1xcL2csICIvIikubWF0Y2goL3N5bWJvbHNcLyhyb3VuZGVkfG91dGxpbmVkfHNoYXJwKVwvKFteL10rKVwuc3ZnJC8pOwogIGlmICghdCkgcmV0dXJuIG51bGw7CiAgY29uc3QgcyA9IHRbMV0sIGkgPSB0WzJdLCBbciwgLi4uYV0gPSBpLnNwbGl0KCIuIik7CiAgbGV0IGwgPSByLCBmID0gMDsKICByLmVuZHNXaXRoKCItZmlsbCIpICYmIChsID0gci5zbGljZSgwLCAtNSksIGYgPSAxKTsKICBsZXQgbSA9IDQwMCwgaCA9IDI0OwogIGZvciAoY29uc3QgYyBvZiBhKQogICAgaWYgKGMuc3RhcnRzV2l0aCgidyIpKSB7CiAgICAgIGNvbnN0IG4gPSBOdW1iZXIoYy5zbGljZSgxKSk7CiAgICAgIE51bWJlci5pc0Zpbml0ZShuKSAmJiAobSA9IG4pOwogICAgfSBlbHNlIGlmIChjLnN0YXJ0c1dpdGgoInMiKSkgewogICAgICBjb25zdCBuID0gTnVtYmVyKGMuc2xpY2UoMSkpOwogICAgICBOdW1iZXIuaXNGaW5pdGUobikgJiYgKGggPSBuKTsKICAgIH0KICByZXR1cm4geyB0aGVtZTogcywgaWNvbjogbCwgZmlsbDogZiwgd2VpZ2h0OiBtLCBzaXplOiBoIH07Cn0KZnVuY3Rpb24geChlKSB7CiAgY29uc3QgdCA9IGUubWF0Y2goL3ZpZXdCb3g9IihbXiJdKykiL2kpLCBzID0gZS5tYXRjaCgvPHBhdGhbXj5dKlxzZD0iKFteIl0rKSJbXj5dKj4vaSk7CiAgcmV0dXJuICF0IHx8ICFzID8gbnVsbCA6IHsgdmlld0JveDogdFsxXSwgZDogc1sxXSB9Owp9CmZvciAoY29uc3QgW2UsIHRdIG9mIE9iamVjdC5lbnRyaWVzKEcpKSB7CiAgY29uc3QgcyA9IEgoZSk7CiAgaWYgKCFzKSBjb250aW51ZTsKICBjb25zdCBpID0geCh0KTsKICBpICYmIEYuc2V0KGIocyksIGkpOwp9CmZ1bmN0aW9uIFkoZSkgewogIGNvbnN0IHQgPSBiKGUpLCBzID0gZC5nZXQodCk7CiAgaWYgKHMpIHJldHVybiBzOwogIGNvbnN0IGkgPSBgJHtlLmljb259Ojoke2Uuc2l6ZX1gLCByID0gJC5nZXQoaSk7CiAgcmV0dXJuIHIgfHwgRi5nZXQodCk7Cn0KZnVuY3Rpb24gcShlLCB0KSB7CiAgY29uc3QgcyA9IHsKICAgIGljb246IGUuaWNvbiwKICAgIHNpemU6IGUuc2l6ZSwKICAgIHRoZW1lOiBlLnRoZW1lID8/IE4sCiAgICBmaWxsOiBlLmZpbGwgPz8geiwKICAgIHdlaWdodDogTnVtYmVyKGUud2VpZ2h0ID8/IEUpCiAgfTsKICBkLnNldChiKHMpLCB0KSwgJC5zZXQoYCR7cy5pY29ufTo6JHtzLnNpemV9YCwgdCk7Cn0KZnVuY3Rpb24gSihlKSB7CiAgY29uc3QgdCA9IHsKICAgIGljb246IGUuaWNvbiwKICAgIHNpemU6IGUuc2l6ZSwKICAgIHRoZW1lOiBlLnRoZW1lID8/IE4sCiAgICBmaWxsOiBlLmZpbGwgPz8geiwKICAgIHdlaWdodDogTnVtYmVyKGUud2VpZ2h0ID8/IEUpCiAgfTsKICBkLmRlbGV0ZShiKHQpKSwgJC5kZWxldGUoYCR7dC5pY29ufTo6JHt0LnNpemV9YCk7Cn0KZnVuY3Rpb24gTShlLCB0KSB7CiAgY29uc3QgcyA9IHgodCk7CiAgaWYgKCFzKSB0aHJvdyBuZXcgRXJyb3IoIltpY29ucy9yZWdpc3RyeV0gRmFpbGVkIHRvIHBhcnNlIHJhdyBTVkc6IG1pc3Npbmcgdmlld0JveCBvciBwYXRoIGQiKTsKICBxKGUsIHMpOwp9CmZ1bmN0aW9uIFEoZSkgewogIGZvciAoY29uc3QgW3QsIHNdIG9mIE9iamVjdC5lbnRyaWVzKGUpKSB7CiAgICBsZXQgaTsKICAgIGZvciAoY29uc3QgW3IsIGFdIG9mIE9iamVjdC5lbnRyaWVzKF8pKQogICAgICBpZiAoci5yZXBsYWNlKC9cXC9nLCAiLyIpLmVuZHNXaXRoKGAvJHt0fS5zdmdgKSkgewogICAgICAgIGkgPSBhOwogICAgICAgIGJyZWFrOwogICAgICB9CiAgICBpZiAoISh0eXBlb2YgaSAhPSAic3RyaW5nIiB8fCAhaS5pbmNsdWRlcygiPHN2ZyIpKSkKICAgICAgZm9yIChjb25zdCByIG9mIE9iamVjdC5rZXlzKHMpKSB7CiAgICAgICAgY29uc3QgYSA9IE51bWJlcihyKTsKICAgICAgICBOdW1iZXIuaXNGaW5pdGUoYSkgJiYgTSh7IGljb246IHQsIHNpemU6IGEgfSwgaSk7CiAgICAgIH0KICB9Cn0KZnVuY3Rpb24gWChlLCB0LCBzLCBpKSB7CiAgZm9yIChjb25zdCByIG9mIHQpCiAgICBNKHsgaWNvbjogZSwgc2l6ZTogciwgLi4uaSB9LCBzKHIpKTsKfQpmdW5jdGlvbiBaKGUsIHQpIHsKICByZXR1cm4gewogICAgU3ltYm9sczogZSwKICAgIEN1c3RvbTogdCA/PyB7fQogIH07Cn0KZXhwb3J0IHsKICBRIGFzIGF1dG9SZWdpc3RlckN1c3RvbSwKICBaIGFzIGRlZmluZUljb25zLAogIFkgYXMgZ2V0U3ltYm9sLAogIFYgYXMgbWF0ZXJpYWxTeW1ib2xzU3ZnLAogIFggYXMgcmVnaXN0ZXJNdWx0aXBsZVNpemVzLAogIE0gYXMgcmVnaXN0ZXJSYXdTeW1ib2wsCiAgcSBhcyByZWdpc3RlclN5bWJvbCwKICBKIGFzIHVucmVnaXN0ZXJTeW1ib2wKfTsKLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwCg==", import.meta.url);
    let c = decodeURIComponent(n.pathname);
    return process.platform === "win32" && c.startsWith("/") && (c = c.slice(1)), c;
  })(), i = u.resolve(I, ".temp"), e = u.resolve(i, "symbols"), C = {
    outDir: g.outDir ?? e,
    concurrency: g.concurrency ?? 8,
    strict: g.strict ?? !1,
    enabled: g.enabled ?? !0,
    cleanRemoved: g.cleanRemoved ?? !1
  };
  if (!g || !g.icons)
    throw new Error("[material-symbols-svg] options.icons is required");
  let t = "";
  return {
    name: "material-symbols-svg",
    configResolved(n) {
      t = n.root || process.cwd();
    },
    async buildStart() {
      if (!C.enabled) return;
      const n = u.isAbsolute(C.outDir) ? C.outDir : u.resolve(t, C.outDir), c = g.icons, r = [];
      for (const [l, o] of Object.entries(c)) {
        const a = (o.sizes && o.sizes.length ? Array.from(o.sizes) : []).map((s) => Number(s)).filter((s) => Number.isFinite(s)), V = (o.weights && o.weights.length ? Array.from(o.weights) : []).map((s) => Number(s)).filter((s) => Number.isFinite(s)), L = (o.fills && o.fills.length ? Array.from(o.fills) : []).map((s) => Number(s)).filter((s) => s === 0 || s === 1), N = o.themes && o.themes.length ? Array.from(o.themes) : [];
        for (const s of d(N)) {
          await k(u.resolve(n, s));
          for (const G of d(V))
            for (const S of d(L))
              for (const h of d(a)) {
                const J = Q(G, S), v = F(s, l, J, h), z = u.resolve(n, s, U(l, S, G, h));
                r.push({ url: v, file: z });
              }
        }
      }
      let b = 0, m = 0, A = 0;
      await T(r, C.concurrency, async (l) => {
        try {
          if (await R(l.file)) {
            m++;
            return;
          }
          const o = await fetch(l.url);
          if (!o.ok) throw new Error(`HTTP ${o.status}`);
          const a = await o.text();
          if (!a.startsWith("<svg")) throw new Error("Not an SVG");
          await B.writeFile(l.file, a), await D(l.file), A++;
        } catch (o) {
          b++;
          const a = o instanceof Error ? o.message : String(o);
          this.warn(`[material-symbols-svg] Failed ${l.url} -> ${l.file}: ${a}`);
        }
      });
      const y = `[material-symbols-svg] Done. Saved: ${A}, Skipped: ${m}, Failed: ${b}`;
      b > 0 && C.strict ? this.error(y) : this.info(y);
    }
  };
}
const O = /* @__PURE__ */ Object.assign({}), P = /* @__PURE__ */ Object.assign({}), w = /* @__PURE__ */ new Map(), Z = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), f = "rounded", Y = 0, X = 200;
function K(g) {
  return `${g.theme}::${g.icon}::${g.fill}::${g.weight}::${g.size}`;
}
function j(g) {
  const I = g.replace(/\\/g, "/").match(/symbols\/(rounded|outlined|sharp)\/([^/]+)\.svg$/);
  if (!I) return null;
  const i = I[1], e = I[2], [C, ...t] = e.split(".");
  let n = C, c = 0;
  C.endsWith("-fill") && (n = C.slice(0, -5), c = 1);
  let r = 400, b = 24;
  for (const m of t)
    if (m.startsWith("w")) {
      const A = Number(m.slice(1));
      Number.isFinite(A) && (r = A);
    } else if (m.startsWith("s")) {
      const A = Number(m.slice(1));
      Number.isFinite(A) && (b = A);
    }
  return { theme: i, icon: n, fill: c, weight: r, size: b };
}
function H(g) {
  const I = g.match(/viewBox="([^"]+)"/i), i = g.match(/<path[^>]*\sd="([^"]+)"[^>]*>/i);
  return !I || !i ? null : { viewBox: I[1], d: i[1] };
}
for (const [g, I] of Object.entries(O)) {
  const i = j(g);
  if (!i) continue;
  const e = H(I);
  e && w.set(K(i), e);
}
function $(g) {
  const I = K(g), i = Z.get(I);
  if (i) return i;
  const e = `${g.icon}::${g.size}`, C = p.get(e);
  return C || w.get(I);
}
function M(g, I) {
  const i = {
    icon: g.icon,
    size: g.size,
    theme: g.theme ?? f,
    fill: g.fill ?? Y,
    weight: Number(g.weight ?? X)
  };
  Z.set(K(i), I), p.set(`${i.icon}::${i.size}`, I);
}
function q(g) {
  const I = {
    icon: g.icon,
    size: g.size,
    theme: g.theme ?? f,
    fill: g.fill ?? Y,
    weight: Number(g.weight ?? X)
  };
  Z.delete(K(I)), p.delete(`${I.icon}::${I.size}`);
}
function W(g, I) {
  const i = H(I);
  if (!i) throw new Error("[icons/registry] Failed to parse raw SVG: missing viewBox or path d");
  M(g, i);
}
function _(g) {
  for (const [I, i] of Object.entries(g)) {
    let e;
    for (const [C, t] of Object.entries(P))
      if (C.replace(/\\/g, "/").endsWith(`/${I}.svg`)) {
        e = t;
        break;
      }
    if (!(typeof e != "string" || !e.includes("<svg")))
      for (const C of Object.keys(i)) {
        const t = Number(C);
        Number.isFinite(t) && W({ icon: I, size: t }, e);
      }
  }
}
function gg(g, I, i, e) {
  for (const C of I)
    W({ icon: g, size: C, ...e }, i(C));
}
function Ig(g, I) {
  return {
    Symbols: g,
    Custom: I ?? {}
  };
}
export {
  _ as autoRegisterCustom,
  Ig as defineIcons,
  $ as getSymbol,
  x as materialSymbolsSvg,
  gg as registerMultipleSizes,
  W as registerRawSymbol,
  M as registerSymbol,
  q as unregisterSymbol
};
//# sourceMappingURL=index.js.map
