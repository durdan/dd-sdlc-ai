// Runs a visitor's code in a throwaway sandboxed iframe (scripts allowed, no same-origin,
// so it can't touch this page, its storage or cookies) and streams console lines back
// with postMessage. Loops get a time check so `while (true) {}` stops instead of hanging.

export type OutLine = { kind: "log" | "info" | "warn" | "error" | "system"; text: string }
export type RunEnd = "done" | "timeout"

export const RUN_LIMIT_MS = 3000

/**
 * Adds a time check at the start of every braced loop body. A small scanner rather than a
 * parser: it skips strings and comments, which covers ordinary code. Unbraced loop bodies aren't guarded.
 */
export function guardLoops(src: string): string {
  let out = ""
  let i = 0
  const n = src.length
  const skipString = (from: number, q: string) => {
    let j = from + 1
    while (j < n && src[j] !== q) {
      if (src[j] === "\\") j++
      else if (q !== "`" && src[j] === "\n") break
      j++
    }
    return j + 1
  }
  const skipSpace = (j: number) => {
    while (j < n && /\s/.test(src[j])) j++
    return j
  }
  while (i < n) {
    const c = src[i]
    if (c === '"' || c === "'" || c === "`") {
      const j = skipString(i, c)
      out += src.slice(i, j)
      i = j
      continue
    }
    if (c === "/" && src[i + 1] === "/") {
      const j = src.indexOf("\n", i)
      const end = j < 0 ? n : j
      out += src.slice(i, end)
      i = end
      continue
    }
    if (c === "/" && src[i + 1] === "*") {
      const j = src.indexOf("*/", i + 2)
      const end = j < 0 ? n : j + 2
      out += src.slice(i, end)
      i = end
      continue
    }
    const word = /^(for|while|do)\b/.exec(src.slice(i, i + 6))
    const prev = i > 0 ? src[i - 1] : ""
    if (word && !/[\w$.]/.test(prev)) {
      let j = i + word[1].length
      if (word[1] !== "do") {
        j = skipSpace(j)
        if (src[j] !== "(") {
          out += src.slice(i, j)
          i = j
          continue
        }
        // Find the matching parenthesis, skipping strings inside it.
        let depth = 0
        while (j < n) {
          const d = src[j]
          if (d === '"' || d === "'" || d === "`") {
            j = skipString(j, d)
            continue
          }
          if (d === "(") depth++
          else if (d === ")" && --depth === 0) {
            j++
            break
          }
          j++
        }
      }
      const k = skipSpace(j)
      if (src[k] === "{") {
        out += src.slice(i, k + 1) + "__jsGuard();"
        i = k + 1
      } else {
        out += src.slice(i, j)
        i = j
      }
      continue
    }
    out += c
    i++
  }
  return out
}

/** The iframe document: console capture, timer bookkeeping, then the visitor's script, then a "finished?" check. */
export function buildDocument(code: string, runId: string): string {
  const user = guardLoops(code).replace(/<\/(script)/gi, "<\\/$1")
  const id = JSON.stringify(runId)
  return `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
(function () {
  var RUN = ${id};
  var post = function (kind, text) { parent.postMessage({ jsRun: RUN, kind: kind, text: text }, "*"); };
  function fmt(v, depth) {
    depth = depth || 0;
    if (typeof v === "string") return depth ? JSON.stringify(v) : v;
    if (v === undefined) return "undefined";
    if (v === null) return "null";
    if (typeof v === "function") return "[Function: " + (v.name || "anonymous") + "]";
    if (typeof v === "symbol" || typeof v === "bigint") return v.toString() + (typeof v === "bigint" ? "n" : "");
    if (v instanceof Error) return v.name + ": " + v.message;
    if (typeof Promise === "function" && v instanceof Promise) return "Promise { … }";
    if (typeof v !== "object") return String(v);
    if (depth > 2) return Array.isArray(v) ? "[Array]" : "[Object]";
    try {
      if (Array.isArray(v)) return "[ " + v.map(function (x) { return fmt(x, depth + 1); }).join(", ") + " ]";
      var keys = Object.keys(v);
      var name = v.constructor && v.constructor !== Object ? v.constructor.name + " " : "";
      return name + "{ " + keys.map(function (k) { return k + ": " + fmt(v[k], depth + 1); }).join(", ") + " }";
    } catch (e) { return String(v); }
  }
  var line = function (args) { return Array.prototype.map.call(args, function (a) { return fmt(a); }).join(" "); };
  console.log = function () { post("log", line(arguments)); };
  console.info = function () { post("info", line(arguments)); };
  console.debug = console.log;
  console.warn = function () { post("warn", line(arguments)); };
  console.error = function () { post("error", line(arguments)); };
  window.addEventListener("error", function (e) {
    var err = e.error;
    post("error", "Uncaught " + (err && err.name ? err.name + ": " + err.message : e.message));
  });
  window.addEventListener("unhandledrejection", function (e) {
    post("error", "Uncaught (in promise) " + fmt(e.reason));
  });
  // Count pending timers so the page can tell when the code has finished.
  var st = window.setTimeout, ct = window.clearTimeout, si = window.setInterval, ci = window.clearInterval;
  var pending = new Set();
  window.setTimeout = function (fn, ms) {
    var rest = Array.prototype.slice.call(arguments, 2);
    var h = st(function () { pending.delete(h); if (typeof fn === "function") fn.apply(null, rest); }, ms);
    pending.add(h);
    return h;
  };
  window.clearTimeout = function (h) { pending.delete(h); ct(h); };
  window.setInterval = function (fn, ms) {
    var rest = Array.prototype.slice.call(arguments, 2);
    var h = si(function () { if (typeof fn === "function") fn.apply(null, rest); }, ms);
    pending.add(h);
    return h;
  };
  window.clearInterval = function (h) { pending.delete(h); ci(h); };
  var started = Date.now();
  window.__jsGuard = function () {
    if (Date.now() - started > ${RUN_LIMIT_MS - 500}) throw new RangeError("Stopped a loop that ran for more than ${(RUN_LIMIT_MS - 500) / 1000} seconds");
  };
  window.__jsFinish = function () {
    var check = function () { if (pending.size === 0) post("end", "done"); else st(check, 25); };
    st(check, 0);
  };
})();
</script><script>
${user}
</script><script>window.__jsFinish();</script></body></html>`
}
