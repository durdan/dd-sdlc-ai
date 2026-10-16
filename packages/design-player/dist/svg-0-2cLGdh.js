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
	client: {
		fill: "#eef2f6",
		stroke: "#5c6b80",
		label: "Client",
		icon: "M1.5 2.5h9v6h-9z M4 10.5h4"
	},
	service: {
		fill: "#e6efec",
		stroke: "#3d6b63",
		label: "Service",
		icon: "M4 3 1.5 6 4 9 M8 3l2.5 3L8 9"
	},
	data: {
		fill: "#efedf8",
		stroke: "#6b5ca5",
		label: "Data store",
		icon: "M2 3c0-1.3 8-1.3 8 0v6c0 1.3-8 1.3-8 0z M2 3c0 1.3 8 1.3 8 0"
	},
	cache: {
		fill: "#f6ecf5",
		stroke: "#8e4f8b",
		label: "Cache",
		icon: "M7 1 3 7h3l-1 4 4-6H6z"
	},
	queue: {
		fill: "#fbefe4",
		stroke: "#b4652c",
		label: "Queue / stream",
		icon: "M2 3.5h8 M2 6h8 M2 8.5h8"
	},
	security: {
		fill: "#f9eaed",
		stroke: "#b5475c",
		label: "Security",
		icon: "M6 1.2l4 1.6v3.1c0 2.5-1.8 4.2-4 4.9-2.2-.7-4-2.4-4-4.9V2.8z"
	},
	edge: {
		fill: "#f6efdc",
		stroke: "#8a6a2c",
		label: "Network edge",
		icon: "M3.5 9.5h5.2a2.3 2.3 0 0 0 .2-4.6A3 3 0 0 0 3.2 5.6a2 2 0 0 0 .3 3.9z"
	},
	external: {
		fill: "#ffffff",
		stroke: "#9aa5a2",
		label: "External",
		icon: "M5 2.5H2.5v7h7V7 M7 2h3v3 M10 2 5.5 6.5"
	},
	error: {
		fill: "#fbe9e6",
		stroke: "#a8382c",
		label: "Error / failure",
		icon: "M6 1.5 10.8 10H1.2z M6 4.8v2.4 M6 8.6v.1"
	}
}, j = "M6 6a2.2 2.2 0 1 0 0-4.4A2.2 2.2 0 0 0 6 6z M2 11c.6-2.3 2.2-3.4 4-3.4s3.4 1.1 4 3.4", M = {
	active: {
		fill: "#e5f1f4",
		stroke: "#2f7f93",
		label: "Active",
		icon: "M4 2.5v7l5.5-3.5z"
	},
	waiting: {
		fill: "#f6efdc",
		stroke: "#8a6a2c",
		label: "Waiting",
		icon: "M3 1.5h6 M3 10.5h6 M3.5 1.5c0 3 5 3 5 4.5s-5 1.5-5 4.5 M8.5 1.5c0 3-5 3-5 4.5s5 1.5 5 4.5"
	},
	success: {
		fill: "#e6f2ea",
		stroke: "#3a7d52",
		label: "Success",
		icon: "M2 6.5l2.6 2.6L10 3.5"
	},
	failure: {
		fill: "#f9eaed",
		stroke: "#b5475c",
		label: "Failure / exit",
		icon: "M3 3l6 6M9 3l-6 6"
	},
	decision: {
		fill: "#efedf8",
		stroke: "#6b5ca5",
		label: "Decision",
		icon: "M6 1.5 10.5 6 6 10.5 1.5 6z"
	}
}, N = {
	added: {
		stroke: "#2f8f5b",
		dash: "",
		label: "Added",
		mark: "+"
	},
	removed: {
		stroke: "#c0455b",
		dash: "5 4",
		label: "Removed",
		mark: "−"
	},
	changed: {
		stroke: "#b07a1e",
		dash: "2 3",
		label: "Changed",
		mark: "~"
	}
}, P = [
	".dg[data-view=\"before\"] [data-change=\"added\"], .dg[data-view=\"after\"] [data-change=\"removed\"] { display: none }",
	".dg[data-view=\"before\"] .dg-badge, .dg[data-view=\"after\"] .dg-badge { display: none }",
	".dg[data-view=\"before\"] [data-change] .dg-box, .dg[data-view=\"after\"] [data-change] .dg-box { stroke: var(--bs); stroke-dasharray: none; stroke-width: 1.5 }",
	".dg[data-view=\"before\"] .dg-edge[data-change] path, .dg[data-view=\"after\"] .dg-edge[data-change] path { stroke: var(--bs); stroke-dasharray: var(--bd) }"
].join("\n"), F = {
	core: "service",
	stream: "queue",
	data: "data",
	external: "external"
}, I = {
	core: A.service,
	stream: A.queue,
	data: A.data,
	external: A.external,
	neutral: {
		fill: "#fbfbf9",
		stroke: "#c9d0cd"
	}
}, L = [
	["error", /\b(errors?|exceptions?|crash(es|ed)?|fail(s|ed|ure)?|oomkilled|panics?|timeouts?|rejected|hang|deadlock|throttled)\b/],
	["security", /\b(auth\w*|oauth|n?acls?|network acl|mtls|certificates?|iam|jwt|tokens?|polic(y|ies)|rbac|firewall|waf|guard|secrets?|security groups?|scps?|rcps?|permissions?|role ?bindings?|csrf|cors|kms|sts|admission|sandbox|seccomp|capabilities)\b/],
	["queue", /\b(queues?|kafka|sqs|sns|topics?|streams?|eventbridge|event bus|bus|pub\/?sub|broker|rabbitmq|nats|outbox|dlq|webhooks?|partitions? log)\b/],
	["cache", /\b(cache[sd]?|caching|redis|memcached|valkey|lru)\b/],
	["edge", /\b(cdn|load balancer|alb|nlb|elb|gateway|proxy|ingress|dns|route 53|nat|cloudfront|nginx|envoy|internet|vpc endpoint)\b/],
	["data", /\b(db|database|postgres(ql)?|mysql|sqlite|sql|dynamodb|mongo(db)?|tables?|indexe?s?|etcd|s3|buckets?|storage|volumes?|disks?|ebs|efs|warehouse|replicas?|wal|snapshots?|pvcs?|files?|blobs?|registry)\b/],
	["client", /\b(browsers?|users?|clients?|mobile|ios|android|web app|ui|frontend|callers?|visitors?|customers?|tabs?|screens?|phones?)\b/]
];
function R(e) {
	if (e.role) return e.role;
	if (e.kind === "person") return "client";
	if (e.kind === "external") return "external";
	let t = `${e.label} ${e.sub ?? ""}`.toLowerCase(), n = L.find(([, e]) => e.test(t))?.[0];
	return e.kind === "store" ? n === "cache" || n === "queue" ? n : "data" : n || e.tone && F[e.tone] || "service";
}
var z = {
	main: {
		stroke: "#3d6b63",
		dash: "",
		label: "Request / call"
	},
	reply: {
		stroke: "#7b8784",
		dash: "5 4",
		label: "Reply / return"
	},
	async: {
		stroke: "#4a72b0",
		dash: "2 3",
		label: "Async / background"
	},
	security: {
		stroke: "#b5475c",
		dash: "5 4",
		label: "Security check"
	},
	data: {
		stroke: "#6b5ca5",
		dash: "",
		label: "Data read / write"
	},
	blocked: {
		stroke: "#a8382c",
		dash: "1.5 3.5",
		label: "Blocked / rejected"
	}
}, B = {
	solid: "main",
	dashed: "reply",
	dotted: "async"
}, V = {
	solid: z.main,
	dashed: z.reply,
	dotted: z.async
}, H = (e) => e.flow ?? B[e.style ?? "solid"];
function U(e) {
	let t = (e.kind === "c4" ? e.elements : e.participants).filter((e) => !("kind" in e) || e.kind !== "start"), n = e.kind === "c4" && e.variant === "state", r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
	if (e.kind === "c4" && n) for (let t of e.elements) {
		if (t.kind === "start") continue;
		let e = t.status ?? "active";
		i.set(e, (i.get(e) ?? 0) + 1);
	}
	else for (let e of t) {
		let t = R(e);
		r.set(t, (r.get(t) ?? 0) + 1);
	}
	let a = /* @__PURE__ */ new Map();
	if (e.kind === "c4") for (let t of [...e.elements, ...e.edges]) t.change && a.set(t.change, (a.get(t.change) ?? 0) + 1);
	let o = /* @__PURE__ */ new Map();
	for (let t of e.kind === "c4" ? e.edges : e.messages) {
		let e = H(t);
		o.set(e, (o.get(e) ?? 0) + 1);
	}
	return {
		roles: [...[...r].map(([e, t]) => ({
			role: e,
			n: t,
			...A[e]
		})), ...[...i].map(([e, t]) => ({
			role: `status-${e}`,
			n: t,
			...M[e]
		}))],
		flows: [...o].map(([e, t]) => ({
			flow: e,
			n: t,
			...z[e]
		})),
		changes: [...a].map(([e, t]) => ({
			change: e,
			n: t,
			...N[e]
		})),
		final: n && e.elements.some((e) => e.final)
	};
}
var W = "#1d2826", G = "#4f5d5a", K = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", q = (e) => e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function J(e, t = 5) {
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
var Y = (e, t, n, r) => `<path class="dg-icon" d="${e}" transform="translate(${t} ${n}) scale(0.92)" fill="none" stroke="${r}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>`;
function X(e, t, n = {}) {
	let r = n.pad ?? 16, i = t.width + r * 2, a = t.height + r * 2, o = (e, t) => `<marker id="arr-${e}" viewBox="0 0 8 8" refX="7.2" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0.6 L7.4 4 L0 7.4 z" fill="${t}"/></marker>`, s = e.kind === "c4" && e.variant === "delta", c = e.kind === "c4" && e.variant === "state", l = Object.keys(z).map((e) => o(e, z[e].stroke)).join("") + (s ? Object.keys(N).map((e) => o(e, N[e].stroke)).join("") + `<style>${P}</style>` : ""), u = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${i} ${a}" class="dg" data-diagram="${q(e.id)}"${s ? " data-view=\"delta\"" : ""} font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" role="img" aria-label="${q(e.title)}">`, `<defs>${l}</defs><g transform="translate(${r} ${r})">`];
	if (e.kind === "c4") for (let n of e.groups ?? []) {
		let e = t.groups[n.id];
		if (!e) continue;
		let r = n.tone ? F[n.tone] : void 0, i = r ? A[r].stroke : "#8f9b98", a = n.label.toUpperCase(), o = a.length * 6.9 + 16;
		u.push(`<g class="dg-group" data-group="${q(n.id)}"><rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="12" fill="${r ? A[r].fill : "#ffffff"}" fill-opacity="0.45" stroke="${i}" stroke-opacity="0.75" stroke-dasharray="6 5"/><rect x="${e.x + 12}" y="${e.y - 9}" width="${o}" height="18" rx="9" fill="#ffffff" stroke="${i}" stroke-opacity="0.75"/><text x="${e.x + 12 + o / 2}" y="${e.y + 4}" text-anchor="middle" class="dg-group-label" fill="${i}" font-family="${K}" font-size="10.5" font-weight="700" letter-spacing="0.6">${q(a)}</text></g>`);
	}
	else {
		let n = (e) => t.edges[e]?.points[0].y;
		for (let r of e.phases ?? []) {
			let e = n(r.from), i = n(r.to);
			if (e === void 0 || i === void 0) continue;
			let a = e - 30;
			u.push(`<g class="dg-phase"><rect x="2" y="${a}" width="${t.width - 4}" height="${i - a + 18}" rx="10" fill="#eef1ef" fill-opacity="0.55" stroke="#c9d1ce" stroke-dasharray="5 4"/><text x="12" y="${a + 14}" font-family="${K}" font-size="10.5" font-weight="700" letter-spacing="0.6" fill="#6b7875">${q(r.label.toUpperCase())}</text></g>`);
		}
		for (let n of e.participants) {
			let e = t.nodes[n.id];
			u.push(`<line class="dg-lifeline" data-life="${q(n.id)}" x1="${e.x + e.w / 2}" y1="${e.y + e.h}" x2="${e.x + e.w / 2}" y2="${t.height}" stroke="#d3d9d6" stroke-dasharray="3 4"/>`);
		}
		let r = e.messages.filter((e) => t.edges[e.id]);
		for (let i of e.participants) {
			let e = t.nodes[i.id], a = e.x + e.w / 2, o = [], s = [], c = (e) => e.from === i.id || e.to === i.id;
			r.forEach((e, t) => {
				if (e.to === i.id && e.from !== i.id && H(e) !== "reply") o.push(t);
				else if (e.from === i.id && e.to !== i.id && H(e) === "reply" && o.length) {
					let t = o.pop();
					s.push([n(r[t].id), n(e.id)]);
				}
			});
			for (let e of o) {
				let t = r.slice(e + 1).find(c), i = n(r[e].id);
				s.push([i, t ? n(t.id) : i + 18]);
			}
			s.sort((e, t) => e[0] - t[0]);
			let l = [];
			for (let e of s) {
				let t = l[l.length - 1];
				t && e[0] <= t[1] + 2 ? t[1] = Math.max(t[1], e[1]) : l.push([e[0], e[1]]);
			}
			let d = A[R(i)];
			for (let [e, t] of l) u.push(`<rect class="dg-lifeline dg-activation" data-life="${q(i.id)}" x="${a - 5}" y="${e - 4}" width="10" height="${t - e + 8}" rx="3" fill="${d.fill}" stroke="${d.stroke}" stroke-width="1.2"/>`);
		}
	}
	let d = e.kind === "c4" ? e.edges : e.messages;
	for (let n of d) {
		let r = t.edges[n.id];
		if (!r) continue;
		let i = H(n), a = n.style ? V[n.style].dash : z[i].dash, o = s && "change" in n && n.change ? N[n.change] : void 0, c = o ? o.stroke : z[i].stroke, l = o ? o.dash : a;
		if (u.push(`<g class="dg-edge" data-edge="${q(n.id)}" data-from="${q(n.from)}" data-to="${q(n.to)}" data-flow="${i}"${o ? ` data-change="${n.change}" style="--bs:${z[i].stroke};--bd:${a || "none"}"` : ""}><path d="${J(r.points)}" fill="none" stroke="${c}" stroke-width="${o ? 2 : 1.6}"${l ? ` stroke-dasharray="${l}"` : ""} marker-end="url(#arr-${o ? n.change : i})"/>`), n.label) {
			let t = r.label ? {
				x: r.label.x + r.label.w / 2,
				y: r.label.y + r.label.h / 2 + 4
			} : e.kind === "sequence" ? {
				x: (r.points[0].x + r.points[r.points.length - 1].x) / 2,
				y: r.points[0].y - 8
			} : {
				x: (r.points[0].x + r.points[r.points.length - 1].x) / 2,
				y: (r.points[0].y + r.points[r.points.length - 1].y) / 2
			}, i = n.label.length * 6.75 + 14;
			u.push(`<rect class="dg-edge-pill" x="${t.x - i / 2}" y="${t.y - 12}" width="${i}" height="17" rx="8.5" fill="#ffffff" stroke="${c}" stroke-opacity="0.45"/><text class="dg-edge-label" x="${t.x}" y="${t.y}" text-anchor="middle" font-family="${K}" font-size="11" fill="${c}">${q(n.label)}</text>`);
		}
		u.push("</g>");
	}
	let f = e.kind === "c4" ? e.elements : e.participants.map((e) => ({
		id: e.id,
		kind: "container",
		label: e.label,
		role: e.role
	}));
	for (let e of f) {
		let n = t.nodes[e.id];
		if (!n) continue;
		if (e.kind === "start") {
			u.push(`<g class="dg-node" data-node="${q(e.id)}" data-role="start"><circle cx="${n.x + n.w / 2}" cy="${n.y + n.h / 2}" r="7" fill="${W}"/></g>`);
			continue;
		}
		let r = R(e), i = c ? M[e.status ?? "active"] : void 0, a = i ?? A[r], o = s && e.change ? N[e.change] : void 0, l = e.kind === "system", d = n.w >= 70 && n.h >= 34, f = c ? 14 : e.kind === "person" ? 22 : 7, p = o ? o.dash : r === "external" && !i ? "4 3" : "";
		u.push(`<g class="dg-node" data-node="${q(e.id)}" data-role="${i ? `status-${e.status ?? "active"}` : r}"${o ? ` data-change="${e.change}" style="--bs:${l ? W : a.stroke}"` : ""}><rect class="dg-box" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${f}" fill="${a.fill}"${e.change === "removed" && s ? " fill-opacity=\"0.55\"" : ""} stroke="${o ? o.stroke : l ? W : a.stroke}" stroke-width="${o ? 2.2 : l ? 2 : 1.5}"${p ? ` stroke-dasharray="${p}"` : ""}/>` + (c && e.final ? `<rect x="${n.x + 3.5}" y="${n.y + 3.5}" width="${n.w - 7}" height="${n.h - 7}" rx="${f - 3}" fill="none" stroke="${a.stroke}" stroke-width="1.2"/>` : "") + (o ? `<g class="dg-badge"><circle cx="${n.x + n.w - 2}" cy="${n.y + 2}" r="9" fill="#ffffff" stroke="${o.stroke}" stroke-width="1.6"/><text x="${n.x + n.w - 2}" y="${n.y + 6.5}" text-anchor="middle" font-family="${K}" font-size="13" font-weight="700" fill="${o.stroke}">${o.mark}</text></g>` : "") + (d ? Y(i ? i.icon : e.kind === "person" ? j : a.icon, n.x + (e.kind === "person" && !i ? 14 : 8), n.y + 6, a.stroke) : "") + `<text x="${n.x + n.w / 2}" y="${n.y + (e.sub ? n.h / 2 - 3 : n.h / 2 + 5)}" text-anchor="middle" font-size="14.5" font-weight="600" fill="${W}">${q(e.label)}</text>` + (e.sub ? `<text x="${n.x + n.w / 2}" y="${n.y + n.h / 2 + 15}" text-anchor="middle" font-size="12" fill="${G}">${q(e.sub)}</text>` : "") + "</g>");
	}
	return u.push("</g></svg>"), u.join("");
}
//#endregion
export { l as A, S as C, o as D, e as E, i as F, s as I, t as M, r as N, c as O, u as P, y as S, T, O as _, M as a, E as b, U as c, R as d, D as f, C as g, w as h, A as i, a as j, n as k, J as l, m, V as n, I as o, h as p, z as r, H as s, N as t, X as u, k as v, v as w, x, g as y };
