import { C as e, D as t, E as n, O as r, S as i, _ as a, a as o, b as s, c, d as l, f as u, g as d, i as f, k as p, l as m, m as h, o as g, p as _, t as v, u as y, v as b, w as x, x as S } from "./svg-2uUk2eb6.js";
import { t as ee } from "./keys-BT7tChre.js";
import { useCallback as te, useEffect as C, useLayoutEffect as w, useMemo as T, useRef as E, useState as D } from "react";
import { Fragment as O, jsx as k, jsxs as A } from "react/jsx-runtime";
import { gsap as j } from "gsap";
import { DrawSVGPlugin as M } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin as ne } from "gsap/MotionPathPlugin";
//#region src/Library.tsx
var N = {
	patterns: "pattern",
	companies: "company"
};
function P({ catalog: t, progress: n, open: r, initialTab: i, heading: o = "The library", intro: s = "Design patterns explained through the problems they solve, and how leading digital companies built their systems." }) {
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
	].filter((e) => e.count > 0 || e.id === "patterns"), [d, f] = D(() => l.some((e) => e.id === i) ? i : "patterns"), [p, h] = D("All"), [g, _] = D(""), v = (e) => {
		f(e), h("All"), history.replaceState(null, "", u(e));
	}, y = T(() => d === "paths" ? [] : t.topics.filter((e) => (e.meta?.kind ?? "pattern") === N[d]), [t, d]), b = ["All", ...new Set(y.map((e) => e.meta?.category ?? "Other"))], x = g.trim().toLowerCase(), S = x ? t.topics.filter((e) => !x || [
		e.title,
		e.subtitle,
		e.meta?.blurb,
		e.meta?.category,
		...e.chapters.map((e) => e.title)
	].join(" ").toLowerCase().includes(x)) : y.filter((e) => p === "All" || (e.meta?.category ?? "Other") === p), ee = t.topics.filter((e) => m(n[e.id]) > .02 && !c(n[e.id])).sort((e, t) => n[t.id].at - n[e.id].at).slice(0, 6);
	return /* @__PURE__ */ A("div", {
		className: "library",
		children: [
			/* @__PURE__ */ A("header", {
				className: "lib-head",
				children: [
					/* @__PURE__ */ k("h1", { children: o }),
					/* @__PURE__ */ k("p", { children: s }),
					/* @__PURE__ */ A("label", {
						className: "lib-search",
						children: [/* @__PURE__ */ A("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: [/* @__PURE__ */ k("circle", {
								cx: "11",
								cy: "11",
								r: "7"
							}), /* @__PURE__ */ k("path", { d: "M20 20l-3.5-3.5" })]
						}), /* @__PURE__ */ k("input", {
							type: "search",
							placeholder: "Search patterns, companies, chapters",
							value: g,
							onChange: (e) => _(e.target.value)
						})]
					})
				]
			}),
			!x && ee.length ? /* @__PURE__ */ A("section", {
				className: "lib-row",
				children: [/* @__PURE__ */ k("h2", { children: "Continue watching" }), /* @__PURE__ */ k("div", {
					className: "lib-rail",
					children: ee.map((e) => /* @__PURE__ */ k(I, {
						t: e,
						p: n[e.id],
						open: r,
						compact: !0
					}, e.id))
				})]
			}) : null,
			x ? /* @__PURE__ */ A("p", {
				className: "lib-results",
				children: [
					S.length,
					" result",
					S.length === 1 ? "" : "s",
					" for “",
					g.trim(),
					"”"
				]
			}) : /* @__PURE__ */ k("nav", {
				className: "lib-tabs",
				role: "tablist",
				children: l.map((e) => /* @__PURE__ */ A("button", {
					role: "tab",
					"aria-selected": d === e.id,
					className: d === e.id ? "on" : "",
					onClick: () => v(e.id),
					children: [
						e.label,
						" ",
						/* @__PURE__ */ k("span", { children: e.count })
					]
				}, e.id))
			}),
			!x && d !== "paths" && b.length > 2 ? /* @__PURE__ */ k("div", {
				className: "lib-chips",
				children: b.map((e) => /* @__PURE__ */ k("button", {
					className: e === p ? "on" : "",
					onClick: () => h(e),
					children: e
				}, e))
			}) : null,
			!x && d === "paths" ? /* @__PURE__ */ k("div", {
				className: "lib-paths",
				children: t.paths.map((i) => {
					let o = i.steps.filter((e) => c(n[e])).length;
					return /* @__PURE__ */ A("section", {
						className: "lib-path",
						children: [/* @__PURE__ */ A("header", { children: [
							/* @__PURE__ */ k("h2", { children: i.title }),
							/* @__PURE__ */ k("p", { children: i.blurb }),
							/* @__PURE__ */ A("span", { children: [
								o,
								" of ",
								i.steps.length,
								" watched"
							] })
						] }), /* @__PURE__ */ k("ol", { children: i.steps.map((i, o) => {
							let s = t.topics.find((e) => e.id === i), l = n[i];
							return /* @__PURE__ */ A("li", {
								className: s ? c(l) ? "done" : "" : "soon",
								children: [/* @__PURE__ */ k("b", { children: c(l) ? "✓" : o + 1 }), s ? /* @__PURE__ */ A("a", {
									href: a(s),
									onClick: (e) => {
										e.preventDefault(), r(a(s));
									},
									children: [/* @__PURE__ */ k("span", { children: s.title }), /* @__PURE__ */ A("small", { children: [
										F(s.meta?.level ?? ""),
										" · ",
										e(s.ms.engineer),
										m(l) > .02 && !c(l) ? ` · ${Math.round(m(l) * 100)}% watched` : ""
									] })]
								}) : /* @__PURE__ */ A("span", { children: [i.replace(/-/g, " "), /* @__PURE__ */ k("small", { children: "coming soon" })] })]
							}, i);
						}) })]
					}, i.id);
				})
			}) : /* @__PURE__ */ A("div", {
				className: "lib-grid",
				children: [S.map((e) => /* @__PURE__ */ k(I, {
					t: e,
					p: n[e.id],
					open: r
				}, e.id)), S.length ? null : /* @__PURE__ */ k("p", {
					className: "lib-empty",
					children: "Nothing here yet."
				})]
			})
		]
	});
}
var F = (e) => e.charAt(0).toUpperCase() + e.slice(1);
function I({ t, p: n, open: r, compact: i }) {
	let o = m(n), s = a(t);
	return /* @__PURE__ */ A("a", {
		className: `lib-tile${i ? " compact" : ""}`,
		href: s,
		onClick: (e) => {
			e.preventDefault(), r(s);
		},
		children: [/* @__PURE__ */ A("div", {
			className: "lib-thumb",
			children: [
				/* @__PURE__ */ k("img", {
					src: g(`/thumbs/${t.id}.svg`),
					alt: "",
					loading: "lazy"
				}),
				y(t) ? /* @__PURE__ */ k("em", {
					className: "new",
					children: "New"
				}) : l(t) ? /* @__PURE__ */ k("em", {
					className: "upd",
					children: "Updated"
				}) : null,
				t.ms.engineer ? /* @__PURE__ */ k("span", {
					className: "dur",
					children: e(t.ms.engineer)
				}) : null,
				o > .02 ? /* @__PURE__ */ k("i", { style: { width: `${o * 100}%` } }) : null
			]
		}), /* @__PURE__ */ A("div", {
			className: "lib-meta",
			children: [
				/* @__PURE__ */ A("small", { children: [t.meta?.category ?? t.subtitle, t.meta?.level ? ` · ${t.meta.level}` : ""] }),
				/* @__PURE__ */ k("b", { children: t.title }),
				!i && t.meta?.blurb ? /* @__PURE__ */ k("p", { children: t.meta.blurb }) : null
			]
		})]
	});
}
//#endregion
//#region src/CardStage.tsx
function re({ card: e, shotMs: t, offsetMs: n, playing: r, epoch: i }) {
	let a = e.kind ?? "points", o = a === "compare" ? e.points.slice(1) : e.points, s = t * .75 / Math.max(o.length, 1), c = (e) => ({
		animationDelay: `${e * s - n}ms`,
		animationPlayState: r ? "running" : "paused"
	}), l = (e) => e.split("|").map((e) => e.trim());
	return /* @__PURE__ */ A("div", {
		className: `card-stage is-${a}`,
		children: [/* @__PURE__ */ k("h2", { children: e.heading }), a === "numbers" ? /* @__PURE__ */ k("div", {
			className: "card-numbers",
			children: o.map((e, t) => {
				let [n, r] = l(e);
				return /* @__PURE__ */ A("div", {
					className: "card-in",
					style: c(t),
					children: [/* @__PURE__ */ k("b", { children: n }), /* @__PURE__ */ k("span", { children: r })]
				}, e);
			})
		}) : a === "compare" ? /* @__PURE__ */ A("table", {
			className: "card-compare",
			children: [/* @__PURE__ */ k("thead", { children: /* @__PURE__ */ k("tr", { children: l(e.points[0]).map((e) => /* @__PURE__ */ k("th", { children: e }, e)) }) }), /* @__PURE__ */ k("tbody", { children: o.map((e, t) => /* @__PURE__ */ k("tr", {
				className: "card-in",
				style: c(t),
				children: l(e).map((e, t) => /* @__PURE__ */ k("td", { children: e }, t))
			}, e)) })]
		}) : /* @__PURE__ */ k("ul", {
			className: "card-points",
			children: o.map((e, t) => /* @__PURE__ */ k("li", {
				className: "card-in",
				style: c(t),
				children: e
			}, e))
		})]
	}, i);
}
//#endregion
//#region src/DiagramStage.tsx
j.registerPlugin(M, ne);
var L = 16, ie = .2, ae = .72, oe = .9, R = (e) => `${e.x.toFixed(1)} ${e.y.toFixed(1)} ${e.w.toFixed(1)} ${e.h.toFixed(1)}`;
function z(e, t, n) {
	let r = t.width + 32, i = t.height + 32, a = n.w / n.h, o = Math.max(e.w + 120, (e.h + 100) * a);
	o = Math.min(o, n.w / ae), o = Math.max(o, n.w / oe);
	let s = o / a, c = e.x + e.w / 2 + L, l = e.y + e.h / 2 + L;
	return {
		x: o >= r ? (r - o) / 2 : Math.min(Math.max(0, c - o / 2), r - o),
		y: s >= i ? (i - s) / 2 : Math.min(Math.max(0, l - s / 2), i - s),
		w: o,
		h: s
	};
}
function B(e) {
	let t = Math.min(...e.map((e) => e.x)), n = Math.min(...e.map((e) => e.y)), r = Math.max(...e.map((e) => e.x + e.w)), i = Math.max(...e.map((e) => e.y + e.h));
	return {
		x: t,
		y: n,
		w: r - t,
		h: i - n
	};
}
function se(e, t) {
	let n = (e.kind === "c4" ? e.edges : e.messages).filter((e) => t.trace.includes(e.id));
	return /* @__PURE__ */ new Set([...t.focus, ...n.flatMap((e) => [e.from, e.to])]);
}
function ce(e, t, n) {
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
	let p = (o + c) / 2 + L, m = (s + l) / 2 + L, h = Math.min(Math.max(0, p - u / 2), i - u), g = Math.min(Math.max(0, m - d / 2), a - d);
	return `${h.toFixed(1)} ${g.toFixed(1)} ${u.toFixed(1)} ${d.toFixed(1)}`;
}
function le({ diagram: e, layout: t, portraitLayout: n, epoch: r, shot: i, shotMs: a, offsetMs: o, scrubMs: s, playing: c, onSelect: l, selected: u, view: d }) {
	let p = E(null), m = E(null), [h, g] = D(null);
	w(() => {
		let e = p.current;
		if (!e) return;
		let t = () => {
			let t = e.getBoundingClientRect();
			t.width && t.height && g((e) => e && Math.abs(e.w - t.width) < 2 && Math.abs(e.h - t.height) < 2 ? e : {
				w: t.width,
				h: t.height
			});
		};
		t();
		let n = new ResizeObserver(t);
		return n.observe(e), () => n.disconnect();
	}, []);
	let _ = h && n && h.h > h.w * .9 ? n : t, y = T(() => f(e, _, { pad: L }), [e, _]), b = d !== void 0, x = !b && !!h && Math.min(h.w / (_.width + 32), h.h / (_.height + 32)) < ae;
	return w(() => {
		let t = p.current?.querySelector("svg");
		if (!t || !h) return;
		let n = se(e, i), r = n.size > 0, s = t.querySelectorAll(".dg-node, .dg-edge, .dg-group, .dg-lifeline"), l = t.querySelectorAll(".dg-edge-label");
		t.querySelectorAll(".dg-pulse").forEach((e) => e.remove());
		{
			let e = j.timeline({ paused: !0 }), o = (e) => _.nodes[e], c = (e) => {
				let t = _.edges[e]?.points ?? [];
				return t.length ? B(t.map((e) => ({
					x: e.x,
					y: e.y,
					w: 1,
					h: 1
				}))) : null;
			};
			if (b) t.setAttribute("preserveAspectRatio", "xMidYMid meet");
			else if (!x) e.to(t, {
				attr: { viewBox: ce(_, n, i.trace) },
				duration: 1.3,
				ease: "power2.inOut"
			}, 0);
			else {
				t.setAttribute("preserveAspectRatio", "xMidYMid meet");
				let r = i.trace.length ? c(i.trace[0]) : null, a = [...n].map(o).filter(Boolean), s = r ?? (a.length ? B(a) : null), l = {
					x: 0,
					y: 0,
					w: _.width,
					h: _.height
				}, u = s ? z(s, _, h) : z(l, _, {
					w: h.w,
					h: h.h
				}), d = Math.max((_.width + 32) / h.w, (_.height + 32) / h.h), f = {
					x: (_.width + 32 - h.w * d) / 2,
					y: (_.height + 32 - h.h * d) / 2,
					w: h.w * d,
					h: h.h * d
				};
				e.to(t, {
					attr: { viewBox: R(s ? u : f) },
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
				opacity: ie,
				duration: .6,
				ease: "power1.out"
			}, 0), p.length && e.to(p, {
				opacity: 1,
				duration: .6,
				ease: "power1.out"
			}, 0);
			let g = i.trace.length ? Math.max(1.1, (a / 1e3 - 1.2) / i.trace.length) : 0;
			i.trace.forEach((n, r) => {
				let i = t.querySelector(`.dg-edge[data-edge="${CSS.escape(n)}"]`), a = i?.querySelector("path");
				if (!i || !a) return;
				let o = .5 + r * g, s = Math.min(.9, g * .7);
				if (x && r > 0) {
					let r = c(n);
					if (r) {
						let i = _.edges[n].points, a = i[0], c = i[i.length - 1], l = z(r, _, h), u = l.w >= r.w + 60 && l.h >= r.h + 60, d = u ? l : z({
							x: a.x - 40,
							y: a.y - 40,
							w: 80,
							h: 80
						}, _, h);
						e.to(t, {
							attr: { viewBox: R(d) },
							duration: Math.min(.7, g * .35),
							ease: "power2.inOut"
						}, o - Math.min(.7, g * .35)), u || e.to(t, {
							attr: { viewBox: R(z({
								x: c.x - 40,
								y: c.y - 40,
								w: 80,
								h: 80
							}, _, h)) },
							duration: s,
							ease: "power1.inOut"
						}, o);
					}
				} else if (x && r === 0) {
					let r = _.edges[n]?.points ?? [], i = c(n);
					if (i && r.length) {
						let n = z(i, _, h);
						if (!(n.w >= i.w + 60 && n.h >= i.h + 60)) {
							let n = r[0], i = r[r.length - 1];
							e.to(t, {
								attr: { viewBox: R(z({
									x: n.x - 40,
									y: n.y - 40,
									w: 80,
									h: 80
								}, _, h)) },
								duration: .5,
								ease: "power2.inOut"
							}, Math.max(0, o - .5)), e.to(t, {
								attr: { viewBox: R(z({
									x: i.x - 40,
									y: i.y - 40,
									w: 80,
									h: 80
								}, _, h)) },
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
			}), e.set({}, {}, Math.max(a / 1e3, e.duration())), m.current = e;
		}
		return m.current?.time(Math.max(0, o) / 1e3), c && m.current?.play(), () => {
			m.current?.kill(), m.current = null;
		};
	}, [
		y,
		i,
		a,
		o,
		r,
		h,
		x,
		b
	]), w(() => {
		d && p.current?.querySelector("svg")?.setAttribute("viewBox", d);
	}, [
		d,
		y,
		h
	]), w(() => {
		m.current && (c ? m.current.play() : m.current.pause());
	}, [c]), w(() => {
		s !== void 0 && m.current?.time(s / 1e3);
	}, [s]), w(() => {
		let e = p.current?.querySelector("svg");
		e?.querySelectorAll(".dg-node.is-selected").forEach((e) => e.classList.remove("is-selected")), u && e?.querySelector(`.dg-node[data-node="${CSS.escape(u)}"]`)?.classList.add("is-selected");
	}, [u, y]), /* @__PURE__ */ k("div", {
		ref: p,
		className: "stage-svg",
		onClick: (e) => {
			let t = e.target.closest(".dg-node");
			t?.dataset.node && l(t.dataset.node);
		},
		dangerouslySetInnerHTML: { __html: y }
	});
}
//#endregion
//#region src/Watch.tsx
var V = [
	1,
	1.25,
	1.5,
	2,
	.75
], H = "(max-width: 700px), (max-height: 500px) and (orientation: landscape)";
function ue() {
	let e = typeof window < "u", t = e && new URLSearchParams(location.search).get("watch") === "1", [n, r] = D(() => e && (t || matchMedia(H).matches));
	return C(() => {
		if (t || !e) return;
		let n = matchMedia(H);
		r(n.matches);
		let i = () => r(n.matches);
		return n.addEventListener("change", i), () => n.removeEventListener("change", i);
	}, [t, e]), n;
}
function de(n) {
	let { w: r, chapters: i, time: s, total: c } = n, [l, u] = D(null), d = E(null), f = Math.max(0, i.findLastIndex((e) => e.start <= s)), m = i[f], h = n.nav?.next, _ = (e) => n.nav?.open(a(e)), v = s > 0 || n.playing || !!n.clip, y = !n.playing && !n.clip && s >= c - 2;
	C(() => {
		let e = d.current, t = e?.querySelector(".on");
		e && t && e.scrollTo({
			left: t.offsetLeft - e.clientWidth / 2 + t.clientWidth / 2,
			behavior: "smooth"
		});
	}, [f]);
	let b = (e) => {
		e >= i.length ? h && h.id !== r.id && _(h) : n.seek(i[Math.max(0, e)].start + 1);
	}, x = E(null), S = (e) => {
		x.current = {
			x: e.clientX,
			y: e.clientY,
			t: performance.now()
		};
	}, ee = (e) => {
		let t = x.current;
		if (x.current = null, !t) return;
		let r = e.clientX - t.x, i = e.clientY - t.y;
		Math.abs(i) > 60 && Math.abs(i) > Math.abs(r) * 1.3 ? b(i < 0 ? f + 1 : f - 1) : Math.hypot(r, i) < 10 && performance.now() - t.t < 400 && (n.playing || !e.target.closest(".dg-node")) && n.toggle();
	}, { words: te, said: w } = t(p(n.text), n.spoken), T = m ? `${f + 1} · ${m.title}` : r.subtitle ?? "";
	return /* @__PURE__ */ A("div", {
		className: `watch${n.clip ? " is-clip" : ""}`,
		children: [
			/* @__PURE__ */ k("div", {
				className: "w-stage",
				onPointerDown: S,
				onPointerUp: ee,
				children: /* @__PURE__ */ k("div", {
					className: `w-canvas${v ? "" : " dim"}`,
					children: n.stage
				})
			}),
			/* @__PURE__ */ A("header", {
				className: "w-top",
				children: [/* @__PURE__ */ A("button", {
					className: "w-title",
					onClick: () => u("next"),
					"aria-label": "What next",
					children: [/* @__PURE__ */ A("b", { children: [/* @__PURE__ */ k("em", { children: r.title }), /* @__PURE__ */ k("svg", {
						viewBox: "0 0 24 24",
						"aria-hidden": "true",
						children: /* @__PURE__ */ k("path", { d: "M6 9l6 6 6-6" })
					})] }), /* @__PURE__ */ k("span", { children: v ? T : r.subtitle })]
				}), n.clip ? null : /* @__PURE__ */ A("button", {
					className: "w-pill",
					onClick: () => n.onDepth(n.depth === "engineer" ? "executive" : "engineer"),
					"aria-label": "Switch depth",
					children: [
						n.depth === "engineer" ? "Engineer" : "Executive",
						" ",
						/* @__PURE__ */ k("span", { children: "⇄" })
					]
				})]
			}),
			v ? y ? /* @__PURE__ */ A("div", {
				className: "w-intro",
				children: [
					/* @__PURE__ */ k("span", {
						className: "w-eyebrow",
						children: "Up next"
					}),
					/* @__PURE__ */ k("h1", { children: h?.title }),
					/* @__PURE__ */ k("button", {
						className: "w-play",
						onClick: () => h && _(h),
						"aria-label": "Play next topic",
						children: /* @__PURE__ */ k("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ k("path", { d: "M8 5.5v13l11-6.5z" })
						})
					}),
					/* @__PURE__ */ k("button", {
						className: "w-link",
						onClick: () => n.seek(0),
						children: "Watch again"
					})
				]
			}) : !n.playing && !n.clip ? /* @__PURE__ */ A("div", {
				className: "w-paused",
				children: [
					/* @__PURE__ */ k("button", {
						className: "w-icon",
						onClick: () => b(f - 1),
						"aria-label": "Previous chapter",
						children: /* @__PURE__ */ k("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ k("path", { d: "M7 6v12M18 6l-8 6 8 6z" })
						})
					}),
					/* @__PURE__ */ k("button", {
						className: "w-icon",
						onClick: () => n.seek(s - 1e4),
						"aria-label": "Back 10 seconds",
						children: "−10"
					}),
					/* @__PURE__ */ k("button", {
						className: "w-play",
						onClick: n.toggle,
						"aria-label": "Resume",
						children: /* @__PURE__ */ k("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ k("path", { d: "M8 5.5v13l11-6.5z" })
						})
					}),
					/* @__PURE__ */ k("button", {
						className: "w-icon",
						onClick: () => n.seek(s + 1e4),
						"aria-label": "Forward 10 seconds",
						children: "+10"
					}),
					/* @__PURE__ */ k("button", {
						className: "w-icon",
						onClick: () => b(f + 1),
						"aria-label": "Next chapter",
						children: /* @__PURE__ */ k("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ k("path", { d: "M17 6v12M6 6l8 6-8 6z" })
						})
					})
				]
			}) : null : /* @__PURE__ */ A("div", {
				className: "w-intro",
				children: [
					/* @__PURE__ */ k("span", {
						className: "w-eyebrow",
						children: r.subtitle ?? "Walkthrough"
					}),
					/* @__PURE__ */ k("h1", { children: r.title }),
					/* @__PURE__ */ A("p", { children: [
						i.length,
						" chapters · ",
						e(c)
					] }),
					/* @__PURE__ */ k("button", {
						className: "w-play",
						onClick: n.toggle,
						"aria-label": "Play",
						children: /* @__PURE__ */ k("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ k("path", { d: "M8 5.5v13l11-6.5z" })
						})
					}),
					/* @__PURE__ */ k("small", { children: "Tap to play with sound · swipe up for the next chapter" })
				]
			}),
			/* @__PURE__ */ A("div", {
				className: "w-bottom",
				children: [
					v && !y && !n.clip && m && o.has(m.id) && n.nav?.links.length ? /* @__PURE__ */ k("div", {
						className: "w-chips",
						children: n.nav.links.map((e) => /* @__PURE__ */ A("button", {
							onClick: () => _(e),
							children: [e.title, " ›"]
						}, e.id))
					}) : null,
					v && n.captions && !y ? /* @__PURE__ */ A("div", {
						className: "w-caption",
						"aria-live": "off",
						children: [/* @__PURE__ */ k("span", {
							className: "w-eyebrow",
							children: T
						}), /* @__PURE__ */ k("p", { children: te.map((e, t) => /* @__PURE__ */ A("span", {
							className: t < w ? "said" : "",
							children: [e, " "]
						}, t)) })]
					}) : null,
					/* @__PURE__ */ k("div", {
						className: "w-strip",
						ref: d,
						children: i.map((e, t) => /* @__PURE__ */ A("button", {
							className: t === f ? "on" : t < f ? "done" : "",
							onClick: () => n.seek(e.start + 1),
							children: [/* @__PURE__ */ k("b", { children: t + 1 }), /* @__PURE__ */ k("span", { children: e.title })]
						}, e.id))
					}),
					/* @__PURE__ */ A("div", {
						className: "w-progress",
						children: [i.map((e, t) => {
							let n = i[t + 1]?.start ?? c, r = Math.min(1, Math.max(0, (s - e.start) / (n - e.start)));
							return /* @__PURE__ */ k("span", {
								style: { flexGrow: n - e.start },
								children: /* @__PURE__ */ k("i", { style: { width: `${r * 100}%` } })
							}, e.id);
						}), /* @__PURE__ */ k("input", {
							type: "range",
							min: 0,
							max: c,
							step: 100,
							value: s,
							onChange: (e) => n.seek(Number(e.target.value)),
							"aria-label": "Position"
						})]
					}),
					n.clip ? null : /* @__PURE__ */ A("div", {
						className: "w-bar",
						children: [
							/* @__PURE__ */ k("button", {
								className: "w-icon",
								onClick: n.toggle,
								"aria-label": n.playing ? "Pause" : "Play",
								children: n.playing ? /* @__PURE__ */ k("svg", {
									viewBox: "0 0 24 24",
									"aria-hidden": "true",
									children: /* @__PURE__ */ k("path", { d: "M8 5v14M16 5v14" })
								}) : /* @__PURE__ */ k("svg", {
									viewBox: "0 0 24 24",
									"aria-hidden": "true",
									className: "fill",
									children: /* @__PURE__ */ k("path", { d: "M8 5.5v13l11-6.5z" })
								})
							}),
							/* @__PURE__ */ A("span", {
								className: "w-time",
								children: [
									e(s),
									" / ",
									e(c)
								]
							}),
							/* @__PURE__ */ k("button", {
								className: "w-icon",
								onClick: () => u("chapters"),
								"aria-label": "Chapters",
								children: /* @__PURE__ */ k("svg", {
									viewBox: "0 0 24 24",
									"aria-hidden": "true",
									children: /* @__PURE__ */ k("path", { d: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" })
								})
							}),
							/* @__PURE__ */ k("button", {
								className: `w-icon w-cc${n.captions ? " on" : ""}`,
								onClick: () => n.setCaptions((e) => !e),
								"aria-label": "Subtitles",
								children: "CC"
							}),
							/* @__PURE__ */ A("button", {
								className: "w-icon w-speed",
								onClick: () => n.setSpeed(V[(V.indexOf(n.speed) + 1) % V.length]),
								"aria-label": "Speed",
								children: [n.speed, "×"]
							})
						]
					})
				]
			}),
			n.explore,
			l ? /* @__PURE__ */ k("div", {
				className: "w-sheet-back",
				onClick: () => u(null),
				children: /* @__PURE__ */ A("div", {
					className: "w-sheet",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ k("div", { className: "w-grip" }), l === "chapters" ? /* @__PURE__ */ A(O, { children: [/* @__PURE__ */ k("h2", { children: "Chapters" }), i.map((t, r) => /* @__PURE__ */ A("button", {
						className: r === f ? "on" : "",
						onClick: () => {
							n.seek(t.start + 1), u(null);
						},
						children: [
							/* @__PURE__ */ k("b", { children: r + 1 }),
							/* @__PURE__ */ k("span", { children: t.title }),
							/* @__PURE__ */ k("small", { children: e(t.start) })
						]
					}, t.id))] }) : /* @__PURE__ */ A(O, { children: [(n.nav?.groups ?? []).map((t) => /* @__PURE__ */ A("section", { children: [/* @__PURE__ */ k("h2", { children: t.title }), t.items.map(({ topic: t, note: n }) => /* @__PURE__ */ A("button", {
						onClick: () => {
							u(null), _(t);
						},
						children: [/* @__PURE__ */ k("img", {
							src: g(`/thumbs/${t.id}.svg`),
							alt: "",
							loading: "lazy"
						}), /* @__PURE__ */ A("span", { children: [t.title, /* @__PURE__ */ k("small", { children: n ?? [t.meta?.category, e(t.ms.engineer)].filter(Boolean).join(" · ") })] })]
					}, t.id))] }, t.title)), /* @__PURE__ */ k("button", {
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
	let w = ue(), j = _ !== void 0, [M, ne] = D(b), N = T(() => n(t.shots, M, c), [
		t.shots,
		M,
		c
	]), P = T(() => r(N), [N]), F = P[P.length - 1] + N[N.length - 1], I = T(() => s(t, P), [t, P]), [L, ie] = D(0), [ae, oe] = D(d), R = j ? Math.max(0, Math.min(F - 1, _)) : L, z = !j && ae, [B, se] = D(1), [ce, V] = D(!0), [H, pe] = D(null), [me, he] = D({
		index: 0,
		offset: 0,
		epoch: 0
	}), U = E(null), ge = E(null), W = E({
		time: 0,
		last: 0
	}), { index: G, offset: K } = x(R, N), q = E(null);
	j && q.current?.index !== G && (q.current = {
		index: G,
		offset: q.current ? 0 : K
	});
	let J = j && q.current ? {
		...q.current,
		epoch: 0
	} : me, Y = t.shots[G], _e = Y.diagram ?? t.shots.slice(0, G).reverse().find((e) => e.diagram)?.diagram ?? t.diagrams[0].id, X = t.diagrams.find((e) => e.id === _e), Z = c[i(Y, M)], Q = te((e) => {
		let t = Math.max(0, Math.min(F - 1, e));
		W.current.time = t, ie(t);
		let n = x(t, N);
		he((e) => ({
			index: n.index,
			offset: n.offset,
			epoch: e.epoch + 1
		}));
	}, [N, F]);
	C(() => {
		let e = m ? I.find((e) => e.id === m) : void 0, t = e ? e.start + 1 : f > 5e3 && f < F - 5e3 ? f : 0;
		t && Q(t);
	}, []);
	let ve = E(0);
	C(() => {
		h && (Math.abs(R - ve.current) > 3e3 || !z) && (ve.current = R, h(R, F));
	}, [
		R,
		z,
		F,
		h
	]), C(() => {
		let e = U.current;
		if (!e) return;
		if (!Z) {
			e.removeAttribute("src");
			return;
		}
		e.src.endsWith(Z.file) || (e.src = g(Z.file));
		let t = J.index === G ? J.offset : 0;
		t < Z.ms && (e.currentTime = t / 1e3), e.playbackRate = B, z && t < Z.ms && e.play().catch(() => void 0);
	}, [
		G,
		M,
		J.epoch,
		Z?.file
	]), C(() => {
		U.current && (U.current.playbackRate = B);
	}, [B]), C(() => {
		let e = U.current;
		e && Z && (z && K < Z.ms ? e.play().catch(() => void 0) : e.pause());
	}, [z]), C(() => {
		if (!z) return;
		let e = 0;
		W.current.last = performance.now();
		let n = (r) => {
			let a = r - W.current.last;
			W.current.last = r;
			let o = x(W.current.time, N), s = U.current, l = c[i(t.shots[o.index], M)], u;
			u = s && l && s.src.endsWith(l.file) && !s.paused && !s.ended ? P[o.index] + s.currentTime * 1e3 : W.current.time + a * B;
			let d = x(u, N);
			d.index !== o.index && he((e) => ({
				index: d.index,
				offset: 0,
				epoch: e.epoch
			})), u >= F ? (W.current.time = F, ie(F - 1), oe(!1)) : (W.current.time = u, ie(u), e = requestAnimationFrame(n));
		};
		return e = requestAnimationFrame(n), () => cancelAnimationFrame(e);
	}, [
		z,
		N,
		P,
		F,
		B,
		M,
		c,
		t.shots
	]);
	let ye = (e) => {
		if (e === M) return;
		let i = G;
		ne(e);
		let a = r(n(t.shots, e, c));
		W.current.time = a[i], ie(a[i]), he((e) => ({
			index: i,
			offset: 0,
			epoch: e.epoch + 1
		}));
	}, be = te(() => {
		!z && R >= F - 2 && Q(0), pe(null), oe((e) => !e);
	}, [
		z,
		R,
		F,
		Q
	]);
	C(() => {
		let e = (e) => {
			e.target.tagName !== "SELECT" && (e.key === " " ? (e.preventDefault(), be()) : e.key === "ArrowRight" ? Q(W.current.time + 1e4) : e.key === "ArrowLeft" ? Q(W.current.time - 1e4) : e.key === "." ? Q(P[Math.min(G + 1, t.shots.length - 1)]) : e.key === "," ? Q(P[Math.max(G - 1, 0)]) : e.key === "c" && V((e) => !e));
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [
		be,
		Q,
		P,
		G,
		t.shots.length
	]);
	let xe = Y[M], Se = Z ? Math.min(1, K / Z.ms) : Math.min(1, K / N[G]), Ce = S(p(xe), Se), $ = [...I].reverse().find((e) => e.start <= R);
	C(() => {
		let e = ge.current, t = e?.querySelector("button.on");
		e && t && e.scrollWidth > e.clientWidth && e.scrollTo({
			left: t.offsetLeft - e.clientWidth / 2 + t.clientWidth / 2,
			behavior: "smooth"
		});
	}, [$?.id]);
	let we = H ? t.shots.map((e, t) => ({
		s: e,
		i: t
	})).filter(({ s: e }) => e.focus.includes(H)) : [], Te = H && (X.kind === "c4" ? X.elements.find((e) => e.id === H)?.label : X.participants.find((e) => e.id === H)?.label), Ee = !Y.card && X.kind === "c4" && X.legend?.length ? /* @__PURE__ */ k("div", {
		className: "legend",
		"aria-label": "Legend",
		children: X.legend.map((e) => /* @__PURE__ */ A("span", {
			style: { color: v[e.style].stroke },
			children: [/* @__PURE__ */ k("svg", {
				viewBox: "0 0 34 8",
				"aria-hidden": "true",
				children: /* @__PURE__ */ k("line", {
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
	}) : null, De = u && $ && o.has($.id) ? u.links : [], Oe = Y.card ? /* @__PURE__ */ k(re, {
		card: Y.card,
		shotMs: N[G],
		offsetMs: j ? K : J.index === G ? J.offset : 0,
		playing: z,
		epoch: J.epoch * 1e3 + G
	}) : /* @__PURE__ */ k(le, {
		diagram: X,
		layout: l[X.id],
		portraitLayout: l[`${X.id}${ee}`],
		epoch: J.epoch,
		shot: Y,
		shotMs: N[G],
		offsetMs: J.index === G ? J.offset : 0,
		scrubMs: j ? K : void 0,
		view: j ? y : void 0,
		playing: z,
		selected: H,
		onSelect: (e) => {
			z || pe((t) => t === e ? null : e);
		}
	}, X.id), ke = !z && H ? /* @__PURE__ */ A("aside", {
		className: "explore",
		onClick: (e) => e.stopPropagation(),
		children: [/* @__PURE__ */ k("strong", { children: Te }), we.length ? /* @__PURE__ */ A(O, { children: [/* @__PURE__ */ k("span", { children: "Explained in:" }), we.map(({ s: t, i: n }) => /* @__PURE__ */ A("button", {
			onClick: () => Q(P[n]),
			children: [
				e(P[n]),
				" · ",
				t[M].slice(0, 70),
				"…"
			]
		}, t.id))] }) : /* @__PURE__ */ k("span", { children: "Not the focus of any shot in this walkthrough." })]
	}) : null, Ae = j ? null : /* @__PURE__ */ k("audio", {
		ref: U,
		preload: "auto"
	});
	return w ? /* @__PURE__ */ A(O, { children: [/* @__PURE__ */ k(de, {
		w: t,
		nav: u,
		stage: Oe,
		depth: M,
		onDepth: ye,
		time: R,
		total: F,
		playing: z,
		toggle: be,
		seek: Q,
		chapters: I,
		text: xe,
		spoken: Se,
		captions: ce,
		setCaptions: V,
		speed: B,
		setSpeed: se,
		explore: ke,
		clip: j
	}), Ae] }) : /* @__PURE__ */ A("div", {
		className: `player${j ? " is-clip" : ""}`,
		children: [
			/* @__PURE__ */ A("header", {
				className: "player-head",
				children: [/* @__PURE__ */ A("div", { children: [/* @__PURE__ */ k("h1", { children: t.title }), /* @__PURE__ */ A("p", { children: [
					$?.title,
					" · ",
					Y.card ? Y.card.heading : X.title
				] })] }), /* @__PURE__ */ k("div", {
					className: "depth",
					role: "group",
					"aria-label": "Depth",
					children: ["executive", "engineer"].map((e) => /* @__PURE__ */ k("button", {
						className: e === M ? "on" : "",
						onClick: () => ye(e),
						children: e === "engineer" ? "Engineer" : "Executive"
					}, e))
				})]
			}),
			/* @__PURE__ */ A("div", {
				className: "stage",
				onClick: () => z ? be() : void 0,
				children: [
					Oe,
					Ee,
					ce && Ce ? /* @__PURE__ */ k("div", {
						className: "subtitle",
						children: Ce
					}) : null,
					!z && !j ? /* @__PURE__ */ k("button", {
						className: "big-play",
						onClick: be,
						"aria-label": R > 0 ? "Resume" : "Play",
						children: "▶"
					}) : null,
					ke,
					!z && !j && !H && R > 0 && !Y.card ? /* @__PURE__ */ k("div", {
						className: "hint",
						children: "Paused · click any part of the diagram to explore it"
					}) : null
				]
			}),
			De.length && !j ? /* @__PURE__ */ A("div", {
				className: "topic-chips",
				children: [/* @__PURE__ */ k("span", { children: $?.id === "patterns" ? "Watch the patterns" : "Watch next" }), De.map((e) => /* @__PURE__ */ A("a", {
					href: a(e),
					onClick: (t) => {
						t.preventDefault(), u?.open(a(e));
					},
					children: [e.title, " ›"]
				}, e.id))]
			}) : null,
			j ? null : /* @__PURE__ */ A(O, { children: [/* @__PURE__ */ A("div", {
				className: "controls",
				children: [
					/* @__PURE__ */ k("button", {
						onClick: be,
						"aria-label": z ? "Pause" : "Play",
						children: z ? "❚❚" : "▶"
					}),
					/* @__PURE__ */ k("button", {
						onClick: () => Q(P[Math.max(G - 1, 0)]),
						"aria-label": "Previous shot",
						children: "⏮"
					}),
					/* @__PURE__ */ k("button", {
						className: "skip10",
						onClick: () => Q(R - 1e4),
						"aria-label": "Back 10 seconds",
						children: "−10"
					}),
					/* @__PURE__ */ k("button", {
						className: "skip10",
						onClick: () => Q(R + 1e4),
						"aria-label": "Forward 10 seconds",
						children: "+10"
					}),
					/* @__PURE__ */ k("button", {
						onClick: () => Q(P[Math.min(G + 1, t.shots.length - 1)]),
						"aria-label": "Next shot",
						children: "⏭"
					}),
					/* @__PURE__ */ A("div", {
						className: "scrub",
						children: [/* @__PURE__ */ k("input", {
							type: "range",
							min: 0,
							max: F,
							step: 100,
							value: R,
							onChange: (e) => Q(Number(e.target.value)),
							"aria-label": "Position"
						}), I.map((e) => /* @__PURE__ */ k("button", {
							className: "mark",
							style: { left: `${e.start / F * 100}%` },
							title: e.title,
							onClick: () => Q(e.start)
						}, e.id))]
					}),
					/* @__PURE__ */ A("span", {
						className: "time",
						children: [
							e(R),
							" / ",
							e(F)
						]
					}),
					/* @__PURE__ */ k("select", {
						value: B,
						onChange: (e) => se(Number(e.target.value)),
						"aria-label": "Speed",
						children: fe.map((e) => /* @__PURE__ */ A("option", {
							value: e,
							children: [e, "×"]
						}, e))
					}),
					/* @__PURE__ */ k("button", {
						className: ce ? "on" : "",
						onClick: () => V((e) => !e),
						"aria-label": "Subtitles",
						children: "CC"
					})
				]
			}), /* @__PURE__ */ k("nav", {
				className: "chapters",
				ref: ge,
				children: I.map((t) => /* @__PURE__ */ A("button", {
					className: $?.id === t.id ? "on" : "",
					onClick: () => Q(t.start),
					children: [
						/* @__PURE__ */ k("span", { children: e(t.start) }),
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
	let [a, o] = D({});
	return C(() => o(h()), []), /* @__PURE__ */ k(P, {
		catalog: e,
		progress: a,
		open: t,
		initialTab: n,
		heading: r,
		intro: i
	});
}
function ge({ catalog: e, walkthrough: t, layouts: n, manifest: r, chapter: i, open: a = he, library: o = () => a(u()), autoplay: s }) {
	let c = t.id, l = ue(), [f, p] = D(null), [m, g] = D(!1);
	C(() => {
		p(h()), g(sessionStorage.getItem(me) === "1"), sessionStorage.removeItem(me);
	}, [c]);
	let v = T(() => {
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
	]), y = te((e, t) => d(c, e, t), [c]);
	return f ? /* @__PURE__ */ A(O, { children: [l ? null : /* @__PURE__ */ k("nav", {
		className: "topbar",
		children: /* @__PURE__ */ k("a", {
			href: u(),
			onClick: (e) => {
				e.preventDefault(), o();
			},
			children: "← Library"
		})
	}), /* @__PURE__ */ k(pe, {
		walkthrough: t,
		manifest: r,
		layouts: n,
		nav: v,
		autoplay: s ?? m,
		startAt: f[c]?.t ?? 0,
		startChapter: i,
		onProgress: y
	}, c)] }) : /* @__PURE__ */ k("div", {
		className: "loading",
		children: "Loading…"
	});
}
//#endregion
//#region src/lib/react.tsx
var W = (e) => /* @__PURE__ */ k("div", {
	className: "dp",
	children: /* @__PURE__ */ k(pe, { ...e })
}), G = (e) => /* @__PURE__ */ k("div", {
	className: "dp",
	children: /* @__PURE__ */ k(P, { ...e })
}), K = (e) => /* @__PURE__ */ k("div", {
	className: "dp",
	children: /* @__PURE__ */ k(U, { ...e })
}), q = (e) => /* @__PURE__ */ k("div", {
	className: "dp",
	children: /* @__PURE__ */ k(ge, { ...e })
});
//#endregion
export { G as Library, K as LibraryPage, W as Player, q as TopicPage, ue as useWatchMode };
