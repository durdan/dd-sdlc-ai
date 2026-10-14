import { t as e } from "./keys-BT7tChre.js";
import t from "elkjs/lib/elk.bundled.js";
//#region src/diagram/layout.ts
var n = 8.4, r = 6.6;
function i(e) {
	let t = Math.min(300, Math.max(170, e.label.length * n + 44, (e.sub?.length ?? 0) * r + 36));
	return {
		w: Math.round(t),
		h: e.sub ? 64 : 46
	};
}
function a(e) {
	return {
		width: Math.round(e.length * 6.4 + 12),
		height: 18
	};
}
async function o(e) {
	let n = new t(), r = e.elements.some((e) => e.rank !== void 0), o = (e) => ({
		id: e.id,
		width: i(e).w,
		height: i(e).h,
		...r ? { layoutOptions: { "elk.partitioning.partition": String(e.rank ?? 0) } } : {}
	}), c = e.groups ?? [], l = r ? e.elements.map(o) : [...c.map((t) => ({
		id: t.id,
		layoutOptions: { "elk.padding": "[top=44,left=24,bottom=24,right=24]" },
		children: e.elements.filter((e) => e.group === t.id).map(o)
	})), ...e.elements.filter((e) => !e.group || !c.some((t) => t.id === e.group)).map(o)], u = {
		id: "root",
		layoutOptions: {
			"elk.algorithm": "layered",
			"elk.direction": e.direction ?? "DOWN",
			"elk.edgeRouting": "ORTHOGONAL",
			"elk.hierarchyHandling": "INCLUDE_CHILDREN",
			...r ? {
				"elk.partitioning.activate": "true",
				"elk.layered.spacing.nodeNodeBetweenLayers": "74"
			} : {},
			"elk.layered.spacing.nodeNodeBetweenLayers": "58",
			"elk.spacing.nodeNode": "36",
			"elk.spacing.edgeNode": "22",
			"elk.spacing.edgeEdge": "14",
			"elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
			"elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
			"elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
			"elk.edgeLabels.placement": "CENTER",
			"elk.padding": "[top=24,left=24,bottom=24,right=24]",
			"elk.json.edgeCoords": "ROOT"
		},
		children: l,
		edges: e.edges.map((e) => ({
			id: e.id,
			sources: [e.from],
			targets: [e.to],
			...e.label ? { labels: [{
				text: e.label,
				...a(e.label)
			}] } : {}
		}))
	}, d = await n.layout(u), f = {}, p = {}, m = (e, t, n) => {
		for (let r of e.children ?? []) {
			let e = {
				x: t + (r.x ?? 0),
				y: n + (r.y ?? 0),
				w: r.width ?? 0,
				h: r.height ?? 0
			};
			r.children ? (p[r.id] = e, m(r, e.x, e.y)) : f[r.id] = e;
		}
	};
	m(d, 0, 0);
	let h = {}, g = (e, t, n) => {
		for (let r of e.edges ?? []) {
			let e = r.sections?.[0];
			if (!e) continue;
			let i = s([
				e.startPoint,
				...e.bendPoints ?? [],
				e.endPoint
			].map((e) => ({
				x: e.x + t,
				y: e.y + n
			}))), a = r.labels?.[0];
			h[r.id] = {
				points: i,
				...a && a.x !== void 0 ? { label: {
					x: a.x + t,
					y: (a.y ?? 0) + n,
					w: a.width,
					h: a.height
				} } : {}
			};
		}
		for (let r of e.children ?? []) r.children && g(r, t + (r.x ?? 0), n + (r.y ?? 0));
	};
	if (g(d, 0, 0), r) for (let t of c) {
		let n = e.elements.filter((e) => e.group === t.id).map((e) => f[e.id]).filter(Boolean);
		if (!n.length) continue;
		let r = Math.min(...n.map((e) => e.x)) - 18, i = Math.min(...n.map((e) => e.y)) - 34, a = Math.max(...n.map((e) => e.x + e.w)) + 18, o = Math.max(...n.map((e) => e.y + e.h)) + 14;
		p[t.id] = {
			x: r,
			y: i,
			w: a - r,
			h: o - i
		};
	}
	return {
		width: Math.ceil(d.width ?? 1200),
		height: Math.ceil(d.height ?? 720),
		nodes: f,
		groups: p,
		edges: h
	};
}
function s(e) {
	let t = [e[0]];
	for (let n = 1; n < e.length; n += 1) {
		let r = t[t.length - 1], i = e[n];
		if (Math.abs(i.x - r.x) > .5 && Math.abs(i.y - r.y) > .5) {
			let e = t[t.length - 2], n = !e || Math.abs(e.x - r.x) < .5;
			t.push(n ? {
				x: r.x,
				y: i.y
			} : {
				x: i.x,
				y: r.y
			});
		}
		t.push(i);
	}
	return t.filter((e, t, n) => {
		if (t === 0 || t === n.length - 1) return !0;
		let r = n[t - 1], i = n[t + 1];
		return !(Math.abs(r.x - e.x) < .5 && Math.abs(e.x - i.x) < .5 || Math.abs(r.y - e.y) < .5 && Math.abs(e.y - i.y) < .5);
	});
}
function c(e) {
	let t = Math.max(150, Math.min(210, 1200 / e.participants.length)), n = Math.round(t * e.participants.length + 40), r = {};
	e.participants.forEach((e, n) => {
		r[e.id] = {
			x: 20 + n * t + 10,
			y: 20,
			w: t - 20,
			h: 46
		};
	});
	let i = (e) => r[e].x + r[e].w / 2, a = {};
	return e.messages.forEach((e, t) => {
		let n = 108 + t * 48;
		if (e.from === e.to) {
			let t = i(e.from);
			a[e.id] = { points: [
				{
					x: t,
					y: n
				},
				{
					x: t + 36,
					y: n
				},
				{
					x: t + 36,
					y: n + 18
				},
				{
					x: t + 4,
					y: n + 18
				}
			] };
		} else a[e.id] = { points: [{
			x: i(e.from),
			y: n
		}, {
			x: i(e.to),
			y: n
		}] };
	}), {
		width: n,
		height: 108 + e.messages.length * 48 + 20,
		nodes: r,
		groups: {},
		edges: a
	};
}
async function l(e) {
	return e.kind === "c4" ? o(e) : c(e);
}
//#endregion
//#region src/lib/layout.ts
async function u(t) {
	let n = {};
	for (let r of t.diagrams) n[r.id] = await l(r), r.kind === "c4" && r.direction === "RIGHT" && (n[`${r.id}${e}`] = await l({
		...r,
		direction: "DOWN"
	}));
	return n;
}
//#endregion
export { l as layoutDiagram, u as layoutWalkthrough };
