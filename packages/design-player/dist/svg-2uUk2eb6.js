//#region src/engine.ts
var e = 600;
function t(e) {
	let t = e.split(/\s+/).filter(Boolean).length;
	return Math.max(2600, t * 380);
}
function n(e, t) {
	return `${e.id}-${t}`;
}
function r(e, r, i) {
	return e.map((e) => (i[n(e, r)]?.ms ?? t(e[r])) + 600);
}
function i(e) {
	let t = [], n = 0;
	for (let r of e) t.push(n), n += r;
	return t;
}
function a(e, t) {
	let n = 0;
	for (let r = 0; r < t.length; r += 1) {
		if (e < n + t[r]) return {
			index: r,
			offset: e - n
		};
		n += t[r];
	}
	let r = t.length - 1;
	return {
		index: r,
		offset: t[r]
	};
}
function o(e, t) {
	return e.chapters.map((n) => {
		let r = e.shots.findIndex((e) => e.chapter === n.id);
		return r === -1 ? null : {
			id: n.id,
			title: n.title,
			start: t[r]
		};
	}).filter((e) => e !== null);
}
function s(e) {
	let t = e.match(/[^.!?]+[.!?]*/g)?.map((e) => e.trim()).filter(Boolean) ?? [e], n = [];
	for (let e of t) {
		let t = e.split(/\s+/);
		for (let e = 0; e < t.length; e += 14) n.push(t.slice(e, e + 14).join(" "));
	}
	return n;
}
function c(e, t) {
	let n = e.reduce((e, t) => e + t.split(/\s+/).length, 0), r = 0;
	for (let i of e) if (r += i.split(/\s+/).length, t * n < r) return i;
	return e[e.length - 1] ?? "";
}
function l(e) {
	let t = Math.max(0, Math.floor(e / 1e3));
	return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function u(e, t) {
	let n = t * e.reduce((e, t) => e + t.split(/\s+/).length, 0), r = 0;
	for (let t of e) {
		let e = t.split(/\s+/);
		if (n < r + e.length) return {
			words: e,
			said: Math.max(0, Math.floor(n - r) + 1)
		};
		r += e.length;
	}
	let i = (e[e.length - 1] ?? "").split(/\s+/);
	return {
		words: i,
		said: i.length
	};
}
//#endregion
//#region src/navigation.ts
var d = "", f = "", p = null;
function m(e) {
	e.base !== void 0 && (d = e.base.replace(/\/$/, "")), e.assets !== void 0 && (f = e.assets.replace(/\/$/, "")), e.audio !== void 0 && (p = e.audio.replace(/\/$/, ""));
}
var h = (e) => /^https?:/.test(e) ? e : p !== null && e.startsWith("/audio/") ? `${p}${e.slice(6)}` : `${f}${e}`, g = (e) => e && e !== "patterns" ? `${d}/library/${e}` : `${d}/`, _ = {
	pattern: "p",
	company: "c"
};
function v(e, t) {
	return `${d}/${_[e.meta?.kind ?? "pattern"] ?? "p"}/${e.id}${t ? `#ch=${t}` : ""}`;
}
function y(e = location) {
	let t = new URLSearchParams(e.search).get("w"), n = d && e.pathname.startsWith(d) ? e.pathname.slice(d.length) || "/" : e.pathname, r = /^\/(?:p|c)\/([\w-]+)\/?$/.exec(n), i = /(?:^|&)ch=([\w-]+)/.exec(e.hash.slice(1))?.[1];
	return r ? {
		page: "topic",
		id: r[1],
		chapter: i
	} : t ? {
		page: "topic",
		id: t,
		chapter: i
	} : {
		page: "library",
		tab: /^\/library\/([\w-]+)/.exec(n)?.[1]
	};
}
var b = "design-player.progress";
function x() {
	try {
		return JSON.parse(localStorage.getItem(b) ?? "{}");
	} catch {
		return {};
	}
}
function S(e, t, n) {
	let r = x();
	r[e] = {
		t: Math.round(t),
		total: Math.round(n),
		at: Date.now()
	}, localStorage.setItem(b, JSON.stringify(r));
}
var C = (e) => e && e.total ? Math.min(1, e.t / e.total) : 0, w = (e) => C(e) > .95;
function T(e, t, n) {
	let r = new Map(e.topics.map((e) => [e.id, e])), i = r.get(t), a = [], o = e.paths.filter((e) => e.steps.includes(t)).map((e) => ({
		p: e,
		after: e.steps.slice(e.steps.indexOf(t) + 1).map((e) => r.get(e)).filter((e) => !!e)
	})).filter((e) => e.after.length);
	for (let { p: e, after: t } of o) a.push({
		title: `Up next in ${e.title}`,
		items: t.slice(0, 2).map((e) => ({ topic: e }))
	});
	let s = [.../* @__PURE__ */ new Set([
		...i?.meta?.uses ?? [],
		...i?.usedBy ?? [],
		...i?.meta?.related ?? []
	])].filter((e) => e !== t).map((e) => r.get(e)).filter((e) => !!e);
	if (s.length) {
		let e = i?.meta?.kind;
		a.push({
			title: e === "company" ? "Patterns in this design" : "Related",
			items: s.slice(0, 4).map((e) => ({
				topic: e,
				note: i?.usedBy.includes(e.id) ? "uses this pattern" : void 0
			}))
		});
	}
	let c = Object.entries(n).filter(([e, n]) => e !== t && r.has(e) && C(n) > .02 && !w(n)).sort((e, t) => t[1].at - e[1].at).slice(0, 3).map(([e]) => ({ topic: r.get(e) }));
	c.length && a.unshift({
		title: "Continue watching",
		items: c
	});
	let l = /* @__PURE__ */ new Set();
	for (let e of a) e.items = e.items.filter(({ topic: e }) => !l.has(e.id) && (l.add(e.id), !0));
	let u = a.filter((e) => e.items.length);
	a.length = 0, a.push(...u);
	let d = e.topics.filter((e) => e.meta?.kind === i?.meta?.kind && e.id !== t && !w(n[e.id]));
	return {
		groups: a,
		next: o[0]?.after[0] ?? s.find((e) => !w(n[e.id])) ?? d[0] ?? e.topics.find((e) => e.id !== t)
	};
}
function E(e, t) {
	let n = new Map(e.topics.map((e) => [e.id, e])), r = n.get(t);
	return [.../* @__PURE__ */ new Set([
		...r?.meta?.uses ?? [],
		...r?.meta?.related ?? [],
		...r?.usedBy ?? []
	])].map((e) => n.get(e)).filter((e) => !!e && e.id !== t);
}
var D = /* @__PURE__ */ new Set([
	"patterns",
	"related",
	"wild"
]);
function O(e, t = 30) {
	return !!e.meta?.created && Date.now() - Date.parse(e.meta.created) < t * 864e5;
}
function k(e, t = 30) {
	return !!e.meta?.updated && e.meta.updated !== e.meta.created && Date.now() - Date.parse(e.meta.updated) < t * 864e5;
}
//#endregion
//#region src/diagram/svg.ts
var A = {
	core: {
		fill: "#e6efec",
		stroke: "#3d6b63"
	},
	stream: {
		fill: "#f4eddd",
		stroke: "#8a6a2c"
	},
	data: {
		fill: "#eef1f6",
		stroke: "#56657c"
	},
	external: {
		fill: "#ffffff",
		stroke: "#b9c2bf"
	},
	neutral: {
		fill: "#fbfbf9",
		stroke: "#c9d0cd"
	}
}, j = {
	solid: {
		stroke: "#3d6b63",
		dash: ""
	},
	dashed: {
		stroke: "#8a6a2c",
		dash: "5 4"
	},
	dotted: {
		stroke: "#6b7875",
		dash: "2 3"
	}
}, M = "#1d2826", N = "#4f5d5a", P = (e) => e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function F(e, t = 5) {
	if (e.length < 2) return "";
	let n = `M ${e[0].x} ${e[0].y}`;
	for (let r = 1; r < e.length - 1; r += 1) {
		let i = e[r - 1], a = e[r], o = e[r + 1], s = Math.min(t, Math.hypot(a.x - i.x, a.y - i.y) / 2), c = Math.min(t, Math.hypot(o.x - a.x, o.y - a.y) / 2), l = {
			x: a.x - Math.sign(a.x - i.x) * s,
			y: a.y - Math.sign(a.y - i.y) * s
		}, u = {
			x: a.x + Math.sign(o.x - a.x) * c,
			y: a.y + Math.sign(o.y - a.y) * c
		};
		n += ` L ${l.x} ${l.y} Q ${a.x} ${a.y} ${u.x} ${u.y}`;
	}
	let r = e[e.length - 1];
	return `${n} L ${r.x} ${r.y}`;
}
function I(e) {
	return e.tone ? e.tone : e.kind === "external" ? "external" : e.kind === "store" ? "data" : e.kind === "person" ? "neutral" : "core";
}
function L(e, t, n = {}) {
	let r = n.pad ?? 16, i = t.width + r * 2, a = t.height + r * 2, o = Object.keys(j).map((e) => `<marker id="arr-${e}" viewBox="0 0 8 8" refX="7.2" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0.6 L7.4 4 L0 7.4 z" fill="${j[e].stroke}"/></marker>`).join(""), s = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${i} ${a}" class="dg" data-diagram="${P(e.id)}" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" role="img" aria-label="${P(e.title)}">`, `<defs>${o}</defs><g transform="translate(${r} ${r})">`];
	if (e.kind === "c4") for (let n of e.groups ?? []) {
		let e = t.groups[n.id];
		e && s.push(`<g class="dg-group" data-group="${P(n.id)}"><rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="12" fill="none" stroke="#c5ccc9" stroke-dasharray="6 5"/><text x="${e.x + 14}" y="${e.y + 22}" class="dg-group-label" fill="${N}" font-size="13" font-weight="600">${P(n.label)}</text></g>`);
	}
	else for (let n of e.participants) {
		let e = t.nodes[n.id];
		s.push(`<line class="dg-lifeline" data-life="${P(n.id)}" x1="${e.x + e.w / 2}" y1="${e.y + e.h}" x2="${e.x + e.w / 2}" y2="${t.height}" stroke="#d3d9d6" stroke-dasharray="3 4"/>`);
	}
	let c = e.kind === "c4" ? e.edges : e.messages;
	for (let n of c) {
		let r = t.edges[n.id];
		if (!r) continue;
		let i = n.style ?? "solid", { stroke: a, dash: o } = j[i];
		if (s.push(`<g class="dg-edge" data-edge="${P(n.id)}" data-from="${P(n.from)}" data-to="${P(n.to)}"><path d="${F(r.points)}" fill="none" stroke="${a}" stroke-width="1.6"${o ? ` stroke-dasharray="${o}"` : ""} marker-end="url(#arr-${i})"/>`), n.label) {
			let t = r.label ? {
				x: r.label.x + r.label.w / 2,
				y: r.label.y + r.label.h / 2 + 4
			} : e.kind === "sequence" ? {
				x: (r.points[0].x + r.points[r.points.length - 1].x) / 2,
				y: r.points[0].y - 8
			} : {
				x: (r.points[0].x + r.points[r.points.length - 1].x) / 2,
				y: (r.points[0].y + r.points[r.points.length - 1].y) / 2
			};
			s.push(`<text class="dg-edge-label" x="${t.x}" y="${t.y}" text-anchor="middle" font-size="12" fill="${a}" paint-order="stroke" stroke="#f4f5f2" stroke-width="5">${P(n.label)}</text>`);
		}
		s.push("</g>");
	}
	let l = e.kind === "c4" ? e.elements : e.participants.map((e) => ({
		id: e.id,
		kind: "container",
		label: e.label,
		tone: "neutral"
	}));
	for (let e of l) {
		let n = t.nodes[e.id];
		if (!n) continue;
		let r = A[I(e)], i = e.kind === "system";
		s.push(`<g class="dg-node" data-node="${P(e.id)}"><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${e.kind === "person" ? 22 : 6}" fill="${r.fill}" stroke="${i ? M : r.stroke}" stroke-width="${i ? 2 : 1.4}"/><text x="${n.x + n.w / 2}" y="${n.y + (e.sub ? n.h / 2 - 3 : n.h / 2 + 5)}" text-anchor="middle" font-size="14.5" font-weight="600" fill="${M}">${P(e.label)}</text>` + (e.sub ? `<text x="${n.x + n.w / 2}" y="${n.y + n.h / 2 + 15}" text-anchor="middle" font-size="12" fill="${N}">${P(e.sub)}</text>` : "") + "</g>");
	}
	return s.push("</g></svg>"), s.join("");
}
//#endregion
export { l as C, u as D, r as E, i as O, n as S, t as T, v as _, D as a, o as b, w as c, k as d, g as f, S as g, y as h, L as i, s as k, C as l, x as m, A as n, h as o, E as p, F as r, m as s, j as t, O as u, T as v, a as w, c as x, e as y };
