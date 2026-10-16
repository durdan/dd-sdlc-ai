import { C as e, D as t, E as n, O as r, S as i, _ as a, a as o, b as s, c, d as l, f as u, g as d, i as f, k as p, l as m, m as h, o as g, p as _, t as v, u as y, v as b, w as x, x as S } from "./svg-2uUk2eb6.js";
import { t as C } from "./keys-BT7tChre.js";
import { useCallback as ee, useEffect as w, useLayoutEffect as T, useMemo as E, useRef as D, useState as O } from "react";
import { Fragment as k, jsx as A, jsxs as j } from "react/jsx-runtime";
import { gsap as M } from "gsap";
import { DrawSVGPlugin as N } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin as te } from "gsap/MotionPathPlugin";
//#region src/Library.tsx
var P = {
	patterns: "pattern",
	companies: "company"
};
function F({ catalog: t, progress: n, open: r, initialTab: i, heading: o = "The library", intro: s = "Design patterns explained through the problems they solve, and how leading digital companies built their systems." }) {
	let l = [
		{
			id: "patterns",
			label: "Patterns",
			count: t.topics.filter((e) => e.meta?.kind === "pattern").length
		},
		{
			id: "companies",
			label: "Companies",
			count: t.topics.filter((e) => e.meta?.kind === "company").length
		},
		{
			id: "paths",
			label: "Paths",
			count: t.paths.length
		}
	].filter((e) => e.count > 0 || e.id === "patterns"), [d, f] = O(() => l.some((e) => e.id === i) ? i : "patterns"), [p, h] = O("All"), [g, _] = O(""), v = (e) => {
		f(e), h("All"), history.replaceState(null, "", u(e));
	}, y = E(() => d === "paths" ? [] : t.topics.filter((e) => (e.meta?.kind ?? "pattern") === P[d]), [t, d]), b = ["All", ...new Set(y.map((e) => e.meta?.category ?? "Other"))], x = g.trim().toLowerCase(), S = x ? t.topics.filter((e) => !x || [
		e.title,
		e.subtitle,
		e.meta?.blurb,
		e.meta?.category,
		...e.chapters.map((e) => e.title)
	].join(" ").toLowerCase().includes(x)) : y.filter((e) => p === "All" || (e.meta?.category ?? "Other") === p), C = t.topics.filter((e) => m(n[e.id]) > .02 && !c(n[e.id])).sort((e, t) => n[t.id].at - n[e.id].at).slice(0, 6);
	return /* @__PURE__ */ j("div", {
		className: "library",
		children: [
			/* @__PURE__ */ j("header", {
				className: "lib-head",
				children: [
					/* @__PURE__ */ A("h1", { children: o }),
					/* @__PURE__ */ A("p", { children: s }),
					/* @__PURE__ */ j("label", {
						className: "lib-search",
						children: [/* @__PURE__ */ j("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: [/* @__PURE__ */ A("circle", {
								cx: "11",
								cy: "11",
								r: "7"
							}), /* @__PURE__ */ A("path", { d: "M20 20l-3.5-3.5" })]
						}), /* @__PURE__ */ A("input", {
							type: "search",
							placeholder: "Search patterns, companies, chapters",
							value: g,
							onChange: (e) => _(e.target.value)
						})]
					})
				]
			}),
			!x && C.length ? /* @__PURE__ */ j("section", {
				className: "lib-row",
				children: [/* @__PURE__ */ A("h2", { children: "Continue watching" }), /* @__PURE__ */ A("div", {
					className: "lib-rail",
					children: C.map((e) => /* @__PURE__ */ A(L, {
						t: e,
						p: n[e.id],
						open: r,
						compact: !0
					}, e.id))
				})]
			}) : null,
			x ? /* @__PURE__ */ j("p", {
				className: "lib-results",
				children: [
					S.length,
					" result",
					S.length === 1 ? "" : "s",
					" for “",
					g.trim(),
					"”"
				]
			}) : /* @__PURE__ */ A("nav", {
				className: "lib-tabs",
				role: "tablist",
				children: l.map((e) => /* @__PURE__ */ j("button", {
					role: "tab",
					"aria-selected": d === e.id,
					className: d === e.id ? "on" : "",
					onClick: () => v(e.id),
					children: [
						e.label,
						" ",
						/* @__PURE__ */ A("span", { children: e.count })
					]
				}, e.id))
			}),
			!x && d !== "paths" && b.length > 2 ? /* @__PURE__ */ A("div", {
				className: "lib-chips",
				children: b.map((e) => /* @__PURE__ */ A("button", {
					className: e === p ? "on" : "",
					onClick: () => h(e),
					children: e
				}, e))
			}) : null,
			!x && d === "paths" ? /* @__PURE__ */ A("div", {
				className: "lib-paths",
				children: t.paths.map((i) => {
					let o = i.steps.filter((e) => c(n[e])).length;
					return /* @__PURE__ */ j("section", {
						className: "lib-path",
						children: [/* @__PURE__ */ j("header", { children: [
							/* @__PURE__ */ A("h2", { children: i.title }),
							/* @__PURE__ */ A("p", { children: i.blurb }),
							/* @__PURE__ */ j("span", { children: [
								o,
								" of ",
								i.steps.length,
								" watched"
							] })
						] }), /* @__PURE__ */ A("ol", { children: i.steps.map((i, o) => {
							let s = t.topics.find((e) => e.id === i), l = n[i];
							return /* @__PURE__ */ j("li", {
								className: s ? c(l) ? "done" : "" : "soon",
								children: [/* @__PURE__ */ A("b", { children: c(l) ? "✓" : o + 1 }), s ? /* @__PURE__ */ j("a", {
									href: a(s),
									onClick: (e) => {
										e.preventDefault(), r(a(s));
									},
									children: [/* @__PURE__ */ A("span", { children: s.title }), /* @__PURE__ */ j("small", { children: [
										I(s.meta?.level ?? ""),
										" · ",
										e(s.ms.engineer),
										m(l) > .02 && !c(l) ? ` · ${Math.round(m(l) * 100)}% watched` : ""
									] })]
								}) : /* @__PURE__ */ j("span", { children: [i.replace(/-/g, " "), /* @__PURE__ */ A("small", { children: "coming soon" })] })]
							}, i);
						}) })]
					}, i.id);
				})
			}) : /* @__PURE__ */ j("div", {
				className: "lib-grid",
				children: [S.map((e) => /* @__PURE__ */ A(L, {
					t: e,
					p: n[e.id],
					open: r
				}, e.id)), S.length ? null : /* @__PURE__ */ A("p", {
					className: "lib-empty",
					children: "Nothing here yet."
				})]
			})
		]
	});
}
var I = (e) => e.charAt(0).toUpperCase() + e.slice(1);
function L({ t, p: n, open: r, compact: i }) {
	let o = m(n), s = a(t);
	return /* @__PURE__ */ j("a", {
		className: `lib-tile${i ? " compact" : ""}`,
		href: s,
		onClick: (e) => {
			e.preventDefault(), r(s);
		},
		children: [/* @__PURE__ */ j("div", {
			className: "lib-thumb",
			children: [
				/* @__PURE__ */ A("img", {
					src: g(`/thumbs/${t.id}.svg`),
					alt: "",
					loading: "lazy"
				}),
				y(t) ? /* @__PURE__ */ A("em", {
					className: "new",
					children: "New"
				}) : l(t) ? /* @__PURE__ */ A("em", {
					className: "upd",
					children: "Updated"
				}) : null,
				t.ms.engineer ? /* @__PURE__ */ A("span", {
					className: "dur",
					children: e(t.ms.engineer)
				}) : null,
				o > .02 ? /* @__PURE__ */ A("i", { style: { width: `${o * 100}%` } }) : null
			]
		}), /* @__PURE__ */ j("div", {
			className: "lib-meta",
			children: [
				/* @__PURE__ */ j("small", { children: [t.meta?.category ?? t.subtitle, t.meta?.level ? ` · ${t.meta.level}` : ""] }),
				/* @__PURE__ */ A("b", { children: t.title }),
				!i && t.meta?.blurb ? /* @__PURE__ */ A("p", { children: t.meta.blurb }) : null
			]
		})]
	});
}
//#endregion
//#region src/CardStage.tsx
function ne({ card: e, shotMs: t, offsetMs: n, playing: r, epoch: i }) {
	let a = e.kind ?? "points", o = a === "compare" ? e.points.slice(1) : e.points, s = t * .75 / Math.max(o.length, 1), c = (e) => ({
		animationDelay: `${e * s - n}ms`,
		animationPlayState: r ? "running" : "paused"
	}), l = (e) => e.split("|").map((e) => e.trim());
	return /* @__PURE__ */ j("div", {
		className: `card-stage is-${a}`,
		children: [/* @__PURE__ */ A("h2", { children: e.heading }), a === "numbers" ? /* @__PURE__ */ A("div", {
			className: "card-numbers",
			children: o.map((e, t) => {
				let [n, r] = l(e);
				return /* @__PURE__ */ j("div", {
					className: "card-in",
					style: c(t),
					children: [/* @__PURE__ */ A("b", { children: n }), /* @__PURE__ */ A("span", { children: r })]
				}, e);
			})
		}) : a === "compare" ? /* @__PURE__ */ j("table", {
			className: "card-compare",
			children: [/* @__PURE__ */ A("thead", { children: /* @__PURE__ */ A("tr", { children: l(e.points[0]).map((e) => /* @__PURE__ */ A("th", { children: e }, e)) }) }), /* @__PURE__ */ A("tbody", { children: o.map((e, t) => /* @__PURE__ */ A("tr", {
				className: "card-in",
				style: c(t),
				children: l(e).map((e, t) => /* @__PURE__ */ A("td", { children: e }, t))
			}, e)) })]
		}) : /* @__PURE__ */ A("ul", {
			className: "card-points",
			children: o.map((e, t) => /* @__PURE__ */ A("li", {
				className: "card-in",
				style: c(t),
				children: e
			}, e))
		})]
	}, i);
}
//#endregion
//#region src/DiagramStage.tsx
M.registerPlugin(N, te);
var R = 16, re = .2, ie = .72, ae = .9, z = (e) => `${e.x.toFixed(1)} ${e.y.toFixed(1)} ${e.w.toFixed(1)} ${e.h.toFixed(1)}`;
function B(e, t, n) {
	let r = t.width + 32, i = t.height + 32, a = n.w / n.h, o = Math.max(e.w + 120, (e.h + 100) * a);
	o = Math.min(o, n.w / ie), o = Math.max(o, n.w / ae);
	let s = o / a, c = e.x + e.w / 2 + R, l = e.y + e.h / 2 + R;
	return {
		x: o >= r ? (r - o) / 2 : Math.min(Math.max(0, c - o / 2), r - o),
		y: s >= i ? (i - s) / 2 : Math.min(Math.max(0, l - s / 2), i - s),
		w: o,
		h: s
	};
}
function V(e) {
	let t = Math.min(...e.map((e) => e.x)), n = Math.min(...e.map((e) => e.y)), r = Math.max(...e.map((e) => e.x + e.w)), i = Math.max(...e.map((e) => e.y + e.h));
	return {
		x: t,
		y: n,
		w: r - t,
		h: i - n
	};
}
function oe(e, t) {
	let n = (e.kind === "c4" ? e.edges : e.messages).filter((e) => t.trace.includes(e.id));
	return /* @__PURE__ */ new Set([...t.focus, ...n.flatMap((e) => [e.from, e.to])]);
}
function se(e, t, n) {
	let r = [...t].map((t) => e.nodes[t]).filter(Boolean);
	for (let t of n) for (let n of e.edges[t]?.points ?? []) r.push({
		x: n.x,
		y: n.y,
		w: 1,
		h: 1
	});
	let i = e.width + 32, a = e.height + 32;
	if (r.length === 0) return `0 0 ${i} ${a}`;
	let o = Math.min(...r.map((e) => e.x)), s = Math.min(...r.map((e) => e.y)), c = Math.max(...r.map((e) => e.x + e.w)), l = Math.max(...r.map((e) => e.y + e.h)), u = Math.max(c - o + 160, i / 1.6), d = Math.max(l - s + 140, a / 1.6), f = i / a;
	if (u / d > f ? d = u / f : u = d * f, u >= i * .85) return `0 0 ${i} ${a}`;
	let p = (o + c) / 2 + R, m = (s + l) / 2 + R, h = Math.min(Math.max(0, p - u / 2), i - u), g = Math.min(Math.max(0, m - d / 2), a - d);
	return `${h.toFixed(1)} ${g.toFixed(1)} ${u.toFixed(1)} ${d.toFixed(1)}`;
}
function ce({ diagram: e, layout: t, portraitLayout: n, epoch: r, shot: i, shotMs: a, offsetMs: o, scrubMs: s, playing: c, onSelect: l, selected: u, view: d, stableSvg: p = !0 }) {
	let m = D(null), h = D(null), [g, _] = O(null);
	T(() => {
		let e = m.current;
		if (!e) return;
		let t = () => {
			let t = e.getBoundingClientRect();
			t.width && t.height && _((e) => e && Math.abs(e.w - t.width) < 2 && Math.abs(e.h - t.height) < 2 ? e : {
				w: t.width,
				h: t.height
			});
		};
		t();
		let n = new ResizeObserver(t);
		return n.observe(e), () => n.disconnect();
	}, []);
	let y = g && n && g.h > g.w * .9 ? n : t, b = E(() => f(e, y, { pad: R }), [e, y]), x = E(() => ({ __html: b }), [b]), S = d !== void 0, C = !S && !!g && Math.min(g.w / (y.width + 32), g.h / (y.height + 32)) < ie;
	return T(() => {
		let t = m.current?.querySelector("svg");
		if (!t || !g) return;
		let n = oe(e, i), r = n.size > 0, s = t.querySelectorAll(".dg-node, .dg-edge, .dg-group, .dg-lifeline"), l = t.querySelectorAll(".dg-edge-label");
		t.querySelectorAll(".dg-pulse").forEach((e) => e.remove());
		{
			let e = M.timeline({ paused: !0 }), o = (e) => y.nodes[e], c = (e) => {
				let t = y.edges[e]?.points ?? [];
				return t.length ? V(t.map((e) => ({
					x: e.x,
					y: e.y,
					w: 1,
					h: 1
				}))) : null;
			};
			if (S) t.setAttribute("preserveAspectRatio", "xMidYMid meet");
			else if (!C) e.to(t, {
				attr: { viewBox: se(y, n, i.trace) },
				duration: 1.3,
				ease: "power2.inOut"
			}, 0);
			else {
				t.setAttribute("preserveAspectRatio", "xMidYMid meet");
				let r = i.trace.length ? c(i.trace[0]) : null, a = [...n].map(o).filter(Boolean), s = r ?? (a.length ? V(a) : null), l = {
					x: 0,
					y: 0,
					w: y.width,
					h: y.height
				}, u = s ? B(s, y, g) : B(l, y, {
					w: g.w,
					h: g.h
				}), d = Math.max((y.width + 32) / g.w, (y.height + 32) / g.h), f = {
					x: (y.width + 32 - g.w * d) / 2,
					y: (y.height + 32 - g.h * d) / 2,
					w: g.w * d,
					h: g.h * d
				};
				e.to(t, {
					attr: { viewBox: z(s ? u : f) },
					duration: 1.1,
					ease: "power2.inOut"
				}, 0);
			}
			e.to(l, {
				opacity: 0,
				duration: .3
			}, 0);
			let u = i.trace.map((e) => t.querySelector(`.dg-edge[data-edge="${CSS.escape(e)}"] path`)).filter((e) => !!e), d = [...t.querySelectorAll(".dg-edge path")].filter((e) => !u.includes(e));
			e.set(d, { clearProps: "strokeDasharray,strokeDashoffset,opacity" }, 0), u.length && e.set(u, {
				drawSVG: "0%",
				opacity: 0
			}, 0);
			let f = r ? [...s].filter((e) => {
				let t = e.dataset.node ?? e.dataset.edge ?? e.dataset.group ?? e.dataset.life ?? "";
				return e.classList.contains("dg-group") ? !i.focus.includes(t) : e.classList.contains("dg-edge") ? !i.trace.includes(t) : !n.has(t);
			}) : [], p = [...s].filter((e) => !f.includes(e));
			f.length && e.to(f, {
				opacity: re,
				duration: .6,
				ease: "power1.out"
			}, 0), p.length && e.to(p, {
				opacity: 1,
				duration: .6,
				ease: "power1.out"
			}, 0);
			let m = i.trace.length ? Math.max(1.1, (a / 1e3 - 1.2) / i.trace.length) : 0;
			i.trace.forEach((n, r) => {
				let i = t.querySelector(`.dg-edge[data-edge="${CSS.escape(n)}"]`), a = i?.querySelector("path");
				if (!i || !a) return;
				let o = .5 + r * m, s = Math.min(.9, m * .7);
				if (C && r > 0) {
					let r = c(n);
					if (r) {
						let i = y.edges[n].points, a = i[0], c = i[i.length - 1], l = B(r, y, g), u = l.w >= r.w + 60 && l.h >= r.h + 60, d = u ? l : B({
							x: a.x - 40,
							y: a.y - 40,
							w: 80,
							h: 80
						}, y, g);
						e.to(t, {
							attr: { viewBox: z(d) },
							duration: Math.min(.7, m * .35),
							ease: "power2.inOut"
						}, o - Math.min(.7, m * .35)), u || e.to(t, {
							attr: { viewBox: z(B({
								x: c.x - 40,
								y: c.y - 40,
								w: 80,
								h: 80
							}, y, g)) },
							duration: s,
							ease: "power1.inOut"
						}, o);
					}
				} else if (C && r === 0) {
					let r = y.edges[n]?.points ?? [], i = c(n);
					if (i && r.length) {
						let n = B(i, y, g);
						if (!(n.w >= i.w + 60 && n.h >= i.h + 60)) {
							let n = r[0], i = r[r.length - 1];
							e.to(t, {
								attr: { viewBox: z(B({
									x: n.x - 40,
									y: n.y - 40,
									w: 80,
									h: 80
								}, y, g)) },
								duration: .5,
								ease: "power2.inOut"
							}, Math.max(0, o - .5)), e.to(t, {
								attr: { viewBox: z(B({
									x: i.x - 40,
									y: i.y - 40,
									w: 80,
									h: 80
								}, y, g)) },
								duration: s,
								ease: "power1.inOut"
							}, o);
						}
					}
				}
				e.set(a, { opacity: 1 }, o), e.fromTo(a, { drawSVG: "0%" }, {
					drawSVG: "100%",
					duration: s,
					ease: "power1.inOut",
					immediateRender: !1
				}, o), e.set(a, { clearProps: "strokeDasharray,strokeDashoffset" }, o + s);
				let l = i.querySelector(".dg-edge-label");
				l && e.to(l, {
					opacity: 1,
					duration: .35
				}, o + s * .6);
				let u = document.createElementNS("http://www.w3.org/2000/svg", "circle");
				u.setAttribute("r", "4.5"), u.setAttribute("class", "dg-pulse"), u.setAttribute("fill", a.getAttribute("stroke") ?? v.solid.stroke), u.setAttribute("opacity", "0"), i.appendChild(u), e.set(u, { opacity: 1 }, o).to(u, {
					duration: s,
					ease: "power1.inOut",
					motionPath: {
						path: a,
						align: a,
						alignOrigin: [.5, .5]
					}
				}, o).to(u, {
					opacity: 0,
					duration: .25
				}, o + s);
			}), e.set({}, {}, Math.max(a / 1e3, e.duration())), h.current = e;
		}
		return h.current?.time(Math.max(0, o) / 1e3), c && h.current?.play(), () => {
			h.current?.kill(), h.current = null;
		};
	}, [
		b,
		i,
		a,
		o,
		r,
		g,
		C,
		S
	]), T(() => {
		d && m.current?.querySelector("svg")?.setAttribute("viewBox", d);
	}, [
		d,
		b,
		g
	]), T(() => {
		h.current && (c ? h.current.play() : h.current.pause());
	}, [c]), T(() => {
		s !== void 0 && h.current?.time(s / 1e3);
	}, [s]), T(() => {
		let e = m.current?.querySelector("svg");
		e?.querySelectorAll(".dg-node.is-selected").forEach((e) => e.classList.remove("is-selected")), u && e?.querySelector(`.dg-node[data-node="${CSS.escape(u)}"]`)?.classList.add("is-selected");
	}, [u, b]), /* @__PURE__ */ A("div", {
		ref: m,
		className: "stage-svg",
		onClick: (e) => {
			let t = e.target.closest(".dg-node");
			t?.dataset.node && l(t.dataset.node);
		},
		dangerouslySetInnerHTML: p ? x : { __html: b }
	});
}
//#endregion
//#region src/Watch.tsx
var le = [
	1,
	1.25,
	1.5,
	2,
	.75
], H = "(max-width: 700px), (max-height: 500px) and (orientation: landscape)";
function ue() {
	let e = typeof window < "u", t = e && new URLSearchParams(location.search).get("watch") === "1", [n, r] = O(() => e && (t || matchMedia(H).matches));
	return w(() => {
		if (t || !e) return;
		let n = matchMedia(H);
		r(n.matches);
		let i = () => r(n.matches);
		return n.addEventListener("change", i), () => n.removeEventListener("change", i);
	}, [t, e]), n;
}
function de(n) {
	let { w: r, chapters: i, time: s, total: c } = n, [l, u] = O(null), d = D(null), f = Math.max(0, i.findLastIndex((e) => e.start <= s)), m = i[f], h = n.nav?.next, _ = (e) => n.nav?.open(a(e)), v = s > 0 || n.playing || !!n.clip, y = !n.playing && !n.clip && s >= c - 2;
	w(() => {
		let e = d.current, t = e?.querySelector(".on");
		e && t && e.scrollTo({
			left: t.offsetLeft - e.clientWidth / 2 + t.clientWidth / 2,
			behavior: "smooth"
		});
	}, [f]);
	let b = (e) => {
		e >= i.length ? h && h.id !== r.id && _(h) : n.seek(i[Math.max(0, e)].start + 1);
	}, x = D(null), S = (e) => {
		x.current = {
			x: e.clientX,
			y: e.clientY,
			t: performance.now()
		};
	}, C = (e) => {
		let t = x.current;
		if (x.current = null, !t) return;
		let r = e.clientX - t.x, i = e.clientY - t.y;
		Math.abs(i) > 60 && Math.abs(i) > Math.abs(r) * 1.3 ? b(i < 0 ? f + 1 : f - 1) : Math.hypot(r, i) < 10 && performance.now() - t.t < 400 && (n.playing || !e.target.closest(".dg-node")) && n.toggle();
	}, { words: ee, said: T } = t(p(n.text), n.spoken), E = m ? `${f + 1} · ${m.title}` : r.subtitle ?? "";
	return /* @__PURE__ */ j("div", {
		className: `watch${n.clip ? " is-clip" : ""}`,
		children: [
			/* @__PURE__ */ A("div", {
				className: "w-stage",
				onPointerDown: S,
				onPointerUp: C,
				children: /* @__PURE__ */ A("div", {
					className: `w-canvas${v ? "" : " dim"}`,
					children: n.stage
				})
			}),
			/* @__PURE__ */ j("header", {
				className: "w-top",
				children: [/* @__PURE__ */ j("button", {
					className: "w-title",
					onClick: () => u("next"),
					"aria-label": "What next",
					children: [/* @__PURE__ */ j("b", { children: [/* @__PURE__ */ A("em", { children: r.title }), /* @__PURE__ */ A("svg", {
						viewBox: "0 0 24 24",
						"aria-hidden": "true",
						children: /* @__PURE__ */ A("path", { d: "M6 9l6 6 6-6" })
					})] }), /* @__PURE__ */ A("span", { children: v ? E : r.subtitle })]
				}), n.clip ? null : /* @__PURE__ */ j("button", {
					className: "w-pill",
					onClick: () => n.onDepth(n.depth === "engineer" ? "executive" : "engineer"),
					"aria-label": "Switch depth",
					children: [
						n.depth === "engineer" ? "Engineer" : "Executive",
						" ",
						/* @__PURE__ */ A("span", { children: "⇄" })
					]
				})]
			}),
			v ? y ? /* @__PURE__ */ j("div", {
				className: "w-intro",
				children: [
					/* @__PURE__ */ A("span", {
						className: "w-eyebrow",
						children: "Up next"
					}),
					/* @__PURE__ */ A("h1", { children: h?.title }),
					/* @__PURE__ */ A("button", {
						className: "w-play",
						onClick: () => h && _(h),
						"aria-label": "Play next topic",
						children: /* @__PURE__ */ A("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ A("path", { d: "M8 5.5v13l11-6.5z" })
						})
					}),
					/* @__PURE__ */ A("button", {
						className: "w-link",
						onClick: () => n.seek(0),
						children: "Watch again"
					})
				]
			}) : !n.playing && !n.clip ? /* @__PURE__ */ j("div", {
				className: "w-paused",
				children: [
					/* @__PURE__ */ A("button", {
						className: "w-icon",
						onClick: () => b(f - 1),
						"aria-label": "Previous chapter",
						children: /* @__PURE__ */ A("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ A("path", { d: "M7 6v12M18 6l-8 6 8 6z" })
						})
					}),
					/* @__PURE__ */ A("button", {
						className: "w-icon",
						onClick: () => n.seek(s - 1e4),
						"aria-label": "Back 10 seconds",
						children: "−10"
					}),
					/* @__PURE__ */ A("button", {
						className: "w-play",
						onClick: n.toggle,
						"aria-label": "Resume",
						children: /* @__PURE__ */ A("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ A("path", { d: "M8 5.5v13l11-6.5z" })
						})
					}),
					/* @__PURE__ */ A("button", {
						className: "w-icon",
						onClick: () => n.seek(s + 1e4),
						"aria-label": "Forward 10 seconds",
						children: "+10"
					}),
					/* @__PURE__ */ A("button", {
						className: "w-icon",
						onClick: () => b(f + 1),
						"aria-label": "Next chapter",
						children: /* @__PURE__ */ A("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ A("path", { d: "M17 6v12M6 6l8 6-8 6z" })
						})
					})
				]
			}) : null : /* @__PURE__ */ j("div", {
				className: "w-intro",
				children: [
					/* @__PURE__ */ A("span", {
						className: "w-eyebrow",
						children: r.subtitle ?? "Walkthrough"
					}),
					/* @__PURE__ */ A("h1", { children: r.title }),
					/* @__PURE__ */ j("p", { children: [
						i.length,
						" chapters · ",
						e(c)
					] }),
					/* @__PURE__ */ A("button", {
						className: "w-play",
						onClick: n.toggle,
						"aria-label": "Play",
						children: /* @__PURE__ */ A("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ A("path", { d: "M8 5.5v13l11-6.5z" })
						})
					}),
					/* @__PURE__ */ A("small", { children: "Tap to play with sound · swipe up for the next chapter" })
				]
			}),
			/* @__PURE__ */ j("div", {
				className: "w-bottom",
				children: [
					v && !y && !n.clip && m && o.has(m.id) && n.nav?.links.length ? /* @__PURE__ */ A("div", {
						className: "w-chips",
						children: n.nav.links.map((e) => /* @__PURE__ */ j("button", {
							onClick: () => _(e),
							children: [e.title, " ›"]
						}, e.id))
					}) : null,
					v && n.captions && !y ? /* @__PURE__ */ j("div", {
						className: "w-caption",
						"aria-live": "off",
						children: [/* @__PURE__ */ A("span", {
							className: "w-eyebrow",
							children: E
						}), /* @__PURE__ */ A("p", { children: ee.map((e, t) => /* @__PURE__ */ j("span", {
							className: t < T ? "said" : "",
							children: [e, " "]
						}, t)) })]
					}) : null,
					/* @__PURE__ */ A("div", {
						className: "w-strip",
						ref: d,
						children: i.map((e, t) => /* @__PURE__ */ j("button", {
							className: t === f ? "on" : t < f ? "done" : "",
							onClick: () => n.seek(e.start + 1),
							children: [/* @__PURE__ */ A("b", { children: t + 1 }), /* @__PURE__ */ A("span", { children: e.title })]
						}, e.id))
					}),
					/* @__PURE__ */ j("div", {
						className: "w-progress",
						children: [i.map((e, t) => {
							let n = i[t + 1]?.start ?? c, r = Math.min(1, Math.max(0, (s - e.start) / (n - e.start)));
							return /* @__PURE__ */ A("span", {
								style: { flexGrow: n - e.start },
								children: /* @__PURE__ */ A("i", { style: { width: `${r * 100}%` } })
							}, e.id);
						}), /* @__PURE__ */ A("input", {
							type: "range",
							min: 0,
							max: c,
							step: 100,
							value: s,
							onChange: (e) => n.seek(Number(e.target.value)),
							"aria-label": "Position"
						})]
					}),
					n.clip ? null : /* @__PURE__ */ j("div", {
						className: "w-bar",
						children: [
							/* @__PURE__ */ A("button", {
								className: "w-icon",
								onClick: n.toggle,
								"aria-label": n.playing ? "Pause" : "Play",
								children: n.playing ? /* @__PURE__ */ A("svg", {
									viewBox: "0 0 24 24",
									"aria-hidden": "true",
									children: /* @__PURE__ */ A("path", { d: "M8 5v14M16 5v14" })
								}) : /* @__PURE__ */ A("svg", {
									viewBox: "0 0 24 24",
									"aria-hidden": "true",
									className: "fill",
									children: /* @__PURE__ */ A("path", { d: "M8 5.5v13l11-6.5z" })
								})
							}),
							/* @__PURE__ */ j("span", {
								className: "w-time",
								children: [
									e(s),
									" / ",
									e(c)
								]
							}),
							/* @__PURE__ */ A("button", {
								className: "w-icon",
								onClick: () => u("chapters"),
								"aria-label": "Chapters",
								children: /* @__PURE__ */ A("svg", {
									viewBox: "0 0 24 24",
									"aria-hidden": "true",
									children: /* @__PURE__ */ A("path", { d: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" })
								})
							}),
							/* @__PURE__ */ A("button", {
								className: `w-icon w-cc${n.captions ? " on" : ""}`,
								onClick: () => n.setCaptions((e) => !e),
								"aria-label": "Subtitles",
								children: "CC"
							}),
							/* @__PURE__ */ j("button", {
								className: "w-icon w-speed",
								onClick: () => n.setSpeed(le[(le.indexOf(n.speed) + 1) % le.length]),
								"aria-label": "Speed",
								children: [n.speed, "×"]
							})
						]
					})
				]
			}),
			n.explore,
			l ? /* @__PURE__ */ A("div", {
				className: "w-sheet-back",
				onClick: () => u(null),
				children: /* @__PURE__ */ j("div", {
					className: "w-sheet",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ A("div", { className: "w-grip" }), l === "chapters" ? /* @__PURE__ */ j(k, { children: [/* @__PURE__ */ A("h2", { children: "Chapters" }), i.map((t, r) => /* @__PURE__ */ j("button", {
						className: r === f ? "on" : "",
						onClick: () => {
							n.seek(t.start + 1), u(null);
						},
						children: [
							/* @__PURE__ */ A("b", { children: r + 1 }),
							/* @__PURE__ */ A("span", { children: t.title }),
							/* @__PURE__ */ A("small", { children: e(t.start) })
						]
					}, t.id))] }) : /* @__PURE__ */ j(k, { children: [(n.nav?.groups ?? []).map((t) => /* @__PURE__ */ j("section", { children: [/* @__PURE__ */ A("h2", { children: t.title }), t.items.map(({ topic: t, note: n }) => /* @__PURE__ */ j("button", {
						onClick: () => {
							u(null), _(t);
						},
						children: [/* @__PURE__ */ A("img", {
							src: g(`/thumbs/${t.id}.svg`),
							alt: "",
							loading: "lazy"
						}), /* @__PURE__ */ j("span", { children: [t.title, /* @__PURE__ */ A("small", { children: n ?? [t.meta?.category, e(t.ms.engineer)].filter(Boolean).join(" · ") })] })]
					}, t.id))] }, t.title)), /* @__PURE__ */ A("button", {
						className: "w-browse",
						onClick: () => n.nav?.library(),
						children: "Browse the library"
					})] })]
				})
			}) : null
		]
	});
}
//#endregion
//#region src/Player.tsx
var fe = [
	.75,
	1,
	1.25,
	1.5,
	2
];
function pe({ walkthrough: t, manifest: c, layouts: l, nav: u, autoplay: d = !1, startAt: f = 0, startChapter: m, onProgress: h, frame: _, view: y, initialDepth: b = "engineer" }) {
	let T = ue(), M = _ !== void 0, [N, te] = O(b), P = E(() => n(t.shots, N, c), [
		t.shots,
		N,
		c
	]), F = E(() => r(P), [P]), I = F[F.length - 1] + P[P.length - 1], L = E(() => s(t, F), [t, F]), [R, re] = O(0), [ie, ae] = O(d), z = M ? Math.max(0, Math.min(I - 1, _)) : R, B = !M && ie, [V, oe] = O(1), [se, le] = O(!0), [H, pe] = O(null), [me, he] = O({
		index: 0,
		offset: 0,
		epoch: 0
	}), U = D(null), ge = D(null), W = D({
		time: 0,
		last: 0
	}), { index: G, offset: K } = x(z, P), q = D(null);
	M && q.current?.index !== G && (q.current = {
		index: G,
		offset: q.current ? 0 : K
	});
	let J = M && q.current ? {
		...q.current,
		epoch: 0
	} : me, Y = t.shots[G], _e = Y.diagram ?? t.shots.slice(0, G).reverse().find((e) => e.diagram)?.diagram ?? t.diagrams[0].id, X = t.diagrams.find((e) => e.id === _e), Z = c[i(Y, N)], Q = ee((e) => {
		let t = Math.max(0, Math.min(I - 1, e));
		W.current.time = t, re(t);
		let n = x(t, P);
		he((e) => ({
			index: n.index,
			offset: n.offset,
			epoch: e.epoch + 1
		}));
	}, [P, I]);
	w(() => {
		let e = m ? L.find((e) => e.id === m) : void 0, t = e ? e.start + 1 : f > 5e3 && f < I - 5e3 ? f : 0;
		t && Q(t);
	}, []);
	let ve = D(0);
	w(() => {
		h && (Math.abs(z - ve.current) > 3e3 || !B) && (ve.current = z, h(z, I));
	}, [
		z,
		B,
		I,
		h
	]), w(() => {
		let e = U.current;
		if (!e) return;
		if (!Z) {
			e.removeAttribute("src");
			return;
		}
		e.src.endsWith(Z.file) || (e.src = g(Z.file));
		let t = J.index === G ? J.offset : 0;
		t < Z.ms && (e.currentTime = t / 1e3), e.playbackRate = V, B && t < Z.ms && e.play().catch(() => void 0);
	}, [
		G,
		N,
		J.epoch,
		Z?.file
	]), w(() => {
		U.current && (U.current.playbackRate = V);
	}, [V]), w(() => {
		let e = U.current;
		e && Z && (B && K < Z.ms ? e.play().catch(() => void 0) : e.pause());
	}, [B]), w(() => {
		if (!B) return;
		let e = 0;
		W.current.last = performance.now();
		let n = (r) => {
			let a = r - W.current.last;
			W.current.last = r;
			let o = x(W.current.time, P), s = U.current, l = c[i(t.shots[o.index], N)], u;
			u = s && l && s.src.endsWith(l.file) && !s.paused && !s.ended ? F[o.index] + s.currentTime * 1e3 : W.current.time + a * V;
			let d = x(u, P);
			d.index !== o.index && he((e) => ({
				index: d.index,
				offset: 0,
				epoch: e.epoch
			})), u >= I ? (W.current.time = I, re(I - 1), ae(!1)) : (W.current.time = u, re(u), e = requestAnimationFrame(n));
		};
		return e = requestAnimationFrame(n), () => cancelAnimationFrame(e);
	}, [
		B,
		P,
		F,
		I,
		V,
		N,
		c,
		t.shots
	]);
	let ye = (e) => {
		if (e === N) return;
		let i = G;
		te(e);
		let a = r(n(t.shots, e, c));
		W.current.time = a[i], re(a[i]), he((e) => ({
			index: i,
			offset: 0,
			epoch: e.epoch + 1
		}));
	}, be = ee(() => {
		!B && z >= I - 2 && Q(0), pe(null), ae((e) => !e);
	}, [
		B,
		z,
		I,
		Q
	]);
	w(() => {
		let e = (e) => {
			e.target.tagName !== "SELECT" && (e.key === " " ? (e.preventDefault(), be()) : e.key === "ArrowRight" ? Q(W.current.time + 1e4) : e.key === "ArrowLeft" ? Q(W.current.time - 1e4) : e.key === "." ? Q(F[Math.min(G + 1, t.shots.length - 1)]) : e.key === "," ? Q(F[Math.max(G - 1, 0)]) : e.key === "c" && le((e) => !e));
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [
		be,
		Q,
		F,
		G,
		t.shots.length
	]);
	let xe = Y[N], Se = Z ? Math.min(1, K / Z.ms) : Math.min(1, K / P[G]), Ce = S(p(xe), Se), $ = [...L].reverse().find((e) => e.start <= z);
	w(() => {
		let e = ge.current, t = e?.querySelector("button.on");
		e && t && e.scrollWidth > e.clientWidth && e.scrollTo({
			left: t.offsetLeft - e.clientWidth / 2 + t.clientWidth / 2,
			behavior: "smooth"
		});
	}, [$?.id]);
	let we = H ? t.shots.map((e, t) => ({
		s: e,
		i: t
	})).filter(({ s: e }) => e.focus.includes(H)) : [], Te = H && (X.kind === "c4" ? X.elements.find((e) => e.id === H)?.label : X.participants.find((e) => e.id === H)?.label), Ee = !Y.card && X.kind === "c4" && X.legend?.length ? /* @__PURE__ */ A("div", {
		className: "legend",
		"aria-label": "Legend",
		children: X.legend.map((e) => /* @__PURE__ */ j("span", {
			style: { color: v[e.style].stroke },
			children: [/* @__PURE__ */ A("svg", {
				viewBox: "0 0 34 8",
				"aria-hidden": "true",
				children: /* @__PURE__ */ A("line", {
					x1: "0",
					y1: "4",
					x2: "34",
					y2: "4",
					stroke: v[e.style].stroke,
					strokeWidth: "2",
					strokeDasharray: v[e.style].dash || void 0
				})
			}), e.label]
		}, e.label))
	}) : null, De = u && $ && o.has($.id) ? u.links : [], Oe = Y.card ? /* @__PURE__ */ A(ne, {
		card: Y.card,
		shotMs: P[G],
		offsetMs: M ? K : J.index === G ? J.offset : 0,
		playing: B,
		epoch: J.epoch * 1e3 + G
	}) : /* @__PURE__ */ A(ce, {
		diagram: X,
		layout: l[X.id],
		portraitLayout: l[`${X.id}${C}`],
		epoch: J.epoch,
		shot: Y,
		shotMs: P[G],
		offsetMs: J.index === G ? J.offset : 0,
		scrubMs: M ? K : void 0,
		view: M ? y : void 0,
		playing: B,
		selected: H,
		onSelect: (e) => {
			B || pe((t) => t === e ? null : e);
		}
	}, X.id), ke = !B && H ? /* @__PURE__ */ j("aside", {
		className: "explore",
		onClick: (e) => e.stopPropagation(),
		children: [/* @__PURE__ */ A("strong", { children: Te }), we.length ? /* @__PURE__ */ j(k, { children: [/* @__PURE__ */ A("span", { children: "Explained in:" }), we.map(({ s: t, i: n }) => /* @__PURE__ */ j("button", {
			onClick: () => Q(F[n]),
			children: [
				e(F[n]),
				" · ",
				t[N].slice(0, 70),
				"…"
			]
		}, t.id))] }) : /* @__PURE__ */ A("span", { children: "Not the focus of any shot in this walkthrough." })]
	}) : null, Ae = M ? null : /* @__PURE__ */ A("audio", {
		ref: U,
		preload: "auto"
	});
	return T ? /* @__PURE__ */ j(k, { children: [/* @__PURE__ */ A(de, {
		w: t,
		nav: u,
		stage: Oe,
		depth: N,
		onDepth: ye,
		time: z,
		total: I,
		playing: B,
		toggle: be,
		seek: Q,
		chapters: L,
		text: xe,
		spoken: Se,
		captions: se,
		setCaptions: le,
		speed: V,
		setSpeed: oe,
		explore: ke,
		clip: M
	}), Ae] }) : /* @__PURE__ */ j("div", {
		className: `player${M ? " is-clip" : ""}`,
		children: [
			/* @__PURE__ */ j("header", {
				className: "player-head",
				children: [/* @__PURE__ */ j("div", { children: [/* @__PURE__ */ A("h1", { children: t.title }), /* @__PURE__ */ j("p", { children: [
					$?.title,
					" · ",
					Y.card ? Y.card.heading : X.title
				] })] }), /* @__PURE__ */ A("div", {
					className: "depth",
					role: "group",
					"aria-label": "Depth",
					children: ["executive", "engineer"].map((e) => /* @__PURE__ */ A("button", {
						className: e === N ? "on" : "",
						onClick: () => ye(e),
						children: e === "engineer" ? "Engineer" : "Executive"
					}, e))
				})]
			}),
			/* @__PURE__ */ j("div", {
				className: "stage",
				onClick: () => B ? be() : void 0,
				children: [
					Oe,
					Ee,
					se && Ce ? /* @__PURE__ */ A("div", {
						className: "subtitle",
						children: Ce
					}) : null,
					!B && !M ? /* @__PURE__ */ A("button", {
						className: "big-play",
						onClick: be,
						"aria-label": z > 0 ? "Resume" : "Play",
						children: "▶"
					}) : null,
					ke,
					!B && !M && !H && z > 0 && !Y.card ? /* @__PURE__ */ A("div", {
						className: "hint",
						children: "Paused · click any part of the diagram to explore it"
					}) : null
				]
			}),
			De.length && !M ? /* @__PURE__ */ j("div", {
				className: "topic-chips",
				children: [/* @__PURE__ */ A("span", { children: $?.id === "patterns" ? "Watch the patterns" : "Watch next" }), De.map((e) => /* @__PURE__ */ j("a", {
					href: a(e),
					onClick: (t) => {
						t.preventDefault(), u?.open(a(e));
					},
					children: [e.title, " ›"]
				}, e.id))]
			}) : null,
			M ? null : /* @__PURE__ */ j(k, { children: [/* @__PURE__ */ j("div", {
				className: "controls",
				children: [
					/* @__PURE__ */ A("button", {
						onClick: be,
						"aria-label": B ? "Pause" : "Play",
						children: B ? "❚❚" : "▶"
					}),
					/* @__PURE__ */ A("button", {
						onClick: () => Q(F[Math.max(G - 1, 0)]),
						"aria-label": "Previous shot",
						children: "⏮"
					}),
					/* @__PURE__ */ A("button", {
						className: "skip10",
						onClick: () => Q(z - 1e4),
						"aria-label": "Back 10 seconds",
						children: "−10"
					}),
					/* @__PURE__ */ A("button", {
						className: "skip10",
						onClick: () => Q(z + 1e4),
						"aria-label": "Forward 10 seconds",
						children: "+10"
					}),
					/* @__PURE__ */ A("button", {
						onClick: () => Q(F[Math.min(G + 1, t.shots.length - 1)]),
						"aria-label": "Next shot",
						children: "⏭"
					}),
					/* @__PURE__ */ j("div", {
						className: "scrub",
						children: [/* @__PURE__ */ A("input", {
							type: "range",
							min: 0,
							max: I,
							step: 100,
							value: z,
							onChange: (e) => Q(Number(e.target.value)),
							"aria-label": "Position"
						}), L.map((e) => /* @__PURE__ */ A("button", {
							className: "mark",
							style: { left: `${e.start / I * 100}%` },
							title: e.title,
							onClick: () => Q(e.start)
						}, e.id))]
					}),
					/* @__PURE__ */ j("span", {
						className: "time",
						children: [
							e(z),
							" / ",
							e(I)
						]
					}),
					/* @__PURE__ */ A("select", {
						value: V,
						onChange: (e) => oe(Number(e.target.value)),
						"aria-label": "Speed",
						children: fe.map((e) => /* @__PURE__ */ j("option", {
							value: e,
							children: [e, "×"]
						}, e))
					}),
					/* @__PURE__ */ A("button", {
						className: se ? "on" : "",
						onClick: () => le((e) => !e),
						"aria-label": "Subtitles",
						children: "CC"
					})
				]
			}), /* @__PURE__ */ A("nav", {
				className: "chapters",
				ref: ge,
				children: L.map((t) => /* @__PURE__ */ j("button", {
					className: $?.id === t.id ? "on" : "",
					onClick: () => Q(t.start),
					children: [
						/* @__PURE__ */ A("span", { children: e(t.start) }),
						" ",
						t.title
					]
				}, t.id))
			})] }),
			Ae
		]
	});
}
//#endregion
//#region src/views.tsx
var me = "design-player.autoplay";
function he(e) {
	/\/(p|c)\/[\w-]+/.test(e) && sessionStorage.setItem(me, "1"), location.assign(e);
}
function U({ catalog: e, open: t = he, initialTab: n, heading: r, intro: i }) {
	let [a, o] = O({});
	return w(() => o(h()), []), /* @__PURE__ */ A(F, {
		catalog: e,
		progress: a,
		open: t,
		initialTab: n,
		heading: r,
		intro: i
	});
}
function ge({ catalog: e, walkthrough: t, layouts: n, manifest: r, chapter: i, open: a = he, library: o = () => a(u()), autoplay: s }) {
	let c = t.id, l = ue(), [f, p] = O(null), [m, g] = O(!1);
	w(() => {
		p(h()), g(sessionStorage.getItem(me) === "1"), sessionStorage.removeItem(me);
	}, [c]);
	let v = E(() => {
		let { groups: t, next: n } = b(e, c, f ?? {});
		return {
			groups: t,
			next: n,
			links: _(e, c),
			open: a,
			library: o
		};
	}, [
		e,
		c,
		f,
		a,
		o
	]), y = ee((e, t) => d(c, e, t), [c]);
	return f ? /* @__PURE__ */ j(k, { children: [l ? null : /* @__PURE__ */ A("nav", {
		className: "topbar",
		children: /* @__PURE__ */ A("a", {
			href: u(),
			onClick: (e) => {
				e.preventDefault(), o();
			},
			children: "← Library"
		})
	}), /* @__PURE__ */ A(pe, {
		walkthrough: t,
		manifest: r,
		layouts: n,
		nav: v,
		autoplay: s ?? m,
		startAt: f[c]?.t ?? 0,
		startChapter: i,
		onProgress: y
	}, c)] }) : /* @__PURE__ */ A("div", {
		className: "loading",
		children: "Loading…"
	});
}
//#endregion
//#region src/lib/react.tsx
var W = (e) => /* @__PURE__ */ A("div", {
	className: "dp",
	children: /* @__PURE__ */ A(pe, { ...e })
}), G = (e) => /* @__PURE__ */ A("div", {
	className: "dp",
	children: /* @__PURE__ */ A(F, { ...e })
}), K = (e) => /* @__PURE__ */ A("div", {
	className: "dp",
	children: /* @__PURE__ */ A(U, { ...e })
}), q = (e) => /* @__PURE__ */ A("div", {
	className: "dp",
	children: /* @__PURE__ */ A(ge, { ...e })
}), J = (e) => /* @__PURE__ */ A("div", {
	className: "dp",
	style: {
		width: "100%",
		height: "100%",
		background: "transparent"
	},
	children: /* @__PURE__ */ A(ce, { ...e })
});
//#endregion
export { J as DiagramStage, G as Library, K as LibraryPage, W as Player, q as TopicPage, ue as useWatchMode };
