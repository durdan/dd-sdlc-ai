import { A as e, C as t, D as n, F as r, I as i, N as a, O as o, P as s, T as c, _ as l, b as u, f as d, g as f, h as p, j as m, k as h, n as g, p as _, u as v, v as y, w as b, x, y as S } from "./svg-0-2cLGdh.js";
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
function F({ catalog: t, progress: n, open: r, initialTab: i, heading: a = "The library", intro: o = "Design patterns explained through the problems they solve, and how leading digital companies built their systems." }) {
	let s = [
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
	].filter((e) => e.count > 0 || e.id === "patterns"), [c, l] = O(() => s.some((e) => e.id === i) ? i : "patterns"), [u, d] = O("All"), [m, h] = O(""), g = (e) => {
		l(e), d("All"), history.replaceState(null, "", S(e));
	}, _ = E(() => c === "paths" ? [] : t.topics.filter((e) => (e.meta?.kind ?? "pattern") === P[c]), [t, c]), v = ["All", ...new Set(_.map((e) => e.meta?.category ?? "Other"))], y = m.trim().toLowerCase(), x = y ? t.topics.filter((e) => !y || [
		e.title,
		e.subtitle,
		e.meta?.blurb,
		e.meta?.category,
		...e.chapters.map((e) => e.title)
	].join(" ").toLowerCase().includes(y)) : _.filter((e) => u === "All" || (e.meta?.category ?? "Other") === u), C = t.topics.filter((e) => f(n[e.id]) > .02 && !p(n[e.id])).sort((e, t) => n[t.id].at - n[e.id].at).slice(0, 6);
	return /* @__PURE__ */ j("div", {
		className: "library",
		children: [
			/* @__PURE__ */ j("header", {
				className: "lib-head",
				children: [
					/* @__PURE__ */ A("h1", { children: a }),
					/* @__PURE__ */ A("p", { children: o }),
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
							value: m,
							onChange: (e) => h(e.target.value)
						})]
					})
				]
			}),
			!y && C.length ? /* @__PURE__ */ j("section", {
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
			y ? /* @__PURE__ */ j("p", {
				className: "lib-results",
				children: [
					x.length,
					" result",
					x.length === 1 ? "" : "s",
					" for “",
					m.trim(),
					"”"
				]
			}) : /* @__PURE__ */ A("nav", {
				className: "lib-tabs",
				role: "tablist",
				children: s.map((e) => /* @__PURE__ */ j("button", {
					role: "tab",
					"aria-selected": c === e.id,
					className: c === e.id ? "on" : "",
					onClick: () => g(e.id),
					children: [
						e.label,
						" ",
						/* @__PURE__ */ A("span", { children: e.count })
					]
				}, e.id))
			}),
			!y && c !== "paths" && v.length > 2 ? /* @__PURE__ */ A("div", {
				className: "lib-chips",
				children: v.map((e) => /* @__PURE__ */ A("button", {
					className: e === u ? "on" : "",
					onClick: () => d(e),
					children: e
				}, e))
			}) : null,
			!y && c === "paths" ? /* @__PURE__ */ A("div", {
				className: "lib-paths",
				children: t.paths.map((i) => {
					let a = i.steps.filter((e) => p(n[e])).length;
					return /* @__PURE__ */ j("section", {
						className: "lib-path",
						children: [/* @__PURE__ */ j("header", { children: [
							/* @__PURE__ */ A("h2", { children: i.title }),
							/* @__PURE__ */ A("p", { children: i.blurb }),
							/* @__PURE__ */ j("span", { children: [
								a,
								" of ",
								i.steps.length,
								" watched"
							] })
						] }), /* @__PURE__ */ A("ol", { children: i.steps.map((i, a) => {
							let o = t.topics.find((e) => e.id === i), s = n[i];
							return /* @__PURE__ */ j("li", {
								className: o ? p(s) ? "done" : "" : "soon",
								children: [/* @__PURE__ */ A("b", { children: p(s) ? "✓" : a + 1 }), o ? /* @__PURE__ */ j("a", {
									href: b(o),
									onClick: (e) => {
										e.preventDefault(), r(b(o));
									},
									children: [/* @__PURE__ */ A("span", { children: o.title }), /* @__PURE__ */ j("small", { children: [
										I(o.meta?.level ?? ""),
										" · ",
										e(o.ms.engineer),
										f(s) > .02 && !p(s) ? ` · ${Math.round(f(s) * 100)}% watched` : ""
									] })]
								}) : /* @__PURE__ */ j("span", { children: [i.replace(/-/g, " "), /* @__PURE__ */ A("small", { children: "coming soon" })] })]
							}, i);
						}) })]
					}, i.id);
				})
			}) : /* @__PURE__ */ j("div", {
				className: "lib-grid",
				children: [x.map((e) => /* @__PURE__ */ A(L, {
					t: e,
					p: n[e.id],
					open: r
				}, e.id)), x.length ? null : /* @__PURE__ */ A("p", {
					className: "lib-empty",
					children: "Nothing here yet."
				})]
			})
		]
	});
}
var I = (e) => e.charAt(0).toUpperCase() + e.slice(1);
function L({ t, p: n, open: r, compact: i }) {
	let a = f(n), o = b(t);
	return /* @__PURE__ */ j("a", {
		className: `lib-tile${i ? " compact" : ""}`,
		href: o,
		onClick: (e) => {
			e.preventDefault(), r(o);
		},
		children: [/* @__PURE__ */ j("div", {
			className: "lib-thumb",
			children: [
				/* @__PURE__ */ A("img", {
					src: _(`/thumbs/${t.id}.svg`),
					alt: "",
					loading: "lazy"
				}),
				l(t) ? /* @__PURE__ */ A("em", {
					className: "new",
					children: "New"
				}) : y(t) ? /* @__PURE__ */ A("em", {
					className: "upd",
					children: "Updated"
				}) : null,
				t.ms.engineer ? /* @__PURE__ */ A("span", {
					className: "dur",
					children: e(t.ms.engineer)
				}) : null,
				a > .02 ? /* @__PURE__ */ A("i", { style: { width: `${a * 100}%` } }) : null
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
function ce({ diagram: e, layout: t, portraitLayout: n, epoch: r, shot: i, shotMs: a, offsetMs: o, scrubMs: s, playing: c, onSelect: l, selected: u, view: d, stableSvg: f = !0 }) {
	let p = D(null), m = D(null), [h, _] = O(null);
	T(() => {
		let e = p.current;
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
	let y = h && n && h.h > h.w * .9 ? n : t, b = E(() => v(e, y, { pad: R }), [e, y]), x = E(() => ({ __html: b }), [b]), S = d !== void 0, C = !S && !!h && Math.min(h.w / (y.width + 32), h.h / (y.height + 32)) < ie;
	return T(() => {
		let t = p.current?.querySelector("svg");
		if (!t || !h) return;
		let n = oe(e, i), r = n.size > 0, s = t.querySelectorAll(".dg-node, .dg-edge, .dg-group, .dg-lifeline"), l = t.querySelectorAll(".dg-edge-label, .dg-edge-pill");
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
				}, u = s ? B(s, y, h) : B(l, y, {
					w: h.w,
					h: h.h
				}), d = Math.max((y.width + 32) / h.w, (y.height + 32) / h.h), f = {
					x: (y.width + 32 - h.w * d) / 2,
					y: (y.height + 32 - h.h * d) / 2,
					w: h.w * d,
					h: h.h * d
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
			let _ = i.trace.length ? Math.max(1.1, (a / 1e3 - 1.2) / i.trace.length) : 0;
			i.trace.forEach((n, r) => {
				let i = t.querySelector(`.dg-edge[data-edge="${CSS.escape(n)}"]`), a = i?.querySelector("path");
				if (!i || !a) return;
				let o = .5 + r * _, s = Math.min(.9, _ * .7);
				if (C && r > 0) {
					let r = c(n);
					if (r) {
						let i = y.edges[n].points, a = i[0], c = i[i.length - 1], l = B(r, y, h), u = l.w >= r.w + 60 && l.h >= r.h + 60, d = u ? l : B({
							x: a.x - 40,
							y: a.y - 40,
							w: 80,
							h: 80
						}, y, h);
						e.to(t, {
							attr: { viewBox: z(d) },
							duration: Math.min(.7, _ * .35),
							ease: "power2.inOut"
						}, o - Math.min(.7, _ * .35)), u || e.to(t, {
							attr: { viewBox: z(B({
								x: c.x - 40,
								y: c.y - 40,
								w: 80,
								h: 80
							}, y, h)) },
							duration: s,
							ease: "power1.inOut"
						}, o);
					}
				} else if (C && r === 0) {
					let r = y.edges[n]?.points ?? [], i = c(n);
					if (i && r.length) {
						let n = B(i, y, h);
						if (!(n.w >= i.w + 60 && n.h >= i.h + 60)) {
							let n = r[0], i = r[r.length - 1];
							e.to(t, {
								attr: { viewBox: z(B({
									x: n.x - 40,
									y: n.y - 40,
									w: 80,
									h: 80
								}, y, h)) },
								duration: .5,
								ease: "power2.inOut"
							}, Math.max(0, o - .5)), e.to(t, {
								attr: { viewBox: z(B({
									x: i.x - 40,
									y: i.y - 40,
									w: 80,
									h: 80
								}, y, h)) },
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
				let l = i.querySelectorAll(".dg-edge-label, .dg-edge-pill");
				l.length && e.to(l, {
					opacity: 1,
					duration: .35
				}, o + s * .6);
				let u = document.createElementNS("http://www.w3.org/2000/svg", "circle");
				u.setAttribute("r", "4.5"), u.setAttribute("class", "dg-pulse"), u.setAttribute("fill", a.getAttribute("stroke") ?? g.solid.stroke), u.setAttribute("opacity", "0"), i.appendChild(u), e.set(u, { opacity: 1 }, o).to(u, {
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
		b,
		i,
		a,
		o,
		r,
		h,
		C,
		S
	]), T(() => {
		d && p.current?.querySelector("svg")?.setAttribute("viewBox", d);
	}, [
		d,
		b,
		h
	]), T(() => {
		m.current && (c ? m.current.play() : m.current.pause());
	}, [c]), T(() => {
		s !== void 0 && m.current?.time(s / 1e3);
	}, [s]), T(() => {
		let e = p.current?.querySelector("svg");
		e?.querySelectorAll(".dg-node.is-selected").forEach((e) => e.classList.remove("is-selected")), u && e?.querySelector(`.dg-node[data-node="${CSS.escape(u)}"]`)?.classList.add("is-selected");
	}, [u, b]), /* @__PURE__ */ A("div", {
		ref: p,
		className: "stage-svg",
		onClick: (e) => {
			let t = e.target.closest(".dg-node");
			t?.dataset.node && l(t.dataset.node);
		},
		dangerouslySetInnerHTML: f ? x : { __html: b }
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
function de(t) {
	let { w: n, chapters: r, time: a, total: o } = t, [c, l] = O(null), u = D(null), f = Math.max(0, r.findLastIndex((e) => e.start <= a)), p = r[f], m = t.nav?.next, h = (e) => t.nav?.open(b(e)), g = a > 0 || t.playing || !!t.clip, v = !t.playing && !t.clip && a >= o - 2;
	w(() => {
		let e = u.current, t = e?.querySelector(".on");
		e && t && e.scrollTo({
			left: t.offsetLeft - e.clientWidth / 2 + t.clientWidth / 2,
			behavior: "smooth"
		});
	}, [f]);
	let y = (e) => {
		e >= r.length ? m && m.id !== n.id && h(m) : t.seek(r[Math.max(0, e)].start + 1);
	}, x = D(null), S = (e) => {
		x.current = {
			x: e.clientX,
			y: e.clientY,
			t: performance.now()
		};
	}, C = (e) => {
		let n = x.current;
		if (x.current = null, !n) return;
		let r = e.clientX - n.x, i = e.clientY - n.y;
		Math.abs(i) > 60 && Math.abs(i) > Math.abs(r) * 1.3 ? y(i < 0 ? f + 1 : f - 1) : Math.hypot(r, i) < 10 && performance.now() - n.t < 400 && (t.playing || !e.target.closest(".dg-node")) && t.toggle();
	}, { words: ee, said: T } = s(i(t.text), t.spoken), E = p ? `${f + 1} · ${p.title}` : n.subtitle ?? "";
	return /* @__PURE__ */ j("div", {
		className: `watch${t.clip ? " is-clip" : ""}`,
		children: [
			/* @__PURE__ */ A("div", {
				className: "w-stage",
				onPointerDown: S,
				onPointerUp: C,
				children: /* @__PURE__ */ A("div", {
					className: `w-canvas${g ? "" : " dim"}`,
					children: t.stage
				})
			}),
			/* @__PURE__ */ j("header", {
				className: "w-top",
				children: [/* @__PURE__ */ j("button", {
					className: "w-title",
					onClick: () => l("next"),
					"aria-label": "What next",
					children: [/* @__PURE__ */ j("b", { children: [/* @__PURE__ */ A("em", { children: n.title }), /* @__PURE__ */ A("svg", {
						viewBox: "0 0 24 24",
						"aria-hidden": "true",
						children: /* @__PURE__ */ A("path", { d: "M6 9l6 6 6-6" })
					})] }), /* @__PURE__ */ A("span", { children: g ? E : n.subtitle })]
				}), t.clip ? null : /* @__PURE__ */ j("button", {
					className: "w-pill",
					onClick: () => t.onDepth(t.depth === "engineer" ? "executive" : "engineer"),
					"aria-label": "Switch depth",
					children: [
						t.depth === "engineer" ? "Engineer" : "Executive",
						" ",
						/* @__PURE__ */ A("span", { children: "⇄" })
					]
				})]
			}),
			g ? v ? /* @__PURE__ */ j("div", {
				className: "w-intro",
				children: [
					/* @__PURE__ */ A("span", {
						className: "w-eyebrow",
						children: "Up next"
					}),
					/* @__PURE__ */ A("h1", { children: m?.title }),
					/* @__PURE__ */ A("button", {
						className: "w-play",
						onClick: () => m && h(m),
						"aria-label": "Play next topic",
						children: /* @__PURE__ */ A("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ A("path", { d: "M8 5.5v13l11-6.5z" })
						})
					}),
					/* @__PURE__ */ A("button", {
						className: "w-link",
						onClick: () => t.seek(0),
						children: "Watch again"
					})
				]
			}) : !t.playing && !t.clip ? /* @__PURE__ */ j("div", {
				className: "w-paused",
				children: [
					/* @__PURE__ */ A("button", {
						className: "w-icon",
						onClick: () => y(f - 1),
						"aria-label": "Previous chapter",
						children: /* @__PURE__ */ A("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ A("path", { d: "M7 6v12M18 6l-8 6 8 6z" })
						})
					}),
					/* @__PURE__ */ A("button", {
						className: "w-icon",
						onClick: () => t.seek(a - 1e4),
						"aria-label": "Back 10 seconds",
						children: "−10"
					}),
					/* @__PURE__ */ A("button", {
						className: "w-play",
						onClick: t.toggle,
						"aria-label": "Resume",
						children: /* @__PURE__ */ A("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ A("path", { d: "M8 5.5v13l11-6.5z" })
						})
					}),
					/* @__PURE__ */ A("button", {
						className: "w-icon",
						onClick: () => t.seek(a + 1e4),
						"aria-label": "Forward 10 seconds",
						children: "+10"
					}),
					/* @__PURE__ */ A("button", {
						className: "w-icon",
						onClick: () => y(f + 1),
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
						children: n.subtitle ?? "Walkthrough"
					}),
					/* @__PURE__ */ A("h1", { children: n.title }),
					/* @__PURE__ */ j("p", { children: [
						r.length,
						" chapters · ",
						e(o)
					] }),
					/* @__PURE__ */ A("button", {
						className: "w-play",
						onClick: t.toggle,
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
					g && !v && !t.clip && p && d.has(p.id) && t.nav?.links.length ? /* @__PURE__ */ A("div", {
						className: "w-chips",
						children: t.nav.links.map((e) => /* @__PURE__ */ j("button", {
							onClick: () => h(e),
							children: [e.title, " ›"]
						}, e.id))
					}) : null,
					g && t.captions && !v ? /* @__PURE__ */ j("div", {
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
						ref: u,
						children: r.map((e, n) => /* @__PURE__ */ j("button", {
							className: n === f ? "on" : n < f ? "done" : "",
							onClick: () => t.seek(e.start + 1),
							children: [/* @__PURE__ */ A("b", { children: n + 1 }), /* @__PURE__ */ A("span", { children: e.title })]
						}, e.id))
					}),
					/* @__PURE__ */ j("div", {
						className: "w-progress",
						children: [r.map((e, t) => {
							let n = r[t + 1]?.start ?? o, i = Math.min(1, Math.max(0, (a - e.start) / (n - e.start)));
							return /* @__PURE__ */ A("span", {
								style: { flexGrow: n - e.start },
								children: /* @__PURE__ */ A("i", { style: { width: `${i * 100}%` } })
							}, e.id);
						}), /* @__PURE__ */ A("input", {
							type: "range",
							min: 0,
							max: o,
							step: 100,
							value: a,
							onChange: (e) => t.seek(Number(e.target.value)),
							"aria-label": "Position"
						})]
					}),
					t.clip ? null : /* @__PURE__ */ j("div", {
						className: "w-bar",
						children: [
							/* @__PURE__ */ A("button", {
								className: "w-icon",
								onClick: t.toggle,
								"aria-label": t.playing ? "Pause" : "Play",
								children: t.playing ? /* @__PURE__ */ A("svg", {
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
									e(a),
									" / ",
									e(o)
								]
							}),
							/* @__PURE__ */ A("button", {
								className: "w-icon",
								onClick: () => l("chapters"),
								"aria-label": "Chapters",
								children: /* @__PURE__ */ A("svg", {
									viewBox: "0 0 24 24",
									"aria-hidden": "true",
									children: /* @__PURE__ */ A("path", { d: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" })
								})
							}),
							/* @__PURE__ */ A("button", {
								className: `w-icon w-cc${t.captions ? " on" : ""}`,
								onClick: () => t.setCaptions((e) => !e),
								"aria-label": "Subtitles",
								children: "CC"
							}),
							/* @__PURE__ */ j("button", {
								className: "w-icon w-speed",
								onClick: () => t.setSpeed(le[(le.indexOf(t.speed) + 1) % le.length]),
								"aria-label": "Speed",
								children: [t.speed, "×"]
							})
						]
					})
				]
			}),
			t.explore,
			c ? /* @__PURE__ */ A("div", {
				className: "w-sheet-back",
				onClick: () => l(null),
				children: /* @__PURE__ */ j("div", {
					className: "w-sheet",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ A("div", { className: "w-grip" }), c === "chapters" ? /* @__PURE__ */ j(k, { children: [/* @__PURE__ */ A("h2", { children: "Chapters" }), r.map((n, r) => /* @__PURE__ */ j("button", {
						className: r === f ? "on" : "",
						onClick: () => {
							t.seek(n.start + 1), l(null);
						},
						children: [
							/* @__PURE__ */ A("b", { children: r + 1 }),
							/* @__PURE__ */ A("span", { children: n.title }),
							/* @__PURE__ */ A("small", { children: e(n.start) })
						]
					}, n.id))] }) : /* @__PURE__ */ j(k, { children: [(t.nav?.groups ?? []).map((t) => /* @__PURE__ */ j("section", { children: [/* @__PURE__ */ A("h2", { children: t.title }), t.items.map(({ topic: t, note: n }) => /* @__PURE__ */ j("button", {
						onClick: () => {
							l(null), h(t);
						},
						children: [/* @__PURE__ */ A("img", {
							src: _(`/thumbs/${t.id}.svg`),
							alt: "",
							loading: "lazy"
						}), /* @__PURE__ */ j("span", { children: [t.title, /* @__PURE__ */ A("small", { children: n ?? [t.meta?.category, e(t.ms.engineer)].filter(Boolean).join(" · ") })] })]
					}, t.id))] }, t.title)), /* @__PURE__ */ A("button", {
						className: "w-browse",
						onClick: () => t.nav?.library(),
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
function pe({ walkthrough: t, manifest: s, layouts: c, nav: l, autoplay: u = !1, startAt: f = 0, startChapter: p, onProgress: v, frame: y, view: x, initialDepth: S = "engineer" }) {
	let T = ue(), M = y !== void 0, [N, te] = O(S), P = E(() => a(t.shots, N, s), [
		t.shots,
		N,
		s
	]), F = E(() => r(P), [P]), I = F[F.length - 1] + P[P.length - 1], L = E(() => n(t, F), [t, F]), [R, re] = O(0), [ie, ae] = O(u), z = M ? Math.max(0, Math.min(I - 1, y)) : R, B = !M && ie, [V, oe] = O(1), [se, le] = O(!0), [H, pe] = O(null), [me, he] = O({
		index: 0,
		offset: 0,
		epoch: 0
	}), U = D(null), ge = D(null), W = D({
		time: 0,
		last: 0
	}), { index: G, offset: K } = m(z, P), q = D(null);
	M && q.current?.index !== G && (q.current = {
		index: G,
		offset: q.current ? 0 : K
	});
	let J = M && q.current ? {
		...q.current,
		epoch: 0
	} : me, Y = t.shots[G], _e = Y.diagram ?? t.shots.slice(0, G).reverse().find((e) => e.diagram)?.diagram ?? t.diagrams[0].id, X = t.diagrams.find((e) => e.id === _e), Z = s[h(Y, N)], Q = ee((e) => {
		let t = Math.max(0, Math.min(I - 1, e));
		W.current.time = t, re(t);
		let n = m(t, P);
		he((e) => ({
			index: n.index,
			offset: n.offset,
			epoch: e.epoch + 1
		}));
	}, [P, I]);
	w(() => {
		let e = p ? L.find((e) => e.id === p) : void 0, t = e ? e.start + 1 : f > 5e3 && f < I - 5e3 ? f : 0;
		t && Q(t);
	}, []);
	let ve = D(0);
	w(() => {
		v && (Math.abs(z - ve.current) > 3e3 || !B) && (ve.current = z, v(z, I));
	}, [
		z,
		B,
		I,
		v
	]), w(() => {
		let e = U.current;
		if (!e) return;
		if (!Z) {
			e.removeAttribute("src");
			return;
		}
		e.src.endsWith(Z.file) || (e.src = _(Z.file));
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
			let i = r - W.current.last;
			W.current.last = r;
			let a = m(W.current.time, P), o = U.current, c = s[h(t.shots[a.index], N)], l;
			l = o && c && o.src.endsWith(c.file) && !o.paused && !o.ended ? F[a.index] + o.currentTime * 1e3 : W.current.time + i * V;
			let u = m(l, P);
			u.index !== a.index && he((e) => ({
				index: u.index,
				offset: 0,
				epoch: e.epoch
			})), l >= I ? (W.current.time = I, re(I - 1), ae(!1)) : (W.current.time = l, re(l), e = requestAnimationFrame(n));
		};
		return e = requestAnimationFrame(n), () => cancelAnimationFrame(e);
	}, [
		B,
		P,
		F,
		I,
		V,
		N,
		s,
		t.shots
	]);
	let ye = (e) => {
		if (e === N) return;
		let n = G;
		te(e);
		let i = r(a(t.shots, e, s));
		W.current.time = i[n], re(i[n]), he((e) => ({
			index: n,
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
	let xe = Y[N], Se = Z ? Math.min(1, K / Z.ms) : Math.min(1, K / P[G]), Ce = o(i(xe), Se), $ = [...L].reverse().find((e) => e.start <= z);
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
			style: { color: g[e.style].stroke },
			children: [/* @__PURE__ */ A("svg", {
				viewBox: "0 0 34 8",
				"aria-hidden": "true",
				children: /* @__PURE__ */ A("line", {
					x1: "0",
					y1: "4",
					x2: "34",
					y2: "4",
					stroke: g[e.style].stroke,
					strokeWidth: "2",
					strokeDasharray: g[e.style].dash || void 0
				})
			}), e.label]
		}, e.label))
	}) : null, De = l && $ && d.has($.id) ? l.links : [], Oe = Y.card ? /* @__PURE__ */ A(ne, {
		card: Y.card,
		shotMs: P[G],
		offsetMs: M ? K : J.index === G ? J.offset : 0,
		playing: B,
		epoch: J.epoch * 1e3 + G
	}) : /* @__PURE__ */ A(ce, {
		diagram: X,
		layout: c[X.id],
		portraitLayout: c[`${X.id}${C}`],
		epoch: J.epoch,
		shot: Y,
		shotMs: P[G],
		offsetMs: J.index === G ? J.offset : 0,
		scrubMs: M ? K : void 0,
		view: M ? x : void 0,
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
		nav: l,
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
					href: b(e),
					onClick: (t) => {
						t.preventDefault(), l?.open(b(e));
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
	return w(() => o(x()), []), /* @__PURE__ */ A(F, {
		catalog: e,
		progress: a,
		open: t,
		initialTab: n,
		heading: r,
		intro: i
	});
}
function ge({ catalog: e, walkthrough: n, layouts: r, manifest: i, chapter: a, open: o = he, library: s = () => o(S()), autoplay: l }) {
	let d = n.id, f = ue(), [p, m] = O(null), [h, g] = O(!1);
	w(() => {
		m(x()), g(sessionStorage.getItem(me) === "1"), sessionStorage.removeItem(me);
	}, [d]);
	let _ = E(() => {
		let { groups: t, next: n } = c(e, d, p ?? {});
		return {
			groups: t,
			next: n,
			links: u(e, d),
			open: o,
			library: s
		};
	}, [
		e,
		d,
		p,
		o,
		s
	]), v = ee((e, n) => t(d, e, n), [d]);
	return p ? /* @__PURE__ */ j(k, { children: [f ? null : /* @__PURE__ */ A("nav", {
		className: "topbar",
		children: /* @__PURE__ */ A("a", {
			href: S(),
			onClick: (e) => {
				e.preventDefault(), s();
			},
			children: "← Library"
		})
	}), /* @__PURE__ */ A(pe, {
		walkthrough: n,
		manifest: i,
		layouts: r,
		nav: _,
		autoplay: l ?? h,
		startAt: p[d]?.t ?? 0,
		startChapter: a,
		onProgress: v
	}, d)] }) : /* @__PURE__ */ A("div", {
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
