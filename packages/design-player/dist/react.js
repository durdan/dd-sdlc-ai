import { C as e, D as t, E as n, O as r, S as i, _ as a, a as o, b as s, c, d as l, f as u, g as d, i as f, k as p, l as m, m as h, o as g, p as _, t as v, u as y, v as b, w as x, x as ee } from "./svg-2uUk2eb6.js";
import { t as te } from "./keys-BT7tChre.js";
import { useCallback as S, useEffect as C, useLayoutEffect as w, useMemo as T, useRef as E, useState as D } from "react";
import { Fragment as O, jsx as k, jsxs as A } from "react/jsx-runtime";
import { gsap as j } from "gsap";
import { DrawSVGPlugin as M } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin as N } from "gsap/MotionPathPlugin";
//#region src/Library.tsx
var P = {
	patterns: "pattern",
	companies: "company"
};
function F({ catalog: t, progress: n, open: r, initialTab: i }) {
	let o = [
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
	].filter((e) => e.count > 0 || e.id === "patterns"), [s, l] = D(() => o.some((e) => e.id === i) ? i : "patterns"), [d, f] = D("All"), [p, h] = D(""), g = (e) => {
		l(e), f("All"), history.replaceState(null, "", u(e));
	}, _ = T(() => s === "paths" ? [] : t.topics.filter((e) => (e.meta?.kind ?? "pattern") === P[s]), [t, s]), v = ["All", ...new Set(_.map((e) => e.meta?.category ?? "Other"))], y = p.trim().toLowerCase(), b = y ? t.topics.filter((e) => !y || [
		e.title,
		e.subtitle,
		e.meta?.blurb,
		e.meta?.category,
		...e.chapters.map((e) => e.title)
	].join(" ").toLowerCase().includes(y)) : _.filter((e) => d === "All" || (e.meta?.category ?? "Other") === d), x = t.topics.filter((e) => m(n[e.id]) > .02 && !c(n[e.id])).sort((e, t) => n[t.id].at - n[e.id].at).slice(0, 6);
	return /* @__PURE__ */ A("div", {
		className: "library",
		children: [
			/* @__PURE__ */ A("header", {
				className: "lib-head",
				children: [
					/* @__PURE__ */ k("h1", { children: "Design walkthroughs" }),
					/* @__PURE__ */ k("p", { children: "Patterns, companies and the systems we build, one narrated diagram at a time." }),
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
							value: p,
							onChange: (e) => h(e.target.value)
						})]
					})
				]
			}),
			!y && x.length ? /* @__PURE__ */ A("section", {
				className: "lib-row",
				children: [/* @__PURE__ */ k("h2", { children: "Continue watching" }), /* @__PURE__ */ k("div", {
					className: "lib-rail",
					children: x.map((e) => /* @__PURE__ */ k(ne, {
						t: e,
						p: n[e.id],
						open: r,
						compact: !0
					}, e.id))
				})]
			}) : null,
			y ? /* @__PURE__ */ A("p", {
				className: "lib-results",
				children: [
					b.length,
					" result",
					b.length === 1 ? "" : "s",
					" for “",
					p.trim(),
					"”"
				]
			}) : /* @__PURE__ */ k("nav", {
				className: "lib-tabs",
				role: "tablist",
				children: o.map((e) => /* @__PURE__ */ A("button", {
					role: "tab",
					"aria-selected": s === e.id,
					className: s === e.id ? "on" : "",
					onClick: () => g(e.id),
					children: [
						e.label,
						" ",
						/* @__PURE__ */ k("span", { children: e.count })
					]
				}, e.id))
			}),
			!y && s !== "paths" && v.length > 2 ? /* @__PURE__ */ k("div", {
				className: "lib-chips",
				children: v.map((e) => /* @__PURE__ */ k("button", {
					className: e === d ? "on" : "",
					onClick: () => f(e),
					children: e
				}, e))
			}) : null,
			!y && s === "paths" ? /* @__PURE__ */ k("div", {
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
										I(s.meta?.level ?? ""),
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
				children: [b.map((e) => /* @__PURE__ */ k(ne, {
					t: e,
					p: n[e.id],
					open: r
				}, e.id)), b.length ? null : /* @__PURE__ */ k("p", {
					className: "lib-empty",
					children: "Nothing here yet."
				})]
			})
		]
	});
}
var I = (e) => e.charAt(0).toUpperCase() + e.slice(1);
function ne({ t, p: n, open: r, compact: i }) {
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
j.registerPlugin(M, N);
var L = 16, ie = .2, R = .72, z = .9, B = (e) => `${e.x.toFixed(1)} ${e.y.toFixed(1)} ${e.w.toFixed(1)} ${e.h.toFixed(1)}`;
function V(e, t, n) {
	let r = t.width + 32, i = t.height + 32, a = n.w / n.h, o = Math.max(e.w + 120, (e.h + 100) * a);
	o = Math.min(o, n.w / R), o = Math.max(o, n.w / z);
	let s = o / a, c = e.x + e.w / 2 + L, l = e.y + e.h / 2 + L;
	return {
		x: o >= r ? (r - o) / 2 : Math.min(Math.max(0, c - o / 2), r - o),
		y: s >= i ? (i - s) / 2 : Math.min(Math.max(0, l - s / 2), i - s),
		w: o,
		h: s
	};
}
function H(e) {
	let t = Math.min(...e.map((e) => e.x)), n = Math.min(...e.map((e) => e.y)), r = Math.max(...e.map((e) => e.x + e.w)), i = Math.max(...e.map((e) => e.y + e.h));
	return {
		x: t,
		y: n,
		w: r - t,
		h: i - n
	};
}
function ae(e, t) {
	let n = (e.kind === "c4" ? e.edges : e.messages).filter((e) => t.trace.includes(e.id));
	return /* @__PURE__ */ new Set([...t.focus, ...n.flatMap((e) => [e.from, e.to])]);
}
function U(e, t, n) {
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
function oe({ diagram: e, layout: t, portraitLayout: n, epoch: r, shot: i, shotMs: a, offsetMs: o, playing: s, onSelect: c, selected: l }) {
	let u = E(null), d = E(null), [p, m] = D(null);
	w(() => {
		let e = u.current;
		if (!e) return;
		let t = () => {
			let t = e.getBoundingClientRect();
			t.width && t.height && m((e) => e && Math.abs(e.w - t.width) < 2 && Math.abs(e.h - t.height) < 2 ? e : {
				w: t.width,
				h: t.height
			});
		};
		t();
		let n = new ResizeObserver(t);
		return n.observe(e), () => n.disconnect();
	}, []);
	let h = p && n && p.h > p.w * .9 ? n : t, g = T(() => f(e, h, { pad: L }), [e, h]), _ = !!p && Math.min(p.w / (h.width + 32), p.h / (h.height + 32)) < R;
	return w(() => {
		let t = u.current?.querySelector("svg");
		if (!t || !p) return;
		let n = ae(e, i), r = n.size > 0, c = t.querySelectorAll(".dg-node, .dg-edge, .dg-group, .dg-lifeline"), l = t.querySelectorAll(".dg-edge-label");
		t.querySelectorAll(".dg-pulse").forEach((e) => e.remove());
		{
			let e = j.timeline({ paused: !0 }), o = (e) => h.nodes[e], s = (e) => {
				let t = h.edges[e]?.points ?? [];
				return t.length ? H(t.map((e) => ({
					x: e.x,
					y: e.y,
					w: 1,
					h: 1
				}))) : null;
			};
			if (!_) e.to(t, {
				attr: { viewBox: U(h, n, i.trace) },
				duration: 1.3,
				ease: "power2.inOut"
			}, 0);
			else {
				t.setAttribute("preserveAspectRatio", "xMidYMid meet");
				let r = i.trace.length ? s(i.trace[0]) : null, a = [...n].map(o).filter(Boolean), c = r ?? (a.length ? H(a) : null), l = {
					x: 0,
					y: 0,
					w: h.width,
					h: h.height
				}, u = c ? V(c, h, p) : V(l, h, {
					w: p.w,
					h: p.h
				}), d = Math.max((h.width + 32) / p.w, (h.height + 32) / p.h), f = {
					x: (h.width + 32 - p.w * d) / 2,
					y: (h.height + 32 - p.h * d) / 2,
					w: p.w * d,
					h: p.h * d
				};
				e.to(t, {
					attr: { viewBox: B(c ? u : f) },
					duration: 1.1,
					ease: "power2.inOut"
				}, 0);
			}
			e.to(l, {
				opacity: 0,
				duration: .3
			}, 0);
			let u = i.trace.map((e) => t.querySelector(`.dg-edge[data-edge="${CSS.escape(e)}"] path`)).filter((e) => !!e), f = [...t.querySelectorAll(".dg-edge path")].filter((e) => !u.includes(e));
			e.set(f, { clearProps: "strokeDasharray,strokeDashoffset,opacity" }, 0), u.length && e.set(u, {
				drawSVG: "0%",
				opacity: 0
			}, 0);
			let m = r ? [...c].filter((e) => {
				let t = e.dataset.node ?? e.dataset.edge ?? e.dataset.group ?? e.dataset.life ?? "";
				return e.classList.contains("dg-group") ? !i.focus.includes(t) : e.classList.contains("dg-edge") ? !i.trace.includes(t) : !n.has(t);
			}) : [], g = [...c].filter((e) => !m.includes(e));
			m.length && e.to(m, {
				opacity: ie,
				duration: .6,
				ease: "power1.out"
			}, 0), g.length && e.to(g, {
				opacity: 1,
				duration: .6,
				ease: "power1.out"
			}, 0);
			let y = i.trace.length ? Math.max(1.1, (a / 1e3 - 1.2) / i.trace.length) : 0;
			i.trace.forEach((n, r) => {
				let i = t.querySelector(`.dg-edge[data-edge="${CSS.escape(n)}"]`), a = i?.querySelector("path");
				if (!i || !a) return;
				let o = .5 + r * y, c = Math.min(.9, y * .7);
				if (_ && r > 0) {
					let r = s(n);
					if (r) {
						let i = h.edges[n].points, a = i[0], s = i[i.length - 1], l = V(r, h, p), u = l.w >= r.w + 60 && l.h >= r.h + 60, d = u ? l : V({
							x: a.x - 40,
							y: a.y - 40,
							w: 80,
							h: 80
						}, h, p);
						e.to(t, {
							attr: { viewBox: B(d) },
							duration: Math.min(.7, y * .35),
							ease: "power2.inOut"
						}, o - Math.min(.7, y * .35)), u || e.to(t, {
							attr: { viewBox: B(V({
								x: s.x - 40,
								y: s.y - 40,
								w: 80,
								h: 80
							}, h, p)) },
							duration: c,
							ease: "power1.inOut"
						}, o);
					}
				} else if (_ && r === 0) {
					let r = h.edges[n]?.points ?? [], i = s(n);
					if (i && r.length) {
						let n = V(i, h, p);
						if (!(n.w >= i.w + 60 && n.h >= i.h + 60)) {
							let n = r[0], i = r[r.length - 1];
							e.to(t, {
								attr: { viewBox: B(V({
									x: n.x - 40,
									y: n.y - 40,
									w: 80,
									h: 80
								}, h, p)) },
								duration: .5,
								ease: "power2.inOut"
							}, Math.max(0, o - .5)), e.to(t, {
								attr: { viewBox: B(V({
									x: i.x - 40,
									y: i.y - 40,
									w: 80,
									h: 80
								}, h, p)) },
								duration: c,
								ease: "power1.inOut"
							}, o);
						}
					}
				}
				e.set(a, { opacity: 1 }, o), e.fromTo(a, { drawSVG: "0%" }, {
					drawSVG: "100%",
					duration: c,
					ease: "power1.inOut",
					immediateRender: !1
				}, o), e.set(a, { clearProps: "strokeDasharray,strokeDashoffset" }, o + c);
				let l = i.querySelector(".dg-edge-label");
				l && e.to(l, {
					opacity: 1,
					duration: .35
				}, o + c * .6);
				let u = document.createElementNS("http://www.w3.org/2000/svg", "circle");
				u.setAttribute("r", "4.5"), u.setAttribute("class", "dg-pulse"), u.setAttribute("fill", a.getAttribute("stroke") ?? v.solid.stroke), u.setAttribute("opacity", "0"), i.appendChild(u), e.set(u, { opacity: 1 }, o).to(u, {
					duration: c,
					ease: "power1.inOut",
					motionPath: {
						path: a,
						align: a,
						alignOrigin: [.5, .5]
					}
				}, o).to(u, {
					opacity: 0,
					duration: .25
				}, o + c);
			}), e.set({}, {}, Math.max(a / 1e3, e.duration())), d.current = e;
		}
		return d.current?.time(Math.max(0, o) / 1e3), s && d.current?.play(), () => {
			d.current?.kill(), d.current = null;
		};
	}, [
		g,
		i,
		a,
		o,
		r,
		p,
		_
	]), w(() => {
		d.current && (s ? d.current.play() : d.current.pause());
	}, [s]), w(() => {
		let e = u.current?.querySelector("svg");
		e?.querySelectorAll(".dg-node.is-selected").forEach((e) => e.classList.remove("is-selected")), l && e?.querySelector(`.dg-node[data-node="${CSS.escape(l)}"]`)?.classList.add("is-selected");
	}, [l, g]), /* @__PURE__ */ k("div", {
		ref: u,
		className: "stage-svg",
		onClick: (e) => {
			let t = e.target.closest(".dg-node");
			t?.dataset.node && c(t.dataset.node);
		},
		dangerouslySetInnerHTML: { __html: g }
	});
}
//#endregion
//#region src/Watch.tsx
var W = [
	1,
	1.25,
	1.5,
	2,
	.75
], G = "(max-width: 700px), (max-height: 500px) and (orientation: landscape)";
function se() {
	let e = typeof window < "u", t = e && new URLSearchParams(location.search).get("watch") === "1", [n, r] = D(() => e && (t || matchMedia(G).matches));
	return C(() => {
		if (t || !e) return;
		let n = matchMedia(G);
		r(n.matches);
		let i = () => r(n.matches);
		return n.addEventListener("change", i), () => n.removeEventListener("change", i);
	}, [t, e]), n;
}
function ce(n) {
	let { w: r, chapters: i, time: s, total: c } = n, [l, u] = D(null), d = E(null), f = Math.max(0, i.findLastIndex((e) => e.start <= s)), m = i[f], h = n.nav?.next, _ = (e) => n.nav?.open(a(e)), v = s > 0 || n.playing, y = !n.playing && s >= c - 2;
	C(() => {
		let e = d.current, t = e?.querySelector(".on");
		e && t && e.scrollTo({
			left: t.offsetLeft - e.clientWidth / 2 + t.clientWidth / 2,
			behavior: "smooth"
		});
	}, [f]);
	let b = (e) => {
		e >= i.length ? h && h.id !== r.id && _(h) : n.seek(i[Math.max(0, e)].start + 1);
	}, x = E(null), ee = (e) => {
		x.current = {
			x: e.clientX,
			y: e.clientY,
			t: performance.now()
		};
	}, te = (e) => {
		let t = x.current;
		if (x.current = null, !t) return;
		let r = e.clientX - t.x, i = e.clientY - t.y;
		Math.abs(i) > 60 && Math.abs(i) > Math.abs(r) * 1.3 ? b(i < 0 ? f + 1 : f - 1) : Math.hypot(r, i) < 10 && performance.now() - t.t < 400 && (n.playing || !e.target.closest(".dg-node")) && n.toggle();
	}, { words: S, said: w } = t(p(n.text), n.spoken), T = m ? `${f + 1} · ${m.title}` : r.subtitle ?? "";
	return /* @__PURE__ */ A("div", {
		className: "watch",
		children: [
			/* @__PURE__ */ k("div", {
				className: "w-stage",
				onPointerDown: ee,
				onPointerUp: te,
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
				}), /* @__PURE__ */ A("button", {
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
			}) : n.playing ? null : /* @__PURE__ */ A("div", {
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
			}) : /* @__PURE__ */ A("div", {
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
					v && !y && m && o.has(m.id) && n.nav?.links.length ? /* @__PURE__ */ k("div", {
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
						}), /* @__PURE__ */ k("p", { children: S.map((e, t) => /* @__PURE__ */ A("span", {
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
					/* @__PURE__ */ A("div", {
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
								onClick: () => n.setSpeed(W[(W.indexOf(n.speed) + 1) % W.length]),
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
var le = [
	.75,
	1,
	1.25,
	1.5,
	2
];
function K({ walkthrough: t, manifest: c, layouts: l, nav: u, autoplay: d = !1, startAt: f = 0, startChapter: m, onProgress: h }) {
	let _ = se(), [y, b] = D("engineer"), w = T(() => n(t.shots, y, c), [
		t.shots,
		y,
		c
	]), j = T(() => r(w), [w]), M = j[j.length - 1] + w[w.length - 1], N = T(() => s(t, j), [t, j]), [P, F] = D(0), [I, ne] = D(d), [L, ie] = D(1), [R, z] = D(!0), [B, V] = D(null), [H, ae] = D({
		index: 0,
		offset: 0,
		epoch: 0
	}), U = E(null), W = E(null), G = E({
		time: 0,
		last: 0
	}), { index: K, offset: q } = x(P, w), J = t.shots[K], ue = J.diagram ?? t.shots.slice(0, K).reverse().find((e) => e.diagram)?.diagram ?? t.diagrams[0].id, Y = t.diagrams.find((e) => e.id === ue), X = c[i(J, y)], Z = S((e) => {
		let t = Math.max(0, Math.min(M - 1, e));
		G.current.time = t, F(t);
		let n = x(t, w);
		ae((e) => ({
			index: n.index,
			offset: n.offset,
			epoch: e.epoch + 1
		}));
	}, [w, M]);
	C(() => {
		let e = m ? N.find((e) => e.id === m) : void 0, t = e ? e.start + 1 : f > 5e3 && f < M - 5e3 ? f : 0;
		t && Z(t);
	}, []);
	let de = E(0);
	C(() => {
		h && (Math.abs(P - de.current) > 3e3 || !I) && (de.current = P, h(P, M));
	}, [
		P,
		I,
		M,
		h
	]), C(() => {
		let e = U.current;
		if (!e) return;
		if (!X) {
			e.removeAttribute("src");
			return;
		}
		e.src.endsWith(X.file) || (e.src = g(X.file));
		let t = H.index === K ? H.offset : 0;
		t < X.ms && (e.currentTime = t / 1e3), e.playbackRate = L, I && t < X.ms && e.play().catch(() => void 0);
	}, [
		K,
		y,
		H.epoch,
		X?.file
	]), C(() => {
		U.current && (U.current.playbackRate = L);
	}, [L]), C(() => {
		let e = U.current;
		e && X && (I && q < X.ms ? e.play().catch(() => void 0) : e.pause());
	}, [I]), C(() => {
		if (!I) return;
		let e = 0;
		G.current.last = performance.now();
		let n = (r) => {
			let a = r - G.current.last;
			G.current.last = r;
			let o = x(G.current.time, w), s = U.current, l = c[i(t.shots[o.index], y)], u;
			u = s && l && s.src.endsWith(l.file) && !s.paused && !s.ended ? j[o.index] + s.currentTime * 1e3 : G.current.time + a * L;
			let d = x(u, w);
			d.index !== o.index && ae((e) => ({
				index: d.index,
				offset: 0,
				epoch: e.epoch
			})), u >= M ? (G.current.time = M, F(M - 1), ne(!1)) : (G.current.time = u, F(u), e = requestAnimationFrame(n));
		};
		return e = requestAnimationFrame(n), () => cancelAnimationFrame(e);
	}, [
		I,
		w,
		j,
		M,
		L,
		y,
		c,
		t.shots
	]);
	let fe = (e) => {
		if (e === y) return;
		let i = K;
		b(e);
		let a = r(n(t.shots, e, c));
		G.current.time = a[i], F(a[i]), ae((e) => ({
			index: i,
			offset: 0,
			epoch: e.epoch + 1
		}));
	}, Q = S(() => {
		!I && P >= M - 2 && Z(0), V(null), ne((e) => !e);
	}, [
		I,
		P,
		M,
		Z
	]);
	C(() => {
		let e = (e) => {
			e.target.tagName !== "SELECT" && (e.key === " " ? (e.preventDefault(), Q()) : e.key === "ArrowRight" ? Z(G.current.time + 1e4) : e.key === "ArrowLeft" ? Z(G.current.time - 1e4) : e.key === "." ? Z(j[Math.min(K + 1, t.shots.length - 1)]) : e.key === "," ? Z(j[Math.max(K - 1, 0)]) : e.key === "c" && z((e) => !e));
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [
		Q,
		Z,
		j,
		K,
		t.shots.length
	]);
	let pe = J[y], me = X ? Math.min(1, q / X.ms) : Math.min(1, q / w[K]), he = ee(p(pe), me), $ = [...N].reverse().find((e) => e.start <= P);
	C(() => {
		let e = W.current, t = e?.querySelector("button.on");
		e && t && e.scrollWidth > e.clientWidth && e.scrollTo({
			left: t.offsetLeft - e.clientWidth / 2 + t.clientWidth / 2,
			behavior: "smooth"
		});
	}, [$?.id]);
	let ge = B ? t.shots.map((e, t) => ({
		s: e,
		i: t
	})).filter(({ s: e }) => e.focus.includes(B)) : [], _e = B && (Y.kind === "c4" ? Y.elements.find((e) => e.id === B)?.label : Y.participants.find((e) => e.id === B)?.label), ve = !J.card && Y.kind === "c4" && Y.legend?.length ? /* @__PURE__ */ k("div", {
		className: "legend",
		"aria-label": "Legend",
		children: Y.legend.map((e) => /* @__PURE__ */ A("span", {
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
	}) : null, ye = u && $ && o.has($.id) ? u.links : [], be = J.card ? /* @__PURE__ */ k(re, {
		card: J.card,
		shotMs: w[K],
		offsetMs: H.index === K ? H.offset : 0,
		playing: I,
		epoch: H.epoch * 1e3 + K
	}) : /* @__PURE__ */ k(oe, {
		diagram: Y,
		layout: l[Y.id],
		portraitLayout: l[`${Y.id}${te}`],
		epoch: H.epoch,
		shot: J,
		shotMs: w[K],
		offsetMs: H.index === K ? H.offset : 0,
		playing: I,
		selected: B,
		onSelect: (e) => {
			I || V((t) => t === e ? null : e);
		}
	}, Y.id), xe = !I && B ? /* @__PURE__ */ A("aside", {
		className: "explore",
		onClick: (e) => e.stopPropagation(),
		children: [/* @__PURE__ */ k("strong", { children: _e }), ge.length ? /* @__PURE__ */ A(O, { children: [/* @__PURE__ */ k("span", { children: "Explained in:" }), ge.map(({ s: t, i: n }) => /* @__PURE__ */ A("button", {
			onClick: () => Z(j[n]),
			children: [
				e(j[n]),
				" · ",
				t[y].slice(0, 70),
				"…"
			]
		}, t.id))] }) : /* @__PURE__ */ k("span", { children: "Not the focus of any shot in this walkthrough." })]
	}) : null, Se = /* @__PURE__ */ k("audio", {
		ref: U,
		preload: "auto"
	});
	return _ ? /* @__PURE__ */ A(O, { children: [/* @__PURE__ */ k(ce, {
		w: t,
		nav: u,
		stage: be,
		depth: y,
		onDepth: fe,
		time: P,
		total: M,
		playing: I,
		toggle: Q,
		seek: Z,
		chapters: N,
		text: pe,
		spoken: me,
		captions: R,
		setCaptions: z,
		speed: L,
		setSpeed: ie,
		explore: xe
	}), Se] }) : /* @__PURE__ */ A("div", {
		className: "player",
		children: [
			/* @__PURE__ */ A("header", {
				className: "player-head",
				children: [/* @__PURE__ */ A("div", { children: [/* @__PURE__ */ k("h1", { children: t.title }), /* @__PURE__ */ A("p", { children: [
					$?.title,
					" · ",
					J.card ? J.card.heading : Y.title
				] })] }), /* @__PURE__ */ k("div", {
					className: "depth",
					role: "group",
					"aria-label": "Depth",
					children: ["executive", "engineer"].map((e) => /* @__PURE__ */ k("button", {
						className: e === y ? "on" : "",
						onClick: () => fe(e),
						children: e === "engineer" ? "Engineer" : "Executive"
					}, e))
				})]
			}),
			/* @__PURE__ */ A("div", {
				className: "stage",
				onClick: () => I ? Q() : void 0,
				children: [
					be,
					ve,
					R && he ? /* @__PURE__ */ k("div", {
						className: "subtitle",
						children: he
					}) : null,
					I ? null : /* @__PURE__ */ k("button", {
						className: "big-play",
						onClick: Q,
						"aria-label": P > 0 ? "Resume" : "Play",
						children: "▶"
					}),
					xe,
					!I && !B && P > 0 && !J.card ? /* @__PURE__ */ k("div", {
						className: "hint",
						children: "Paused · click any part of the diagram to explore it"
					}) : null
				]
			}),
			ye.length ? /* @__PURE__ */ A("div", {
				className: "topic-chips",
				children: [/* @__PURE__ */ k("span", { children: $?.id === "patterns" ? "Watch the patterns" : "Watch next" }), ye.map((e) => /* @__PURE__ */ A("a", {
					href: a(e),
					onClick: (t) => {
						t.preventDefault(), u?.open(a(e));
					},
					children: [e.title, " ›"]
				}, e.id))]
			}) : null,
			/* @__PURE__ */ A("div", {
				className: "controls",
				children: [
					/* @__PURE__ */ k("button", {
						onClick: Q,
						"aria-label": I ? "Pause" : "Play",
						children: I ? "❚❚" : "▶"
					}),
					/* @__PURE__ */ k("button", {
						onClick: () => Z(j[Math.max(K - 1, 0)]),
						"aria-label": "Previous shot",
						children: "⏮"
					}),
					/* @__PURE__ */ k("button", {
						className: "skip10",
						onClick: () => Z(P - 1e4),
						"aria-label": "Back 10 seconds",
						children: "−10"
					}),
					/* @__PURE__ */ k("button", {
						className: "skip10",
						onClick: () => Z(P + 1e4),
						"aria-label": "Forward 10 seconds",
						children: "+10"
					}),
					/* @__PURE__ */ k("button", {
						onClick: () => Z(j[Math.min(K + 1, t.shots.length - 1)]),
						"aria-label": "Next shot",
						children: "⏭"
					}),
					/* @__PURE__ */ A("div", {
						className: "scrub",
						children: [/* @__PURE__ */ k("input", {
							type: "range",
							min: 0,
							max: M,
							step: 100,
							value: P,
							onChange: (e) => Z(Number(e.target.value)),
							"aria-label": "Position"
						}), N.map((e) => /* @__PURE__ */ k("button", {
							className: "mark",
							style: { left: `${e.start / M * 100}%` },
							title: e.title,
							onClick: () => Z(e.start)
						}, e.id))]
					}),
					/* @__PURE__ */ A("span", {
						className: "time",
						children: [
							e(P),
							" / ",
							e(M)
						]
					}),
					/* @__PURE__ */ k("select", {
						value: L,
						onChange: (e) => ie(Number(e.target.value)),
						"aria-label": "Speed",
						children: le.map((e) => /* @__PURE__ */ A("option", {
							value: e,
							children: [e, "×"]
						}, e))
					}),
					/* @__PURE__ */ k("button", {
						className: R ? "on" : "",
						onClick: () => z((e) => !e),
						"aria-label": "Subtitles",
						children: "CC"
					})
				]
			}),
			/* @__PURE__ */ k("nav", {
				className: "chapters",
				ref: W,
				children: N.map((t) => /* @__PURE__ */ A("button", {
					className: $?.id === t.id ? "on" : "",
					onClick: () => Z(t.start),
					children: [
						/* @__PURE__ */ k("span", { children: e(t.start) }),
						" ",
						t.title
					]
				}, t.id))
			}),
			Se
		]
	});
}
//#endregion
//#region src/views.tsx
var q = "design-player.autoplay";
function J(e) {
	/\/(p|c)\/[\w-]+/.test(e) && sessionStorage.setItem(q, "1"), location.assign(e);
}
function ue({ catalog: e, open: t = J, initialTab: n }) {
	let [r, i] = D({});
	return C(() => i(h()), []), /* @__PURE__ */ k(F, {
		catalog: e,
		progress: r,
		open: t,
		initialTab: n
	});
}
function Y({ catalog: e, walkthrough: t, layouts: n, manifest: r, chapter: i, open: a = J, library: o = () => a(u()), autoplay: s }) {
	let c = t.id, l = se(), [f, p] = D(null), [m, g] = D(!1);
	C(() => {
		p(h()), g(sessionStorage.getItem(q) === "1"), sessionStorage.removeItem(q);
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
	]), y = S((e, t) => d(c, e, t), [c]);
	return f ? /* @__PURE__ */ A(O, { children: [l ? null : /* @__PURE__ */ k("nav", {
		className: "topbar",
		children: /* @__PURE__ */ k("a", {
			href: u(),
			onClick: (e) => {
				e.preventDefault(), o();
			},
			children: "← Library"
		})
	}), /* @__PURE__ */ k(K, {
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
var X = (e) => /* @__PURE__ */ k("div", {
	className: "dp",
	children: /* @__PURE__ */ k(K, { ...e })
}), Z = (e) => /* @__PURE__ */ k("div", {
	className: "dp",
	children: /* @__PURE__ */ k(F, { ...e })
}), de = (e) => /* @__PURE__ */ k("div", {
	className: "dp",
	children: /* @__PURE__ */ k(ue, { ...e })
}), fe = (e) => /* @__PURE__ */ k("div", {
	className: "dp",
	children: /* @__PURE__ */ k(Y, { ...e })
});
//#endregion
export { Z as Library, de as LibraryPage, X as Player, fe as TopicPage, se as useWatchMode };
