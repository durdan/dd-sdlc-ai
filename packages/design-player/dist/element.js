import { n as e, t } from "./keys-BeFVP0p2.js";
//#region node_modules/scheduler/cjs/scheduler.production.js
var n = /* @__PURE__ */ e(((e) => {
	function t(e, t) {
		var n = e.length;
		e.push(t);
		a: for (; 0 < n;) {
			var r = n - 1 >>> 1, a = e[r];
			if (0 < i(a, t)) e[r] = t, e[n] = a, n = r;
			else break a;
		}
	}
	function n(e) {
		return e.length === 0 ? null : e[0];
	}
	function r(e) {
		if (e.length === 0) return null;
		var t = e[0], n = e.pop();
		if (n !== t) {
			e[0] = n;
			a: for (var r = 0, a = e.length, o = a >>> 1; r < o;) {
				var s = 2 * (r + 1) - 1, c = e[s], l = s + 1, u = e[l];
				if (0 > i(c, n)) l < a && 0 > i(u, c) ? (e[r] = u, e[l] = n, r = l) : (e[r] = c, e[s] = n, r = s);
				else if (l < a && 0 > i(u, n)) e[r] = u, e[l] = n, r = l;
				else break a;
			}
		}
		return t;
	}
	function i(e, t) {
		var n = e.sortIndex - t.sortIndex;
		return n === 0 ? e.id - t.id : n;
	}
	if (e.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
		var a = performance;
		e.unstable_now = function() {
			return a.now();
		};
	} else {
		var o = Date, s = o.now();
		e.unstable_now = function() {
			return o.now() - s;
		};
	}
	var c = [], l = [], u = 1, d = null, f = 3, p = !1, m = !1, h = !1, g = !1, _ = typeof setTimeout == "function" ? setTimeout : null, v = typeof clearTimeout == "function" ? clearTimeout : null, y = typeof setImmediate < "u" ? setImmediate : null;
	function b(e) {
		for (var i = n(l); i !== null;) {
			if (i.callback === null) r(l);
			else if (i.startTime <= e) r(l), i.sortIndex = i.expirationTime, t(c, i);
			else break;
			i = n(l);
		}
	}
	function x(e) {
		if (h = !1, b(e), !m) {
			if (n(c) !== null) m = !0, S || (S = !0, O());
			else {
				var t = n(l);
				t !== null && j(x, t.startTime - e);
			}
		}
	}
	var S = !1, C = -1, w = 5, T = -1;
	function E() {
		return g ? !0 : !(e.unstable_now() - T < w);
	}
	function D() {
		if (g = !1, S) {
			var t = e.unstable_now();
			T = t;
			var i = !0;
			try {
				a: {
					m = !1, h && (h = !1, v(C), C = -1), p = !0;
					var a = f;
					try {
						b: {
							for (b(t), d = n(c); d !== null && !(d.expirationTime > t && E());) {
								var o = d.callback;
								if (typeof o == "function") {
									d.callback = null, f = d.priorityLevel;
									var s = o(d.expirationTime <= t);
									if (t = e.unstable_now(), typeof s == "function") {
										d.callback = s, b(t), i = !0;
										break b;
									}
									d === n(c) && r(c), b(t);
								} else r(c);
								d = n(c);
							}
							if (d !== null) i = !0;
							else {
								var u = n(l);
								u !== null && j(x, u.startTime - t), i = !1;
							}
						}
						break a;
					} finally {
						d = null, f = a, p = !1;
					}
					i = void 0;
				}
			} finally {
				i ? O() : S = !1;
			}
		}
	}
	var O;
	if (typeof y == "function") O = function() {
		y(D);
	};
	else if (typeof MessageChannel < "u") {
		var k = new MessageChannel(), A = k.port2;
		k.port1.onmessage = D, O = function() {
			A.postMessage(null);
		};
	} else O = function() {
		_(D, 0);
	};
	function j(t, n) {
		C = _(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : w = 0 < e ? Math.floor(1e3 / e) : 5;
	}, e.unstable_getCurrentPriorityLevel = function() {
		return f;
	}, e.unstable_next = function(e) {
		switch (f) {
			case 1:
			case 2:
			case 3:
				var t = 3;
				break;
			default: t = f;
		}
		var n = f;
		f = t;
		try {
			return e();
		} finally {
			f = n;
		}
	}, e.unstable_requestPaint = function() {
		g = !0;
	}, e.unstable_runWithPriority = function(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: e = 3;
		}
		var n = f;
		f = e;
		try {
			return t();
		} finally {
			f = n;
		}
	}, e.unstable_scheduleCallback = function(r, i, a) {
		var o = e.unstable_now();
		switch (typeof a == "object" && a ? (a = a.delay, a = typeof a == "number" && 0 < a ? o + a : o) : a = o, r) {
			case 1:
				var s = -1;
				break;
			case 2:
				s = 250;
				break;
			case 5:
				s = 1073741823;
				break;
			case 4:
				s = 1e4;
				break;
			default: s = 5e3;
		}
		return s = a + s, r = {
			id: u++,
			callback: i,
			priorityLevel: r,
			startTime: a,
			expirationTime: s,
			sortIndex: -1
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(C), C = -1) : h = !0, j(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, O()))), r;
	}, e.unstable_shouldYield = E, e.unstable_wrapCallback = function(e) {
		var t = f;
		return function() {
			var n = f;
			f = t;
			try {
				return e.apply(this, arguments);
			} finally {
				f = n;
			}
		};
	};
})), r = /* @__PURE__ */ e(((e, t) => {
	t.exports = n();
})), i = /* @__PURE__ */ e(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.for("react.view_transition"), m = Symbol.iterator;
	function h(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var g = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, _ = Object.assign, v = {};
	function y(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	y.prototype.isReactComponent = {}, y.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, y.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function b() {}
	b.prototype = y.prototype;
	function x(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	var S = x.prototype = new b();
	S.constructor = x, _(S, y.prototype), S.isPureReactComponent = !0;
	var C = Array.isArray;
	function w() {}
	var T = {
		H: null,
		A: null,
		T: null,
		S: null
	}, E = Object.prototype.hasOwnProperty;
	function D(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function O(e, t) {
		return D(e.type, t, e.props);
	}
	function k(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function A(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var j = /\/+/g;
	function M(e, t) {
		return typeof e == "object" && e && e.key != null ? A("" + e.key) : t.toString(36);
	}
	function N(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(w, w) : (e.status = "pending", e.then(function(t) {
				e.status === "pending" && (e.status = "fulfilled", e.value = t);
			}, function(t) {
				e.status === "pending" && (e.status = "rejected", e.reason = t);
			})), e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
			}
		}
		throw e;
	}
	function P(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "bigint":
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n:
					c = !0;
					break;
				case d: return c = e._init, P(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + M(e, 0) : a, C(o) ? (i = "", c != null && (i = c.replace(j, "$&/") + "/"), P(o, r, i, "", function(e) {
			return e;
		})) : o != null && (k(o) && (o = O(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(j, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (C(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + M(a, u), c += P(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + M(a, u++), c += P(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return P(N(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function F(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return P(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function ee(e) {
		if (e._status === -1) {
			var t = e._result, n = t();
			n.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t, n.status === void 0 && (n.status = "fulfilled", n.value = t));
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t, n.status === void 0 && (n.status = "rejected", n.reason = t));
			}), e._status === -1 && (e._status = 0, e._result = n);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var I = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	};
	function te(e) {
		var t = T.T, n = {};
		n.types = t === null ? null : t.types, T.T = n;
		try {
			var r = e(), i = T.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(w, I);
		} catch (e) {
			I(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), T.T = t;
		}
	}
	function L(e) {
		var t = T.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else te(L.bind(null, e));
	}
	var R = {
		map: F,
		forEach: function(e, t, n) {
			F(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return F(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return F(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!k(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = R, e.Component = y, e.Fragment = r, e.Profiler = a, e.PureComponent = x, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = T, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return T.H.useMemoCache(e);
		}
	}, e.addTransitionType = L, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = _({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !E.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return D(e.type, i, r);
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, e.Provider = e, e.Consumer = {
			$$typeof: o,
			_context: e
		}, e;
	}, e.createElement = function(e, t, n) {
		var r, i = {}, a = null;
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) E.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return D(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = k, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: ee
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = te, e.unstable_useCacheRefresh = function() {
		return T.H.useCacheRefresh();
	}, e.use = function(e) {
		return T.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return T.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return T.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return T.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return T.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return T.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return T.H.useEffectEvent(e);
	}, e.useId = function() {
		return T.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return T.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return T.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return T.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return T.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return T.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return T.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return T.H.useRef(e);
	}, e.useState = function(e) {
		return T.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return T.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return T.H.useTransition();
	}, e.version = "19.3.0";
})), a = /* @__PURE__ */ e(((e, t) => {
	t.exports = i();
})), o = /* @__PURE__ */ e(((e) => {
	var t = a();
	function n(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function r() {}
	var i = {
		d: {
			f: r,
			r: function() {
				throw Error(n(522));
			},
			D: r,
			C: r,
			L: r,
			m: r,
			X: r,
			S: r,
			M: r
		},
		p: 0,
		findDOMNode: null
	}, o = Symbol.for("react.portal"), s = Symbol.for("react.recoverable"), c = Symbol.for("react.optimistic_key");
	function l(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: o,
			key: r == null ? null : r === c ? c : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	var u = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function d(e, t) {
		if (e === "font") return "";
		if (typeof t == "string") return t === "use-credentials" ? t : "";
	}
	e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i, e.browser = function(e) {
		return {
			$$typeof: s,
			_reason: e
		};
	}, e.createPortal = function(e, t) {
		var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(n(299));
		return l(e, t, null, r);
	}, e.flushSync = function(e) {
		var t = u.T, n = i.p;
		try {
			if (u.T = null, i.p = 2, e) return e();
		} finally {
			u.T = t, i.p = n, i.d.f();
		}
	}, e.preconnect = function(e, t) {
		typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, i.d.C(e, t));
	}, e.prefetchDNS = function(e) {
		typeof e == "string" && i.d.D(e);
	}, e.preinit = function(e, t) {
		if (typeof e == "string" && t && typeof t.as == "string") {
			var n = t.as, r = d(n, t.crossOrigin), a = typeof t.integrity == "string" ? t.integrity : void 0, o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
			n === "style" ? i.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o
			}) : n === "script" && i.d.X(e, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			});
		}
	}, e.preinitModule = function(e, t) {
		if (typeof e == "string") {
			if (typeof t == "object" && t) {
				if (t.as == null || t.as === "script") {
					var n = d(t.as, t.crossOrigin);
					i.d.M(e, {
						crossOrigin: n,
						integrity: typeof t.integrity == "string" ? t.integrity : void 0,
						nonce: typeof t.nonce == "string" ? t.nonce : void 0,
						fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
					});
				}
			} else t ?? i.d.M(e);
		}
	}, e.preload = function(e, t) {
		if (typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
			var n = t.as, r = d(n, t.crossOrigin);
			i.d.L(e, n, {
				crossOrigin: r,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				type: typeof t.type == "string" ? t.type : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
				referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
				imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
				imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
				media: typeof t.media == "string" ? t.media : void 0
			});
		}
	}, e.preloadModule = function(e, t) {
		if (typeof e == "string") {
			if (t) {
				var n = d(t.as, t.crossOrigin);
				i.d.m(e, {
					as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
					crossOrigin: n,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0,
					fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
				});
			} else i.d.m(e);
		}
	}, e.requestFormReset = function(e) {
		i.d.r(e);
	}, e.unstable_batchedUpdates = function(e, t) {
		return e(t);
	}, e.useFormState = function(e, t, n) {
		return u.H.useFormState(e, t, n);
	}, e.useFormStatus = function() {
		return u.H.useHostTransitionStatus();
	}, e.version = "19.3.0";
})), s = /* @__PURE__ */ e(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = o();
})), c = /* @__PURE__ */ e(((e) => {
	var t = r(), n = a(), i = s();
	function o(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function c(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
	}
	function l(e) {
		for (var t = e, n = t; n && !n.alternate;) t = n, t.flags & 4098 && (e = t.return), n = t.return;
		for (; t.return;) t = t.return;
		return t.tag === 3 ? e : null;
	}
	function u(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function d(e) {
		if (e.tag === 31) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function f(e) {
		if (l(e) !== e) throw Error(o(188));
	}
	function p(e) {
		var t = e.alternate;
		if (!t) {
			if (t = l(e), t === null) throw Error(o(188));
			return t === e ? e : null;
		}
		for (var n = e, r = t;;) {
			var i = n.return;
			if (i === null) break;
			var a = i.alternate;
			if (a === null) {
				if (r = i.return, r !== null) {
					n = r;
					continue;
				}
				break;
			}
			if (i.child === a.child) {
				for (a = i.child; a;) {
					if (a === n) return f(i), e;
					if (a === r) return f(i), t;
					a = a.sibling;
				}
				throw Error(o(188));
			}
			if (n.return !== r.return) n = i, r = a;
			else {
				for (var s = !1, c = i.child; c;) {
					if (c === n) {
						s = !0, n = i, r = a;
						break;
					}
					if (c === r) {
						s = !0, r = i, n = a;
						break;
					}
					c = c.sibling;
				}
				if (!s) {
					for (c = a.child; c;) {
						if (c === n) {
							s = !0, n = a, r = i;
							break;
						}
						if (c === r) {
							s = !0, r = a, n = i;
							break;
						}
						c = c.sibling;
					}
					if (!s) throw Error(o(189));
				}
			}
			if (n.alternate !== r) throw Error(o(190));
		}
		if (n.tag !== 3) throw Error(o(188));
		return n.stateNode.current === n ? e : t;
	}
	function m(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e;
		for (e = e.child; e !== null;) {
			if (t = m(e), t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	function h(e, t, n, r, i, a) {
		for (; e !== null;) {
			if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && n(e, r, i, a) || (e.tag !== 22 || e.memoizedState === null) && (t || e.tag !== 5 && e.tag !== 27) && h(e.child, t, n, r, i, a)) return !0;
			e = e.sibling;
		}
		return !1;
	}
	function g(e) {
		for (e = e.return; e !== null;) {
			if (e.tag === 3 || e.tag === 5 || e.tag === 27) return e;
			e = e.return;
		}
		return null;
	}
	function _(e) {
		var t = !1;
		for (e = e.return; e !== null && (e.tag === 4 && (t = !0), e.tag !== 3 && e.tag !== 5 && e.tag !== 27);) e = e.return;
		return t;
	}
	function v(e) {
		var t = [null, null], n = g(e);
		return n === null || y(t, e, n.child, { foundSelf: !1 }), t;
	}
	function y(e, t, n, r) {
		for (; n !== null;) {
			if (n === t) r.foundSelf = !0;
			else if (n.tag === 5 || n.tag === 27 || n.tag === 6) {
				if (r.foundSelf) return e[1] = n, !0;
				e[0] = n;
			} else if ((n.tag !== 22 || n.memoizedState === null) && y(e, t, n.child, r)) return !0;
			n = n.sibling;
		}
		return !1;
	}
	function b(e) {
		switch (e.tag) {
			case 5:
			case 27:
			case 6: return e.stateNode;
			case 3: return e.stateNode.containerInfo;
			default: throw Error(o(559));
		}
	}
	var x = null, S = null;
	function C(e, t, n) {
		return e === n || e === t && (x = e, !0);
	}
	function w(e, t, n) {
		return e === n ? (S = e, !1) : e === t && (S !== null && (x = e), !0);
	}
	function T(e) {
		if (e === null) return null;
		do
			e = e === null ? null : e.return;
		while (e && e.tag !== 5 && e.tag !== 27 && e.tag !== 3);
		return e || null;
	}
	function E(e, t, n) {
		for (var r = 0, i = e; i; i = n(i)) r++;
		i = 0;
		for (var a = t; a; a = n(a)) i++;
		for (; 0 < r - i;) e = n(e), r--;
		for (; 0 < i - r;) t = n(t), i--;
		for (; r--;) {
			if (e === t || t !== null && e === t.alternate) return e;
			e = n(e), t = n(t);
		}
		return null;
	}
	var D = Object.assign, O = Symbol.for("react.element"), k = Symbol.for("react.transitional.element"), A = Symbol.for("react.portal"), j = Symbol.for("react.fragment"), M = Symbol.for("react.strict_mode"), N = Symbol.for("react.profiler"), P = Symbol.for("react.consumer"), F = Symbol.for("react.context"), ee = Symbol.for("react.forward_ref"), I = Symbol.for("react.suspense"), te = Symbol.for("react.suspense_list"), L = Symbol.for("react.memo"), R = Symbol.for("react.lazy"), z = Symbol.for("react.activity"), ne = Symbol.for("react.legacy_hidden"), re = Symbol.for("react.memo_cache_sentinel"), ie = Symbol.for("react.view_transition"), ae = Symbol.for("react.recoverable"), oe = Symbol.iterator;
	function se(e) {
		return typeof e != "object" || !e ? null : (e = oe && e[oe] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var ce = Symbol.for("react.client.reference");
	function le(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === ce ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case j: return "Fragment";
			case N: return "Profiler";
			case M: return "StrictMode";
			case I: return "Suspense";
			case te: return "SuspenseList";
			case z: return "Activity";
			case ie: return "ViewTransition";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case A: return "Portal";
			case F: return e.displayName || "Context";
			case P: return (e._context.displayName || "Context") + ".Consumer";
			case ee:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case L: return t = e.displayName || null, t === null ? le(e.type) || "Memo" : t;
			case R:
				t = e._payload, e = e._init;
				try {
					return le(e(t));
				} catch {}
		}
		return null;
	}
	var ue = Array.isArray, B = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, V = i.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, de = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, fe = [], pe = -1;
	function me(e) {
		return { current: e };
	}
	function he(e) {
		0 > pe || (e.current = fe[pe], fe[pe] = null, pe--);
	}
	function H(e, t) {
		pe++, fe[pe] = e.current, e.current = t;
	}
	var ge = me(null), _e = me(null), ve = me(null), ye = me(null);
	function be(e, t) {
		switch (H(ve, t), H(_e, e), H(ge, null), t.nodeType) {
			case 9:
			case 11:
				e = (e = t.documentElement) && (e = e.namespaceURI) ? up(e) : 0;
				break;
			default: if (e = t.tagName, t = t.namespaceURI) t = up(t), e = dp(t, e);
			else switch (e) {
				case "svg":
					e = 1;
					break;
				case "math":
					e = 2;
					break;
				default: e = 0;
			}
		}
		he(ge), H(ge, e);
	}
	function xe() {
		he(ge), he(_e), he(ve);
	}
	function Se(e) {
		var t = e.memoizedState;
		t !== null && (sh._currentValue = t.memoizedState, H(ye, e)), t = ge.current;
		var n = dp(t, e.type);
		t !== n && (H(_e, e), H(ge, n));
	}
	function Ce(e) {
		_e.current === e && (he(ge), he(_e)), ye.current === e && (he(ye), sh._currentValue = de);
	}
	var we, Te;
	function Ee(e) {
		if (we === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			we = t && t[1] || "", Te = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + we + e + Te;
	}
	var De = !1;
	function Oe(e, t) {
		if (!e || De) return "";
		De = !0;
		var n = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var r = { DetermineComponentFrameRoot: function() {
				try {
					if (t) {
						var n = function() {
							throw Error();
						};
						if (Object.defineProperty(n.prototype, "props", { set: function() {
							throw Error();
						} }), typeof Reflect == "object" && Reflect.construct) {
							try {
								Reflect.construct(n, []);
							} catch (e) {
								var r = e;
							}
							Reflect.construct(e, [], n);
						} else {
							try {
								n.call();
							} catch (e) {
								r = e;
							}
							n = !1;
							try {
								var i = Object.getOwnPropertyDescriptor(e.prototype, "props");
								Object.defineProperty(e.prototype, "props", {
									configurable: !0,
									set: function() {
										throw Error();
									}
								}), n = !0, new e();
							} finally {
								n && (i === void 0 ? delete e.prototype.props : Object.defineProperty(e.prototype, "props", i));
							}
						}
					} else {
						try {
							throw Error();
						} catch (e) {
							r = e;
						}
						(n = e()) && typeof n.catch == "function" && n.catch(function() {});
					}
				} catch (e) {
					if (e && r && typeof e.stack == "string") return [e.stack, r.stack];
				}
				return [null, null];
			} };
			r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var i = Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot, "name");
			i && i.configurable && Object.defineProperty(r.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var a = r.DetermineComponentFrameRoot(), o = a[0], s = a[1];
			if (o && s) {
				var c = o.split("\n"), l = s.split("\n");
				for (i = r = 0; r < c.length && !c[r].includes("DetermineComponentFrameRoot");) r++;
				for (; i < l.length && !l[i].includes("DetermineComponentFrameRoot");) i++;
				if (r === c.length || i === l.length) for (r = c.length - 1, i = l.length - 1; 1 <= r && 0 <= i && c[r] !== l[i];) i--;
				for (; 1 <= r && 0 <= i; r--, i--) if (c[r] !== l[i]) {
					if (r !== 1 || i !== 1) do
						if (r--, i--, 0 > i || c[r] !== l[i]) {
							var u = "\n" + c[r].replace(" at new ", " at ");
							return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
						}
					while (1 <= r && 0 <= i);
					break;
				}
			}
		} finally {
			De = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? Ee(n) : "";
	}
	function ke(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return Ee(e.type);
			case 16: return Ee("Lazy");
			case 13: return e.child !== t && t !== null ? Ee("Suspense Fallback") : Ee("Suspense");
			case 19: return Ee("SuspenseList");
			case 0:
			case 15: return Oe(e.type, !1);
			case 11: return Oe(e.type.render, !1);
			case 1: return Oe(e.type, !0);
			case 31: return Ee("Activity");
			case 30: return Ee("ViewTransition");
			default: return "";
		}
	}
	function Ae(e) {
		try {
			var t = "", n = null;
			do
				t += ke(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var je = Object.prototype.hasOwnProperty, Me = t.unstable_scheduleCallback, Ne = t.unstable_cancelCallback, Pe = t.unstable_shouldYield, Fe = t.unstable_requestPaint, Ie = t.unstable_now, Le = t.unstable_getCurrentPriorityLevel, Re = t.unstable_ImmediatePriority, ze = t.unstable_UserBlockingPriority, Be = t.unstable_NormalPriority, Ve = t.unstable_LowPriority, He = t.unstable_IdlePriority, Ue = t.log, We = t.unstable_setDisableYieldValue, Ge = null, Ke = null;
	function qe(e) {
		if (typeof Ue == "function" && We(e), Ke && typeof Ke.setStrictMode == "function") try {
			Ke.setStrictMode(Ge, e);
		} catch {}
	}
	var Je = Math.clz32 ? Math.clz32 : Ze, Ye = Math.log, Xe = Math.LN2;
	function Ze(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (Ye(e) / Xe | 0) | 0;
	}
	var Qe = 256, $e = 262144, et = 4194304;
	function tt(e) {
		var t = e & 42;
		if (t !== 0) return t;
		switch (e & -e) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return e & -e;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return e & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return e & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return e;
		}
	}
	function nt(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = tt(n))) : i = tt(o) : i = tt(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = tt(n))) : i = tt(o)) : i = tt(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function rt(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function it(e, t) {
		t & 8 && (t |= t & 32);
		var n = e.entangledLanes;
		if (n !== 0) for (e = e.entanglements, n &= t; 0 < n;) {
			var r = 31 - Je(n), i = 1 << r;
			t |= e[r], n &= ~i;
		}
		return t;
	}
	function at(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return t + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return t + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function ot() {
		var e = et;
		return et <<= 1, !(et & 62914560) && (et = 4194304), e;
	}
	function st(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function ct(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function lt(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - Je(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && ut(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function ut(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - Je(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function dt(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - Je(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function ft(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : pt(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function pt(e) {
		switch (e) {
			case 2:
				e = 1;
				break;
			case 8:
				e = 4;
				break;
			case 32:
				e = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				e = 128;
				break;
			case 268435456:
				e = 134217728;
				break;
			default: e = 0;
		}
		return e;
	}
	function mt(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function ht() {
		var e = V.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : Ch(e.type)) : e;
	}
	function gt(e, t) {
		var n = V.p;
		try {
			return V.p = e, t();
		} finally {
			V.p = n;
		}
	}
	var _t = Math.random().toString(36).slice(2), vt = "__reactFiber$" + _t, yt = "__reactProps$" + _t, bt = "__reactContainer$" + _t, xt = "__reactEvents$" + _t, St = "__reactListeners$" + _t, Ct = "__reactHandles$" + _t, wt = "__reactResources$" + _t, Tt = "__reactMarker$" + _t, Et = "__reactLoad$" + _t;
	function Dt(e) {
		delete e[vt], delete e[yt], delete e[St], delete e[Ct];
	}
	function Ot(e) {
		var t;
		if (t = e[vt]) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[bt] || n[vt]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = fm(e); e !== null;) {
					if (n = e[vt]) return n;
					e = fm(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function kt(e) {
		if (e = e[vt] || e[bt]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function At(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(o(33));
	}
	function jt(e) {
		var t = e[wt];
		return t ||= e[wt] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function U(e) {
		e[Tt] = !0;
	}
	function Mt(e) {
		e[Et] = void 0;
	}
	var Nt = /* @__PURE__ */ new Set(), Pt = {};
	function Ft(e, t) {
		It(e, t), It(e + "Capture", t);
	}
	function It(e, t) {
		for (Pt[e] = t, e = 0; e < t.length; e++) Nt.add(t[e]);
	}
	var Lt = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), Rt = {}, zt = {};
	function Bt(e) {
		return je.call(zt, e) ? !0 : je.call(Rt, e) ? !1 : Lt.test(e) ? zt[e] = !0 : (Rt[e] = !0, !1);
	}
	var W = !1;
	function Vt() {
		var e = W;
		return W = !1, e;
	}
	function Ht(e, t, n) {
		if (Bt(t)) {
			if (n === null) e.removeAttribute(t);
			else {
				switch (typeof n) {
					case "undefined":
					case "function":
					case "symbol":
						e.removeAttribute(t);
						return;
					case "boolean":
						var r = t.toLowerCase().slice(0, 5);
						if (r !== "data-" && r !== "aria-") {
							e.removeAttribute(t);
							return;
						}
				}
				e.setAttribute(t, n);
			}
		}
	}
	function Ut(e, t, n) {
		if (n === null) e.removeAttribute(t);
		else {
			switch (typeof n) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(t);
					return;
			}
			e.setAttribute(t, n);
		}
	}
	function Wt(e, t, n, r) {
		if (r === null) e.removeAttribute(n);
		else {
			switch (typeof r) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(n);
					return;
			}
			e.setAttributeNS(t, n, r);
		}
	}
	function Gt(e) {
		switch (typeof e) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return e;
			case "object": return e;
			default: return "";
		}
	}
	function Kt(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function qt(e, t, n) {
		var r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
		if (!e.hasOwnProperty(t) && r !== void 0 && typeof r.get == "function" && typeof r.set == "function") {
			var i = r.get, a = r.set;
			return Object.defineProperty(e, t, {
				configurable: !0,
				get: function() {
					return i.call(this);
				},
				set: function(e) {
					n = "" + e, a.call(this, e);
				}
			}), Object.defineProperty(e, t, { enumerable: r.enumerable }), {
				getValue: function() {
					return n;
				},
				setValue: function(e) {
					n = "" + e;
				},
				stopTracking: function() {
					e._valueTracker = null, delete e[t];
				}
			};
		}
	}
	function Jt(e) {
		if (!e._valueTracker) {
			var t = Kt(e) ? "checked" : "value";
			e._valueTracker = qt(e, t, "" + e[t]);
		}
	}
	function Yt(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = Kt(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	var Xt = /[\n"\\]/g;
	function Zt(e) {
		return e.replace(Xt, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function Qt(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Gt(t)) : e.value !== "" + Gt(t) && (e.value = "" + Gt(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : en(e, Gt(n)) : o === "number" && e.value == t ? en(e, Gt(e.value)) : en(e, Gt(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + Gt(s) : e.removeAttribute("name");
	}
	function $t(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				Jt(e);
				return;
			}
			n = n == null ? "" : "" + Gt(n), t = t == null ? n : "" + Gt(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), Jt(e);
	}
	function en(e, t) {
		e.defaultValue !== "" + t && (e.defaultValue = "" + t);
	}
	function tn(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + Gt(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function nn(e, t, n) {
		t != null && (t = "" + Gt(t), t !== e.value && (e.value = t), n == null) ? e.defaultValue !== t && (e.defaultValue = t) : e.defaultValue = n == null ? "" : "" + Gt(n);
	}
	function rn(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(o(92));
				if (ue(r)) {
					if (1 < r.length) throw Error(o(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = Gt(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), Jt(e);
	}
	function an(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var on = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function sn(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || on.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function cn(e, t, n) {
		if (t != null && typeof t != "object") throw Error(o(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "", W = !0);
			for (var i in t) r = t[i], t.hasOwnProperty(i) && n[i] !== r && (sn(e, i, r), W = !0);
		} else for (var a in t) t.hasOwnProperty(a) && sn(e, a, t[a]);
	}
	function ln(e) {
		if (e.indexOf("-") === -1) return !1;
		switch (e) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var un = /* @__PURE__ */ new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["maskType", "mask-type"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]), dn = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function fn(e) {
		return dn.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function pn() {}
	var mn = null;
	function hn(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var G = null, gn = null;
	function _n(e) {
		var t = kt(e);
		if (t && (e = t.stateNode)) {
			var n = e[yt] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (Qt(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + Zt("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var i = r[yt] || null;
								if (!i) throw Error(o(90));
								Qt(r, i.value, i.defaultValue, i.defaultValue, i.checked, i.defaultChecked, i.type, i.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && Yt(r);
					}
					break a;
				case "textarea":
					nn(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && tn(e, !!n.multiple, t, !1);
			}
		}
	}
	var vn = !1;
	function yn(e, t, n) {
		if (vn) return e(t, n);
		vn = !0;
		try {
			return e(t);
		} finally {
			if (vn = !1, (G !== null || gn !== null) && (Ld(), G && (t = G, e = gn, gn = G = null, _n(t), e))) for (t = 0; t < e.length; t++) _n(e[t]);
		}
	}
	function bn(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[yt] || null;
		if (r === null) return null;
		n = r[t];
		a: switch (t) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(r = !r.disabled) || (e = e.type, r = e !== "button" && e !== "input" && e !== "select" && e !== "textarea"), e = !r;
				break a;
			default: e = !1;
		}
		if (e) return null;
		if (n && typeof n != "function") throw Error(o(231, t, typeof n));
		return n;
	}
	var xn = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, Sn = !1;
	if (xn) try {
		var Cn = {};
		Object.defineProperty(Cn, "passive", { get: function() {
			Sn = !0;
		} }), window.addEventListener("test", Cn, Cn), window.removeEventListener("test", Cn, Cn);
	} catch {
		Sn = !1;
	}
	var wn = null, Tn = null, En = null;
	function Dn() {
		if (En) return En;
		var e, t = Tn, n = t.length, r, i = "value" in wn ? wn.value : wn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return En = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function On(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function kn() {
		return !0;
	}
	function An() {
		return !1;
	}
	function jn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? kn : An, this.isPropagationStopped = An, this;
		}
		return D(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = kn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = kn);
			},
			persist: function() {},
			isPersistent: kn
		}), t;
	}
	var Mn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, Nn = jn(Mn), Pn = D({}, Mn, {
		view: 0,
		detail: 0
	}), Fn = jn(Pn), In, Ln, Rn, zn = D({}, Pn, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: Xn,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Rn && (Rn && e.type === "mousemove" ? (In = e.screenX - Rn.screenX, Ln = e.screenY - Rn.screenY) : Ln = In = 0, Rn = e), In);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : Ln;
		}
	}), Bn = jn(zn), Vn = jn(D({}, zn, { dataTransfer: 0 })), Hn = jn(D({}, Pn, { relatedTarget: 0 })), Un = jn(D({}, Mn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Wn = jn(D({}, Mn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), Gn = jn(D({}, Mn, { data: 0 })), Kn = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	}, qn = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	}, Jn = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function Yn(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = Jn[e]) ? !!t[e] : !1;
	}
	function Xn() {
		return Yn;
	}
	var Zn = jn(D({}, Pn, {
		key: function(e) {
			if (e.key) {
				var t = Kn[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = On(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? qn[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: Xn,
		charCode: function(e) {
			return e.type === "keypress" ? On(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? On(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), Qn = jn(D({}, zn, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	})), $n = jn(D({}, Mn, { submitter: 0 })), er = jn(D({}, Pn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: Xn
	})), tr = jn(D({}, Mn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), nr = jn(D({}, zn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), rr = jn(D({}, Mn, {
		newState: 0,
		oldState: 0,
		source: 0
	})), ir = [
		9,
		13,
		27,
		32
	], ar = xn && "CompositionEvent" in window, or = null;
	xn && "documentMode" in document && (or = document.documentMode);
	var sr = xn && "TextEvent" in window && !or, cr = xn && (!ar || or && 8 < or && 11 >= or), lr = " ", ur = !1;
	function dr(e, t) {
		switch (e) {
			case "keyup": return ir.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function fr(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var pr = !1;
	function mr(e, t) {
		switch (e) {
			case "compositionend": return fr(t);
			case "keypress": return t.which === 32 ? (ur = !0, lr) : null;
			case "textInput": return e = t.data, e === lr && ur ? null : e;
			default: return null;
		}
	}
	function hr(e, t) {
		if (pr) return e === "compositionend" || !ar && dr(e, t) ? (e = Dn(), En = Tn = wn = null, pr = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return cr && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var gr = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function _r(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!gr[e.type] : t === "textarea";
	}
	function vr(e, t, n, r) {
		G ? gn ? gn.push(r) : gn = [r] : G = r, t = qf(t, "onChange"), 0 < t.length && (n = new Nn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var yr = null, br = null;
	function xr(e) {
		Bf(e, 0);
	}
	function Sr(e) {
		if (Yt(At(e))) return e;
	}
	function Cr(e, t) {
		if (e === "change") return t;
	}
	var wr = !1;
	if (xn) {
		var Tr;
		if (xn) {
			var Er = "oninput" in document;
			if (!Er) {
				var Dr = document.createElement("div");
				Dr.setAttribute("oninput", "return;"), Er = typeof Dr.oninput == "function";
			}
			Tr = Er;
		} else Tr = !1;
		wr = Tr && (!document.documentMode || 9 < document.documentMode);
	}
	function Or() {
		yr && (yr.detachEvent("onpropertychange", kr), br = yr = null);
	}
	function kr(e) {
		if (e.propertyName === "value" && Sr(br)) {
			var t = [];
			vr(t, br, e, hn(e)), yn(xr, t);
		}
	}
	function Ar(e, t, n) {
		e === "focusin" ? (Or(), yr = t, br = n, yr.attachEvent("onpropertychange", kr)) : e === "focusout" && Or();
	}
	function jr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return Sr(br);
	}
	function Mr(e, t) {
		if (e === "click") return Sr(t);
	}
	function Nr(e, t) {
		if (e === "input" || e === "change") return Sr(t);
	}
	function Pr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Fr = typeof Object.is == "function" ? Object.is : Pr;
	function Ir(e, t) {
		if (Fr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!je.call(t, i) || !Fr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function Lr(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function Rr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function zr(e, t) {
		var n = Rr(e);
		e = 0;
		for (var r; n;) {
			if (n.nodeType === 3) {
				if (r = e + n.textContent.length, e <= t && r >= t) return {
					node: n,
					offset: t - e
				};
				e = r;
			}
			a: {
				for (; n;) {
					if (n.nextSibling) {
						n = n.nextSibling;
						break a;
					}
					n = n.parentNode;
				}
				n = void 0;
			}
			n = Rr(n);
		}
	}
	function Br(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Br(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Vr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Lr(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Lr(e.document);
		}
		return t;
	}
	function Hr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var Ur = xn && "documentMode" in document && 11 >= document.documentMode, Wr = null, Gr = null, Kr = null, qr = !1;
	function Jr(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		qr || Wr == null || Wr !== Lr(r) || (r = Wr, "selectionStart" in r && Hr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Kr && Ir(Kr, r) || (Kr = r, r = qf(Gr, "onSelect"), 0 < r.length && (t = new Nn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Wr)));
	}
	function Yr(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var Xr = {
		animationend: Yr("Animation", "AnimationEnd"),
		animationiteration: Yr("Animation", "AnimationIteration"),
		animationstart: Yr("Animation", "AnimationStart"),
		transitionrun: Yr("Transition", "TransitionRun"),
		transitionstart: Yr("Transition", "TransitionStart"),
		transitioncancel: Yr("Transition", "TransitionCancel"),
		transitionend: Yr("Transition", "TransitionEnd")
	}, Zr = {}, Qr = {};
	xn && (Qr = document.createElement("div").style, "AnimationEvent" in window || (delete Xr.animationend.animation, delete Xr.animationiteration.animation, delete Xr.animationstart.animation), "TransitionEvent" in window || delete Xr.transitionend.transition);
	function $r(e) {
		if (Zr[e]) return Zr[e];
		if (!Xr[e]) return e;
		var t = Xr[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in Qr) return Zr[e] = t[n];
		return e;
	}
	var ei = $r("animationend"), ti = $r("animationiteration"), ni = $r("animationstart"), ri = $r("transitionrun"), ii = $r("transitionstart"), ai = $r("transitioncancel"), oi = $r("transitionend"), si = /* @__PURE__ */ new Map(), ci = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	ci.push("scrollEnd");
	function li(e, t) {
		si.set(e, t), Ft(t, [e]);
	}
	var ui = 0;
	function di(e, t) {
		if (e.name != null && e.name !== "auto") return e.name;
		if (t.autoName !== null) return t.autoName;
		e = vd.identifierPrefix;
		var n = ui++;
		return e = "_" + e + "t_" + n.toString(32) + "_", t.autoName = e;
	}
	function fi(e) {
		if (e == null || typeof e == "string") return e;
		var t = null, n = Ed;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = e[n[r]];
			if (i != null) {
				if (i === "none") return "none";
				t = t == null ? i : t + (" " + i);
			}
		}
		return t ?? e.default;
	}
	function pi(e, t) {
		return e = fi(e), t = fi(t), t == null ? e === "auto" ? null : e : t === "auto" ? null : t;
	}
	var mi = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	}, hi = [], gi = 0, _i = 0;
	function vi() {
		for (var e = gi, t = _i = gi = 0; t < e;) {
			var n = hi[t];
			hi[t++] = null;
			var r = hi[t];
			hi[t++] = null;
			var i = hi[t];
			hi[t++] = null;
			var a = hi[t];
			if (hi[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && Si(n, i, a);
		}
	}
	function yi(e, t, n, r) {
		hi[gi++] = e, hi[gi++] = t, hi[gi++] = n, hi[gi++] = r, _i |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function bi(e, t, n, r) {
		return yi(e, t, n, r), Ci(e);
	}
	function xi(e, t) {
		return yi(e, null, null, t), Ci(e);
	}
	function Si(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - Je(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function Ci(e) {
		if (50 < Dd) throw Dd = 0, Od = null, Error(o(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var wi = {};
	function Ti(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function Ei(e, t, n, r) {
		return new Ti(e, t, n, r);
	}
	function Di(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function Oi(e, t) {
		var n = e.alternate;
		return n === null ? (n = Ei(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 1206910976, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function ki(e, t) {
		e.flags &= 1206910978;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function Ai(e, t, n, r, i, a) {
		var s = 0;
		if (r = e, typeof r == "function") Di(r) && (s = 1);
		else if (typeof r == "string") s = qm(e, n, ge.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (r) {
			case z: return e = Ei(31, n, t, i), e.elementType = z, e.lanes = a, e;
			case j: return ji(n.children, i, a, t);
			case M:
				s = 8, i |= 24;
				break;
			case N: return e = Ei(12, n, t, i | 2), e.elementType = N, e.lanes = a, e;
			case I: return e = Ei(13, n, t, i), e.elementType = I, e.lanes = a, e;
			case te: return e = Ei(19, n, t, i), e.elementType = te, e.lanes = a, e;
			case ne:
			case ie: return e = i | 32, e = Ei(30, n, t, e), e.elementType = ie, e.lanes = a, e.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}, e;
			default:
				if (typeof r == "object" && r) switch (r.$$typeof) {
					case F:
						s = 10;
						break a;
					case P:
						s = 9;
						break a;
					case ee:
						s = 11;
						break a;
					case L:
						s = 14;
						break a;
					case R:
						s = 16, r = null;
						break a;
				}
				s = 29, n = Error(o(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = Ei(s, n, t, i), t.elementType = e, t.type = r, t.lanes = a, t;
	}
	function ji(e, t, n, r) {
		return e = Ei(7, e, r, t), e.lanes = n, e;
	}
	function Mi(e, t, n) {
		return e = Ei(6, e, null, t), e.lanes = n, e;
	}
	function Ni(e) {
		var t = Ei(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function Pi(e, t, n) {
		return t = Ei(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var Fi = /* @__PURE__ */ new WeakMap();
	function Ii(e, t) {
		if (typeof e == "object" && e) {
			var n = Fi.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: Ae(t)
			}, Fi.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: Ae(t)
		};
	}
	var Li = [], Ri = 0, zi = null, Bi = 0, Vi = [], Hi = 0, Ui = null, Wi = 1, Gi = "";
	function Ki(e, t) {
		Li[Ri++] = Bi, Li[Ri++] = zi, zi = e, Bi = t;
	}
	function qi(e, t, n) {
		Vi[Hi++] = Wi, Vi[Hi++] = Gi, Vi[Hi++] = Ui, Ui = e;
		var r = Wi;
		e = Gi;
		var i = 32 - Je(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Je(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, Wi = 1 << 32 - Je(t) + i | n << i | r, Gi = a + e;
		} else Wi = 1 << a | n << i | r, Gi = e;
	}
	function Ji(e) {
		e.return !== null && (Ki(e, 1), qi(e, 1, 0));
	}
	function Yi(e) {
		for (; e === zi;) zi = Li[--Ri], Li[Ri] = null, Bi = Li[--Ri], Li[Ri] = null;
		for (; e === Ui;) Ui = Vi[--Hi], Vi[Hi] = null, Gi = Vi[--Hi], Vi[Hi] = null, Wi = Vi[--Hi], Vi[Hi] = null;
	}
	function Xi(e, t) {
		Vi[Hi++] = Wi, Vi[Hi++] = Gi, Vi[Hi++] = Ui, Wi = t.id, Gi = t.overflow, Ui = e;
	}
	var Zi = null, Qi = null, K = !1, $i = null, ea = !1, ta = Error(o(519));
	function na(e) {
		throw ca(Ii(Error(o(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), ta;
	}
	function ra(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[vt] = e, t[yt] = r, n) {
			case "dialog":
				$("cancel", t), $("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				$("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < Rf.length; n++) $(Rf[n], t);
				break;
			case "source":
				$("error", t);
				break;
			case "img":
			case "image":
			case "link":
				$("error", t), $("load", t);
				break;
			case "details":
				$("toggle", t);
				break;
			case "input":
				$("invalid", t), $t(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				$("invalid", t);
				break;
			case "textarea": $("invalid", t), rn(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || $f(t.textContent, n) ? (r.popover != null && ($("beforetoggle", t), $("toggle", t)), r.onScroll != null && $("scroll", t), r.onScrollEnd != null && $("scrollend", t), r.onClick != null && (t.onclick = pn), t = !0) : t = !1, t || na(e, !0);
	}
	function ia(e) {
		for (Zi = e.return; Zi;) switch (Zi.tag) {
			case 5:
			case 31:
			case 13:
				ea = !1;
				return;
			case 27:
			case 3:
				ea = !0;
				return;
			default: Zi = Zi.return;
		}
	}
	function aa(e) {
		if (e !== Zi) return !1;
		if (!K) return ia(e), K = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || pp(e.type, e.memoizedProps)), n = !n), n && Qi && na(e), ia(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(o(317));
			Qi = dm(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(o(317));
			Qi = dm(e);
		} else t === 27 ? (t = Qi, Sp(e.type) ? (e = um, um = null, Qi = e) : Qi = t) : Qi = Zi ? lm(e.stateNode.nextSibling) : null;
		return !0;
	}
	function oa() {
		Qi = Zi = null, K = !1;
	}
	function sa() {
		var e = $i;
		return e !== null && (ud === null ? ud = e : ud.push.apply(ud, e), $i = null), e;
	}
	function ca(e) {
		$i === null ? $i = [e] : $i.push(e);
	}
	var la = me(null), ua = null, da = null;
	function fa(e, t, n) {
		H(la, t._currentValue), t._currentValue = n;
	}
	function pa(e) {
		e._currentValue = la.current, he(la);
	}
	function ma(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function ha(e, t, n, r) {
		var i = e.child;
		for (i !== null && (i.return = e); i !== null;) {
			var a = i.dependencies;
			if (a !== null) {
				var s = i.child;
				a = a.firstContext;
				a: for (; a !== null;) {
					var c = a;
					a = i;
					for (var l = 0; l < t.length; l++) if (c.context === t[l]) {
						a.lanes |= n, c = a.alternate, c !== null && (c.lanes |= n), ma(a.return, n, e), r || (s = null);
						break a;
					}
					a = c.next;
				}
			} else if (i.tag === 18) {
				if (s = i.return, s === null) throw Error(o(341));
				s.lanes |= n, a = s.alternate, a !== null && (a.lanes |= n), ma(s, n, e), s = null;
			} else i.tag === 13 && i.memoizedState !== null && i.memoizedState.dehydrated === null ? (i.lanes |= n, s = i.alternate, s !== null && (s.lanes |= n), ma(i.return, n, e), s = i.child, s = s === null ? null : s.sibling) : s = i.child;
			if (s !== null) s.return = i;
			else for (s = i; s !== null;) {
				if (s === e) {
					s = null;
					break;
				}
				if (i = s.sibling, i !== null) {
					i.return = s.return, s = i;
					break;
				}
				s = s.return;
			}
			i = s;
		}
	}
	function ga(e, t, n, r) {
		e = null;
		for (var i = t, a = !1; i !== null;) {
			if (!a) {
				if (i.flags & 524288) a = !0;
				else if (i.flags & 262144) break;
			}
			if (i.tag === 10) {
				var s = i.alternate;
				if (s === null) throw Error(o(387));
				if (s = s.memoizedProps, s !== null) {
					var c = i.type;
					Fr(i.pendingProps.value, s.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (i === ye.current) {
				if (s = i.alternate, s === null) throw Error(o(387));
				s.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e === null ? e = [sh] : e.push(sh));
			}
			i = i.return;
		}
		return e !== null && ha(t, e, n, r), t.flags |= 262144, e !== null;
	}
	function _a(e) {
		for (e = e.firstContext; e !== null;) {
			if (!Fr(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function va(e) {
		ua = e, da = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function ya(e) {
		return xa(ua, e);
	}
	function ba(e, t) {
		return ua === null && va(e), xa(e, t);
	}
	function xa(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, da === null) {
			if (e === null) throw Error(o(308));
			da = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else da = da.next = t;
		return n;
	}
	var Sa = typeof AbortController < "u" ? AbortController : function() {
		var e = [], t = this.signal = {
			aborted: !1,
			addEventListener: function(t, n) {
				e.push(n);
			}
		};
		this.abort = function() {
			t.aborted = !0, e.forEach(function(e) {
				return e();
			});
		};
	}, Ca = t.unstable_scheduleCallback, wa = t.unstable_NormalPriority, Ta = {
		$$typeof: F,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function Ea() {
		return {
			controller: new Sa(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function Da(e) {
		e.refCount--, e.refCount === 0 && Ca(wa, function() {
			e.controller.abort();
		});
	}
	function Oa(e, t) {
		if (e.pendingLanes & 4194048) {
			var n = e.transitionTypes;
			for (n === null && (n = e.transitionTypes = []), e = 0; e < t.length; e++) {
				var r = t[e];
				n.indexOf(r) === -1 && n.push(r);
			}
		}
	}
	var ka = null;
	function Aa(e) {
		var t = e.transitionTypes;
		return e.transitionTypes = null, t;
	}
	var q = null, ja = 0, Ma = 0, Na = null;
	function Pa(e, t) {
		if (q === null) {
			var n = q = [];
			ja = 0, Ma = Nf(), Na = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return ja++, t.then(Fa, Fa), t;
	}
	function Fa() {
		if (--ja === 0 && (ka = null, q !== null)) {
			Na !== null && (Na.status = "fulfilled");
			var e = q;
			q = null, Ma = 0, Na = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function Ia(e, t) {
		var n = [], r = {
			status: "pending",
			value: null,
			reason: null,
			then: function(e) {
				n.push(e);
			}
		};
		return e.then(function() {
			r.status = "fulfilled", r.value = t;
			for (var e = 0; e < n.length; e++) (0, n[e])(t);
		}, function(e) {
			for (r.status = "rejected", r.reason = e, e = 0; e < n.length; e++) (0, n[e])(void 0);
		}), r;
	}
	var La = B.S;
	B.S = function(e, t) {
		if (pd = Ie(), typeof t == "object" && t && typeof t.then == "function" && Pa(e, t), ka !== null) for (var n = yf; n !== null;) Oa(n, ka), n = n.next;
		if (n = e.types, n !== null) {
			for (var r = yf; r !== null;) Oa(r, n), r = r.next;
			if (Ma !== 0) {
				r = ka, r === null && (r = ka = []);
				for (var i = 0; i < n.length; i++) {
					var a = n[i];
					r.indexOf(a) === -1 && r.push(a);
				}
			}
		}
		La !== null && La(e, t);
	};
	var Ra = me(null);
	function za() {
		var e = Ra.current;
		return e === null ? Xu.pooledCache : e;
	}
	function Ba(e, t) {
		t === null ? H(Ra, Ra.current) : H(Ra, t.pool);
	}
	function Va() {
		var e = za();
		return e === null ? null : {
			parent: Ta._currentValue,
			pool: e
		};
	}
	var Ha = Error(o(460)), Ua = Error(o(474)), Wa = Error(o(542)), Ga = { then: function() {} };
	function Ka(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function qa(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(pn, pn), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, Za(e), e === void 0 && !("reason" in t) ? Error(o(600)) : e;
			default:
				if (typeof t.status == "string") t.then(pn, pn);
				else {
					if (e = Xu, e !== null && 100 < e.shellSuspendCounter) throw Error(o(482));
					e = t, e.status = "pending", e.then(function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "fulfilled", n.value = e;
						}
					}, function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "rejected", n.reason = e;
						}
					});
				}
				switch (t.status) {
					case "fulfilled": return t.value;
					case "rejected": throw e = t.reason, Za(e), e;
				}
				throw Ya = t, Ha;
		}
	}
	function Ja(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (Ya = e, Ha) : e;
		}
	}
	var Ya = null;
	function Xa() {
		if (Ya === null) throw Error(o(459));
		var e = Ya;
		return Ya = null, e;
	}
	function Za(e) {
		if (e === Ha || e === Wa) throw Error(o(483));
	}
	var Qa = null, $a = 0;
	function eo(e) {
		var t = $a;
		return $a += 1, Qa === null && (Qa = []), qa(Qa, e, t);
	}
	function to(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function no(e, t) {
		throw t.$$typeof === O ? Error(o(525)) : (e = Object.prototype.toString.call(t), Error(o(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function ro(e) {
		function t(t, n) {
			if (e) {
				var r = t.deletions;
				r === null ? (t.deletions = [n], t.flags |= 16) : r.push(n);
			}
		}
		function n(n, r) {
			if (!e) return null;
			for (; r !== null;) t(n, r), r = r.sibling;
			return null;
		}
		function r(e) {
			for (var t = /* @__PURE__ */ new Map(); e !== null;) e.key === null ? t.set(e.index, e) : t.set(e.key, e), e = e.sibling;
			return t;
		}
		function i(e, t) {
			return e = Oi(e, t), e.index = 0, e.sibling = null, e;
		}
		function a(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 134217730, n) : (r = r.index, r < n ? (t.flags |= 2, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 134217730), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = Mi(n, e.mode, r), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var a = n.type;
			return a === j ? (e = d(e, t, n.props.children, r, n.key), to(e, n), e) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === R && Ja(a) === t.type) ? (t = i(t, n.props), to(t, n), t.return = e, t) : (t = Ai(n.type, n.key, n.props, null, e.mode, r), to(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = Pi(n, e.mode, r), t.return = e, t) : (t = i(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, a) {
			return t === null || t.tag !== 7 ? (t = ji(n, e.mode, r, a), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = Mi("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case k: return n = Ai(t.type, t.key, t.props, null, e.mode, n), to(n, t), n.return = e, n;
					case A: return t = Pi(t, e.mode, n), t.return = e, t;
					case R: return t = Ja(t), f(e, t, n);
				}
				if (ue(t) || se(t)) return t = ji(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, eo(t), n);
				if (t.$$typeof === F) return f(e, ba(e, t), n);
				no(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number" || typeof n == "bigint") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case k: return n.key === i ? l(e, t, n, r) : null;
					case A: return n.key === i ? u(e, t, n, r) : null;
					case R: return n = Ja(n), p(e, t, n, r);
				}
				if (ue(n) || se(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, eo(n), r);
				if (n.$$typeof === F) return p(e, t, ba(e, n), r);
				no(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case k: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case A: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case R: return r = Ja(r), m(e, t, n, r, i);
				}
				if (ue(r) || se(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, eo(r), i);
				if (r.$$typeof === F) return m(e, t, n, ba(t, r), i);
				no(t, r);
			}
			return null;
		}
		function h(i, o, s, c) {
			for (var l = null, u = null, d = o, h = o = 0, g = null; d !== null && h < s.length; h++) {
				d.index > h ? (g = d, d = null) : g = d.sibling;
				var _ = p(i, d, s[h], c);
				if (_ === null) {
					d === null && (d = g);
					break;
				}
				e && d && _.alternate === null && t(i, d), o = a(_, o, h), u === null ? l = _ : u.sibling = _, u = _, d = g;
			}
			if (h === s.length) return n(i, d), K && Ki(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (o = a(d, o, h), u === null ? l = d : u.sibling = d, u = d);
				return K && Ki(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && (_ = g.alternate, _ !== null && d.delete(_.key === null ? h : _.key)), o = a(g, o, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), K && Ki(i, h), l;
		}
		function g(i, s, c, l) {
			if (c == null) throw Error(o(151));
			for (var u = null, d = null, h = s, g = s = 0, _ = null, v = c.next(); h !== null && !v.done; g++, v = c.next()) {
				h.index > g ? (_ = h, h = null) : _ = h.sibling;
				var y = p(i, h, v.value, l);
				if (y === null) {
					h === null && (h = _);
					break;
				}
				e && h && y.alternate === null && t(i, h), s = a(y, s, g), d === null ? u = y : d.sibling = y, d = y, h = _;
			}
			if (v.done) return n(i, h), K && Ki(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (s = a(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return K && Ki(i, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && (_ = v.alternate, _ !== null && h.delete(_.key === null ? g : _.key)), s = a(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), K && Ki(i, g), u;
		}
		function _(e, r, a, c) {
			if (typeof a == "object" && a && a.type === j && a.key === null && a.props.ref === void 0 && (a = a.props.children), typeof a == "object" && a) {
				switch (a.$$typeof) {
					case k:
						a: {
							for (var l = a.key; r !== null;) {
								if (r.key === l) {
									if (l = a.type, l === j) {
										if (r.tag === 7) {
											n(e, r.sibling), c = i(r, a.props.children), to(c, a), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === R && Ja(l) === r.type) {
										n(e, r.sibling), c = i(r, a.props), to(c, a), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							a.type === j ? (c = ji(a.props.children, e.mode, c, a.key), to(c, a), c.return = e, e = c) : (c = Ai(a.type, a.key, a.props, null, e.mode, c), to(c, a), c.return = e, e = c);
						}
						return s(e);
					case A:
						a: {
							for (l = a.key; r !== null;) {
								if (r.key === l) {
									if (r.tag === 4 && r.stateNode.containerInfo === a.containerInfo && r.stateNode.implementation === a.implementation) {
										n(e, r.sibling), c = i(r, a.children || []), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							c = Pi(a, e.mode, c), c.return = e, e = c;
						}
						return s(e);
					case R: return a = Ja(a), _(e, r, a, c);
				}
				if (ue(a)) return h(e, r, a, c);
				if (se(a)) {
					if (l = se(a), typeof l != "function") throw Error(o(150));
					return a = l.call(a), g(e, r, a, c);
				}
				if (typeof a.then == "function") return _(e, r, eo(a), c);
				if (a.$$typeof === F) return _(e, r, ba(e, a), c);
				no(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" || typeof a == "bigint" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), c = i(r, a), c.return = e, e = c) : (n(e, r), c = Mi(a, e.mode, c), c.return = e, e = c), s(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				$a = 0;
				var i = _(e, t, n, r);
				return Qa = null, i;
			} catch (t) {
				if (t === Ha || t === Wa) throw t;
				var a = Ei(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var io = ro(!0), ao = ro(!1), oo = !1;
	function so(e) {
		e.updateQueue = {
			baseState: e.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function co(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function lo(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function uo(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, X & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = Ci(e), Si(e, null, n), t;
		}
		return yi(e, r, t, n), Ci(e);
	}
	function fo(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, dt(e, n);
		}
	}
	function po(e, t) {
		var n = e.updateQueue, r = e.alternate;
		if (r !== null && (r = r.updateQueue, n === r)) {
			var i = null, a = null;
			if (n = n.firstBaseUpdate, n !== null) {
				do {
					var o = {
						lane: n.lane,
						tag: n.tag,
						payload: n.payload,
						callback: null,
						next: null
					};
					a === null ? i = a = o : a = a.next = o, n = n.next;
				} while (n !== null);
				a === null ? i = a = t : a = a.next = t;
			} else i = a = t;
			n = {
				baseState: r.baseState,
				firstBaseUpdate: i,
				lastBaseUpdate: a,
				shared: r.shared,
				callbacks: r.callbacks
			}, e.updateQueue = n;
		} else e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
	}
	var mo = !1;
	function ho() {
		if (mo) {
			var e = Na;
			if (e !== null) throw e;
		}
	}
	function go(e, t, n, r) {
		mo = !1;
		var i = e.updateQueue;
		oo = !1;
		var a = i.firstBaseUpdate, o = i.lastBaseUpdate, s = i.shared.pending;
		if (s !== null) {
			i.shared.pending = null;
			var c = s, l = c.next;
			c.next = null, o === null ? a = l : o.next = l, o = c;
			var u = e.alternate;
			u !== null && (u = u.updateQueue, s = u.lastBaseUpdate, s !== o && (s === null ? u.firstBaseUpdate = l : s.next = l, u.lastBaseUpdate = c));
		}
		if (a !== null) {
			var d = i.baseState;
			o = 0, u = l = c = null, s = a;
			do {
				var f = s.lane & -536870913, p = f !== s.lane;
				if (p ? (Q & f) === f : (r & f) === f) {
					f !== 0 && f === Ma && (mo = !0), u !== null && (u = u.next = {
						lane: 0,
						tag: s.tag,
						payload: s.payload,
						callback: null,
						next: null
					});
					a: {
						var m = e, h = s;
						f = t;
						var g = n;
						switch (h.tag) {
							case 1:
								if (m = h.payload, typeof m == "function") {
									d = m.call(g, d, f);
									break a;
								}
								d = m;
								break a;
							case 3: m.flags = m.flags & -65537 | 128;
							case 0:
								if (m = h.payload, f = typeof m == "function" ? m.call(g, d, f) : m, f == null) break a;
								d = D({}, d, f);
								break a;
							case 2: oo = !0;
						}
					}
					f = s.callback, f !== null && (e.flags |= 64, p && (e.flags |= 8192), p = i.callbacks, p === null ? i.callbacks = [f] : p.push(f));
				} else p = {
					lane: f,
					tag: s.tag,
					payload: s.payload,
					callback: s.callback,
					next: null
				}, u === null ? (l = u = p, c = d) : u = u.next = p, o |= f;
				if (s = s.next, s === null) {
					if (s = i.shared.pending, s === null) break;
					p = s, s = p.next, p.next = null, i.lastBaseUpdate = p, i.shared.pending = null;
				}
			} while (1);
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), id |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function _o(e, t) {
		if (typeof e != "function") throw Error(o(191, e));
		e.call(t);
	}
	function vo(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) _o(n[e], t);
	}
	var yo = me(null), bo = me(0);
	function xo(e, t) {
		e = nd, H(bo, e), H(yo, t), nd = e | t.baseLanes;
	}
	function So() {
		H(bo, nd), H(yo, yo.current);
	}
	function Co() {
		nd = bo.current, he(yo), he(bo);
	}
	var wo = me(null), To = null;
	function Eo(e) {
		var t = e.alternate;
		H(jo, jo.current & 1), H(wo, e), To === null && (t === null || yo.current !== null || t.memoizedState !== null) && (To = e);
	}
	function Do(e) {
		H(jo, jo.current), H(wo, e), To === null && (To = e);
	}
	function Oo(e) {
		e.tag === 22 ? (H(jo, jo.current), H(wo, e), To === null && (To = e)) : ko();
	}
	function ko() {
		H(jo, jo.current), H(wo, wo.current);
	}
	function Ao(e) {
		he(wo), To === e && (To = null), he(jo);
	}
	var jo = me(0);
	function Mo(e, t) {
		H(wo, wo.current), H(jo, t);
	}
	function No(e) {
		he(jo), he(wo), To === e && (To = null);
	}
	function Po(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || om(n) || sm(n))) return t;
			} else if (t.tag === 19 && t.memoizedProps.revealOrder !== "independent") {
				if (t.flags & 128) return t;
			} else if (t.child !== null) {
				t.child.return = t, t = t.child;
				continue;
			}
			if (t === e) break;
			for (; t.sibling === null;) {
				if (t.return === null || t.return === e) return null;
				t = t.return;
			}
			t.sibling.return = t.return, t = t.sibling;
		}
		return null;
	}
	var Fo = 0, J = null, Y = null, Io = null, Lo = !1, Ro = !1, zo = !1, Bo = 0, Vo = 0, Ho = null, Uo = 0;
	function Wo() {
		throw Error(o(321));
	}
	function Go(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Fr(e[n], t[n])) return !1;
		return !0;
	}
	function Ko(e, t, n, r, i, a) {
		return Fo = a, J = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, B.H = e === null || e.memoizedState === null ? lc : uc, zo = !1, a = n(r, i), zo = !1, Ro && (a = Jo(t, n, r, i)), qo(e), a;
	}
	function qo(e) {
		B.H = cc;
		var t = Y !== null && Y.next !== null;
		if (Fo = 0, Io = Y = J = null, Lo = !1, Vo = 0, Ho = null, t) throw Error(o(300));
		e === null || Dc || (e = e.dependencies, e !== null && _a(e) && (Dc = !0));
	}
	function Jo(e, t, n, r) {
		J = e;
		var i = 0;
		do {
			if (Ro && (Ho = null), Vo = 0, Ro = !1, 25 <= i) throw Error(o(301));
			if (i += 1, Io = Y = null, e.updateQueue != null) {
				var a = e.updateQueue;
				a.lastEffect = null, a.events = null, a.stores = null, a.memoCache != null && (a.memoCache.index = 0);
			}
			B.H = dc, a = t(n, r);
		} while (Ro);
		return a;
	}
	function Yo() {
		var e = B.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? ns(t) : t, e = e.useState()[0], (Y === null ? null : Y.memoizedState) !== e && (J.flags |= 1024), t;
	}
	function Xo() {
		var e = Bo !== 0;
		return Bo = 0, e;
	}
	function Zo(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function Qo(e) {
		if (Lo) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			Lo = !1;
		}
		Fo = 0, Io = Y = J = null, Ro = !1, Vo = Bo = 0, Ho = null;
	}
	function $o() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return Io === null ? J.memoizedState = Io = e : Io = Io.next = e, Io;
	}
	function es() {
		if (Y === null) {
			var e = J.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = Y.next;
		var t = Io === null ? J.memoizedState : Io.next;
		if (t !== null) Io = t, Y = e;
		else {
			if (e === null) throw J.alternate === null ? Error(o(467)) : Error(o(310));
			Y = e, e = {
				memoizedState: Y.memoizedState,
				baseState: Y.baseState,
				baseQueue: Y.baseQueue,
				queue: Y.queue,
				next: null
			}, Io === null ? J.memoizedState = Io = e : Io = Io.next = e;
		}
		return Io;
	}
	function ts() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function ns(e) {
		var t = Vo;
		return Vo += 1, Ho === null && (Ho = []), e = qa(Ho, e, t), t = J, (Io === null ? t.memoizedState : Io.next) === null && (t = t.alternate, B.H = t === null || t.memoizedState === null ? lc : uc), e;
	}
	function rs(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return ns(e);
			if (e.$$typeof === ae) return;
			if (e.$$typeof === F) return ya(e);
		}
		throw Error(o(438, String(e)));
	}
	function is(e) {
		var t = null, n = J.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = J.alternate;
			r !== null && (r = r.updateQueue, r !== null && (r = r.memoCache, r != null && (t = {
				data: r.data.map(function(e) {
					return e.slice();
				}),
				index: 0
			})));
		}
		if (t ??= {
			data: [],
			index: 0
		}, n === null && (n = ts(), J.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = re;
		return t.index++, n;
	}
	function as(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function os(e) {
		return ss(es(), Y, e);
	}
	function ss(e, t, n) {
		var r = e.queue;
		if (r === null) throw Error(o(311));
		r.lastRenderedReducer = n;
		var i = e.baseQueue, a = r.pending;
		if (a !== null) {
			if (i !== null) {
				var s = i.next;
				i.next = a.next, a.next = s;
			}
			t.baseQueue = i = a, r.pending = null;
		}
		if (a = e.baseState, i === null) e.memoizedState = a;
		else {
			t = i.next;
			var c = s = null, l = null, u = t, d = !1;
			do {
				var f = u.lane & -536870913;
				if (f === u.lane ? (Fo & f) === f : (Q & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === Ma && (d = !0);
					else if ((Fo & p) === p) {
						u = u.next, p === Ma && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, s = a) : l = l.next = f, J.lanes |= p, id |= p;
					f = u.action, zo && n(a, f), a = u.hasEagerState ? u.eagerState : n(a, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, s = a) : l = l.next = p, J.lanes |= f, id |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? s = a : l.next = c, !Fr(a, e.memoizedState) && (Dc = !0, d && (n = Na, n !== null))) throw n;
			e.memoizedState = a, e.baseState = s, e.baseQueue = l, r.lastRenderedState = a;
		}
		return i === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function cs(e) {
		var t = es(), n = t.queue;
		if (n === null) throw Error(o(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, i = n.pending, a = t.memoizedState;
		if (i !== null) {
			n.pending = null;
			var s = i = i.next;
			do
				a = e(a, s.action), s = s.next;
			while (s !== i);
			Fr(a, t.memoizedState) || (Dc = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
		}
		return [a, r];
	}
	function ls(e, t, n) {
		var r = J, i = es(), a = K;
		if (a) {
			if (n === void 0) throw Error(o(407));
			n = n();
		} else n = t();
		var s = !Fr((Y || i).memoizedState, n);
		if (s && (i.memoizedState = n, Dc = !0), i = i.queue, Ps(fs.bind(null, r, i, e), [e]), e = i.getSnapshot !== t || s || Io !== null && !!(Io.memoizedState.tag & 1), ks(e ? 9 : 8, { destroy: void 0 }, ds.bind(null, r, i, n, t), null), e) {
			if (r.flags |= 2048, Xu === null) throw Error(o(349));
			a || Fo & 127 || us(r, t, n);
		}
		return n;
	}
	function us(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = J.updateQueue, t === null ? (t = ts(), J.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function ds(e, t, n, r) {
		t.value = n, t.getSnapshot = r, ps(t) && ms(e);
	}
	function fs(e, t, n) {
		return n(function() {
			ps(t) && ms(e);
		});
	}
	function ps(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Fr(e, n);
		} catch {
			return !0;
		}
	}
	function ms(e) {
		var t = xi(e, 2);
		t !== null && Md(t, e, 2);
	}
	function hs(e) {
		var t = $o();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), zo) {
				qe(!0);
				try {
					n();
				} finally {
					qe(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: as,
			lastRenderedState: e
		}, t;
	}
	function gs(e, t, n, r) {
		return e.baseState = n, ss(e, Y, typeof r == "function" ? r : as);
	}
	function _s(e, t, n, r, i) {
		if (ac(e)) throw Error(o(485));
		if (e = t.action, e !== null) {
			var a = {
				payload: i,
				action: e,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(e) {
					a.listeners.push(e);
				}
			};
			B.T === null ? a.isTransition = !1 : n(!0), r(a), n = t.pending, n === null ? (a.next = t.pending = a, vs(t, a)) : (a.next = n.next, t.pending = n.next = a);
		}
	}
	function vs(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = B.T, o = {};
			o.types = a === null ? null : a.types, B.T = o;
			try {
				var s = n(i, r), c = B.S;
				c !== null && c(o, s), ys(e, t, s);
			} catch (n) {
				xs(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), B.T = a;
			}
		} else try {
			a = n(i, r), ys(e, t, a);
		} catch (n) {
			xs(e, t, n);
		}
	}
	function ys(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			bs(e, t, n);
		}, function(n) {
			return xs(e, t, n);
		}) : bs(e, t, n);
	}
	function bs(e, t, n) {
		t.status = "fulfilled", t.value = n, Ss(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, vs(e, n)));
	}
	function xs(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, Ss(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function Ss(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function Cs(e, t) {
		return t;
	}
	function ws(e, t) {
		if (K) {
			var n = Xu.formState;
			if (n !== null) {
				a: {
					var r = J;
					if (K) {
						if (Qi) {
							b: {
								for (var i = Qi, a = ea; i.nodeType !== 8;) if (!a || (i = lm(i.nextSibling), i === null)) {
									i = null;
									break b;
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								Qi = lm(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						na(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = $o(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Cs,
			lastRenderedState: t
		}, n.queue = r, n = nc.bind(null, J, r), r.dispatch = n, r = hs(!1), a = ic.bind(null, J, !1, r.queue), r = $o(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = _s.bind(null, J, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function Ts(e) {
		return Es(es(), Y, e);
	}
	function Es(e, t, n) {
		if (t = ss(e, t, Cs)[0], e = os(as)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = ns(t);
		} catch (e) {
			throw e === Ha ? Wa : e;
		}
		else r = t;
		t = es();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (J.flags |= 2048, ks(9, { destroy: void 0 }, Ds.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function Ds(e, t) {
		e.action = t;
	}
	function Os(e) {
		var t = es(), n = Y;
		if (n !== null) return Es(t, n, e);
		es(), t = t.memoizedState, n = es();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function ks(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = J.updateQueue, t === null && (t = ts(), J.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function As() {
		return es().memoizedState;
	}
	function js(e, t, n, r) {
		var i = $o();
		J.flags |= e, i.memoizedState = ks(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function Ms(e, t, n, r) {
		var i = es();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		Y !== null && r !== null && Go(r, Y.memoizedState.deps) ? i.memoizedState = ks(t, a, n, r) : (J.flags |= e, i.memoizedState = ks(1 | t, a, n, r));
	}
	function Ns(e, t) {
		js(8390656, 8, e, t);
	}
	function Ps(e, t) {
		Ms(2048, 8, e, t);
	}
	function Fs(e) {
		J.flags |= 4;
		var t = J.updateQueue;
		if (t === null) t = ts(), J.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function Is(e) {
		var t = es().memoizedState;
		return Fs({
			ref: t,
			nextImpl: e
		}), function() {
			if (X & 2) throw Error(o(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function Ls(e, t) {
		return Ms(4, 2, e, t);
	}
	function Rs(e, t) {
		return Ms(4, 4, e, t);
	}
	function zs(e, t) {
		if (typeof t == "function") {
			e = e();
			var n = t(e);
			return function() {
				typeof n == "function" ? n() : t(null);
			};
		}
		if (t != null) return e = e(), t.current = e, function() {
			t.current = null;
		};
	}
	function Bs(e, t, n) {
		n = n == null ? null : n.concat([e]), Ms(4, 4, zs.bind(null, t, e), n);
	}
	function Vs() {}
	function Hs(e, t) {
		var n = es();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && Go(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function Us(e, t) {
		var n = es();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && Go(t, r[1])) return r[0];
		if (r = e(), zo) {
			qe(!0);
			try {
				e();
			} finally {
				qe(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function Ws(e, t, n) {
		return n === void 0 || Fo & 1073741824 && !(Q & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = Ad(), J.lanes |= e, id |= e, n);
	}
	function Gs(e, t, n, r) {
		return Fr(n, t) ? n : yo.current === null ? !(Fo & 106) || Fo & 1073741824 && !(Q & 261930) ? (Dc = !0, e.memoizedState = n) : (e = Ad(), J.lanes |= e, id |= e, t) : (e = Ws(e, n, r), Fr(e, t) || (Dc = !0), e);
	}
	function Ks(e, t, n, r, i) {
		var a = V.p;
		V.p = a !== 0 && 8 > a ? a : 8;
		var o = B.T, s = {};
		s.types = o === null ? null : o.types, B.T = s, ic(e, !1, t, n);
		try {
			var c = i(), l = B.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? rc(e, t, Ia(c, r), kd(e)) : rc(e, t, r, kd(e));
		} catch (n) {
			rc(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, kd());
		} finally {
			V.p = a, o !== null && s.types !== null && (o.types = s.types), B.T = o;
		}
	}
	function qs() {}
	function Js(e, t, n, r) {
		if (e.tag !== 5) throw Error(o(476));
		var i = Ys(e).queue;
		Ks(e, i, t, de, n === null ? qs : function() {
			return Xs(e), n(r);
		});
	}
	function Ys(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: de,
			baseState: de,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: as,
				lastRenderedState: de
			},
			next: null
		};
		var n = {};
		return t.next = {
			memoizedState: n,
			baseState: n,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: as,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function Xs(e) {
		var t = Ys(e);
		t.next === null && (t = e.alternate.memoizedState), rc(e, t.next.queue, {}, kd());
	}
	function Zs() {
		return ya(sh);
	}
	function Qs() {
		return es().memoizedState;
	}
	function $s() {
		return es().memoizedState;
	}
	function ec(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = kd();
					e = lo(n);
					var r = uo(t, e, n);
					r !== null && (Md(r, t, n), fo(r, t, n)), t = { cache: Ea() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function tc(e, t, n) {
		var r = kd();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, ac(e) ? oc(t, n) : (n = bi(e, t, n, r), n !== null && (Md(n, e, r), sc(n, t, r)));
	}
	function nc(e, t, n) {
		rc(e, t, n, kd());
	}
	function rc(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (ac(e)) oc(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, Fr(s, o)) return yi(e, t, i, 0), Xu === null && vi(), !1;
			} catch {}
			if (n = bi(e, t, i, r), n !== null) return Md(n, e, r), sc(n, t, r), !0;
		}
		return !1;
	}
	function ic(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: Nf(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, ac(e)) {
			if (t) throw Error(o(479));
		} else t = bi(e, n, r, 2), t !== null && Md(t, e, 2);
	}
	function ac(e) {
		var t = e.alternate;
		return e === J || t !== null && t === J;
	}
	function oc(e, t) {
		Ro = Lo = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function sc(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, dt(e, n);
		}
	}
	var cc = {
		readContext: ya,
		use: rs,
		useCallback: Wo,
		useContext: Wo,
		useEffect: Wo,
		useImperativeHandle: Wo,
		useLayoutEffect: Wo,
		useInsertionEffect: Wo,
		useMemo: Wo,
		useReducer: Wo,
		useRef: Wo,
		useState: Wo,
		useDebugValue: Wo,
		useDeferredValue: Wo,
		useTransition: Wo,
		useSyncExternalStore: Wo,
		useId: Wo,
		useHostTransitionStatus: Wo,
		useFormState: Wo,
		useActionState: Wo,
		useOptimistic: Wo,
		useMemoCache: Wo,
		useCacheRefresh: Wo,
		useEffectEvent: Wo
	}, lc = {
		readContext: ya,
		use: rs,
		useCallback: function(e, t) {
			return $o().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: ya,
		useEffect: Ns,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), js(4194308, 4, zs.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return js(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			js(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = $o();
			t = t === void 0 ? null : t;
			var r = e();
			if (zo) {
				qe(!0);
				try {
					e();
				} finally {
					qe(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = $o();
			if (n !== void 0) {
				var i = n(t);
				if (zo) {
					qe(!0);
					try {
						n(t);
					} finally {
						qe(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = tc.bind(null, J, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = $o();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = hs(e);
			var t = e.queue, n = nc.bind(null, J, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: Vs,
		useDeferredValue: function(e, t) {
			return Ws($o(), e, t);
		},
		useTransition: function() {
			var e = hs(!1);
			return e = Ks.bind(null, J, e.queue, !0, !1), $o().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = J, i = $o();
			if (K) {
				if (n === void 0) throw Error(o(407));
				n = n();
			} else {
				if (n = t(), Xu === null) throw Error(o(349));
				Q & 127 || us(r, t, n);
			}
			i.memoizedState = n;
			var a = {
				value: n,
				getSnapshot: t
			};
			return i.queue = a, Ns(fs.bind(null, r, a, e), [e]), r.flags |= 2048, ks(9, { destroy: void 0 }, ds.bind(null, r, a, n, t), null), n;
		},
		useId: function() {
			var e = $o(), t = Xu.identifierPrefix;
			if (K) {
				var n = Gi, r = Wi;
				n = (r & ~(1 << 32 - Je(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = Bo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = Uo++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: Zs,
		useFormState: ws,
		useActionState: ws,
		useOptimistic: function(e) {
			var t = $o();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = ic.bind(null, J, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: is,
		useCacheRefresh: function() {
			return $o().memoizedState = ec.bind(null, J);
		},
		useEffectEvent: function(e) {
			var t = $o(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (X & 2) throw Error(o(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, uc = {
		readContext: ya,
		use: rs,
		useCallback: Hs,
		useContext: ya,
		useEffect: Ps,
		useImperativeHandle: Bs,
		useInsertionEffect: Ls,
		useLayoutEffect: Rs,
		useMemo: Us,
		useReducer: os,
		useRef: As,
		useState: function() {
			return os(as);
		},
		useDebugValue: Vs,
		useDeferredValue: function(e, t) {
			return Gs(es(), Y.memoizedState, e, t);
		},
		useTransition: function() {
			var e = os(as)[0], t = es().memoizedState;
			return [typeof e == "boolean" ? e : ns(e), t];
		},
		useSyncExternalStore: ls,
		useId: Qs,
		useHostTransitionStatus: Zs,
		useFormState: Ts,
		useActionState: Ts,
		useOptimistic: function(e, t) {
			return gs(es(), Y, e, t);
		},
		useMemoCache: is,
		useCacheRefresh: $s,
		useEffectEvent: Is
	}, dc = {
		readContext: ya,
		use: rs,
		useCallback: Hs,
		useContext: ya,
		useEffect: Ps,
		useImperativeHandle: Bs,
		useInsertionEffect: Ls,
		useLayoutEffect: Rs,
		useMemo: Us,
		useReducer: cs,
		useRef: As,
		useState: function() {
			return cs(as);
		},
		useDebugValue: Vs,
		useDeferredValue: function(e, t) {
			var n = es();
			return Y === null ? Ws(n, e, t) : Gs(n, Y.memoizedState, e, t);
		},
		useTransition: function() {
			var e = cs(as)[0], t = es().memoizedState;
			return [typeof e == "boolean" ? e : ns(e), t];
		},
		useSyncExternalStore: ls,
		useId: Qs,
		useHostTransitionStatus: Zs,
		useFormState: Os,
		useActionState: Os,
		useOptimistic: function(e, t) {
			var n = es();
			return Y === null ? (n.baseState = e, [e, n.queue.dispatch]) : gs(n, Y, e, t);
		},
		useMemoCache: is,
		useCacheRefresh: $s,
		useEffectEvent: Is
	};
	function fc(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : D({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var pc = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = kd(), i = lo(r);
			i.payload = t, n != null && (i.callback = n), t = uo(e, i, r), t !== null && (Md(t, e, r), fo(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = kd(), i = lo(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = uo(e, i, r), t !== null && (Md(t, e, r), fo(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = kd(), r = lo(n);
			r.tag = 2, t != null && (r.callback = t), t = uo(e, r, n), t !== null && (Md(t, e, n), fo(t, e, n));
		}
	};
	function mc(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Ir(n, r) || !Ir(i, a) : !0;
	}
	function hc(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && pc.enqueueReplaceState(t, t.state, null);
	}
	function gc(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = D({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function _c(e) {
		mi(e);
	}
	function vc(e) {
		console.error(e);
	}
	function yc(e) {
		mi(e);
	}
	function bc(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function xc(e, t, n) {
		try {
			var r = e.onCaughtError;
			r(n.value, {
				componentStack: n.stack,
				errorBoundary: t.tag === 1 ? t.stateNode : null
			});
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Sc(e, t, n) {
		return n = lo(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			bc(e, t);
		}, n;
	}
	function Cc(e) {
		return e = lo(e), e.tag = 3, e;
	}
	function wc(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				xc(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			xc(t, n, r), typeof i != "function" && (gd === null ? gd = /* @__PURE__ */ new Set([this]) : gd.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function Tc(e, t, n, r, i) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && ga(t, n, i, !0), n = wo.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13:
					case 19: return To === null ? Wd() : n.alternate === null && rd === 0 && (rd = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, r === Ga ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), pf(e, r, i)), !1;
					case 22: return n.flags |= 65536, r === Ga ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), pf(e, r, i)), !1;
				}
				throw Error(o(435, n.tag));
			}
			return pf(e, r, i), Wd(), !1;
		}
		if (K) return t = wo.current, t === null ? (r !== ta && (t = Error(o(423), { cause: r }), ca(Ii(t, n))), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, r = Ii(r, n), i = Sc(e.stateNode, r, i), po(e, i), rd !== 4 && (rd = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = i, r !== ta && (e = Error(o(422), { cause: r }), ca(Ii(e, n)))), !1;
		var a = Error(o(520), { cause: r });
		if (a = Ii(a, n), ld === null ? ld = [a] : ld.push(a), rd !== 4 && (rd = 2), t === null) return !0;
		r = Ii(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = i & -i, n.lanes |= e, e = Sc(n.stateNode, r, e), po(n, e), !1;
				case 1:
					if (t = n.type, a = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || a !== null && typeof a.componentDidCatch == "function" && (gd === null || !gd.has(a)))) return n.flags |= 65536, i &= -i, n.lanes |= i, i = Cc(i), wc(i, e, n, r), po(n, i), !1;
					break;
				case 22: if (n.memoizedState !== null) return n.flags |= 65536, !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Ec = Error(o(461)), Dc = !1;
	function Oc(e, t, n, r) {
		t.child = e === null ? ao(t, null, n, r) : io(t, e.child, n, r);
	}
	function kc(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return va(t), r = Ko(e, t, n, o, a, i), s = Xo(), e !== null && !Dc ? (Zo(e, t, i), rl(e, t, i)) : (K && s && Ji(t), t.flags |= 1, Oc(e, t, r, i), t.child);
	}
	function Ac(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !Di(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, jc(e, t, a, r, i)) : (e = Ai(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !il(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Ir : n, n(o, r) && e.ref === t.ref) return rl(e, t, i);
		}
		return t.flags |= 1, e = Oi(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function jc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Ir(a, r) && e.ref === t.ref) {
				if (Dc = !1, t.pendingProps = r = a, il(e, i)) e.flags & 131072 && (Dc = !0);
				else return t.lanes = e.lanes, rl(e, t, i);
			}
		}
		return zc(e, t, n, r, i);
	}
	function Mc(e, t, n, r) {
		var i = r.children, a = e === null ? null : e.memoizedState;
		if (e === null && t.stateNode === null && (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), r.mode === "hidden") {
			if (t.flags & 128) {
				if (a = a === null ? n : a.baseLanes | n, e !== null) {
					for (r = t.child = e.child, i = 0; r !== null;) i = i | r.lanes | r.childLanes, r = r.sibling;
					r = i & ~a;
				} else r = 0, t.child = null;
				return Pc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && Ba(t, a === null ? null : a.cachePool), a === null ? So() : xo(t, a), Oo(t);
			else return r = t.lanes = 536870912, Pc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && Ba(t, null), So(), ko()) : (Ba(t, a.cachePool), xo(t, a), ko(), t.memoizedState = null);
		return Oc(e, t, i, n), t.child;
	}
	function Nc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function Pc(e, t, n, r, i) {
		var a = za();
		return a = a === null ? null : {
			parent: Ta._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && Ba(t, null), So(), Oo(t), e !== null && ga(e, t, r, !0), t.childLanes = i, null;
	}
	function Fc(e, t) {
		return t = Jc({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function Ic(e, t, n) {
		return io(t, e.child, null, n), e = Fc(t, t.pendingProps), e.flags |= 2, Ao(t), t.memoizedState = null, e;
	}
	function Lc(e, t, n) {
		var r = t.pendingProps, i = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (K) {
				if (r.mode === "hidden") return e = Fc(t, r), t.lanes = 536870912, e.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, Nc(null, e);
				if (Do(t), (e = Qi) ? (e = am(e, ea), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Ui === null ? null : {
						id: Wi,
						overflow: Gi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Ni(e), n.return = t, t.child = n, Zi = t, Qi = null)) : e = null, e === null) throw na(t);
				return t.lanes = 536870912, null;
			}
			return Fc(t, r);
		}
		var a = e.memoizedState;
		if (a !== null) {
			var s = a.dehydrated;
			if (Do(t), i) {
				if (t.flags & 256) t.flags &= -257, t = Ic(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(o(558));
			} else if (Dc || ga(e, t, n, !1), i = (n & e.childLanes) !== 0, Dc || i) {
				if (yo.current === null) {
					if (r = Xu, r !== null && (s = ft(r, n), s !== 0 && s !== a.retryLane)) throw a.retryLane = s, xi(e, s), Md(r, e, s), Ec;
					Wd();
				}
				t = Ic(e, t, n);
			} else e = a.treeContext, Qi = lm(s.nextSibling), Zi = t, K = !0, $i = null, ea = !1, e !== null && Xi(t, e), t = Fc(t, r), t.flags |= 134221824;
			return t;
		}
		return e = Oi(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function Rc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(o(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function zc(e, t, n, r, i) {
		return va(t), n = Ko(e, t, n, r, void 0, i), r = Xo(), e !== null && !Dc ? (Zo(e, t, i), rl(e, t, i)) : (K && r && Ji(t), t.flags |= 1, Oc(e, t, n, i), t.child);
	}
	function Bc(e, t, n, r, i, a) {
		return va(t), t.updateQueue = null, n = Jo(t, r, n, i), qo(e), r = Xo(), e !== null && !Dc ? (Zo(e, t, a), rl(e, t, a)) : (K && r && Ji(t), t.flags |= 1, Oc(e, t, n, a), t.child);
	}
	function Vc(e, t, n, r, i) {
		if (va(t), t.stateNode === null) {
			var a = wi, o = n.contextType;
			typeof o == "object" && o && (a = ya(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = pc, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, so(t), o = n.contextType, a.context = typeof o == "object" && o ? ya(o) : wi, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (fc(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && pc.enqueueReplaceState(a, a.state, null), go(t, r, a, i), ho(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = gc(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = wi, typeof u == "object" && u && (o = ya(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && hc(t, a, r, o), oo = !1;
			var f = t.memoizedState;
			a.state = f, go(t, r, a, i), ho(), l = t.memoizedState, s || f !== l || oo ? (typeof d == "function" && (fc(t, n, d, r), l = t.memoizedState), (c = oo || mc(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, co(e, t), o = t.memoizedProps, u = gc(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = wi, typeof l == "object" && l && (c = ya(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && hc(t, a, r, c), oo = !1, f = t.memoizedState, a.state = f, go(t, r, a, i), ho();
			var p = t.memoizedState;
			o !== d || f !== p || oo || e !== null && e.dependencies !== null && _a(e.dependencies) ? (typeof s == "function" && (fc(t, n, s, r), p = t.memoizedState), (u = oo || mc(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && _a(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, Rc(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = io(t, e.child, null, i), t.child = io(t, null, n, i)) : Oc(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = rl(e, t, i), e;
	}
	function Hc(e, t, n, r) {
		return oa(), t.flags |= 256, Oc(e, t, n, r), t.child;
	}
	var Uc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function Wc(e) {
		return {
			baseLanes: e,
			cachePool: Va()
		};
	}
	function Gc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= sd), e;
	}
	function Kc(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : !!(jo.current & 2)), o && (i = !0, t.flags &= -129), o = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (K) {
				if (i ? Eo(t) : ko(), (e = Qi) ? (e = am(e, ea), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Ui === null ? null : {
						id: Wi,
						overflow: Gi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Ni(e), n.return = t, t.child = n, Zi = t, Qi = null)) : e = null, e === null) throw na(t);
				return t.lanes = sm(e) ? 32 : 536870912, null;
			}
			return a = r.children, r = r.fallback, i ? (ko(), i = t.mode, a = Jc({
				mode: "hidden",
				children: a
			}, i), r = ji(r, i, n, null), a.return = t, r.return = t, a.sibling = r, t.child = a, r = t.child, r.memoizedState = Wc(n), r.childLanes = Gc(e, o, n), t.memoizedState = Uc, Nc(null, r)) : (Eo(t), qc(t, a));
		}
		var s = e.memoizedState;
		if (s !== null) {
			var c = s.dehydrated;
			if (c !== null) return Xc(e, t, a, o, r, c, s, n);
		}
		return i ? (ko(), i = r.fallback, a = t.mode, s = e.child, c = s.sibling, r = Oi(s, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = s.subtreeFlags & 1206910976, c === null ? (i = ji(i, a, n, null), i.flags |= 2) : i = Oi(c, i), i.return = t, r.return = t, r.sibling = i, t.child = r, Nc(null, r), r = t.child, i = e.child.memoizedState, i === null ? i = Wc(n) : (a = i.cachePool, a === null ? a = Va() : (s = Ta._currentValue, a = a.parent === s ? a : {
			parent: s,
			pool: s
		}), i = {
			baseLanes: i.baseLanes | n,
			cachePool: a
		}), r.memoizedState = i, r.childLanes = Gc(e, o, n), t.memoizedState = Uc, Nc(e.child, r)) : (Eo(t), n = e.child, e = n.sibling, n = Oi(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function qc(e, t) {
		return t = Jc({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function Jc(e, t) {
		return e = Ei(22, e, null, t), e.lanes = 0, e;
	}
	function Yc(e, t, n) {
		return io(t, e.child, null, n), e = qc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function Xc(e, t, n, r, i, a, s, c) {
		if (n) return t.flags & 256 ? (Eo(t), t.flags &= -257, Yc(e, t, c)) : t.memoizedState === null ? (ko(), a = i.fallback, s = t.mode, i = Jc({
			mode: "visible",
			children: i.children
		}, s), a = ji(a, s, c, null), a.flags |= 2, i.return = t, a.return = t, i.sibling = a, t.child = i, io(t, e.child, null, c), i = t.child, i.memoizedState = Wc(c), i.childLanes = Gc(e, r, c), t.memoizedState = Uc, Nc(null, i)) : (ko(), t.child = e.child, t.flags |= 128, null);
		if (Eo(t), sm(a)) {
			if (r = a.nextSibling && a.nextSibling.dataset, r) var l = r.dgst;
			return r = l, r !== "" && (i = Error(o(419)), i.stack = "", i.digest = r, ca({
				value: i,
				source: null,
				stack: null
			})), Yc(e, t, c);
		}
		if (Dc || ga(e, t, c, !1), r = (c & e.childLanes) !== 0, Dc || r) {
			if (yo.current !== null) return Yc(e, t, c);
			if (r = Xu, r !== null && (i = ft(r, c), i !== 0 && i !== s.retryLane)) throw s.retryLane = i, xi(e, i), Md(r, e, i), Ec;
			return om(a) || Wd(), Yc(e, t, c);
		}
		return om(a) ? (t.flags |= 192, t.child = e.child, null) : (e = s.treeContext, Qi = lm(a.nextSibling), Zi = t, K = !0, $i = null, ea = !1, e !== null && Xi(t, e), t = qc(t, i.children), t.flags |= 134221824, t);
	}
	function Zc(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), ma(e.return, t, n);
	}
	function Qc(e) {
		for (var t = null; e !== null;) {
			var n = e.alternate;
			n !== null && Po(n) === null && (t = e), e = e.sibling;
		}
		return t;
	}
	function $c(e, t, n, r, i, a) {
		var o = e.memoizedState;
		o === null ? e.memoizedState = {
			isBackwards: t,
			rendering: null,
			renderingStartTime: 0,
			last: r,
			tail: n,
			tailMode: i,
			treeForkCount: a
		} : (o.isBackwards = t, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = i, o.treeForkCount = a);
	}
	function el(e) {
		var t = e.child;
		for (e.child = null; t !== null;) {
			var n = t.sibling;
			t.sibling = e.child, e.child = t, t = n;
		}
	}
	function tl(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = jo.current;
		if (t.flags & 128) return Mo(t, o), null;
		var s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, Mo(t, o), i === "backwards" && e !== null ? (el(e), Oc(e, t, r, n), el(e)) : Oc(e, t, r, n), r = K ? Bi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && Zc(e, n, t);
			else if (e.tag === 19) Zc(e, n, t);
			else if (e.child !== null) {
				e.child.return = e, e = e.child;
				continue;
			}
			if (e === t) break a;
			for (; e.sibling === null;) {
				if (e.return === null || e.return === t) break a;
				e = e.return;
			}
			e.sibling.return = e.return, e = e.sibling;
		}
		switch (i) {
			case "backwards":
				n = Qc(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null, el(t)), $c(t, !0, i, null, a, r);
				break;
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && Po(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				$c(t, !0, n, null, a, r);
				break;
			case "together":
				$c(t, !1, null, null, void 0, r);
				break;
			case "independent":
				t.memoizedState = null;
				break;
			default: n = Qc(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), $c(t, !1, i, n, a, r);
		}
		return t.child;
	}
	function nl(e, t, n) {
		var r = t.pendingProps;
		return fa(t, t.type, r.value), Oc(e, t, r.children, n), t.child;
	}
	function rl(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), id |= t.lanes, (n & t.childLanes) === 0) {
			if (e !== null) {
				if (ga(e, t, n, !1), (n & t.childLanes) === 0) return null;
			} else return null;
		}
		if (e !== null && t.child !== e.child) throw Error(o(153));
		if (t.child !== null) {
			for (e = t.child, n = Oi(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Oi(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function il(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && _a(e)));
	}
	function al(e, t, n) {
		switch (t.tag) {
			case 3:
				be(t, t.stateNode.containerInfo), fa(t, Ta, e.memoizedState.cache), oa();
				break;
			case 27:
			case 5:
				Se(t);
				break;
			case 4:
				be(t, t.stateNode.containerInfo);
				break;
			case 10:
				fa(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, Do(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) {
					if (r.dehydrated !== null) return Eo(t), t.flags |= 128, null;
					r = ga(e, t, n, !1);
					var i = t.child.childLanes;
					return r || (n & i) !== 0 ? Kc(e, t, n) : (Eo(t), e = rl(e, t, n), e === null ? null : e.sibling);
				}
				Eo(t);
				break;
			case 19:
				if (t.flags & 128) return tl(e, t, n);
				if (i = !!(e.flags & 128), r = (n & t.childLanes) !== 0, r ||= (ga(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return tl(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), Mo(t, jo.current), r) break;
				return null;
			case 22: return t.lanes = 0, Mc(e, t, n, t.pendingProps);
			case 24: fa(t, Ta, e.memoizedState.cache);
		}
		return rl(e, t, n);
	}
	function ol(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) Dc = !0;
			else {
				if (!il(e, n) && !(t.flags & 128)) return Dc = !1, al(e, t, n);
				Dc = !!(e.flags & 131072);
			}
		} else Dc = !1, K && t.flags & 1048576 && qi(t, Bi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = Ja(t.elementType), t.type = e, typeof e == "function") Di(e) ? (r = gc(e, r), t.tag = 1, t = Vc(null, t, e, r, n)) : (t.tag = 0, t = zc(null, t, e, r, n));
					else {
						if (e != null) {
							var i = e.$$typeof;
							if (i === ee) {
								t.tag = 11, t = kc(null, t, e, r, n);
								break a;
							}
							if (i === L) {
								t.tag = 14, t = Ac(null, t, e, r, n);
								break a;
							}
							if (i === F) {
								t.tag = 10, t.type = e, t = nl(null, t, n);
								break a;
							}
						}
						throw t = le(e) || e, Error(o(306, t, ""));
					}
				}
				return t;
			case 0: return zc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, i = gc(r, t.pendingProps), Vc(e, t, r, i, n);
			case 3:
				a: {
					if (be(t, t.stateNode.containerInfo), e === null) throw Error(o(387));
					r = t.pendingProps;
					var a = t.memoizedState;
					i = a.element, co(e, t), go(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.cache, fa(t, Ta, r), r !== a.cache && ha(t, [Ta], n, !0), ho(), r = s.element, a.isDehydrated) {
						if (a = {
							element: r,
							isDehydrated: !1,
							cache: s.cache
						}, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
							t = Hc(e, t, r, n);
							break a;
						}
						if (r !== i) {
							i = Ii(Error(o(424)), t), ca(i), t = Hc(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (Qi = lm(e.firstChild), Zi = t, K = !0, $i = null, ea = !0, n = ao(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 134221824, n = n.sibling;
					} else {
						if (oa(), r === i) {
							t = rl(e, t, n);
							break a;
						}
						Oc(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return Rc(e, t), e === null ? (n = Nm(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : K || (t.stateNode = fp(t.type, t.pendingProps, ve.current, t)) : t.memoizedState = Nm(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return Se(t), e === null && K && (r = t.stateNode = hm(t.type, t.pendingProps, ve.current), Zi = t, ea = !0, i = Qi, Sp(t.type) ? (um = i, Qi = lm(r.firstChild)) : Qi = i), Oc(e, t, t.pendingProps.children, n), Rc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && K && ((i = r = Qi) && (r = rm(r, t.type, t.pendingProps, ea), r === null ? i = !1 : (t.stateNode = r, Zi = t, Qi = lm(r.firstChild), ea = !1, i = !0)), i || na(t)), Se(t), i = t.type, a = t.pendingProps, s = e === null ? null : e.memoizedProps, r = a.children, pp(i, a) ? r = null : s !== null && pp(i, s) && (t.flags |= 32), t.memoizedState !== null && (i = Ko(e, t, Yo, null, null, n), sh._currentValue = i), Rc(e, t), Oc(e, t, r, n), t.child;
			case 6: return e === null && K && ((e = n = Qi) && (n = im(n, t.pendingProps, ea), n === null ? e = !1 : (t.stateNode = n, Zi = t, Qi = null, e = !0)), e || na(t)), null;
			case 13: return Kc(e, t, n);
			case 4: return be(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = io(t, null, r, n) : Oc(e, t, r, n), t.child;
			case 11: return kc(e, t, t.type, t.pendingProps, n);
			case 7: return r = t.pendingProps, Rc(e, t), Oc(e, t, r, n), t.child;
			case 8: return Oc(e, t, t.pendingProps.children, n), t.child;
			case 12: return Oc(e, t, t.pendingProps.children, n), t.child;
			case 10: return nl(e, t, n);
			case 9: return i = t.type._context, r = t.pendingProps.children, va(t), i = ya(i), r = r(i), t.flags |= 1, Oc(e, t, r, n), t.child;
			case 14: return Ac(e, t, t.type, t.pendingProps, n);
			case 15: return jc(e, t, t.type, t.pendingProps, n);
			case 19: return tl(e, t, n);
			case 31: return Lc(e, t, n);
			case 22: return Mc(e, t, n, t.pendingProps);
			case 24: return va(t), r = ya(Ta), e === null ? (i = za(), i === null && (i = Xu, a = Ea(), i.pooledCache = a, a.refCount++, a !== null && (i.pooledCacheLanes |= n), i = a), t.memoizedState = {
				parent: r,
				cache: i
			}, so(t), fa(t, Ta, i)) : ((e.lanes & n) !== 0 && (co(e, t), go(t, null, null, n), ho()), i = e.memoizedState, a = t.memoizedState, i.parent === r ? (r = a.cache, fa(t, Ta, r), r !== i.cache && ha(t, [Ta], n, !0)) : (i = {
				parent: r,
				cache: r
			}, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), fa(t, Ta, r))), Oc(e, t, t.pendingProps.children, n), t.child;
			case 30: return t.stateNode === null && (t.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}), r = t.pendingProps, r.name != null && r.name !== "auto" ? t.flags |= e === null ? 18882560 : 18874368 : K && Ji(t), e !== null && e.memoizedProps.name !== r.name ? t.flags |= 4194816 : Rc(e, t), Oc(e, t, r.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(o(156, t.tag));
	}
	function sl(e) {
		e.flags |= 4;
	}
	function cl(e, t, n, r, i) {
		var a;
		if ((a = !!(e.mode & 32)) && (a = n === null ? Jm(t, r) : Jm(t, r) && (r.src !== n.src || r.srcSet !== n.srcSet)), a) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (Vd()) e.flags |= 8192;
				else throw Ya = Ga, Ua;
			}
		} else e.flags &= -16777217;
	}
	function ll(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Ym(t)) {
			if (Vd()) e.flags |= 8192;
			else throw Ya = Ga, Ua;
		}
	}
	function ul(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : ot(), e.lanes |= t, cd |= t);
	}
	function dl(e, t) {
		if (!K) switch (e.tailMode) {
			case "visible": break;
			case "collapsed":
				for (var n = e.tail, r = null; n !== null;) n.alternate !== null && (r = n), n = n.sibling;
				r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
				break;
			default:
				for (t = e.tail, n = null; t !== null;) t.alternate !== null && (n = t), t = t.sibling;
				n === null ? e.tail = null : n.sibling = null;
		}
	}
	function fl(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 1206910976, r |= i.flags & 1206910976, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function pl(e, t, n) {
		var r = t.pendingProps;
		switch (Yi(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return fl(t), null;
			case 1: return fl(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), pa(Ta), xe(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (aa(t) ? sl(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, sa())), fl(t), null;
			case 26:
				var i = t.type, a = t.memoizedState;
				return e === null ? (sl(t), a === null ? (fl(t), cl(t, i, null, r, n)) : (fl(t), ll(t, a))) : a ? a === e.memoizedState ? (fl(t), t.flags &= -16777217) : (sl(t), fl(t), ll(t, a)) : (e = e.memoizedProps, e !== r && sl(t), fl(t), cl(t, i, e, r, n)), null;
			case 27:
				if (Ce(t), n = ve.current, i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && sl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(o(166));
						return fl(t), t.subtreeFlags &= -33554433, null;
					}
					e = ge.current, aa(t) ? ra(t, e) : (e = hm(i, r, n), t.stateNode = e, sl(t));
				}
				return fl(t), t.subtreeFlags &= -33554433, null;
			case 5:
				if (Ce(t), i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && sl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(o(166));
						return fl(t), t.subtreeFlags &= -33554433, null;
					}
					if (a = ge.current, aa(t)) ra(t, a);
					else {
						var s = lp(ve.current);
						switch (a) {
							case 1:
								a = s.createElementNS("http://www.w3.org/2000/svg", i);
								break;
							case 2:
								a = s.createElementNS("http://www.w3.org/1998/Math/MathML", i);
								break;
							default: switch (i) {
								case "svg":
									a = s.createElementNS("http://www.w3.org/2000/svg", i);
									break;
								case "math":
									a = s.createElementNS("http://www.w3.org/1998/Math/MathML", i);
									break;
								case "script":
									a = s.createElement("div"), a.innerHTML = "<script><\/script>", a = a.removeChild(a.firstChild);
									break;
								case "select":
									a = typeof r.is == "string" ? s.createElement("select", { is: r.is }) : s.createElement("select"), r.multiple ? a.multiple = !0 : r.size && (a.size = r.size);
									break;
								default: a = typeof r.is == "string" ? s.createElement(i, { is: r.is }) : s.createElement(i);
							}
						}
						a[vt] = t, a[yt] = r;
						a: for (s = t.child; s !== null;) {
							if (s.tag === 5 || s.tag === 6) a.appendChild(s.stateNode);
							else if (s.tag !== 4 && s.tag !== 27 && s.child !== null) {
								s.child.return = s, s = s.child;
								continue;
							}
							if (s === t) break a;
							for (; s.sibling === null;) {
								if (s.return === null || s.return === t) break a;
								s = s.return;
							}
							s.sibling.return = s.return, s = s.sibling;
						}
						t.stateNode = a;
						a: switch (np(a, i, r), i) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								r = !!r.autoFocus;
								break a;
							case "img":
								r = !0;
								break a;
							default: r = !1;
						}
						r && sl(t);
					}
				}
				return fl(t), t.subtreeFlags &= -33554433, cl(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && sl(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(o(166));
					if (e = ve.current, aa(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, i = Zi, i !== null) switch (i.tag) {
							case 27:
							case 5: r = i.memoizedProps;
						}
						e[vt] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || $f(e.nodeValue, n)), e || na(t, !0);
					} else e = lp(e).createTextNode(r), e[vt] = t, t.stateNode = e;
				}
				return fl(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = aa(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(o(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(o(557));
							e[vt] = t;
						} else oa(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						fl(t), e = !1;
					} else n = sa(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (Ao(t), t) : (Ao(t), null);
					if (t.flags & 128) throw Error(o(558));
				}
				return fl(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (i = aa(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!i) throw Error(o(318));
							if (i = t.memoizedState, i = i === null ? null : i.dehydrated, !i) throw Error(o(317));
							i[vt] = t;
						} else oa(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						fl(t), i = !1;
					} else i = sa(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
					if (!i) return t.flags & 256 ? (Ao(t), t) : (Ao(t), null);
				}
				return Ao(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool), a = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (a = r.memoizedState.cachePool.pool), a !== i && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), ul(t, t.updateQueue), fl(t), null);
			case 4: return xe(), e === null && Uf(t.stateNode.containerInfo), t.flags |= 67108864, fl(t), null;
			case 10: return pa(t.type), fl(t), null;
			case 19:
				if (No(t), r = t.memoizedState, r === null) return fl(t), null;
				if (i = !!(t.flags & 128), a = r.rendering, a === null) {
					if (i) dl(r, !1);
					else {
						if (rd !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (a = Po(e), a !== null) {
								for (t.flags |= 128, dl(r, !1), e = a.updateQueue, t.updateQueue = e, ul(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) ki(n, e), n = n.sibling;
								return Mo(t, jo.current & 1 | 2), K && Ki(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && Ie() > md && (t.flags |= 128, i = !0, dl(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!i) {
						if (e = Po(a), e !== null) {
							if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, ul(t, e), dl(r, !0), r.tail === null && r.tailMode !== "collapsed" && r.tailMode !== "visible" && !a.alternate && !K) return fl(t), null;
						} else 2 * Ie() - r.renderingStartTime > md && n !== 536870912 && (t.flags |= 128, i = !0, dl(r, !1), t.lanes = 4194304);
					}
					r.isBackwards ? (a.sibling = t.child, t.child = a) : (e = r.last, e === null ? t.child = a : e.sibling = a, r.last = a);
				}
				if (r.tail !== null) {
					e = r.tail;
					a: {
						for (n = e; n !== null;) {
							if (n.alternate !== null) {
								n = !1;
								break a;
							}
							n = n.sibling;
						}
						n = !0;
					}
					return r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Ie(), e.sibling = null, a = jo.current, a = i ? a & 1 | 2 : a & 1, r.tailMode === "visible" || r.tailMode === "collapsed" || !n || K ? Mo(t, a) : (n = a, H(wo, t), H(jo, n), To === null && (To = t)), K && Ki(t, r.treeForkCount), e;
				}
				return fl(t), null;
			case 22:
			case 23: return Ao(t), Co(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (fl(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : fl(t), n = t.updateQueue, n !== null && ul(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && he(Ra), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), pa(Ta), fl(t), null;
			case 25: return null;
			case 30: return t.flags |= 33554432, fl(t), null;
		}
		throw Error(o(156, t.tag));
	}
	function ml(e, t) {
		switch (Yi(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return pa(Ta), xe(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return Ce(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (Ao(t), t.alternate === null) throw Error(o(340));
					oa();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (Ao(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(o(340));
					oa();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return No(t), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, e = t.memoizedState, e !== null && (e.rendering = null, e.tail = null), t.flags |= 4, t) : null;
			case 4: return xe(), null;
			case 10: return pa(t.type), null;
			case 22:
			case 23: return Ao(t), Co(), e !== null && he(Ra), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return pa(Ta), null;
			case 25: return null;
			default: return null;
		}
	}
	function hl(e, t) {
		switch (Yi(t), t.tag) {
			case 3:
				pa(Ta), xe();
				break;
			case 26:
			case 27:
			case 5:
				Ce(t);
				break;
			case 4:
				xe();
				break;
			case 31:
				t.memoizedState !== null && Ao(t);
				break;
			case 13:
				Ao(t);
				break;
			case 19:
				No(t);
				break;
			case 10:
				pa(t.type);
				break;
			case 22:
			case 23:
				Ao(t), Co(), e !== null && he(Ra);
				break;
			case 24: pa(Ta);
		}
	}
	function gl(e, t) {
		try {
			var n = t.updateQueue, r = n === null ? null : n.lastEffect;
			if (r !== null) {
				var i = r.next;
				n = i;
				do {
					if ((n.tag & e) === e) {
						r = void 0;
						var a = n.create, o = n.inst;
						r = a(), o.destroy = r;
					}
					n = n.next;
				} while (n !== i);
			}
		} catch (e) {
			ff(t, t.return, e);
		}
	}
	function _l(e, t, n) {
		try {
			var r = t.updateQueue, i = r === null ? null : r.lastEffect;
			if (i !== null) {
				var a = i.next;
				r = a;
				do {
					if ((r.tag & e) === e) {
						var o = r.inst, s = o.destroy;
						if (s !== void 0) {
							o.destroy = void 0, i = t;
							var c = n, l = s;
							try {
								l();
							} catch (e) {
								ff(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			ff(t, t.return, e);
		}
	}
	function vl(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				vo(t, n);
			} catch (t) {
				ff(e, e.return, t);
			}
		}
	}
	function yl(e, t, n) {
		n.props = gc(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			ff(e, t, n);
		}
	}
	function bl(e, t) {
		try {
			var n = e.ref;
			if (n !== null) {
				switch (e.tag) {
					case 26:
					case 27:
					case 5:
						var r = e.stateNode;
						break;
					case 30:
						var i = e.stateNode, a = di(e.memoizedProps, i);
						(i.ref === null || i.ref.name !== a) && (i.ref = Pp(a)), r = i.ref;
						break;
					case 7:
						if (e.stateNode === null) {
							var o = new Fp(e);
							h(e.child, !1, Qp, o, void 0, void 0), e.stateNode = o;
						}
						r = e.stateNode;
						break;
					default: r = e.stateNode;
				}
				typeof n == "function" ? e.refCleanup = n(r) : n.current = r;
			}
		} catch (n) {
			ff(e, t, n);
		}
	}
	function xl(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) {
			if (typeof r == "function") try {
				r();
			} catch (n) {
				ff(e, t, n);
			} finally {
				e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
			}
			else if (typeof n == "function") try {
				n(null);
			} catch (n) {
				ff(e, t, n);
			}
			else n.current = null;
		}
	}
	function Sl(e, t) {
		if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && e.alternate === null && t !== null) for (var n = 0; n < t.length; n++) em(e.stateNode, t[n]);
	}
	function Cl(e) {
		for (var t = e.return; t !== null && (El(t) && em(e.stateNode, t.stateNode), !Tl(t));) t = t.return;
	}
	function wl(e) {
		for (var t = e.return; t !== null && (El(t) && tm(e.stateNode, t.stateNode), !Tl(t));) t = t.return;
	}
	function Tl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 27;
	}
	function El(e) {
		return e && e.tag === 7 && e.stateNode !== null;
	}
	function Dl(e) {
		var t = e.type, n = e.memoizedProps, r = e.stateNode;
		try {
			a: switch (t) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					n.autoFocus && r.focus();
					break a;
				case "img": n.src ? r.src = n.src : n.srcSet && (r.srcset = n.srcSet);
			}
		} catch (t) {
			ff(e, e.return, t);
		}
	}
	function Ol(e, t, n) {
		try {
			var r = e.stateNode;
			ip(r, e.type, n, t), r[yt] = t;
		} catch (t) {
			ff(e, e.return, t);
		}
	}
	function kl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Sp(e.type) || e.tag === 4;
	}
	function Al(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || kl(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Sp(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function jl(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(i, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(i), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = pn)), Sl(e, r), W = !0;
		else if (i !== 4 && (i === 27 && (Sl(e, r), r = null, Sp(e.type) && (n = e.stateNode, t = null)), e = e.child, e !== null)) for (jl(e, t, n, r), e = e.sibling; e !== null;) jl(e, t, n, r), e = e.sibling;
	}
	function Ml(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? n.insertBefore(i, t) : n.appendChild(i), Sl(e, r), W = !0;
		else if (i !== 4 && (i === 27 && (Sl(e, r), r = null, Sp(e.type) && (n = e.stateNode)), e = e.child, e !== null)) for (Ml(e, t, n, r), e = e.sibling; e !== null;) Ml(e, t, n, r), e = e.sibling;
	}
	function Nl(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			np(t, r, n), t[vt] = e, t[yt] = n;
		} catch (t) {
			ff(e, e.return, t);
		}
	}
	var Pl = !1, Fl = null;
	function Il(e) {
		(e.tag === 30 || e.subtreeFlags & 33554432) && (Pl = !0);
	}
	var Ll = null;
	function Rl() {
		var e = Ll;
		return Ll = null, e;
	}
	var zl = 0;
	function Bl(e, t, n, r, i) {
		return zl = 0, Vl(e.child, t, n, r, i);
	}
	function Vl(e, t, n, r, i) {
		for (var a = !1; e !== null;) {
			if (e.tag === 5) {
				var o = e.stateNode;
				if (r !== null) {
					var s = Op(o);
					r.push(s), s.view && (a = !0);
				} else a || Op(o).view && (a = !0);
				Pl = !0, Tp(o, zl === 0 ? t : t + "_" + zl, n), zl++;
			} else (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && i || Vl(e.child, t, n, r, i) && (a = !0));
			e = e.sibling;
		}
		return a;
	}
	function Hl(e, t) {
		for (; e !== null;) e.tag === 5 ? Ep(e.stateNode, e.memoizedProps) : (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && t || Hl(e.child, t)), e = e.sibling;
	}
	function Ul(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if ((e.tag !== 22 || e.memoizedState === null) && (Ul(e), e.tag === 30 && e.flags & 18874368 && e.stateNode.paired)) {
				var t = e.memoizedProps;
				if (t.name == null || t.name === "auto") throw Error(o(544));
				var n = t.name;
				t = pi(t.default, t.share), t !== "none" && (Bl(e, n, t, null, !1) || Hl(e.child, !1));
			}
			e = e.sibling;
		}
	}
	function Wl(e, t) {
		if (e.tag === 30) {
			var n = e.stateNode, r = e.memoizedProps, i = di(r, n), a = pi(r.default, n.paired ? r.share : r.enter);
			a === "none" ? Ul(e) : Bl(e, i, a, null, !1) ? (Ul(e), n.paired || t || jd(e, r.onEnter)) : Hl(e.child, !1);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Wl(e, t), e = e.sibling;
		else Ul(e);
	}
	function Gl(e) {
		if (Fl !== null && Fl.size !== 0) {
			var t = Fl;
			if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
				if (e.tag !== 22 || e.memoizedState === null) {
					if (e.tag === 30 && e.flags & 18874368) {
						var n = e.memoizedProps, r = n.name;
						if (r != null && r !== "auto") {
							var i = t.get(r);
							if (i !== void 0) {
								var a = pi(n.default, n.share);
								if (a !== "none" && (Bl(e, r, a, null, !1) ? (a = e.stateNode, i.paired = a, a.paired = i, jd(e, n.onShare)) : Hl(e.child, !1)), t.delete(r), t.size === 0) break;
							}
						}
					}
					Gl(e);
				}
				e = e.sibling;
			}
		}
	}
	function Kl(e) {
		if (e.tag === 30) {
			var t = e.memoizedProps, n = di(t, e.stateNode), r = Fl === null ? void 0 : Fl.get(n), i = pi(t.default, r === void 0 ? t.exit : t.share);
			i !== "none" && (Bl(e, n, i, null, !1) ? r === void 0 ? jd(e, t.onExit) : (i = e.stateNode, r.paired = i, i.paired = r, Fl.delete(n), jd(e, t.onShare)) : Hl(e.child, !1)), Fl !== null && Gl(e);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Kl(e), e = e.sibling;
		else Fl !== null && Gl(e);
	}
	function ql(e) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var t = e.memoizedProps, n = di(t, e.stateNode);
				t = pi(t.default, t.update), e.flags &= -5, t !== "none" && Bl(e, n, t, e.memoizedState = [], !1);
			} else e.subtreeFlags & 33554432 && ql(e);
			e = e.sibling;
		}
	}
	function Jl(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if (e.tag !== 22 || e.memoizedState === null) {
				if (e.tag === 30 && e.flags & 18874368) {
					var t = e.stateNode;
					t.paired !== null && (t.paired = null, Hl(e.child, !1));
				}
				Jl(e);
			}
			e = e.sibling;
		}
	}
	function Yl(e) {
		if (e.tag === 30) e.stateNode.paired = null, Hl(e.child, !1), Jl(e);
		else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Yl(e), e = e.sibling;
		else Jl(e);
	}
	function Xl(e) {
		for (e = e.child; e !== null;) e.tag === 30 ? Hl(e.child, !1) : e.subtreeFlags & 33554432 && Xl(e), e = e.sibling;
	}
	function Zl(e, t, n, r, i, a, o) {
		for (var s = !1; t !== null;) {
			if (t.tag === 5) {
				var c = t.stateNode;
				if (a !== null && zl < a.length) {
					var l = a[zl], u = Op(c);
					(l.view || u.view) && (s = !0);
					var d;
					if (d = !(e.flags & 4)) {
						if (u.clip) d = !0;
						else {
							d = l.rect;
							var f = u.rect;
							d = d.y !== f.y || d.x !== f.x || d.height !== f.height || d.width !== f.width;
						}
					}
					d && (e.flags |= 4), u.abs ? u = !l.abs : (l = l.rect, u = u.rect, u = l.height !== u.height || l.width !== u.width), u && (e.flags |= 32);
				} else e.flags |= 32;
				e.flags & 4 && Tp(c, zl === 0 ? n : n + "_" + zl, i), s && e.flags & 4 || (Ll === null && (Ll = []), Ll.push(c, zl === 0 ? r : r + "_" + zl, t.memoizedProps)), zl++;
			} else (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && o ? e.flags |= t.flags & 32 : Zl(e, t.child, n, r, i, a, o) && (s = !0));
			t = t.sibling;
		}
		return s;
	}
	function Ql(e, t) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var n = e.memoizedProps, r = e.stateNode, i = di(n, r), a = pi(n.default, n.update);
				if (t) {
					r = r.clones;
					var o = r === null ? null : r.map(kp);
				} else o = e.memoizedState, e.memoizedState = null;
				r = e;
				var s = e.child;
				zl = 0, i = Zl(r, s, i, i, a, o, !1), e.flags & 4 && i && (t || jd(e, n.onUpdate));
			} else e.subtreeFlags & 33554432 && Ql(e, t);
			e = e.sibling;
		}
	}
	var $l = !1, eu = !1, tu = !1, nu = !1, ru = typeof WeakSet == "function" ? WeakSet : Set, iu = null, au = !1, ou = !1, su = !1, cu = !1;
	function lu(e, t, n) {
		if (e = e.containerInfo, sp = gh, e = Vr(e), Hr(e)) {
			if ("selectionStart" in e) var r = {
				start: e.selectionStart,
				end: e.selectionEnd
			};
			else a: {
				r = (r = e.ownerDocument) && r.defaultView || window;
				var i = r.getSelection && r.getSelection();
				if (i && i.rangeCount !== 0) {
					r = i.anchorNode;
					var a = i.anchorOffset, o = i.focusNode;
					i = i.focusOffset;
					try {
						r.nodeType, o.nodeType;
					} catch {
						r = null;
						break a;
					}
					var s = 0, c = -1, l = -1, u = 0, d = 0, f = e, p = null;
					b: for (;;) {
						for (var m; f !== r || a !== 0 && f.nodeType !== 3 || (c = s + a), f !== o || i !== 0 && f.nodeType !== 3 || (l = s + i), f.nodeType === 3 && (s += f.nodeValue.length), (m = f.firstChild) !== null;) p = f, f = m;
						for (;;) {
							if (f === e) break b;
							if (p === r && ++u === a && (c = s), p === o && ++d === i && (l = s), (m = f.nextSibling) !== null) break;
							f = p, p = f.parentNode;
						}
						f = m;
					}
					r = c === -1 || l === -1 ? null : {
						start: c,
						end: l
					};
				} else r = null;
			}
			r ||= {
				start: 0,
				end: 0
			};
		} else r = null;
		for (cp = {
			focusedElem: e,
			selectionRange: r
		}, gh = !1, n = (n & 335544064) === n, iu = t, t = n ? 9270 : 1024; iu !== null;) {
			if (e = iu, n && (r = e.deletions, r !== null)) for (a = 0; a < r.length; a++) n && Kl(r[a]);
			if (e.alternate === null && e.flags & 2) n && Il(e), uu(n);
			else {
				if (e.tag === 22) {
					if (r = e.alternate, e.memoizedState !== null) {
						r !== null && r.memoizedState === null && n && Kl(r), uu(n);
						continue;
					}
					if (r !== null && r.memoizedState !== null) {
						n && Il(e), uu(n);
						continue;
					}
				}
				r = e.child, (e.subtreeFlags & t) !== 0 && r !== null ? (r.return = e, iu = r) : (n && ql(e), uu(n));
			}
		}
		Fl = null;
	}
	function uu(e) {
		for (; iu !== null;) {
			var t = iu, n = e, r = t.alternate, i = t.flags;
			switch (t.tag) {
				case 0:
				case 11:
				case 15: break;
				case 1:
					if (i & 1024 && r !== null) {
						n = void 0, i = r.memoizedProps, r = r.memoizedState;
						var a = t.stateNode;
						try {
							var s = gc(t.type, i);
							n = a.getSnapshotBeforeUpdate(s, r), a.__reactInternalSnapshotBeforeUpdate = n;
						} catch (e) {
							ff(t, t.return, e);
						}
					}
					break;
				case 3:
					if (i & 1024) {
						if (r = t.stateNode.containerInfo, n = r.nodeType, n === 9) nm(r);
						else if (n === 1) switch (r.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								nm(r);
								break;
							default: r.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				case 30:
					n && r !== null && (n = di(r.memoizedProps, r.stateNode), i = t.memoizedProps, i = pi(i.default, i.update), i !== "none" && Bl(r, n, i, r.memoizedState = [], !0));
					break;
				default: if (i & 1024) throw Error(o(163));
			}
			if (r = t.sibling, r !== null) {
				r.return = t.return, iu = r;
				break;
			}
			iu = t.return;
		}
	}
	function du(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				ju(e, n), r & 4 && gl(5, n);
				break;
			case 1:
				if (ju(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						ff(n, n.return, e);
					}
					else {
						var i = gc(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							ff(n, n.return, e);
						}
					}
				}
				r & 64 && vl(n), r & 512 && bl(n, n.return);
				break;
			case 3:
				if (ju(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
					if (t = null, n.child !== null) switch (n.child.tag) {
						case 27:
						case 5:
							t = n.child.stateNode;
							break;
						case 1: t = n.child.stateNode;
					}
					try {
						vo(e, t);
					} catch (e) {
						ff(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Nl(n);
			case 26:
			case 5:
				ju(e, n), t === null && r & 4 && Dl(n), r & 512 && bl(n, n.return);
				break;
			case 12:
				ju(e, n);
				break;
			case 31:
				ju(e, n), r & 4 && bu(e, n);
				break;
			case 13:
				ju(e, n), r & 4 && xu(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = gf.bind(null, n), cm(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || $l, !r) {
					var a = t !== null && t.memoizedState !== null || eu;
					t = $l, i = eu, $l = r, (eu = a) && !i ? (r = 2, n.subtreeFlags & 8772 && (r |= 1), Nu(e, n, r)) : ju(e, n), $l = t, eu = i;
				}
				break;
			case 30:
				ju(e, n), r & 512 && bl(n, n.return);
				break;
			case 7: r & 512 && bl(n, n.return);
			default: ju(e, n);
		}
	}
	function fu(e, t) {
		for (e = e.child; e !== null;) pu(e, t), e = e.sibling;
	}
	function pu(e, t) {
		switch (e.tag) {
			case 5:
			case 26:
				try {
					var n = e.stateNode;
					if (t) {
						var r = n.style;
						typeof r.setProperty == "function" ? r.setProperty("display", "none", "important") : r.display = "none";
					} else {
						var i = e.stateNode, a = e.memoizedProps.style, o = a != null && a.hasOwnProperty("display") ? a.display : null;
						i.style.display = o == null || typeof o == "boolean" ? "" : ("" + o).trim();
					}
				} catch (t) {
					ff(e, e.return, t);
				}
				mu(e, t);
				break;
			case 6:
				try {
					e.stateNode.nodeValue = t ? "" : e.memoizedProps, W = !0;
				} catch (t) {
					ff(e, e.return, t);
				}
				break;
			case 18:
				try {
					var s = e.stateNode;
					t ? wp(s, !0) : wp(e.stateNode, !1);
				} catch (t) {
					ff(e, e.return, t);
				}
				break;
			case 22:
			case 23:
				e.memoizedState === null && fu(e, t);
				break;
			default: fu(e, t);
		}
	}
	function mu(e, t) {
		if (e.subtreeFlags & 67108864) for (e = e.child; e !== null;) {
			a: {
				var n = e, r = t;
				switch (n.tag) {
					case 4:
						pu(n, r);
						break a;
					case 22:
						n.memoizedState === null && mu(n, r);
						break a;
					default: mu(n, r);
				}
			}
			e = e.sibling;
		}
	}
	function hu(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, hu(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && Dt(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var gu = null, _u = !1;
	function vu(e, t, n) {
		for (n = n.child; n !== null;) yu(e, t, n), n = n.sibling;
	}
	function yu(e, t, n) {
		if (Ke && typeof Ke.onCommitFiberUnmount == "function") try {
			Ke.onCommitFiberUnmount(Ge, n);
		} catch {}
		switch (n.tag) {
			case 26:
				eu || xl(n, t), vu(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && !eu && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				eu || xl(n, t), wl(n);
				var r = gu, i = _u;
				Sp(n.type) && (gu = n.stateNode, _u = !1), vu(e, t, n), gm(n.stateNode, n.type, n.memoizedProps), gu = r, _u = i;
				break;
			case 5: eu || xl(n, t), wl(n);
			case 6:
				if (n.tag === 6 && wl(n), r = gu, i = _u, gu = null, vu(e, t, n), gu = r, _u = i, gu !== null) {
					if (_u) try {
						(gu.nodeType === 9 ? gu.body : gu.nodeName === "HTML" ? gu.ownerDocument.body : gu).removeChild(n.stateNode), W = !0;
					} catch (e) {
						ff(n, t, e);
					}
					else try {
						gu.removeChild(n.stateNode), W = !0;
					} catch (e) {
						ff(n, t, e);
					}
				}
				break;
			case 18:
				gu !== null && (_u ? (e = gu, Cp(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Hh(e)) : Cp(gu, n.stateNode));
				break;
			case 4:
				r = gu, i = _u, gu = n.stateNode.containerInfo, _u = !0, vu(e, t, n), gu = r, _u = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				_l(2, n, t), eu || _l(4, n, t), vu(e, t, n);
				break;
			case 1:
				eu || (xl(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && yl(n, t, r)), vu(e, t, n);
				break;
			case 21:
				vu(e, t, n);
				break;
			case 22:
				eu = (r = eu) || n.memoizedState !== null, vu(e, t, n), eu = r;
				break;
			case 30:
				xl(n, t), vu(e, t, n);
				break;
			case 7:
				eu || xl(n, t), vu(e, t, n);
				break;
			default: vu(e, t, n);
		}
	}
	function bu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Hh(e);
			} catch (e) {
				ff(t, t.return, e);
			}
		}
	}
	function xu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Hh(e);
		} catch (e) {
			ff(t, t.return, e);
		}
	}
	function Su(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new ru()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new ru()), t;
			default: throw Error(o(435, e.tag));
		}
	}
	function Cu(e, t) {
		var n = Su(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = _f.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function wu(e, t, n) {
		var r = t.deletions;
		if (r !== null) for (var i = 0; i < r.length; i++) {
			var a = r[i], s = e, c = t, l = c;
			a: for (; l !== null;) {
				switch (l.tag) {
					case 27:
						if (Sp(l.type)) {
							gu = l.stateNode, _u = !1;
							break a;
						}
						break;
					case 5:
						gu = l.stateNode, _u = !1;
						break a;
					case 3:
					case 4:
						gu = l.stateNode.containerInfo, _u = !0;
						break a;
				}
				l = l.return;
			}
			if (gu === null) throw Error(o(160));
			yu(s, c, a), gu = null, _u = !1, s = a.alternate, s !== null && (s.return = null), a.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) Eu(t, e, n), t = t.sibling;
	}
	var Tu = null;
	function Eu(e, t, n) {
		var r = e.alternate, i = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				if (i & 4 && (r = e.updateQueue, r = r === null ? null : r.events, r !== null)) for (var a = 0; a < r.length; a++) {
					var s = r[a];
					s.ref.impl = s.nextImpl;
				}
				wu(t, e, n), Du(e), i & 4 && (_l(3, e, e.return), gl(3, e), _l(5, e, e.return));
				break;
			case 1:
				wu(t, e, n), Du(e), i & 512 && (eu || r === null || xl(r, r.return)), i & 64 && $l && (e = e.updateQueue, e !== null && (t = e.callbacks, t !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? t : n.concat(t))));
				break;
			case 26:
				if (a = Tu, wu(t, e, n), Du(e), i & 512 && (eu || r === null || xl(r, r.return)), i & 4) {
					if (i = r === null ? null : r.memoizedState, n = e.memoizedState, r === null) {
						if (n === null) {
							if (e.stateNode === null) {
								if ($l) e.stateNode = fp(e.type, e.memoizedProps, t.containerInfo, e);
								else {
									a: {
										t = e.type, n = e.memoizedProps, i = a.ownerDocument || a;
										b: switch (t) {
											case "title":
												r = i.getElementsByTagName("title")[0], (!r || r[Tt] || r[vt] || r.namespaceURI === "http://www.w3.org/2000/svg" || r.hasAttribute("itemprop")) && (r = i.createElement(t), i.head.insertBefore(r, i.querySelector("head > title"))), np(r, t, n), r[vt] = e, U(r), t = r;
												break a;
											case "link":
												if (a = Gm("link", "href", i).get(t + (n.href || ""))) {
													for (s = 0; s < a.length; s++) if (r = a[s], r.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && r.getAttribute("rel") === (n.rel == null ? null : n.rel) && r.getAttribute("title") === (n.title == null ? null : n.title) && r.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
														a.splice(s, 1);
														break b;
													}
												}
												r = i.createElement(t), np(r, t, n), i.head.appendChild(r);
												break;
											case "meta":
												if (a = Gm("meta", "content", i).get(t + (n.content || ""))) {
													for (s = 0; s < a.length; s++) if (r = a[s], r.getAttribute("content") === (n.content == null ? null : "" + n.content) && r.getAttribute("name") === (n.name == null ? null : n.name) && r.getAttribute("property") === (n.property == null ? null : n.property) && r.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && r.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
														a.splice(s, 1);
														break b;
													}
												}
												r = i.createElement(t), np(r, t, n), i.head.appendChild(r);
												break;
											default: throw Error(o(468, t));
										}
										r[vt] = e, U(r), t = r;
									}
									e.stateNode = t;
								}
							} else $l || Km(a, e.type, e.stateNode);
						} else e.stateNode = Bm(a, n, e.memoizedProps);
					} else i === n ? n === null && e.stateNode !== null && Ol(e, e.memoizedProps, r.memoizedProps) : (i === null ? (t = r.stateNode, t === null || eu || t.parentNode.removeChild(t)) : i.count--, n === null ? $l || Km(a, e.type, e.stateNode) : Bm(a, n, e.memoizedProps));
				}
				break;
			case 27:
				wu(t, e, n), Du(e), i & 512 && (eu || r === null || xl(r, r.return)), r !== null && i & 4 && Ol(e, e.memoizedProps, r.memoizedProps);
				break;
			case 5:
				if (a = tu, tu = !1, wu(t, e, n), tu = a, Du(e), i & 512 && (eu || r === null || xl(r, r.return)), e.flags & 32) {
					t = e.stateNode;
					try {
						an(t, ""), W = !0;
					} catch (t) {
						ff(e, e.return, t);
					}
				}
				i & 4 && e.stateNode != null && (t = e.memoizedProps, Ol(e, t, r === null ? t : r.memoizedProps)), i & 1024 && (nu = !0);
				break;
			case 6:
				if (wu(t, e, n), Du(e), i & 4) {
					if (e.stateNode === null) throw Error(o(162));
					t = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = t, W = !0;
					} catch (t) {
						ff(e, e.return, t);
					}
				}
				break;
			case 3:
				if (W = !1, Wm = null, a = Tu, Tu = bm(t.containerInfo), wu(t, e, n), Tu = a, Du(e), i & 4 && r !== null && r.memoizedState.isDehydrated) try {
					Hh(t.containerInfo);
				} catch (t) {
					ff(e, e.return, t);
				}
				nu && (nu = !1, Ou(e)), W = !1;
				break;
			case 4:
				i = tu, tu = $l, r = Vt(), a = Tu, Tu = bm(e.stateNode.containerInfo), wu(t, e, n), Du(e), Tu = a, W && ou && (su = !0), W = r, tu = i;
				break;
			case 12:
				wu(t, e, n), Du(e);
				break;
			case 31:
				wu(t, e, n), Du(e), i & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Cu(e, t)));
				break;
			case 13:
				wu(t, e, n), Du(e), e.child.flags & 8192 && e.memoizedState !== null != (r !== null && r.memoizedState !== null) && (fd = Ie()), i & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Cu(e, t)));
				break;
			case 22:
				a = e.memoizedState !== null, s = r !== null && r.memoizedState !== null;
				var c = $l, l = eu, u = tu;
				$l = c || a, tu = u || a, eu = l || s, wu(t, e, n), eu = l, tu = u, $l = c, Du(e), i & 8192 && (t = e.stateNode, t._visibility = a ? t._visibility & -2 : t._visibility | 1, !a || r === null || s || $l || eu || (t = s || eu, n = $l, r = eu, $l = a || $l, eu = t, Mu(e, 2), $l = n, eu = r), !a && tu || fu(e, a)), i & 4 && (t = e.updateQueue, t !== null && (n = t.retryQueue, n !== null && (t.retryQueue = null, Cu(e, n))));
				break;
			case 19:
				wu(t, e, n), Du(e), i & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Cu(e, t)));
				break;
			case 30:
				i & 512 && (eu || r === null || xl(r, r.return)), i = Vt(), a = ou, s = (n & 335544064) === n, c = e.memoizedProps, ou = s && pi(c.default, c.update) !== "none", wu(t, e, n), Du(e), s && r !== null && W && (e.flags |= 4), ou = a, W = i;
				break;
			case 21: break;
			case 7: i & 512 && (eu || r === null || xl(r, r.return)), r && r.stateNode !== null && (r.stateNode._fragmentFiber = e);
			default: wu(t, e, n), Du(e);
		}
	}
	function Du(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (kl(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				r = null;
				for (var i = e.return; i !== null;) {
					if (El(i)) {
						var a = i.stateNode;
						r === null ? r = [a] : r.push(a);
					}
					if (Tl(i)) break;
					i = i.return;
				}
				var s = r;
				if (n == null) throw Error(o(160));
				switch (n.tag) {
					case 27:
						var c = n.stateNode;
						Ml(e, Al(e), c, s);
						break;
					case 5:
						var l = n.stateNode;
						n.flags & 32 && (an(l, ""), n.flags &= -33), Ml(e, Al(e), l, s);
						break;
					case 3:
					case 4:
						var u = n.stateNode.containerInfo;
						jl(e, Al(e), u, s);
						break;
					default: throw Error(o(161));
				}
			} catch (t) {
				ff(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function Ou(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			Ou(t), t.tag === 5 && t.flags & 1024 && (t = t.stateNode, gh = !0, t.reset(), gh = !1), e = e.sibling;
		}
	}
	function ku(e, t) {
		if (t.subtreeFlags & 9270) for (t = t.child; t !== null;) Au(t, e), t = t.sibling;
		else Ql(t, !1);
	}
	function Au(e, t) {
		var n = e.alternate;
		if (n === null) Wl(e, !1);
		else switch (e.tag) {
			case 3:
				if (cu = au = !1, Rl(), ku(t, e), !au && !su) {
					if (e = Ll, e !== null) for (var r = 0; r < e.length; r += 3) {
						n = e[r];
						var i = e[r + 1];
						Ep(n, e[r + 2]), n = n.ownerDocument.documentElement, n !== null && n.animate({
							opacity: [0, 0],
							pointerEvents: ["none", "none"]
						}, {
							duration: 0,
							fill: "forwards",
							pseudoElement: "::view-transition-group(" + i + ")"
						});
					}
					e = t.containerInfo, e = e.nodeType === 9 ? e.documentElement : e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "" && (e.style.viewTransitionName = "none", e.animate({
						opacity: [0, 0],
						pointerEvents: ["none", "none"]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition-group(root)"
					}), e.animate({
						width: [0, 0],
						height: [0, 0]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition"
					})), cu = !0;
				}
				Ll = null;
				break;
			case 5:
				ku(t, e);
				break;
			case 4:
				r = au, au = !1, ku(t, e), au && (su = !0), au = r;
				break;
			case 22:
				e.memoizedState === null && (n.memoizedState === null ? ku(t, e) : Wl(e, !1));
				break;
			case 30:
				r = au, i = Rl(), au = !1, ku(t, e), au && (e.flags |= 4);
				var a = e.memoizedProps, o = e.stateNode;
				t = di(a, o), o = di(n.memoizedProps, o);
				var s = pi(a.default, a.update);
				s === "none" ? t = !1 : (a = n.memoizedState, n.memoizedState = null, n = e.child, zl = 0, t = Zl(e, n, t, o, s, a, !0), zl !== (a === null ? 0 : a.length) && (e.flags |= 32)), e.flags & 4 && t ? (jd(e, e.memoizedProps.onUpdate), Ll = i) : i !== null && (i.push.apply(i, Ll), Ll = i), au = e.flags & 32 ? !0 : r;
				break;
			default: ku(t, e);
		}
	}
	function ju(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) du(e, t.alternate, t), t = t.sibling;
	}
	function Mu(e, t) {
		for (e = e.child; e !== null;) {
			var n = e, r = t;
			switch (n.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					_l(4, n, n.return), Mu(n, r);
					break;
				case 1:
					xl(n, n.return);
					var i = n.stateNode;
					typeof i.componentWillUnmount == "function" && yl(n, n.return, i), Mu(n, r);
					break;
				case 27: r & 2 && gm(n.stateNode, n.type, n.memoizedProps);
				case 5:
					xl(n, n.return), n.tag !== 5 && n.tag !== 27 || wl(n), Mu(n, r);
					break;
				case 6:
					wl(n);
					break;
				case 26:
					xl(n, n.return), i = n.stateNode, n.memoizedState !== null || i === null || eu || i.parentNode.removeChild(i), Mu(n, r);
					break;
				case 22:
					n.memoizedState === null && Mu(n, r);
					break;
				case 30:
					xl(n, n.return), Mu(n, r);
					break;
				case 7: xl(n, n.return);
				default: Mu(n, r);
			}
			e = e.sibling;
		}
	}
	function Nu(e, t, n) {
		for (n = t.subtreeFlags & 8772 ? n : n & -2, t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags, s = !!(n & 1);
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					Nu(i, a, n), gl(4, a);
					break;
				case 1:
					if (Nu(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						ff(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var c = r.stateNode;
						try {
							var l = i.shared.hiddenCallbacks;
							if (l !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < l.length; i++) _o(l[i], c);
						} catch (e) {
							ff(r, r.return, e);
						}
					}
					s && o & 64 && vl(a), bl(a, a.return);
					break;
				case 27: n & 2 && Nl(a);
				case 5:
					a.tag !== 5 && a.tag !== 27 || Cl(a), Nu(i, a, n), s && r === null && o & 4 && Dl(a), bl(a, a.return);
					break;
				case 6:
					Cl(a);
					break;
				case 26:
					c = a.stateNode, a.memoizedState !== null || c === null || $l || Km(bm(c.ownerDocument), a.type, c), Nu(i, a, n), s && r === null && o & 4 && Dl(a), bl(a, a.return);
					break;
				case 12:
					Nu(i, a, n);
					break;
				case 31:
					Nu(i, a, n), s && o & 4 && bu(i, a);
					break;
				case 13:
					Nu(i, a, n), s && o & 4 && xu(i, a);
					break;
				case 22:
					a.memoizedState === null && Nu(i, a, n), bl(a, a.return);
					break;
				case 30:
					Nu(i, a, n), bl(a, a.return);
					break;
				case 7: bl(a, a.return);
				default: Nu(i, a, n);
			}
			t = t.sibling;
		}
	}
	function Pu(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && Da(n));
	}
	function Fu(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Da(e));
	}
	function Iu(e, t, n, r) {
		var i = (n & 335544064) === n;
		if (t.subtreeFlags & (i ? 10262 : 10256)) for (t = t.child; t !== null;) Lu(e, t, n, r), t = t.sibling;
		else i && Xl(t);
	}
	function Lu(e, t, n, r) {
		var i = (n & 335544064) === n;
		i && t.alternate === null && t.return !== null && t.return.alternate !== null && Yl(t);
		var a = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				Iu(e, t, n, r), a & 2048 && gl(9, t);
				break;
			case 1:
				Iu(e, t, n, r);
				break;
			case 3:
				Iu(e, t, n, r), i && cu && (e = e.containerInfo, e = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, e.style.viewTransitionName === "root" && (e.style.viewTransitionName = ""), e = e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "none" && (e.style.viewTransitionName = "")), a & 2048 && (a = null, t.alternate !== null && (a = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== a && (t.refCount++, a != null && Da(a)));
				break;
			case 12:
				if (a & 2048) {
					Iu(e, t, n, r), a = t.stateNode;
					try {
						var o = t.memoizedProps, s = o.id, c = o.onPostCommit;
						typeof c == "function" && c(s, t.alternate === null ? "mount" : "update", a.passiveEffectDuration, -0);
					} catch (e) {
						ff(t, t.return, e);
					}
				} else Iu(e, t, n, r);
				break;
			case 31:
				Iu(e, t, n, r);
				break;
			case 13:
				Iu(e, t, n, r);
				break;
			case 23: break;
			case 22:
				o = t.stateNode, s = t.alternate, t.memoizedState === null ? (i && s !== null && s.memoizedState !== null && Yl(t), o._visibility & 2 ? Iu(e, t, n, r) : (o._visibility |= 2, Ru(e, t, n, r, !!(t.subtreeFlags & 10256) || !1))) : (i && s !== null && s.memoizedState === null && Yl(s), o._visibility & 2 ? Iu(e, t, n, r) : zu(e, t)), a & 2048 && Pu(s, t);
				break;
			case 24:
				Iu(e, t, n, r), a & 2048 && Fu(t.alternate, t);
				break;
			case 30:
				i && (a = t.alternate, a !== null && (Hl(a.child, !0), Hl(t.child, !0))), Iu(e, t, n, r);
				break;
			default: Iu(e, t, n, r);
		}
	}
	function Ru(e, t, n, r, i) {
		for (i &&= !!(t.subtreeFlags & 10256) || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					Ru(a, o, s, c, i), gl(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, Ru(a, o, s, c, i)) : u._visibility & 2 ? Ru(a, o, s, c, i) : zu(a, o), i && l & 2048 && Pu(o.alternate, o);
					break;
				case 24:
					Ru(a, o, s, c, i), i && l & 2048 && Fu(o.alternate, o);
					break;
				default: Ru(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function zu(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					zu(n, r), i & 2048 && Pu(r.alternate, r);
					break;
				case 24:
					zu(n, r), i & 2048 && Fu(r.alternate, r);
					break;
				default: zu(n, r);
			}
			t = t.sibling;
		}
	}
	var Bu = 8192;
	function Vu(e, t, n) {
		if (e.subtreeFlags & Bu) for (e = e.child; e !== null;) Hu(e, t, n), e = e.sibling;
	}
	function Hu(e, t, n) {
		switch (e.tag) {
			case 26:
				Vu(e, t, n), e.flags & Bu && (e.memoizedState === null ? (e = e.stateNode, (t & 335544128) === t && Zm(n, e)) : Qm(n, Tu, e.memoizedState, e.memoizedProps));
				break;
			case 5:
				Vu(e, t, n), e.flags & Bu && (e = e.stateNode, (t & 335544128) === t && Zm(n, e));
				break;
			case 3:
			case 4:
				var r = Tu;
				Tu = bm(e.stateNode.containerInfo), Vu(e, t, n), Tu = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Bu, Bu = 16777216, Vu(e, t, n), Bu = r) : Vu(e, t, n));
				break;
			case 30:
				if ((e.flags & Bu) !== 0 && (r = e.memoizedProps.name, r != null && r !== "auto")) {
					var i = e.stateNode;
					i.paired = null, Fl === null && (Fl = /* @__PURE__ */ new Map()), Fl.set(r, i);
				}
				Vu(e, t, n);
				break;
			default: Vu(e, t, n);
		}
	}
	function Uu(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Wu(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				iu = r, qu(r, e);
			}
			Uu(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) Gu(e), e = e.sibling;
	}
	function Gu(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Wu(e), e.flags & 2048 && _l(9, e, e.return);
				break;
			case 3:
				Wu(e);
				break;
			case 12:
				Wu(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Ku(e)) : Wu(e);
				break;
			default: Wu(e);
		}
	}
	function Ku(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				iu = r, qu(r, e);
			}
			Uu(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					_l(8, t, t.return), Ku(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Ku(t));
					break;
				default: Ku(t);
			}
			e = e.sibling;
		}
	}
	function qu(e, t) {
		for (; iu !== null;) {
			var n = iu;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					_l(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: Da(n.memoizedState.cache);
			}
			if (r = n.child, r !== null) r.return = n, iu = r;
			else a: for (n = e; iu !== null;) {
				r = iu;
				var i = r.sibling, a = r.return;
				if (hu(r), r === n) {
					iu = null;
					break a;
				}
				if (i !== null) {
					i.return = a, iu = i;
					break a;
				}
				iu = a;
			}
		}
	}
	var Ju = {
		getCacheForType: function(e) {
			var t = ya(Ta), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return ya(Ta).controller.signal;
		}
	}, Yu = typeof WeakMap == "function" ? WeakMap : Map, X = 0, Xu = null, Z = null, Q = 0, Zu = 0, Qu = null, $u = !1, ed = !1, td = !1, nd = 0, rd = 0, id = 0, ad = 0, od = 0, sd = 0, cd = 0, ld = null, ud = null, dd = !1, fd = 0, pd = 0, md = Infinity, hd = null, gd = null, _d = 0, vd = null, yd = null, bd = 0, xd = 0, Sd = null, Cd = null, wd = null, Td = null, Ed = null, Dd = 0, Od = null;
	function kd() {
		return X & 2 && Q !== 0 ? Q & -Q : B.T === null ? ht() : Nf();
	}
	function Ad() {
		if (sd === 0) {
			if (!(Q & 536870912) || K) {
				var e = $e;
				$e <<= 1, !($e & 3932160) && ($e = 262144), sd = e;
			} else sd = 536870912;
		}
		return e = wo.current, e !== null && (e.flags |= 32), sd;
	}
	function jd(e, t) {
		if (t != null) {
			var n = e.stateNode, r = n.ref;
			r === null && (r = n.ref = Pp(di(e.memoizedProps, n))), Td === null && (Td = []), Td.push(t.bind(null, r));
		}
	}
	function Md(e, t, n) {
		(e === Xu && (Zu === 2 || Zu === 9) || e.cancelPendingCommit !== null) && (zd(e, 0), Id(e, Q, sd, !1)), ct(e, n), (!(X & 2) || e !== Xu) && (e === Xu && (!(X & 2) && (ad |= n), rd === 4 && Id(e, Q, sd, !1)), Tf(e));
	}
	function Nd(e, t, n) {
		if (X & 6) throw Error(o(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || rt(e, t), i = r ? qd(e, t) : Gd(e, t, !0), a = r;
		do {
			if (i === 0) {
				ed && !r && Id(e, t, 0, !1);
				break;
			}
			if (n = e.current.alternate, a && !Fd(n)) i = Gd(e, t, !1), a = !1;
			else {
				if (i === 2) {
					if (a = t, e.errorRecoveryDisabledLanes & a) var s = 0;
					else s = e.pendingLanes & -536870913, s = s === 0 ? s & 536870912 ? 536870912 : 0 : s;
					if (s !== 0) {
						t = s;
						a: {
							var c = e;
							i = ld;
							var l = c.current.memoizedState.isDehydrated;
							if (l && (zd(c, s).flags |= 256), s = Gd(c, s, !1), s !== 2 && s !== 6) {
								if (td && !l) {
									c.errorRecoveryDisabledLanes |= a, ad |= a, i = 4;
									break a;
								}
								a = ud, ud = i, a !== null && (ud === null ? ud = a : ud.push.apply(ud, a));
							}
							i = s;
						}
						if (a = !1, i !== 2) continue;
					}
				}
				if (i === 1) {
					zd(e, 0), Id(e, t, 0, !0);
					break;
				}
				a: {
					switch (r = e, a = i, a) {
						case 0:
						case 1: throw Error(o(345));
						case 4: if ((t & 4194048) !== t && (t & 62914560) !== t) break;
						case 6:
							Id(r, t, sd, !$u);
							break a;
						case 2:
							ud = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(o(329));
					}
					if ((t & 62914560) === t && (i = fd + 300 - Ie(), 10 < i)) {
						if (Id(r, t, sd, !$u), nt(r, 0, !0) !== 0) break a;
						bd = t, r.timeoutHandle = gp(Pd.bind(null, r, n, ud, hd, dd, t, sd, ad, cd, $u, a, "Throttled", -0, 0), i);
						break a;
					}
					Pd(r, n, ud, hd, dd, t, sd, ad, cd, $u, a, null, -0, 0);
				}
				break;
			}
		} while (1);
		Tf(e);
	}
	function Pd(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
		e.timeoutHandle = -1;
		var m = t.subtreeFlags, h = (a & 335544064) === a;
		d = null, (h || m & 8192 || (m & 16785408) == 16785408) && (d = {
			stylesheets: null,
			count: 0,
			imgCount: 0,
			imgBytes: 0,
			suspenseyImages: [],
			waitingForImages: !0,
			waitingForViewTransition: !1,
			unsuspend: pn
		}, Fl = null, Hu(t, a, d), h && (m = d, h = e.containerInfo, h = (h.nodeType === 9 ? h : h.ownerDocument).__reactViewTransition, h != null && (m.count++, m.waitingForViewTransition = !0, m = nh.bind(m), h.finished.then(m, m))), m = (a & 62914560) === a ? fd - Ie() : (a & 4194048) === a ? pd - Ie() : 0, m = eh(d, m), m !== null) ? (bd = a, e.cancelPendingCommit = m(ef.bind(null, e, t, a, n, r, i, o, s, c, l, u, d, null, f, p)), Id(e, a, o, !l)) : ef(e, t, a, n, r, i, o, s, c, l, u, d);
	}
	function Fd(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!Fr(a(), i)) return !1;
				} catch {
					return !1;
				}
			}
			if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
			else {
				if (t === e) break;
				for (; t.sibling === null;) {
					if (t.return === null || t.return === e) return !0;
					t = t.return;
				}
				t.sibling.return = t.return, t = t.sibling;
			}
		}
		return !0;
	}
	function Id(e, t, n, r) {
		t = it(e, t), t &= ~od, t &= ~ad, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - Je(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && ut(e, n, t);
	}
	function Ld() {
		return X & 6 ? !0 : (Ef(0, !1), !1);
	}
	function Rd() {
		if (Z !== null) {
			if (Zu === 0) var e = Z.return;
			else e = Z, da = ua = null, Qo(e), Qa = null, $a = 0, e = Z;
			for (; e !== null;) hl(e.alternate, e), e = e.return;
			Z = null;
		}
	}
	function zd(e, t) {
		var n = e.timeoutHandle;
		return n !== -1 && (e.timeoutHandle = -1, _p(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), bd = 0, Rd(), Xu = e, Z = n = Oi(e.current, null), Q = t, Zu = 0, Qu = null, $u = !1, ed = rt(e, t), td = !1, cd = sd = od = ad = id = rd = 0, ud = ld = null, dd = !1, nd = it(e, t), vi(), n;
	}
	function Bd(e, t) {
		J = null, B.H = cc, t === Ha || t === Wa ? (t = Xa(), Zu = 3) : t === Ua ? (t = Xa(), Zu = 4) : Zu = t === Ec ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, Qu = t, Z === null && (rd = 1, bc(e, Ii(t, e.current)));
	}
	function Vd() {
		var e = wo.current;
		return e === null ? !0 : (Q & 4194048) === Q ? To === null : (Q & 62914560) === Q || Q & 536870912 ? e === To : !1;
	}
	function Hd() {
		var e = B.H;
		return B.H = cc, e === null ? cc : e;
	}
	function Ud() {
		var e = B.A;
		return B.A = Ju, e;
	}
	function Wd() {
		rd = 4, $u || (Q & 4194048) !== Q && wo.current !== null || (ed = !0), !(id & 134217727) && !(ad & 134217727) || Xu === null || Id(Xu, Q, sd, !1);
	}
	function Gd(e, t, n) {
		var r = X;
		X |= 2;
		var i = Hd(), a = Ud();
		(Xu !== e || Q !== t) && (hd = null, zd(e, t)), t = !1;
		var o = rd;
		a: do
			try {
				if (Zu !== 0 && Z !== null) {
					var s = Z, c = Qu;
					switch (Zu) {
						case 8:
							Rd(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							wo.current === null && (t = !0);
							var l = Zu;
							if (Zu = 0, Qu = null, Zd(e, s, c, l), n && ed) {
								o = 0;
								break a;
							}
							break;
						default: l = Zu, Zu = 0, Qu = null, Zd(e, s, c, l);
					}
				}
				Kd(), o = rd;
				break;
			} catch (t) {
				Bd(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, da = ua = null, X = r, B.H = i, B.A = a, Z === null && (Xu = null, Q = 0, vi()), o;
	}
	function Kd() {
		for (; Z !== null;) Yd(Z);
	}
	function qd(e, t) {
		var n = X;
		X |= 2;
		var r = Hd(), i = Ud();
		Xu !== e || Q !== t ? (hd = null, md = Ie() + 500, zd(e, t)) : ed = rt(e, t);
		a: do
			try {
				if (Zu !== 0 && Z !== null) {
					t = Z;
					var a = Qu;
					b: switch (Zu) {
						case 1:
							Zu = 0, Qu = null, Zd(e, t, a, 1);
							break;
						case 2:
						case 9:
							if (Ka(a)) {
								Zu = 0, Qu = null, Xd(t);
								break;
							}
							t = function() {
								Zu !== 2 && Zu !== 9 || Xu !== e || (Zu = 7), Tf(e);
							}, a.then(t, t);
							break a;
						case 3:
							Zu = 7;
							break a;
						case 4:
							Zu = 5;
							break a;
						case 7:
							Ka(a) ? (Zu = 0, Qu = null, Xd(t)) : (Zu = 0, Qu = null, Zd(e, t, a, 7));
							break;
						case 5:
							var s = null;
							switch (Z.tag) {
								case 26: s = Z.memoizedState;
								case 5:
								case 27:
									var c = Z;
									if (s ? Ym(s) : c.stateNode.complete) {
										Zu = 0, Qu = null;
										var l = c.sibling;
										if (l !== null) Z = l;
										else {
											var u = c.return;
											u === null ? Z = null : (Z = u, Qd(u));
										}
										break b;
									}
							}
							Zu = 0, Qu = null, Zd(e, t, a, 5);
							break;
						case 6:
							Zu = 0, Qu = null, Zd(e, t, a, 6);
							break;
						case 8:
							Rd(), rd = 6;
							break a;
						default: throw Error(o(462));
					}
				}
				Jd();
				break;
			} catch (t) {
				Bd(e, t);
			}
		while (1);
		return da = ua = null, B.H = r, B.A = i, X = n, Z === null ? (Xu = null, Q = 0, vi(), rd) : 0;
	}
	function Jd() {
		for (; Z !== null && !Pe();) Yd(Z);
	}
	function Yd(e) {
		var t = ol(e.alternate, e, nd);
		e.memoizedProps = e.pendingProps, t === null ? Qd(e) : Z = t;
	}
	function Xd(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = Bc(n, t, t.pendingProps, t.type, void 0, Q);
				break;
			case 11:
				t = Bc(n, t, t.pendingProps, t.type.render, t.ref, Q);
				break;
			case 5:
				Qo(t);
				var r = t;
				r === Zi && (K ? (ia(r), r.tag === 5 && r.stateNode != null && (Qi = r.stateNode)) : (ia(r), K = !0));
			default: hl(n, t), t = Z = ki(t, nd), t = ol(n, t, nd);
		}
		e.memoizedProps = e.pendingProps, t === null ? Qd(e) : Z = t;
	}
	function Zd(e, t, n, r) {
		da = ua = null, Qo(t), Qa = null, $a = 0;
		var i = t.return;
		try {
			if (Tc(e, i, t, n, Q)) {
				rd = 1, bc(e, Ii(n, e.current)), Z = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw Z = i, t;
			rd = 1, bc(e, Ii(n, e.current)), Z = null;
			return;
		}
		t.flags & 32768 ? (K || r === 1 ? e = !0 : ed || Q & 536870912 ? e = !1 : ($u = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = wo.current, r !== null && r.tag === 13 && (r.flags |= 16384))), $d(t, e)) : Qd(t);
	}
	function Qd(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				$d(t, $u);
				return;
			}
			e = t.return;
			var n = pl(t.alternate, t, nd);
			if (n !== null) {
				Z = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				Z = t;
				return;
			}
			Z = t = e;
		} while (t !== null);
		rd === 0 && (rd = 5);
	}
	function $d(e, t) {
		do {
			var n = ml(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, Z = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				Z = e;
				return;
			}
			Z = e = n;
		} while (e !== null);
		rd = 6, Z = null;
	}
	function ef(e, t, n, r, i, a, s, c, l, u, d, f) {
		e.cancelPendingCommit = null;
		do
			lf();
		while (_d !== 0);
		if (X & 6) throw Error(o(327));
		if (t !== null) {
			if (t === e.current) throw Error(o(177));
			e === Xu && (Z = Xu = null, Q = 0), yd = t, vd = e, bd = n, Sd = i, Cd = r, tf(e, t, n, s, c, l, f);
		}
	}
	function tf(e, t, n, r, i, a, o) {
		var s = t.lanes | t.childLanes;
		if (xd = s, s |= _i, lt(e, n, s, r, i, a), Td = null, (n & 335544064) === n ? (Ed = Aa(e), r = 10262) : (Ed = null, r = 10256), (t.subtreeFlags & r) !== 0 || (t.flags & r) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, vf(Be, function() {
			return uf(), null;
		})) : (e.callbackNode = null, e.callbackPriority = 0), Pl = !1, r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
			r = B.T, B.T = null, i = V.p, V.p = 2, a = X, X |= 4;
			try {
				lu(e, t, n);
			} finally {
				X = a, V.p = i, B.T = r;
			}
		}
		_d = 1, Pl ? wd = Mp(o, e.containerInfo, Ed, af, of, rf, sf, uf, nf, null, null) : (af(), of(), sf());
	}
	function nf(e) {
		if (_d !== 0) {
			var t = vd.onRecoverableError;
			t(e, { componentStack: null });
		}
	}
	function rf() {
		_d === 3 && (_d = 0, Au(yd, vd), _d = 4);
	}
	function af() {
		if (_d === 1) {
			_d = 0;
			var e = vd, t = yd, n = bd, r = !!(t.flags & 13878);
			if (t.subtreeFlags & 13878 || r) {
				r = B.T, B.T = null;
				var i = V.p;
				V.p = 2;
				var a = X;
				X |= 4;
				try {
					ou = su = !1, Eu(t, e, n), n = cp;
					var o = Vr(e.containerInfo), s = n.focusedElem, c = n.selectionRange;
					if (o !== s && s && s.ownerDocument && Br(s.ownerDocument.documentElement, s)) {
						if (c !== null && Hr(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = zr(s, h), v = zr(s, g);
									if (_ && v && (p.rangeCount !== 1 || p.anchorNode !== _.node || p.anchorOffset !== _.offset || p.focusNode !== v.node || p.focusOffset !== v.offset)) {
										var y = d.createRange();
										y.setStart(_.node, _.offset), p.removeAllRanges(), h > g ? (p.addRange(y), p.extend(v.node, v.offset)) : (y.setEnd(v.node, v.offset), p.addRange(y));
									}
								}
							}
						}
						for (d = [], p = s; p = p.parentNode;) p.nodeType === 1 && d.push({
							element: p,
							left: p.scrollLeft,
							top: p.scrollTop
						});
						for (typeof s.focus == "function" && s.focus(), s = 0; s < d.length; s++) {
							var b = d[s];
							b.element.scrollLeft = b.left, b.element.scrollTop = b.top;
						}
					}
					gh = !!sp, cp = sp = null;
				} finally {
					X = a, V.p = i, B.T = r;
				}
			}
			e.current = t, _d = 2;
		}
	}
	function of() {
		if (_d === 2) {
			_d = 0;
			var e = vd, t = yd, n = !!(t.flags & 8772);
			if (t.subtreeFlags & 8772 || n) {
				n = B.T, B.T = null;
				var r = V.p;
				V.p = 2;
				var i = X;
				X |= 4;
				try {
					du(e, t.alternate, t);
				} finally {
					X = i, V.p = r, B.T = n;
				}
			}
			_d = 3;
		}
	}
	function sf() {
		if (_d === 4 || _d === 3) {
			_d = 0;
			var e = wd;
			wd = null, Fe();
			var t = vd, n = yd, r = bd, i = Cd, a = (r & 335544064) === r ? 10262 : 10256;
			if ((n.subtreeFlags & a) !== 0 || (n.flags & a) !== 0 ? _d = 5 : (_d = 0, yd = vd = null, cf(t, t.pendingLanes)), a = t.pendingLanes, a === 0 && (gd = null), mt(r), n = n.stateNode, Ke && typeof Ke.onCommitFiberRoot == "function") try {
				Ke.onCommitFiberRoot(Ge, n, void 0, (n.current.flags & 128) == 128);
			} catch {}
			if (i !== null) {
				n = B.T, a = V.p, V.p = 2, B.T = null;
				try {
					for (var o = t.onRecoverableError, s = 0; s < i.length; s++) {
						var c = i[s];
						o(c.value, { componentStack: c.stack });
					}
				} finally {
					B.T = n, V.p = a;
				}
			}
			if (i = Td, o = Ed, Ed = null, i !== null && (Td = null, o === null && (o = []), e !== null)) for (c = 0; c < i.length; c++) n = (0, i[c])(o), n !== void 0 && e.finished.finally(n);
			bd & 3 && lf(), Tf(t), a = t.pendingLanes, r & 261930 && a & 42 ? t === Od ? Dd++ : (Dd = 0, Od = t) : (Dd = 0, Od = null), Ef(0, !1);
		}
	}
	function cf(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Da(t)));
	}
	function lf() {
		return wd !== null && (wd.skipTransition(), wd = null), af(), of(), sf(), uf();
	}
	function uf() {
		if (_d !== 5) return !1;
		var e = vd, t = xd;
		xd = 0;
		var n = mt(bd), r = B.T, i = V.p;
		try {
			V.p = 32 > n ? 32 : n, B.T = null, n = Sd, Sd = null;
			var a = vd, s = bd;
			if (_d = 0, yd = vd = null, bd = 0, X & 6) throw Error(o(331));
			var c = X;
			if (X |= 4, Gu(a.current), Lu(a, a.current, s, n), X = c, Ef(0, !1), Ke && typeof Ke.onPostCommitFiberRoot == "function") try {
				Ke.onPostCommitFiberRoot(Ge, a);
			} catch {}
			return !0;
		} finally {
			V.p = i, B.T = r, cf(e, t);
		}
	}
	function df(e, t, n) {
		t = Ii(n, t), t = Sc(e.stateNode, t, 2), e = uo(e, t, 2), e !== null && (ct(e, 2), Tf(e));
	}
	function ff(e, t, n) {
		if (e.tag === 3) df(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				df(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (gd === null || !gd.has(r))) {
					e = Ii(n, e), n = Cc(2), r = uo(t, n, 2), r !== null && (wc(n, r, t, e), ct(r, 2), Tf(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function pf(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Yu();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (td = !0, i.add(n), e = mf.bind(null, e, t, n), t.then(e, e));
	}
	function mf(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Xu === e && (Q & n) === n && (rd === 4 || rd === 3 && (Q & 62914560) === Q && 300 > Ie() - fd ? X & 2 ? od |= n : zd(e, 0) : od |= n, cd === Q && (cd = 0)), Tf(e);
	}
	function hf(e, t) {
		t === 0 && (t = ot()), e = xi(e, t), e !== null && (ct(e, t), Tf(e));
	}
	function gf(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), hf(e, n);
	}
	function _f(e, t) {
		var n = 0;
		switch (e.tag) {
			case 31:
			case 13:
				var r = e.stateNode, i = e.memoizedState;
				i !== null && (n = i.retryLane);
				break;
			case 19:
				r = e.stateNode;
				break;
			case 22:
				r = e.stateNode._retryCache;
				break;
			default: throw Error(o(314));
		}
		r !== null && r.delete(t), hf(e, n);
	}
	function vf(e, t) {
		return Me(e, t);
	}
	var yf = null, bf = null, xf = !1, Sf = !1, Cf = !1, wf = 0;
	function Tf(e) {
		e !== bf && e.next === null && (bf === null ? yf = bf = e : bf = bf.next = e), Sf = !0, xf || (xf = !0, Mf());
	}
	function Ef(e, t) {
		if (!Cf && Sf) {
			Cf = !0;
			do
				for (var n = !1, r = yf; r !== null;) {
					if (!t) {
						if (e !== 0) {
							var i = r.pendingLanes;
							if (i === 0) var a = 0;
							else {
								var o = r.suspendedLanes, s = r.pingedLanes;
								a = (1 << 31 - Je(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, jf(r, a));
						} else a = Q, a = nt(r, r === Xu ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || rt(r, a) || (n = !0, jf(r, a));
					}
					r = r.next;
				}
			while (n);
			Cf = !1;
		}
	}
	function Df() {
		Of();
	}
	function Of() {
		Sf = xf = !1;
		var e = 0;
		wf !== 0 && hp() && (e = wf);
		for (var t = Ie(), n = null, r = yf; r !== null;) {
			var i = r.next, a = kf(r, t);
			a === 0 ? (r.next = null, n === null ? yf = i : n.next = i, i === null && (bf = n)) : (n = r, (e !== 0 || a & 3) && (Sf = !0)), r = i;
		}
		_d !== 0 && _d !== 5 || Ef(e, !1), wf !== 0 && (wf = 0);
	}
	function kf(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - Je(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = at(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = Xu, n = Q, n = nt(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (Zu === 2 || Zu === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && Ne(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || rt(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && Ne(r), mt(n)) {
				case 2:
				case 8:
					n = ze;
					break;
				case 32:
					n = Be;
					break;
				case 268435456:
					n = He;
					break;
				default: n = Be;
			}
			return r = Af.bind(null, e), n = Me(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && Ne(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function Af(e, t) {
		if (_d !== 0 && _d !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (lf() && e.callbackNode !== n) return null;
		var r = Q;
		return r = nt(e, e === Xu ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (Nd(e, r, t), kf(e, Ie()), e.callbackNode != null && e.callbackNode === n ? Af.bind(null, e) : null);
	}
	function jf(e, t) {
		if (lf()) return null;
		Nd(e, t, !0);
	}
	function Mf() {
		bp(function() {
			X & 6 ? Me(Re, Df) : Of();
		});
	}
	function Nf() {
		if (wf === 0) {
			var e = Ma;
			e === 0 && (e = Qe, Qe <<= 1, !(Qe & 261888) && (Qe = 256)), wf = e;
		}
		return wf;
	}
	function Pf(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : fn(e);
	}
	function Ff(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = Pf((i[yt] || null).action), o = r.submitter;
			o && (t = (t = o[yt] || null) ? Pf(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new Nn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (wf !== 0) {
								var e = new FormData(i, o);
								Js(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = new FormData(i, o), Js(n, {
							pending: !0,
							data: e,
							method: i.method,
							action: a
						}, a, e));
					},
					currentTarget: i
				}]
			});
		}
	}
	for (var If = 0; If < ci.length; If++) {
		var Lf = ci[If];
		li(Lf.toLowerCase(), "on" + (Lf[0].toUpperCase() + Lf.slice(1)));
	}
	li(ei, "onAnimationEnd"), li(ti, "onAnimationIteration"), li(ni, "onAnimationStart"), li("dblclick", "onDoubleClick"), li("focusin", "onFocus"), li("focusout", "onBlur"), li(ri, "onTransitionRun"), li(ii, "onTransitionStart"), li(ai, "onTransitionCancel"), li(oi, "onTransitionEnd"), It("onMouseEnter", ["mouseout", "mouseover"]), It("onMouseLeave", ["mouseout", "mouseover"]), It("onPointerEnter", ["pointerout", "pointerover"]), It("onPointerLeave", ["pointerout", "pointerover"]), Ft("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), Ft("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), Ft("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), Ft("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), Ft("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), Ft("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var Rf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), zf = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Rf));
	function Bf(e, t) {
		t = !!(t & 4);
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = r.event;
			r = r.listeners;
			a: {
				var a = void 0;
				if (t) for (var o = r.length - 1; 0 <= o; o--) {
					var s = r[o], c = s.instance, l = s.currentTarget;
					if (s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						mi(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						mi(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function $(e, t) {
		var n = t[xt];
		n === void 0 && (n = t[xt] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (Wf(t, e, 2, !1), n.add(r));
	}
	function Vf(e, t, n) {
		var r = 0;
		t && (r |= 4), Wf(n, e, r, t);
	}
	var Hf = "_reactListening" + Math.random().toString(36).slice(2);
	function Uf(e) {
		if (!e[Hf]) {
			e[Hf] = !0, Nt.forEach(function(t) {
				t !== "selectionchange" && (zf.has(t) || Vf(t, !1, e), Vf(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[Hf] || (t[Hf] = !0, Vf("selectionchange", !1, t));
		}
	}
	function Wf(e, t, n, r) {
		switch (Ch(t)) {
			case 2:
				var i = _h;
				break;
			case 8:
				i = vh;
				break;
			default: i = yh;
		}
		n = i.bind(null, t, n, e), i = void 0, !Sn || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function Gf(e, t, n, r, i) {
		var a = r;
		if (!(t & 1) && !(t & 2) && r !== null) a: for (;;) {
			if (r === null) return;
			var o = r.tag;
			if (o === 3 || o === 4) {
				var s = r.stateNode.containerInfo;
				if (s === i) break;
				if (o === 4) for (o = r.return; o !== null;) {
					var c = o.tag;
					if ((c === 3 || c === 4) && o.stateNode.containerInfo === i) return;
					o = o.return;
				}
				for (; s !== null;) {
					if (o = Ot(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6 || c === 26 || c === 27) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		yn(function() {
			var r = a, i = hn(n), o = [];
			a: {
				var s = si.get(e);
				if (s !== void 0) {
					var c = Nn, u = e;
					switch (e) {
						case "keypress": if (On(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = Zn;
							break;
						case "focusin":
							u = "focus", c = Hn;
							break;
						case "focusout":
							u = "blur", c = Hn;
							break;
						case "beforeblur":
						case "afterblur":
							c = Hn;
							break;
						case "click": if (n.button === 2) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							c = Bn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = Vn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							c = er;
							break;
						case ei:
						case ti:
						case ni:
							c = Un;
							break;
						case oi:
							c = tr;
							break;
						case "scroll":
						case "scrollend":
							c = Fn;
							break;
						case "wheel":
							c = nr;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = Wn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							c = Qn;
							break;
						case "submit":
							c = $n;
							break;
						case "toggle":
						case "beforetoggle": c = rr;
					}
					var d = !!(t & 4), f = !d && (e === "scroll" || e === "scrollend"), p = d ? s === null ? null : s + "Capture" : s;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = bn(m, p), g != null && d.push(Kf(m, g, h))), f) break;
						m = m.return;
					}
					0 < d.length && (s = new c(s, u, null, n, i), o.push({
						event: s,
						listeners: d
					}));
				}
			}
			if (!(t & 7)) {
				a: {
					if (c = e === "mouseover" || e === "pointerover", s = e === "mouseout" || e === "pointerout", c && n !== mn && (u = n.relatedTarget || n.fromElement) && (Ot(u) || u[bt])) break a;
					(s || c) && (u = i.window === i ? i : (c = i.ownerDocument) ? c.defaultView || c.parentWindow : window, s ? (c = n.relatedTarget || n.toElement, s = r, c = c ? Ot(c) : null, c !== null && (f = l(c), d = c.tag, c !== f || d !== 5 && d !== 27 && d !== 6) && (c = null)) : (s = null, c = r), s !== c && (d = Bn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = Qn, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = s == null ? u : At(s), h = c == null ? u : At(c), u = new d(g, m + "leave", s, n, i), u.target = f, u.relatedTarget = h, g = null, Ot(i) === r && (d = new d(p, m + "enter", c, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, d = s && c ? E(s, c, Jf) : null, s !== null && Yf(o, u, s, d, !1), c !== null && f !== null && Yf(o, f, c, d, !0)));
				}
				a: {
					if (s = r ? At(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var _ = Cr;
					else if (_r(s)) {
						if (wr) _ = Nr;
						else {
							_ = jr;
							var v = Ar;
						}
					} else c = s.nodeName, !c || c.toLowerCase() !== "input" || s.type !== "checkbox" && s.type !== "radio" ? r && ln(r.elementType) && (_ = Cr) : _ = Mr;
					if (_ &&= _(e, r)) {
						vr(o, _, n, i);
						break a;
					}
					v && v(e, s, r);
				}
				switch (v = r ? At(r) : window, e) {
					case "focusin":
						(_r(v) || v.contentEditable === "true") && (Wr = v, Gr = r, Kr = null);
						break;
					case "focusout":
						Kr = Gr = Wr = null;
						break;
					case "mousedown":
						qr = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						qr = !1, Jr(o, n, i);
						break;
					case "selectionchange": if (Ur) break;
					case "keydown":
					case "keyup": Jr(o, n, i);
				}
				var y;
				if (ar) b: {
					switch (e) {
						case "compositionstart":
							var b = "onCompositionStart";
							break b;
						case "compositionend":
							b = "onCompositionEnd";
							break b;
						case "compositionupdate":
							b = "onCompositionUpdate";
							break b;
					}
					b = void 0;
				}
				else pr ? dr(e, n) && (b = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (b = "onCompositionStart");
				b && (cr && n.locale !== "ko" && (pr || b !== "onCompositionStart" ? b === "onCompositionEnd" && pr && (y = Dn()) : (wn = i, Tn = "value" in wn ? wn.value : wn.textContent, pr = !0)), v = qf(r, b), 0 < v.length && (b = new Gn(b, e, null, n, i), o.push({
					event: b,
					listeners: v
				}), y ? b.data = y : (y = fr(n), y !== null && (b.data = y)))), (y = sr ? mr(e, n) : hr(e, n)) && (b = qf(r, "onBeforeInput"), 0 < b.length && (v = new Gn("onBeforeInput", "beforeinput", null, n, i), o.push({
					event: v,
					listeners: b
				}), v.data = y)), Ff(o, e, r, n, i);
			}
			Bf(o, t);
		});
	}
	function Kf(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function qf(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = bn(e, n), i != null && r.unshift(Kf(e, i, a)), i = bn(e, t), i != null && r.push(Kf(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Jf(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function Yf(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = bn(n, a), l != null && o.unshift(Kf(n, l, c))) : i || (l = bn(n, a), l != null && o.push(Kf(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var Xf = /\r\n?/g, Zf = /\u0000|\uFFFD/g;
	function Qf(e) {
		return (typeof e == "string" ? e : "" + e).replace(Xf, "\n").replace(Zf, "");
	}
	function $f(e, t) {
		return t = Qf(t), Qf(e) === t;
	}
	function ep(e, t, n, r, i, a) {
		switch (n) {
			case "children":
				if (typeof r == "string") t === "body" || t === "textarea" && r === "" || an(e, r);
				else if (typeof r == "number" || typeof r == "bigint") t !== "body" && an(e, "" + r);
				else return;
				break;
			case "className":
				Ut(e, "class", r);
				break;
			case "tabIndex":
				Ut(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				Ut(e, n, r);
				break;
			case "style":
				cn(e, r, a);
				return;
			case "data": if (t !== "object") {
				Ut(e, "data", r);
				break;
			}
			case "src":
			case "href":
				if (r === "" && (t !== "a" || n !== "href") || r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = fn(r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				}
				if (typeof a == "function" && (n === "formAction" ? (t !== "input" && ep(e, t, "name", i.name, i, null), ep(e, t, "formEncType", i.formEncType, i, null), ep(e, t, "formMethod", i.formMethod, i, null), ep(e, t, "formTarget", i.formTarget, i, null)) : (ep(e, t, "encType", i.encType, i, null), ep(e, t, "method", i.method, i, null), ep(e, t, "target", i.target, i, null))), r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = fn(r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = pn);
				return;
			case "onScroll":
				r != null && $("scroll", e);
				return;
			case "onScrollEnd":
				r != null && $("scrollend", e);
				return;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(o(61));
					if (n = r.__html, n != null) {
						if (i.children != null) throw Error(o(60));
						a?.__html !== n && (e.innerHTML = n);
					}
				}
				break;
			case "multiple":
				e.multiple = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "muted":
				e.muted = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (r == null || typeof r == "function" || typeof r == "boolean" || typeof r == "symbol") {
					e.removeAttribute("xlink:href");
					break;
				}
				n = fn(r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "credentialless":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				r && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
				break;
			case "capture":
			case "download":
				!0 === r ? e.setAttribute(n, "") : !1 !== r && r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				r != null && typeof r != "function" && typeof r != "symbol" && !isNaN(r) && 1 <= r ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "rowSpan":
			case "start":
				r == null || typeof r == "function" || typeof r == "symbol" || isNaN(r) ? e.removeAttribute(n) : e.setAttribute(n, r);
				break;
			case "popover":
				$("beforetoggle", e), $("toggle", e), Ht(e, "popover", r);
				break;
			case "xlinkActuate":
				Wt(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				Wt(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				Wt(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				Wt(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				Wt(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				Wt(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				Wt(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				Wt(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				Wt(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				Ht(e, "is", r);
				break;
			case "innerText":
			case "textContent": return;
			default: if (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") n = un.get(n) || n, Ht(e, n, r);
			else return;
		}
		W = !0;
	}
	function tp(e, t, n, r, i, a) {
		switch (n) {
			case "style":
				cn(e, r, a);
				return;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(o(61));
					if (n = r.__html, n != null) {
						if (i.children != null) throw Error(o(60));
						a?.__html !== n && (e.innerHTML = n);
					}
				}
				break;
			case "children":
				if (typeof r == "string") an(e, r);
				else if (typeof r == "number" || typeof r == "bigint") an(e, "" + r);
				else return;
				break;
			case "onScroll":
				r != null && $("scroll", e);
				return;
			case "onScrollEnd":
				r != null && $("scrollend", e);
				return;
			case "onClick":
				r != null && (e.onclick = pn);
				return;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": return;
			case "innerText":
			case "textContent": return;
			default:
				if (!Pt.hasOwnProperty(n)) a: {
					if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), a = n.slice(2, i ? n.length - 7 : void 0), t = e[yt] || null, t = t == null ? null : t[n], typeof t == "function" && e.removeEventListener(a, t, i), typeof r == "function")) {
						typeof t != "function" && t !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(a, r, i);
						break a;
					}
					W = !0, n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : Ht(e, n, r);
				}
				return;
		}
		W = !0;
	}
	function np(e, t, n) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				$("error", e), $("load", e);
				var r = !1, i = !1, a;
				for (a in n) if (n.hasOwnProperty(a)) {
					var s = n[a];
					if (s != null) switch (a) {
						case "src":
							r = !0;
							break;
						case "srcSet":
							i = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(o(137, t));
						default: ep(e, t, a, s, n, null);
					}
				}
				i && ep(e, t, "srcSet", n.srcSet, n, null), r && ep(e, t, "src", n.src, n, null);
				return;
			case "input":
				$("invalid", e);
				var c = a = s = i = null, l = null, u = null;
				for (r in n) if (n.hasOwnProperty(r)) {
					var d = n[r];
					if (d != null) switch (r) {
						case "name":
							i = d;
							break;
						case "type":
							s = d;
							break;
						case "checked":
							l = d;
							break;
						case "defaultChecked":
							u = d;
							break;
						case "value":
							a = d;
							break;
						case "defaultValue":
							c = d;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (d != null) throw Error(o(137, t));
							break;
						default: ep(e, t, r, d, n, null);
					}
				}
				$t(e, a, c, l, u, s, i, !1);
				return;
			case "select":
				for (i in $("invalid", e), r = s = a = null, n) if (n.hasOwnProperty(i) && (c = n[i], c != null)) switch (i) {
					case "value":
						a = c;
						break;
					case "defaultValue":
						s = c;
						break;
					case "multiple": r = c;
					default: ep(e, t, i, c, n, null);
				}
				t = a, n = s, e.multiple = !!r, t == null ? n != null && tn(e, !!r, n, !0) : tn(e, !!r, t, !1);
				return;
			case "textarea":
				for (s in $("invalid", e), a = i = r = null, n) if (n.hasOwnProperty(s) && (c = n[s], c != null)) switch (s) {
					case "value":
						r = c;
						break;
					case "defaultValue":
						i = c;
						break;
					case "children":
						a = c;
						break;
					case "dangerouslySetInnerHTML":
						if (c != null) throw Error(o(91));
						break;
					default: ep(e, t, s, c, n, null);
				}
				rn(e, r, i, a);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: ep(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				$("beforetoggle", e), $("toggle", e), $("cancel", e), $("close", e);
				break;
			case "iframe":
			case "object":
				$("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < Rf.length; r++) $(Rf[r], e);
				break;
			case "image":
				$("error", e), $("load", e);
				break;
			case "details":
				$("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": $("error", e), $("load", e);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (u in n) if (n.hasOwnProperty(u) && (r = n[u], r != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(o(137, t));
					default: ep(e, t, u, r, n, null);
				}
				return;
			default: if (ln(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && tp(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && ep(e, t, c, r, n, null));
	}
	var rp = {};
	function ip(e, t, n, r) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var i = null, a = null, s = null, c = null, l = null, u = null, d = null;
				for (m in n) {
					var f = n[m];
					if (n.hasOwnProperty(m) && f != null) switch (m) {
						case "checked": break;
						case "value": break;
						case "defaultValue": l = f;
						default: r.hasOwnProperty(m) || ep(e, t, m, null, r, f);
					}
				}
				for (var p in r) {
					var m = r[p];
					if (f = n[p], r.hasOwnProperty(p) && (m != null || f != null)) switch (p) {
						case "type":
							m !== f && (W = !0), a = m;
							break;
						case "name":
							m !== f && (W = !0), i = m;
							break;
						case "checked":
							m !== f && (W = !0), u = m;
							break;
						case "defaultChecked":
							m !== f && (W = !0), d = m;
							break;
						case "value":
							m !== f && (W = !0), s = m;
							break;
						case "defaultValue":
							m !== f && (W = !0), c = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(o(137, t));
							break;
						default: m !== f && ep(e, t, p, m, r, f);
					}
				}
				Qt(e, s, c, l, u, d, a, i);
				return;
			case "select":
				for (a in m = s = c = p = null, n) if (l = n[a], n.hasOwnProperty(a) && l != null) switch (a) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(a) || ep(e, t, a, null, r, l);
				}
				for (i in r) if (a = r[i], l = n[i], r.hasOwnProperty(i) && (a != null || l != null)) switch (i) {
					case "value":
						a !== l && (W = !0), p = a;
						break;
					case "defaultValue":
						a !== l && (W = !0), c = a;
						break;
					case "multiple": a !== l && (W = !0), s = a;
					default: a !== l && ep(e, t, i, a, r, l);
				}
				t = c, n = s, r = m, p == null ? !!r != !!n && (t == null ? tn(e, !!n, n ? [] : "", !1) : tn(e, !!n, t, !0)) : tn(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (i = n[c], n.hasOwnProperty(c) && i != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: ep(e, t, c, null, r, i);
				}
				for (s in r) if (i = r[s], a = n[s], r.hasOwnProperty(s) && (i != null || a != null)) switch (s) {
					case "value":
						i !== a && (W = !0), p = i;
						break;
					case "defaultValue":
						i !== a && (W = !0), m = i;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (i != null) throw Error(o(91));
						break;
					default: i !== a && ep(e, t, s, i, r, a);
				}
				nn(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: ep(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						p !== m && (W = !0), e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: ep(e, t, l, p, r, m);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && ep(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(o(137, t));
						break;
					default: ep(e, t, u, p, r, m);
				}
				return;
			default: if (ln(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && tp(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || tp(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && ep(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || ep(e, t, f, p, r, m);
	}
	function ap(e) {
		switch (e) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function op() {
		if (typeof performance.getEntriesByType == "function") {
			for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), r = 0; r < n.length; r++) {
				var i = n[r], a = i.transferSize, o = i.initiatorType, s = i.duration;
				if (a && s && ap(o)) {
					for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
						var c = n[r], l = c.startTime;
						if (l > s) break;
						var u = c.transferSize, d = c.initiatorType;
						u && ap(d) && (c = c.responseEnd, o += u * (c < s ? 1 : (s - l) / (c - l)));
					}
					if (--r, t += 8 * (a + o) / (i.duration / 1e3), e++, 10 < e) break;
				}
			}
			if (0 < e) return t / e / 1e6;
		}
		return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
	}
	var sp = null, cp = null;
	function lp(e) {
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	function up(e) {
		switch (e) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function dp(e, t) {
		if (e === 0) switch (t) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return e === 1 && t === "foreignObject" ? 0 : e;
	}
	function fp(e, t, n, r) {
		return n = lp(n).createElement(e), n[vt] = r, n[yt] = t, np(n, e, t), U(n), n;
	}
	function pp(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var mp = null;
	function hp() {
		var e = window.event;
		return e && e.type === "popstate" ? e !== mp && (mp = e, !0) : (mp = null, !1);
	}
	var gp = typeof setTimeout == "function" ? setTimeout : void 0, _p = typeof clearTimeout == "function" ? clearTimeout : void 0, vp = typeof Promise == "function" ? Promise : void 0, yp = typeof requestAnimationFrame == "function" ? requestAnimationFrame : gp, bp = typeof queueMicrotask == "function" ? queueMicrotask : vp === void 0 ? gp : function(e) {
		return vp.resolve(null).then(e).catch(xp);
	};
	function xp(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Sp(e) {
		return e === "head";
	}
	function Cp(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) {
				if (n = i.data, n === "/$" || n === "/&") {
					if (r === 0) {
						e.removeChild(i), Hh(t);
						return;
					}
					r--;
				} else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") r++;
				else if (n === "html") _m(e.ownerDocument.documentElement);
				else if (n === "head") {
					n = e.ownerDocument.head, _m(n);
					for (var a = n.firstChild; a;) {
						var o = a.nextSibling, s = a.nodeName;
						a[Tt] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
					}
				} else n === "body" && _m(e.ownerDocument.body);
			}
			n = i;
		} while (n);
		Hh(t);
	}
	function wp(e, t) {
		var n = e;
		e = 0;
		do {
			var r = n.nextSibling;
			if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display, n.style.display = "none") : (n.style.display = n._stashedDisplay || "", n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue, n.nodeValue = "") : n.nodeValue = n._stashedText || ""), r && r.nodeType === 8) {
				if (n = r.data, n === "/$") {
					if (e === 0) break;
					e--;
				} else n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
			}
			n = r;
		} while (n);
	}
	function Tp(e, t, n) {
		if (t = CSS.escape(t) === t ? t : "r-" + btoa(t).replace(/=/g, ""), e.style.viewTransitionName = t, n != null && (e.style.viewTransitionClass = n), n = getComputedStyle(e), n.display === "inline") {
			if (t = e.getClientRects(), t.length === 1) var r = 1;
			else for (var i = r = 0; i < t.length; i++) {
				var a = t[i];
				0 < a.width && 0 < a.height && r++;
			}
			r === 1 && (e = e.style, e.display = t.length === 1 ? "inline-block" : "block", e.marginTop = "-" + n.paddingTop, e.marginBottom = "-" + n.paddingBottom);
		}
	}
	function Ep(e, t) {
		e = e.style, t = t.style;
		var n = t == null ? null : t.hasOwnProperty("viewTransitionName") ? t.viewTransitionName : t.hasOwnProperty("view-transition-name") ? t["view-transition-name"] : null;
		e.viewTransitionName = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), n = t == null ? null : t.hasOwnProperty("viewTransitionClass") ? t.viewTransitionClass : t.hasOwnProperty("view-transition-class") ? t["view-transition-class"] : null, e.viewTransitionClass = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), e.display === "inline-block" && (t == null ? e.display = e.margin = "" : (n = t.display, e.display = n == null || typeof n == "boolean" ? "" : n, n = t.margin, n == null ? (n = t.hasOwnProperty("marginTop") ? t.marginTop : t["margin-top"], e.marginTop = n == null || typeof n == "boolean" ? "" : n, t = t.hasOwnProperty("marginBottom") ? t.marginBottom : t["margin-bottom"], e.marginBottom = t == null || typeof t == "boolean" ? "" : t) : e.margin = n));
	}
	function Dp(e, t, n) {
		return n = n.ownerDocument.defaultView, {
			rect: e,
			abs: t.position === "absolute" || t.position === "fixed",
			clip: t.clipPath !== "none" || t.overflow !== "visible" || t.filter !== "none" || t.mask !== "none" || t.mask !== "none" || t.borderRadius !== "0px",
			view: 0 <= e.bottom && 0 <= e.right && e.top <= n.innerHeight && e.left <= n.innerWidth
		};
	}
	function Op(e) {
		return Dp(e.getBoundingClientRect(), getComputedStyle(e), e);
	}
	function kp(e) {
		var t = e.getBoundingClientRect();
		t = new DOMRect(t.x + 2e4, t.y + 2e4, t.width, t.height);
		var n = getComputedStyle(e);
		return Dp(t, n, e);
	}
	function Ap(e) {
		return e.documentElement.clientHeight;
	}
	function jp(e) {
		this.addEventListener("load", e), this.addEventListener("error", e);
	}
	function Mp(e, t, n, r, i, a, o, s, c) {
		var l = t.nodeType === 9 ? t : t.ownerDocument;
		try {
			var u = l.startViewTransition({
				update: function() {
					var t = l.defaultView, n = t.navigation && t.navigation.transition, o = l.fonts.status;
					r();
					var s = [];
					if (o === "loaded" && (Ap(l), l.fonts.status === "loading" && s.push(l.fonts.ready)), o = s.length, e !== null) for (var c = e.suspenseyImages, u = 0, d = 0; d < c.length; d++) {
						var f = c[d];
						if (!f.complete) {
							var p = f.getBoundingClientRect();
							if (0 < p.bottom && 0 < p.right && p.top < t.innerHeight && p.left < t.innerWidth) {
								if (u += Xm(f), u > $m) {
									s.length = o;
									break;
								}
								f = new Promise(jp.bind(f)), s.push(f);
							}
						}
					}
					if (0 < s.length) return t = Promise.race([Promise.all(s), new Promise(function(e) {
						return setTimeout(e, 500);
					})]).then(i, i), (n ? Promise.allSettled([n.finished, t]) : t).then(a, a);
					if (i(), n) return n.finished.then(a, a);
					a();
				},
				types: n
			});
			l.__reactViewTransition = u;
			var d = [];
			return u.ready.then(function() {
				for (var e = l.documentElement.getAnimations({ subtree: !0 }), t = 0; t < e.length; t++) {
					var n = e[t], r = n.effect, i = r.pseudoElement;
					if (i != null && i.startsWith("::view-transition")) {
						d.push(n), n = r.getKeyframes();
						for (var a = i = void 0, s = !0, c = 0; c < n.length; c++) {
							var u = n[c], f = u.width;
							if (i === void 0) i = f;
							else if (i !== f) {
								s = !1;
								break;
							}
							if (f = u.height, a === void 0) a = f;
							else if (a !== f) {
								s = !1;
								break;
							}
							delete u.width, delete u.height, u.transform === "none" && delete u.transform;
						}
						s && i !== void 0 && a !== void 0 && (r.setKeyframes(n), s = getComputedStyle(r.target, r.pseudoElement), s.width !== i || s.height !== a) && (s = n[0], s.width = i, s.height = a, s = n[n.length - 1], s.width = i, s.height = a, r.setKeyframes(n));
					}
				}
				o();
			}, function(e) {
				l.__reactViewTransition === u && (l.__reactViewTransition = null);
				try {
					if (typeof e == "object" && e) switch (e.name) {
						case "InvalidStateError": (e.message === "View transition was skipped because document visibility state is hidden." || e.message === "Skipping view transition because document visibility state has become hidden." || e.message === "Skipping view transition because viewport size changed." || e.message === "Transition was aborted because of invalid state") && (e = null);
					}
					e !== null && c(e);
				} finally {
					r(), i(), o();
				}
			}), u.finished.finally(function() {
				for (var e = 0; e < d.length; e++) d[e].cancel();
				l.__reactViewTransition === u && (l.__reactViewTransition = null), s();
			}), u;
		} catch {
			return r(), i(), o(), null;
		}
	}
	function Np(e, t) {
		this._scope = document.documentElement, this._selector = "::view-transition-" + e + "(" + t + ")";
	}
	Np.prototype.animate = function(e, t) {
		return t = typeof t == "number" ? { duration: t } : D({}, t), t.pseudoElement = this._selector, this._scope.animate(e, t);
	}, Np.prototype.getAnimations = function() {
		for (var e = this._scope, t = this._selector, n = e.getAnimations({ subtree: !0 }), r = [], i = 0; i < n.length; i++) {
			var a = n[i].effect;
			a !== null && a.target === e && a.pseudoElement === t && r.push(n[i]);
		}
		return r;
	}, Np.prototype.getComputedStyle = function() {
		return getComputedStyle(this._scope, this._selector);
	};
	function Pp(e) {
		return {
			name: e,
			group: new Np("group", e),
			imagePair: new Np("image-pair", e),
			old: new Np("old", e),
			new: new Np("new", e)
		};
	}
	function Fp(e) {
		this._fragmentFiber = e, this._observers = this._eventListeners = null;
	}
	Fp.prototype.addEventListener = function(e, t, n) {
		var r = null, i = null;
		if (!(n != null && typeof n != "boolean" && (r = n.signal || null, r !== null && r.aborted))) {
			this._eventListeners === null && (this._eventListeners = []);
			var a = this._eventListeners;
			if (Bp(a, e, t, n) === -1) {
				var o = this, s = t;
				n != null && typeof n != "boolean" && !0 === n.once && (s = function(r) {
					o.removeEventListener(e, t, n), typeof t == "function" ? t.call(this, r) : t.handleEvent(r);
				}), r !== null && (i = o.removeEventListener.bind(o, e, t, n), r.addEventListener("abort", i, { once: !0 }), i = r.removeEventListener.bind(r, "abort", i)), r = Rp(n), a.push({
					type: e,
					listener: t,
					optionsOrUseCapture: n,
					attachedListener: s,
					cleanup: i
				}), h(this._fragmentFiber.child, !1, Ip, e, s, r);
			}
			this._eventListeners = a;
		}
	};
	function Ip(e, t, n, r) {
		return b(e).addEventListener(t, n, r), !1;
	}
	Fp.prototype.removeEventListener = function(e, t, n) {
		var r = this._eventListeners;
		if (r !== null && (t = Bp(r, e, t, n), t !== -1)) {
			var i = r[t];
			n = i.attachedListener;
			var a = i.cleanup;
			i = Rp(i.optionsOrUseCapture), h(this._fragmentFiber.child, !1, Lp, e, n, i), r.splice(t, 1), a !== null && a();
		}
	};
	function Lp(e, t, n, r) {
		return b(e).removeEventListener(t, n, r), !1;
	}
	function Rp(e) {
		return e != null && typeof e != "boolean" && (!0 === e.once || e.signal instanceof AbortSignal) ? {
			capture: e.capture,
			passive: e.passive
		} : e;
	}
	function zp(e) {
		return e == null ? "c=0" : typeof e == "boolean" ? "c=" + (e ? "1" : "0") : "c=" + (e.capture ? "1" : "0");
	}
	function Bp(e, t, n, r) {
		if (e.length === 0) return -1;
		r = zp(r);
		for (var i = 0; i < e.length; i++) {
			var a = e[i];
			if (a.type === t && a.listener === n && zp(a.optionsOrUseCapture) === r) return i;
		}
		return -1;
	}
	Fp.prototype.dispatchEvent = function(e) {
		var t = g(this._fragmentFiber);
		if (t === null) return !0;
		t = b(t);
		var n = this._eventListeners;
		if (n !== null && 0 < n.length || !e.bubbles) {
			var r = t.nodeType === 9 ? t.createComment("") : document.createTextNode("");
			if (n) for (var i = 0; i < n.length; i++) {
				var a = n[i];
				r.addEventListener(a.type, a.attachedListener, Rp(a.optionsOrUseCapture));
			}
			if (t.appendChild(r), e = r.dispatchEvent(e), n) for (i = 0; i < n.length; i++) a = n[i], r.removeEventListener(a.type, a.attachedListener, Rp(a.optionsOrUseCapture));
			return t.removeChild(r), e;
		}
		return t.dispatchEvent(e);
	}, Fp.prototype.focus = function(e) {
		h(this._fragmentFiber.child, !0, Vp, e, void 0, void 0);
	};
	function Vp(e, t) {
		return e.tag !== 6 && (e = b(e), pm(e, t));
	}
	Fp.prototype.focusLast = function(e) {
		var t = [];
		h(this._fragmentFiber.child, !0, Hp, t, void 0, void 0);
		for (var n = t.length - 1; 0 <= n && !Vp(t[n], e); n--);
	};
	function Hp(e, t) {
		return t.push(e), !1;
	}
	Fp.prototype.blur = function() {
		var e = g(this._fragmentFiber);
		e !== null && (e = b(e), e = lp(e).activeElement, e !== null && h(this._fragmentFiber.child, !1, Up, e, void 0, void 0));
	};
	function Up(e, t) {
		return e.tag !== 6 && (e = b(e), e === t || e.contains(t) ? (t.blur(), !0) : !1);
	}
	Fp.prototype.observeUsing = function(e) {
		this._observers === null && (this._observers = /* @__PURE__ */ new Set()), this._observers.add(e), h(this._fragmentFiber.child, !1, Wp, e, void 0, void 0);
	};
	function Wp(e, t) {
		return e.tag === 6 || (e = b(e), t.observe(e)), !1;
	}
	Fp.prototype.unobserveUsing = function(e) {
		var t = this._observers;
		if (t !== null && t.has(e)) {
			t.delete(e), h(this._fragmentFiber.child, !1, Gp, e, void 0, void 0);
			for (var n = t = 0; n < Kp.length; n++) {
				var r = Kp[n];
				r.fragmentInstance === this && r.observer === e ? e.unobserve(r.instance) : Kp[t++] = r;
			}
			Kp.length = t;
		}
	};
	function Gp(e, t) {
		return e.tag === 6 || (e = b(e), t.unobserve(e)), !1;
	}
	var Kp = [], qp = !1;
	function Jp(e, t, n) {
		Kp.push({
			fragmentInstance: e,
			observer: t,
			instance: n
		}), qp || (qp = !0, mm(function() {
			qp = !1;
			var e = Kp;
			Kp = [];
			for (var t = 0; t < e.length; t++) {
				var n = e[t];
				n.observer.unobserve(n.instance);
			}
		}));
	}
	Fp.prototype.getClientRects = function() {
		var e = [];
		return h(this._fragmentFiber.child, !1, Yp, e, void 0, void 0), e;
	};
	function Yp(e, t) {
		if (e.tag === 6) {
			e = e.stateNode;
			var n = e.ownerDocument.createRange();
			n.selectNodeContents(e), t.push.apply(t, n.getClientRects());
		} else e = b(e), t.push.apply(t, e.getClientRects());
		return !1;
	}
	Fp.prototype.getRootNode = function(e) {
		var t = g(this._fragmentFiber);
		return t === null ? this : b(t).getRootNode(e);
	}, Fp.prototype.compareDocumentPosition = function(e) {
		var t = g(this._fragmentFiber);
		if (t === null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		var n = [];
		h(this._fragmentFiber.child, !1, Hp, n, void 0, void 0);
		var r = b(t);
		if (n.length === 0) {
			if (n = r, _(this._fragmentFiber)) {
				a: {
					for (t = this._fragmentFiber.return; t !== null;) {
						if (t.tag === 4) {
							t = t.stateNode.containerInfo;
							break a;
						}
						if (t.tag === 3 || t.tag === 5 || t.tag === 27) break;
						t = t.return;
					}
					t = null;
				}
				t != null && (n = t);
			}
			t = this._fragmentFiber;
			var i = r = n.compareDocumentPosition(e);
			return n === e ? i = Node.DOCUMENT_POSITION_CONTAINS : r & Node.DOCUMENT_POSITION_CONTAINED_BY && (n = v(t)[1], n === null ? i = Node.DOCUMENT_POSITION_PRECEDING : (e = b(n).compareDocumentPosition(e), i = e === 0 || e & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING)), i |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
		}
		t = b(n[0]), i = b(n[n.length - 1]);
		var a = _(this._fragmentFiber) ? t.parentElement : r;
		if (a == null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		r = a.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_CONTAINED_BY, a = a.compareDocumentPosition(i) & Node.DOCUMENT_POSITION_CONTAINED_BY;
		var o = t.compareDocumentPosition(e), s = i.compareDocumentPosition(e), c = o & Node.DOCUMENT_POSITION_CONTAINED_BY || s & Node.DOCUMENT_POSITION_CONTAINED_BY;
		return s = r && a && o & Node.DOCUMENT_POSITION_FOLLOWING && s & Node.DOCUMENT_POSITION_PRECEDING, t = r && t === e || a && i === e || c || s ? Node.DOCUMENT_POSITION_CONTAINED_BY : !r && t === e || !a && i === e ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : o, t & Node.DOCUMENT_POSITION_DISCONNECTED || t & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || Xp(t, this._fragmentFiber, n[0], n[n.length - 1], e) ? t : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
	};
	function Xp(e, t, n, r, i) {
		var a = Ot(i);
		if (e & Node.DOCUMENT_POSITION_CONTAINED_BY) {
			if (n = !!a) a: {
				for (; a !== null;) {
					if (a.tag === 7 && (a === t || a.alternate === t)) {
						n = !0;
						break a;
					}
					a = a.return;
				}
				n = !1;
			}
			return n;
		}
		if (e & Node.DOCUMENT_POSITION_CONTAINS) {
			if (a === null) return a = i.ownerDocument, i === a || i === a.documentElement || i === a.body;
			a: {
				for (a = t, t = g(t); a !== null;) {
					if (!(a.tag !== 5 && a.tag !== 3 && a.tag !== 27 || a !== t && a.alternate !== t)) {
						a = !0;
						break a;
					}
					a = a.return;
				}
				a = !1;
			}
			return a;
		}
		return e & Node.DOCUMENT_POSITION_PRECEDING ? ((t = !!a) && !(t = a === n) && (t = E(n, a, T), t === null ? t = !1 : (h(t, !0, C, a, n), a = x, x = null, t = a !== null)), t) : e & Node.DOCUMENT_POSITION_FOLLOWING ? ((t = !!a) && !(t = a === r) && (t = E(r, a, T), t === null ? t = !1 : (h(t, !0, w, a, r), a = x, S = x = null, t = a !== null)), t) : !1;
	}
	function Zp(e, t) {
		var n = e.ownerDocument.createRange();
		n.selectNodeContents(e), e = n.getBoundingClientRect(), window.scrollTo(window.scrollX + e.left, t ? window.scrollY + e.top : window.scrollY + e.bottom - window.innerHeight);
	}
	Fp.prototype.scrollIntoView = function(e) {
		if (typeof e == "object") throw Error(o(566));
		var t = [];
		h(this._fragmentFiber.child, !1, Hp, t, void 0, void 0);
		var n = !1 !== e;
		if (t.length === 0) {
			var r = v(this._fragmentFiber);
			if (r = n ? r[1] || r[0] || g(this._fragmentFiber) : r[0] || r[1], r === null) return;
			if (r.tag === 6) {
				e = b(r), Zp(e, n);
				return;
			}
			if (r = b(r), r.nodeType !== 9) {
				if (r.nodeType === 11) {
					n = "host" in r ? r.host : null, n !== null && n.scrollIntoView(e);
					return;
				}
				r.scrollIntoView(e);
			}
		}
		for (r = n ? t.length - 1 : 0; r !== (n ? -1 : t.length);) {
			var i = t[r];
			i.tag === 6 ? (i = b(i), Zp(i, n)) : b(i).scrollIntoView(e), r += n ? -1 : 1;
		}
	};
	function Qp(e, t) {
		return e = b(e), $p(e, t), !1;
	}
	function $p(e, t) {
		e.reactFragments ??= /* @__PURE__ */ new Set(), e.reactFragments.add(t);
	}
	function em(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.addEventListener(i.type, i.attachedListener, Rp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			for (var r = 0, i = 0; i < Kp.length; i++) {
				var a = Kp[i];
				(a.fragmentInstance !== t || a.observer !== n || a.instance !== e) && (Kp[r++] = a);
			}
			Kp.length = r, n.observe(e);
		}), $p(e, t));
	}
	function tm(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.removeEventListener(i.type, i.attachedListener, Rp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			typeof n.rootMargin == "string" ? Jp(t, n, e) : n.unobserve(e);
		}), e.reactFragments != null && e.reactFragments.delete(t));
	}
	function nm(e) {
		var t = e.firstChild;
		for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
			var n = t;
			switch (t = t.nextSibling, n.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					nm(n), Dt(n);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if (n.rel.toLowerCase() === "stylesheet") continue;
			}
			e.removeChild(n);
		}
	}
	function rm(e, t, n, r) {
		for (; e.nodeType === 1;) {
			var i = n;
			if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
				if (!r && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
			} else if (!r) {
				if (t === "input" && e.type === "hidden") {
					var a = i.name == null ? null : "" + i.name;
					if (i.type === "hidden" && e.getAttribute("name") === a) return e;
				} else return e;
			} else if (!e[Tt]) switch (t) {
				case "meta":
					if (!e.hasAttribute("itemprop")) break;
					return e;
				case "link":
					if (a = e.getAttribute("rel"), a === "stylesheet" && e.hasAttribute("data-precedence") || a !== i.rel || e.getAttribute("href") !== (i.href == null || i.href === "" ? null : i.href) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin) || e.getAttribute("title") !== (i.title == null ? null : i.title)) break;
					return e;
				case "style":
					if (e.hasAttribute("data-precedence")) break;
					return e;
				case "script":
					if (a = e.getAttribute("src"), (a !== (i.src == null ? null : i.src) || e.getAttribute("type") !== (i.type == null ? null : i.type) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin)) && a && e.hasAttribute("async") && !e.hasAttribute("itemprop")) break;
					return e;
				default: return e;
			}
			if (e = lm(e.nextSibling), e === null) break;
		}
		return null;
	}
	function im(e, t, n) {
		if (t === "") return null;
		for (; e.nodeType !== 3;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = lm(e.nextSibling), e === null)) return null;
		return e;
	}
	function am(e, t) {
		for (; e.nodeType !== 8;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = lm(e.nextSibling), e === null)) return null;
		return e;
	}
	function om(e) {
		return e.data === "$?" || e.data === "$~";
	}
	function sm(e) {
		return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
	}
	function cm(e, t) {
		var n = e.ownerDocument;
		if (e.data === "$~") e._reactRetry = t;
		else if (e.data !== "$?" || n.readyState !== "loading") t();
		else {
			var r = function() {
				t(), n.removeEventListener("DOMContentLoaded", r);
			};
			n.addEventListener("DOMContentLoaded", r), e._reactRetry = r;
		}
	}
	function lm(e) {
		for (; e != null; e = e.nextSibling) {
			var t = e.nodeType;
			if (t === 1 || t === 3) break;
			if (t === 8) {
				if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F") break;
				if (t === "/$" || t === "/&") return null;
			}
		}
		return e;
	}
	var um = null;
	function dm(e) {
		e = e.nextSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "/$" || n === "/&") {
					if (t === 0) return lm(e.nextSibling);
					t--;
				} else n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
			}
			e = e.nextSibling;
		}
		return null;
	}
	function fm(e) {
		e = e.previousSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
					if (t === 0) return e;
					t--;
				} else n !== "/$" && n !== "/&" || t++;
			}
			e = e.previousSibling;
		}
		return null;
	}
	function pm(e, t) {
		function n() {
			r = !0;
		}
		if (e.ownerDocument.activeElement === e) return !0;
		var r = !1;
		try {
			e.ownerDocument.addEventListener("focus", n, !0), (e.focus || HTMLElement.prototype.focus).call(e, t);
		} finally {
			e.ownerDocument.removeEventListener("focus", n, !0);
		}
		return r;
	}
	function mm(e) {
		yp(function() {
			yp(function(t) {
				return e(t);
			});
		});
	}
	function hm(e, t, n) {
		switch (t = lp(n), e) {
			case "html":
				if (e = t.documentElement, !e) throw Error(o(452));
				return e;
			case "head":
				if (e = t.head, !e) throw Error(o(453));
				return e;
			case "body":
				if (e = t.body, !e) throw Error(o(454));
				return e;
			default: throw Error(o(451));
		}
	}
	function gm(e, t, n) {
		for (var r in n) {
			var i = n[r];
			n.hasOwnProperty(r) && i != null && ep(e, t, r, null, rp, i);
		}
		n.dangerouslySetInnerHTML != null && (e.textContent = ""), e.onclick === pn && (e.onclick = null), Dt(e);
	}
	function _m(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		Dt(e);
	}
	var vm = /* @__PURE__ */ new Map(), ym = /* @__PURE__ */ new Set();
	function bm(e) {
		if (typeof e.getRootNode == "function") {
			var t = e.getRootNode();
			if (t.nodeType === 9 || t.nodeType === 11) return t;
		}
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	var xm = V.d;
	V.d = {
		f: Sm,
		r: Cm,
		D: Em,
		C: Dm,
		L: Om,
		m: km,
		X: jm,
		S: Am,
		M: Mm
	};
	function Sm() {
		var e = xm.f(), t = Ld();
		return e || t;
	}
	function Cm(e) {
		var t = kt(e);
		t !== null && t.tag === 5 && t.type === "form" ? Xs(t) : xm.r(e);
	}
	var wm = typeof document > "u" ? null : document;
	function Tm(e, t, n) {
		var r = wm;
		if (r && typeof t == "string" && t) {
			var i = Zt(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), ym.has(i) || (ym.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), np(t, "link", e), U(t), r.head.appendChild(t)));
		}
	}
	function Em(e) {
		xm.D(e), Tm("dns-prefetch", e, null);
	}
	function Dm(e, t) {
		xm.C(e, t), Tm("preconnect", e, t);
	}
	function Om(e, t, n) {
		xm.L(e, t, n);
		var r = wm;
		if (r && e && t) {
			var i = "link[rel=\"preload\"][as=\"" + Zt(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + Zt(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + Zt(n.imageSizes) + "\"]")) : i += "[href=\"" + Zt(e) + "\"]";
			var a = i;
			switch (t) {
				case "style":
					a = Pm(e);
					break;
				case "script": a = Rm(e);
			}
			if (!(vm.has(a) || (e = D({
				rel: "preload",
				href: t === "image" && n && n.imageSrcSet ? void 0 : e,
				as: t
			}, n), vm.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Fm(a)) || t === "script" && r.querySelector(zm(a))))) {
				var o = r.createElement("link");
				np(o, "link", e), t === "style" && (o[Et] = !0, o.onload = o.onerror = function() {
					Mt(o);
				}), U(o), r.head.appendChild(o);
			}
		}
	}
	function km(e, t) {
		xm.m(e, t);
		var n = wm;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + Zt(r) + "\"][href=\"" + Zt(e) + "\"]", a = i;
			switch (r) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": a = Rm(e);
			}
			if (!vm.has(a) && (e = D({
				rel: "modulepreload",
				href: e
			}, t), vm.set(a, e), n.querySelector(i) === null)) {
				switch (r) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (n.querySelector(zm(a))) return;
				}
				r = n.createElement("link"), np(r, "link", e), U(r), n.head.appendChild(r);
			}
		}
	}
	function Am(e, t, n) {
		xm.S(e, t, n);
		var r = wm;
		if (r && e) {
			var i = jt(r).hoistableStyles, a = Pm(e);
			t ||= "default";
			var o = i.get(a);
			if (!o) {
				var s = {
					loading: 0,
					preload: null
				};
				if (o = r.querySelector(Fm(a))) s.loading = 5;
				else {
					e = D({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n), (n = vm.get(a)) && Hm(e, n);
					var c = o = r.createElement("link");
					U(c), np(c, "link", e), c._p = new Promise(function(e, t) {
						c.onload = e, c.onerror = t;
					}), c.addEventListener("load", function() {
						s.loading |= 1;
					}), c.addEventListener("error", function() {
						s.loading |= 2;
					}), s.loading |= 4, Vm(o, t, r);
				}
				o = {
					type: "stylesheet",
					instance: o,
					count: 1,
					state: s
				}, i.set(a, o);
			}
		}
	}
	function jm(e, t) {
		xm.X(e, t);
		var n = wm;
		if (n && e) {
			var r = jt(n).hoistableScripts, i = Rm(e), a = r.get(i);
			a || (a = n.querySelector(zm(i)), a || (e = D({
				src: e,
				async: !0
			}, t), (t = vm.get(i)) && Um(e, t), a = n.createElement("script"), U(a), np(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Mm(e, t) {
		xm.M(e, t);
		var n = wm;
		if (n && e) {
			var r = jt(n).hoistableScripts, i = Rm(e), a = r.get(i);
			a || (a = n.querySelector(zm(i)), a || (e = D({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = vm.get(i)) && Um(e, t), a = n.createElement("script"), U(a), np(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Nm(e, t, n, r) {
		var i = (i = ve.current) ? bm(i) : null;
		if (!i) throw Error(o(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (n = Pm(n.href), t = jt(i).hoistableStyles, r = t.get(n), r || (r = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, t.set(n, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
					e = Pm(n.href);
					var a = jt(i).hoistableStyles, s = a.get(e);
					if (s || (i = i.ownerDocument || i, s = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, a.set(e, s), (a = i.querySelector(Fm(e))) ? a._p || (s.instance = a, s.state.loading = 5) : (a = vm.get(e), a || (a = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, vm.set(e, a)), Lm(i, e, a, s.state))), t && r === null) throw Error(o(528, ""));
					return s;
				}
				if (t && r !== null) throw Error(o(529, ""));
				return null;
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (n = Rm(n), t = jt(i).hoistableScripts, r = t.get(n), r || (r = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, t.set(n, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(o(444, e));
		}
	}
	function Pm(e) {
		return "href=\"" + Zt(e) + "\"";
	}
	function Fm(e) {
		return "link[rel=\"stylesheet\"][" + e + "]";
	}
	function Im(e) {
		return D({}, e, {
			"data-precedence": e.precedence,
			precedence: null
		});
	}
	function Lm(e, t, n, r) {
		if (t = e.querySelector("link[rel=\"preload\"][as=\"style\"][" + t + "]")) {
			if (!0 !== t[Et]) {
				r.loading = 1;
				return;
			}
		} else t = e.createElement("link"), t[Et] = !0, t.onload = t.onerror = Mt.bind(null, t), np(t, "link", n), U(t), e.head.appendChild(t);
		r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		});
	}
	function Rm(e) {
		return "[src=\"" + Zt(e) + "\"]";
	}
	function zm(e) {
		return "script[async]" + e;
	}
	function Bm(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + Zt(n.href) + "\"]");
				if (r) return t.instance = r, U(r), r;
				var i = D({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), U(r), np(r, "style", i), Vm(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				i = Pm(n.href);
				var a = e.querySelector(Fm(i));
				if (a) return t.state.loading |= 4, t.instance = a, U(a), a;
				r = Im(n), (i = vm.get(i)) && Hm(r, i), a = (e.ownerDocument || e).createElement("link"), U(a);
				var s = a;
				return s._p = new Promise(function(e, t) {
					s.onload = e, s.onerror = t;
				}), np(a, "link", r), t.state.loading |= 4, Vm(a, n.precedence, e), t.instance = a;
			case "script": return a = Rm(n.src), (i = e.querySelector(zm(a))) ? (t.instance = i, U(i), i) : (r = n, (i = vm.get(a)) && (r = D({}, n), Um(r, i)), e = e.ownerDocument || e, i = e.createElement("script"), U(i), np(i, "link", r), e.head.appendChild(i), t.instance = i);
			case "void": return null;
			default: throw Error(o(443, t.type));
		}
		else t.type === "stylesheet" && !(t.state.loading & 4) && (r = t.instance, t.state.loading |= 4, Vm(r, n.precedence, e));
		return t.instance;
	}
	function Vm(e, t, n) {
		for (var r = n.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), i = r.length ? r[r.length - 1] : null, a = i, o = 0; o < r.length; o++) {
			var s = r[o];
			if (s.dataset.precedence === t) a = s;
			else if (a !== i) break;
		}
		a ? a.parentNode.insertBefore(e, a.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
	}
	function Hm(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.title ??= t.title;
	}
	function Um(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.integrity ??= t.integrity;
	}
	var Wm = null;
	function Gm(e, t, n) {
		if (Wm === null) {
			var r = /* @__PURE__ */ new Map(), i = Wm = /* @__PURE__ */ new Map();
			i.set(n, r);
		} else i = Wm, r = i.get(n), r || (r = /* @__PURE__ */ new Map(), i.set(n, r));
		if (r.has(e)) return r;
		for (r.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
			var a = n[i];
			if (!(a[Tt] || a[vt] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
				var o = a.getAttribute(t) || "";
				o = e + o;
				var s = r.get(o);
				s ? s.push(a) : r.set(o, [a]);
			}
		}
		return r;
	}
	function Km(e, t, n) {
		e = e.ownerDocument || e, e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null);
	}
	function qm(e, t, n) {
		if (n === 1 || t.itemProp != null) return !1;
		switch (e) {
			case "meta":
			case "title": return !0;
			case "style":
				if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "") break;
				return !0;
			case "link":
				if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError) break;
				switch (t.rel) {
					case "stylesheet": return e = t.disabled, typeof t.precedence == "string" && e == null;
					default: return !0;
				}
			case "script": if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string") return !0;
		}
		return !1;
	}
	function Jm(e, t) {
		return e === "img" && t.src != null && t.src !== "" && t.onLoad == null && t.loading !== "lazy";
	}
	function Ym(e) {
		return !(e.type === "stylesheet" && !(e.state.loading & 3));
	}
	function Xm(e) {
		return (e.width || 100) * (e.height || 100) * (typeof devicePixelRatio == "number" ? devicePixelRatio : 1) * .25;
	}
	function Zm(e, t) {
		typeof t.decode == "function" && (e.imgCount++, t.complete || (e.imgBytes += Xm(t), e.suspenseyImages.push(t)), e = rh.bind(e), t.decode().then(e, e));
	}
	function Qm(e, t, n, r) {
		if (n.type === "stylesheet" && (typeof r.media != "string" || !1 !== matchMedia(r.media).matches) && !(n.state.loading & 4)) {
			if (n.instance === null) {
				var i = Pm(r.href), a = t.querySelector(Fm(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = nh.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, U(a);
					return;
				}
				a = t.ownerDocument || t, r = Im(r), (i = vm.get(i)) && Hm(r, i), a = a.createElement("link"), U(a);
				var o = a;
				o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), np(a, "link", r), n.instance = a;
			}
			e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && !(n.state.loading & 3) && (e.count++, n = nh.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
		}
	}
	var $m = 0;
	function eh(e, t) {
		return e.stylesheets && e.count === 0 && ah(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
			var r = setTimeout(function() {
				if (e.stylesheets && ah(e, e.stylesheets), e.unsuspend) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, 6e4 + t);
			0 < e.imgBytes && $m === 0 && ($m = 62500 * op());
			var i = setTimeout(function() {
				if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && ah(e, e.stylesheets), e.unsuspend)) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, (e.imgBytes > $m ? 50 : 800) + t);
			return e.unsuspend = n, function() {
				e.unsuspend = null, clearTimeout(r), clearTimeout(i);
			};
		} : null;
	}
	function th(e) {
		if (e.count === 0 && (e.imgCount === 0 || !e.waitingForImages)) {
			if (e.stylesheets) ah(e, e.stylesheets);
			else if (e.unsuspend) {
				var t = e.unsuspend;
				e.unsuspend = null, t();
			}
		}
	}
	function nh() {
		this.count--, th(this);
	}
	function rh() {
		this.imgCount--, th(this);
	}
	var ih = null;
	function ah(e, t) {
		e.stylesheets = null, e.unsuspend !== null && (e.count++, ih = /* @__PURE__ */ new Map(), t.forEach(oh, e), ih = null, nh.call(e));
	}
	function oh(e, t) {
		if (!(t.state.loading & 4)) {
			var n = ih.get(e);
			if (n) var r = n.get(null);
			else {
				n = /* @__PURE__ */ new Map(), ih.set(e, n);
				for (var i = e.querySelectorAll("link[data-precedence],style[data-precedence]"), a = 0; a < i.length; a++) {
					var o = i[a];
					(o.nodeName === "LINK" || o.getAttribute("media") !== "not all") && (n.set(o.dataset.precedence, o), r = o);
				}
				r && n.set(null, r);
			}
			i = t.instance, o = i.getAttribute("data-precedence"), a = n.get(o) || r, a === r && n.set(null, i), n.set(o, i), this.count++, r = nh.bind(this), i.addEventListener("load", r), i.addEventListener("error", r), a ? a.parentNode.insertBefore(i, a.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
		}
	}
	var sh = {
		$$typeof: F,
		Provider: null,
		Consumer: null,
		_currentValue: de,
		_currentValue2: de,
		_threadCount: 0
	};
	function ch(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = st(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = st(0), this.hiddenUpdates = st(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.transitionTypes = null, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function lh(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new ch(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = Ei(3, null, null, t), e.current = a, a.stateNode = e, t = Ea(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, so(a), e;
	}
	function uh(e) {
		return e ? (e = wi, e) : wi;
	}
	function dh(e, t, n, r, i, a) {
		i = uh(i), r.context === null ? r.context = i : r.pendingContext = i, r = lo(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = uo(e, r, t), n !== null && (Md(n, e, t), fo(n, e, t));
	}
	function fh(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function ph(e, t) {
		fh(e, t), (e = e.alternate) && fh(e, t);
	}
	function mh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = xi(e, 67108864);
			t !== null && Md(t, e, 67108864), ph(e, 67108864);
		}
	}
	function hh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = kd();
			t = pt(t);
			var n = xi(e, t);
			n !== null && Md(n, e, t), ph(e, t);
		}
	}
	var gh = !0;
	function _h(e, t, n, r) {
		var i = B.T;
		B.T = null;
		var a = V.p;
		try {
			V.p = 2, yh(e, t, n, r);
		} finally {
			V.p = a, B.T = i;
		}
	}
	function vh(e, t, n, r) {
		var i = B.T;
		B.T = null;
		var a = V.p;
		try {
			V.p = 8, yh(e, t, n, r);
		} finally {
			V.p = a, B.T = i;
		}
	}
	function yh(e, t, n, r) {
		if (gh) {
			var i = bh(r);
			if (i === null) Gf(e, t, r, xh, n), Mh(e, r);
			else if (Ph(i, e, t, n, r)) r.stopPropagation();
			else if (Mh(e, r), t & 4 && -1 < jh.indexOf(e)) {
				for (; i !== null;) {
					var a = kt(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = tt(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - Je(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									Tf(a), !(X & 6) && (md = Ie() + 500, Ef(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = xi(a, 2), s !== null && Md(s, a, 2), Ld(), ph(a, 2);
					}
					if (a = bh(r), a === null && Gf(e, t, r, xh, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Gf(e, t, r, null, n);
		}
	}
	function bh(e) {
		return e = hn(e), Sh(e);
	}
	var xh = null;
	function Sh(e) {
		if (xh = null, e = Ot(e), e !== null) {
			var t = l(e);
			if (t === null) e = null;
			else {
				var n = t.tag;
				if (n === 13) {
					if (e = u(t), e !== null) return e;
					e = null;
				} else if (n === 31) {
					if (e = d(t), e !== null) return e;
					e = null;
				} else if (n === 3) {
					if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
					e = null;
				} else t !== e && (e = null);
			}
		}
		return xh = e, null;
	}
	function Ch(e) {
		switch (e) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "fullscreenerror":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "resize":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (Le()) {
				case Re: return 2;
				case ze: return 8;
				case Be:
				case Ve: return 32;
				case He: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var wh = !1, Th = null, Eh = null, Dh = null, Oh = /* @__PURE__ */ new Map(), kh = /* @__PURE__ */ new Map(), Ah = [], jh = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function Mh(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				Th = null;
				break;
			case "dragenter":
			case "dragleave":
				Eh = null;
				break;
			case "mouseover":
			case "mouseout":
				Dh = null;
				break;
			case "pointerover":
			case "pointerout":
				Oh.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": kh.delete(t.pointerId);
		}
	}
	function Nh(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = kt(t), t !== null && mh(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function Ph(e, t, n, r, i) {
		switch (t) {
			case "focusin": return Th = Nh(Th, e, t, n, r, i), !0;
			case "dragenter": return Eh = Nh(Eh, e, t, n, r, i), !0;
			case "mouseover": return Dh = Nh(Dh, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return Oh.set(a, Nh(Oh.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, kh.set(a, Nh(kh.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function Fh(e) {
		var t = Ot(e.target);
		if (t !== null) {
			var n = l(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = u(n), t !== null) {
						e.blockedOn = t, gt(e.priority, function() {
							hh(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = d(n), t !== null) {
						e.blockedOn = t, gt(e.priority, function() {
							hh(n);
						});
						return;
					}
				} else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
					e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
					return;
				}
			}
		}
		e.blockedOn = null;
	}
	function Ih(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = bh(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				mn = r, n.target.dispatchEvent(r), mn = null;
			} else return t = kt(n), t !== null && mh(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function Lh(e, t, n) {
		Ih(e) && n.delete(t);
	}
	function Rh() {
		wh = !1, Th !== null && Ih(Th) && (Th = null), Eh !== null && Ih(Eh) && (Eh = null), Dh !== null && Ih(Dh) && (Dh = null), Oh.forEach(Lh), kh.forEach(Lh);
	}
	function zh(e, n) {
		e.blockedOn === n && (e.blockedOn = null, wh || (wh = !0, t.unstable_scheduleCallback(t.unstable_NormalPriority, Rh)));
	}
	var Bh = null;
	function Vh(e) {
		Bh !== e && (Bh = e, t.unstable_scheduleCallback(t.unstable_NormalPriority, function() {
			Bh === e && (Bh = null);
			for (var t = 0; t < e.length; t += 3) {
				var n = e[t], r = e[t + 1], i = e[t + 2];
				if (typeof r != "function") {
					if (Sh(r || n) === null) continue;
					break;
				}
				var a = kt(n);
				a !== null && (e.splice(t, 3), t -= 3, Js(a, {
					pending: !0,
					data: i,
					method: n.method,
					action: r
				}, r, i));
			}
		}));
	}
	function Hh(e) {
		function t(t) {
			return zh(t, e);
		}
		Th !== null && zh(Th, e), Eh !== null && zh(Eh, e), Dh !== null && zh(Dh, e), Oh.forEach(t), kh.forEach(t);
		for (var n = 0; n < Ah.length; n++) {
			var r = Ah[n];
			r.blockedOn === e && (r.blockedOn = null);
		}
		for (; 0 < Ah.length && (n = Ah[0], n.blockedOn === null);) Fh(n), n.blockedOn === null && Ah.shift();
		if (n = (e.ownerDocument || e).$$reactFormReplay, n != null) for (r = 0; r < n.length; r += 3) {
			var i = n[r], a = n[r + 1], o = i[yt] || null;
			if (typeof a == "function") o || Vh(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[yt] || null) s = o.formAction;
					else if (Sh(i) !== null) continue;
				} else s = o.action;
				typeof s == "function" ? n[r + 1] = s : (n.splice(r, 3), r -= 3), Vh(n);
			}
		}
	}
	function Uh() {
		function e(e) {
			e.canIntercept && e.info === "react-transition" && e.intercept({
				handler: function() {
					return new Promise(function(e) {
						return i = e;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function t() {
			i !== null && (i(), i = null), r || setTimeout(n, 20);
		}
		function n() {
			if (!r && !navigation.transition) {
				var e = navigation.currentEntry;
				e && e.url != null && navigation.navigate(e.url, {
					state: e.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if (typeof navigation == "object") {
			var r = !1, i = null;
			return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(n, 100), function() {
				r = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), i !== null && (i(), i = null);
			};
		}
	}
	function Wh(e) {
		this._internalRoot = e;
	}
	Gh.prototype.render = Wh.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(o(409));
		var n = t.current;
		dh(n, kd(), e, t, null, null);
	}, Gh.prototype.unmount = Wh.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			dh(e.current, 2, null, e, null, null), Ld(), t[bt] = null;
		}
	};
	function Gh(e) {
		this._internalRoot = e;
	}
	Gh.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = ht();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < Ah.length && t !== 0 && t < Ah[n].priority; n++);
			Ah.splice(n, 0, e), n === 0 && Fh(e);
		}
	};
	var Kh = n.version;
	if (Kh !== "19.3.0") throw Error(o(527, Kh, "19.3.0"));
	V.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(o(188)) : (e = Object.keys(e).join(","), Error(o(268, e)));
		return e = p(t), e = e === null ? null : m(e), e = e === null ? null : e.stateNode, e;
	};
	var qh = {
		bundleType: 0,
		version: "19.3.0",
		rendererPackageName: "react-dom",
		currentDispatcherRef: B,
		reconcilerVersion: "19.3.0"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Jh = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Jh.isDisabled && Jh.supportsFiber) try {
			Ge = Jh.inject(qh), Ke = Jh;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!c(e)) throw Error(o(299));
		var n = !1, r = "", i = _c, a = vc, s = yc;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (a = t.onCaughtError), t.onRecoverableError !== void 0 && (s = t.onRecoverableError)), t = lh(e, 1, !1, null, null, n, r, null, i, a, s, Uh), e[bt] = t.current, Uf(e), new Wh(t);
	};
})), l = (/* @__PURE__ */ e(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = c();
})))(), u = ".dp{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light;color:#1d2826;--ink:#1d2826;--soft:#4f5d5a;--muted:#7b8885;--line:#d9dfdc;--teal:#3d6b63;--teal-tint:#e6efec;--khaki:#8a6a2c;background:#f4f5f2;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,system-ui,sans-serif}.dp,.dp *{box-sizing:border-box}.dp button{font:inherit;color:inherit;cursor:pointer}.dp .loading{color:var(--muted);padding:40px}.dp .picker{flex-wrap:wrap;gap:8px;max-width:1200px;margin:0 auto;padding:18px 20px 0;display:flex}.dp .picker button,.dp .depth button,.dp .chapters button,.dp .controls>button,.dp .controls select{border:1px solid var(--line);color:var(--soft);background:#fff;border-radius:999px;padding:6px 14px;font-size:13.5px}.dp .picker button.on,.dp .chapters button.on,.dp .depth button.on{border-color:var(--teal);background:var(--teal-tint);color:var(--teal);font-weight:600}.dp .player{max-width:1200px;margin:0 auto;padding:18px 20px 28px}.dp .player-head{justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:12px;display:flex}.dp .player-head h1{letter-spacing:-.3px;color:var(--ink);margin:0;font-size:24px;font-weight:700}.dp .player-head p{color:var(--soft);margin:4px 0 0;font-family:Georgia,Times New Roman,serif;font-size:16px}.dp .depth{gap:6px;display:flex}.dp .stage{aspect-ratio:16/9;border:1px solid var(--line);background:#f4f5f2;border-radius:14px;position:relative;overflow:hidden;box-shadow:0 1px #00000005}.dp .stage-svg{justify-content:center;align-items:center;width:100%;height:100%;display:flex}.dp .stage-svg svg{width:100%;height:100%;display:block}.dp .dg-node{cursor:pointer}.dp .dg-node.is-selected rect{stroke:var(--khaki);stroke-width:2.4px}.dp .legend{background:#f4f5f2eb;border-radius:8px;flex-direction:column;gap:4px;padding:8px 10px;font-size:12.5px;display:flex;position:absolute;top:12px;right:14px}.dp .legend span{align-items:center;gap:8px;font-weight:600;display:flex}.dp .legend svg{width:34px;height:8px}.dp .subtitle{text-align:center;color:#fff;text-shadow:0 1px 2px #0009;pointer-events:none;background:#141c1a8c;border-radius:8px;max-width:82%;padding:6px 14px;font-family:Georgia,Times New Roman,serif;font-size:clamp(15px,1.7vw,19px);line-height:1.4;position:absolute;bottom:18px;left:50%;transform:translate(-50%)}.dp .big-play{background:var(--teal);color:#fff;border:0;border-radius:50%;width:72px;height:72px;font-size:26px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);box-shadow:0 8px 28px #3d6b6359}.dp .hint{color:var(--soft);border:1px solid var(--line);background:#fff;border-radius:999px;padding:4px 10px;font-size:12px;position:absolute;top:12px;left:50%;transform:translate(-50%)}.dp .explore{border:1px solid var(--line);background:#fff;border-radius:12px;flex-direction:column;gap:6px;width:320px;padding:12px;font-size:13px;display:flex;position:absolute;top:14px;left:14px;box-shadow:0 6px 24px #0000000f}.dp .explore span{color:var(--muted);font-size:12px}.dp .explore button{text-align:left;background:#f4f5f2;border:0;border-radius:8px;padding:6px 8px;font-size:12px}.dp .explore button:hover{background:var(--teal-tint)}.dp .controls{align-items:center;gap:6px;margin-top:12px;display:flex}.dp .controls>button{min-width:40px;padding:6px 10px}.dp .controls>button.on{border-color:var(--teal);color:var(--teal)}.dp .scrub{flex:1;align-items:center;margin:0 6px;display:flex;position:relative}.dp .scrub input{width:100%;accent-color:var(--teal)}.dp .scrub .mark{background:var(--khaki);border:0;border-radius:2px;width:3px;height:8px;padding:0;position:absolute;top:-9px;transform:translate(-1px)}.dp .time{font-variant-numeric:tabular-nums;color:var(--muted);text-align:right;min-width:86px;font-size:13px}.dp .chapters{flex-wrap:wrap;gap:8px;margin-top:12px;display:flex}.dp .chapters button span{color:var(--muted);font-variant-numeric:tabular-nums;margin-right:6px}.dp .card-stage{background:#f4f5f2;flex-direction:column;justify-content:center;padding:6% 9%;display:flex;position:absolute;inset:0}.dp .card-stage h2{letter-spacing:-.4px;color:var(--ink);margin:0 0 4%;font-size:clamp(22px,3vw,38px)}.dp .card-points{gap:2.2vh;margin:0;padding:0;list-style:none;display:grid}.dp .card-points li{color:var(--ink);padding-left:28px;font-family:Georgia,Times New Roman,serif;font-size:clamp(17px,1.9vw,26px);position:relative}.dp .card-points li:before{content:\"\";background:var(--teal);border-radius:3px;width:12px;height:12px;position:absolute;top:.55em;left:0}.dp .card-numbers{grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:18px;display:grid}.dp .card-numbers div{border:1px solid var(--line);background:#fff;border-radius:14px;padding:18px 20px}.dp .card-numbers b{color:var(--teal);letter-spacing:-.5px;font-size:clamp(26px,3.2vw,44px);display:block}.dp .card-numbers span{color:var(--soft);font-size:clamp(13px,1.2vw,16px)}.dp .card-compare{border-collapse:collapse;border:1px solid var(--line);background:#fff;border-radius:12px;width:100%;font-size:clamp(14px,1.45vw,20px);overflow:hidden}.dp .card-compare th{text-align:left;color:var(--soft);text-transform:uppercase;letter-spacing:.4px;background:#eef1ee;padding:12px 16px;font-size:.75em}.dp .card-compare td{color:var(--ink);vertical-align:top;border-top:1px solid #e8ece9;padding:12px 16px}.dp .card-compare td:first-child{font-weight:600}.dp .card-in{opacity:0;animation:.6s forwards card-in;transform:translateY(10px)}@keyframes card-in{to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.dp .card-in{opacity:1;animation:none;transform:none}}.dp .watch{--w-bg:#f4f5f2;--w-ink:var(--ink);--w-soft:var(--soft);--w-accent:var(--khaki);--w-teal:var(--teal);background:var(--w-bg);height:100dvh;color:var(--w-ink);-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;touch-action:none;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;position:fixed;inset:0;overflow:hidden}.dp .watch button{font:inherit;color:inherit;cursor:pointer;background:0 0;border:0}.dp .w-stage{position:absolute;inset:0}.dp .w-canvas{left:0;right:0;top:calc(env(safe-area-inset-top) + 64px);bottom:calc(env(safe-area-inset-bottom) + 236px);transition:opacity .4s;position:absolute}.dp .w-canvas.dim{opacity:.22}.dp .w-canvas .stage-svg{width:100%;height:100%}.dp .w-top,.dp .w-bottom{z-index:3;pointer-events:none;position:absolute;left:0;right:0}.dp .w-top>*,.dp .w-bottom>*{pointer-events:auto}.dp .w-top{padding:calc(env(safe-area-inset-top) + 10px) 12px 18px;background:linear-gradient(#f4f5f2f7 60%,#f4f5f200);align-items:center;gap:10px;display:flex;top:0}.dp .watch .w-title{text-align:left;border-radius:10px;flex-direction:column;flex:1;align-items:flex-start;min-width:0;padding:4px 4px 4px 6px;display:flex}.dp .watch .w-title:active{background:#0000000a}.dp .w-title b{white-space:nowrap;text-overflow:ellipsis;align-items:center;gap:4px;max-width:100%;font-size:16px;font-weight:700;display:flex;overflow:hidden}.dp .w-title b em{text-overflow:ellipsis;min-width:0;font-style:normal;overflow:hidden}.dp .w-title b svg{fill:none;width:16px;height:16px;stroke:var(--soft);stroke-width:2.4px;stroke-linecap:round;stroke-linejoin:round;flex:none}.dp .w-title>span{max-width:100%;color:var(--w-soft);white-space:nowrap;text-overflow:ellipsis;font-size:12px;overflow:hidden}.dp .watch .w-icon{border-radius:50%;justify-content:center;align-items:center;min-width:40px;height:40px;font-size:13px;font-weight:600;display:inline-flex}.dp .w-top .w-icon{background:#fff;border:1px solid var(--line)!important}.dp .w-icon svg{fill:none;stroke:currentColor;stroke-width:2px;stroke-linecap:round;stroke-linejoin:round;width:22px;height:22px}.dp .w-icon svg.fill,.dp .w-play svg{fill:currentColor;stroke:none}.dp .watch .w-pill{border-radius:999px;flex:none;padding:7px 12px;font-size:13px;font-weight:700;border:1px solid var(--teal)!important;color:var(--teal)!important;background:var(--teal-tint)!important}.dp .watch .w-pill span{color:var(--w-soft);margin-left:2px;font-weight:400}.dp .w-intro{z-index:4;left:0;right:0;bottom:calc(env(safe-area-inset-bottom) + 150px);text-align:center;flex-direction:column;align-items:center;gap:10px;padding:0 24px;display:flex;position:absolute}.dp .w-intro h1{letter-spacing:-.5px;margin:0;font-size:30px;font-weight:800;line-height:1.12}.dp .w-intro p{color:var(--w-soft);margin:0;font-size:14px}.dp .w-intro small{color:var(--w-soft);font-size:12px}.dp .w-eyebrow{letter-spacing:2.5px;text-transform:uppercase;color:var(--w-accent);font-size:11.5px;font-weight:700}.dp .w-play{border-radius:50%;justify-content:center;align-items:center;width:76px;height:76px;margin:8px 0 4px;display:inline-flex;box-shadow:0 10px 28px #3d6b6359;background:var(--teal)!important;color:#fff!important}.dp .w-play svg{width:30px;height:30px;margin-left:4px}.dp .w-link{font-size:14px;text-decoration:underline;color:var(--w-soft)!important}.dp .w-paused{z-index:4;justify-content:center;align-items:center;gap:14px;display:flex;position:absolute;top:42%;left:0;right:0;transform:translateY(-50%)}.dp .watch .w-paused .w-icon{background:#fff;width:48px;height:48px;box-shadow:0 4px 14px #00000014;border:1px solid var(--line)!important}.dp .w-bottom{padding:40px 0 calc(env(safe-area-inset-bottom) + 6px);background:linear-gradient(#f4f5f200,#f4f5f2fc 38%);bottom:0}.dp .w-caption{text-align:center;min-height:92px;padding:0 20px 12px}.dp .w-caption p{color:#a3aeab;margin:6px 0 0;font-family:Georgia,Times New Roman,serif;font-size:19px;line-height:1.42}.dp .w-caption p .said{color:var(--w-ink)}.dp .w-caption p .said:last-of-type{color:var(--teal)}.dp .w-strip{scrollbar-width:none;gap:8px;padding:0 12px 10px;display:flex;overflow-x:auto}.dp .w-strip::-webkit-scrollbar{display:none}.dp .w-strip button{text-align:left;border-radius:10px;flex-direction:column;flex:none;justify-content:space-between;align-items:flex-start;width:74px;height:52px;padding:6px 8px;display:flex;border:1px solid var(--line)!important;background:#fff!important}.dp .w-strip b{font-size:13px}.dp .w-strip span{color:var(--w-soft);-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:9.5px;line-height:1.15;display:-webkit-box;overflow:hidden}.dp .w-strip .done{opacity:.6}.dp .w-strip .on{color:var(--teal);border:2px solid var(--teal)!important;background:var(--teal-tint)!important}.dp .w-progress{align-items:center;gap:3px;height:14px;padding:0 12px;display:flex;position:relative}.dp .w-progress span{background:var(--line);border-radius:2px;flex-basis:0;height:3px;overflow:hidden}.dp .w-progress i{background:var(--teal);height:100%;display:block}.dp .w-progress input{opacity:0;width:calc(100% - 24px);height:14px;margin:0;position:absolute;inset:0 12px}.dp .w-bar{align-items:center;gap:4px;padding:2px 6px 0;display:flex}.dp .w-time{color:var(--w-soft);font-variant-numeric:tabular-nums;flex:1;font-size:12.5px}.dp .w-cc{margin:0 6px;border:1.5px solid var(--soft)!important;border-radius:6px!important;min-width:30px!important;height:22px!important;font-size:12px!important}.dp .w-cc.on{background:var(--ink)!important;color:#fff!important;border-color:var(--ink)!important}.dp .w-speed{font-size:14px!important}.dp .w-sheet-back{z-index:10;background:#1d282659;align-items:flex-end;display:flex;position:absolute;inset:0}.dp .w-sheet{width:100%;max-height:70dvh;padding:8px 12px calc(env(safe-area-inset-bottom) + 16px);background:#fff;border-radius:18px 18px 0 0;overflow:auto;box-shadow:0 -8px 30px #00000014}.dp .w-grip{background:var(--line);border-radius:2px;width:40px;height:4px;margin:4px auto 10px}.dp .w-sheet h2{margin:4px 8px 10px;font-size:16px}.dp .w-sheet button{text-align:left;border-radius:10px;align-items:center;gap:12px;width:100%;padding:12px 10px;font-size:15px;display:flex}.dp .w-sheet button b{background:#eef1ee;border-radius:7px;flex:none;justify-content:center;align-items:center;width:26px;height:26px;font-size:13px;display:inline-flex}.dp .w-sheet button span{flex-direction:column;flex:1;display:flex}.dp .w-sheet button small{color:var(--w-soft);font-size:12px}.dp .w-sheet button.on{background:var(--teal-tint);color:var(--teal)}.dp .watch .explore{z-index:6;width:auto;max-height:50dvh;color:var(--ink);padding:16px 14px calc(env(safe-area-inset-bottom) + 16px);background:#fff;border:0;border-radius:18px 18px 0 0;position:absolute;inset:auto 0 0;overflow:auto;box-shadow:0 -8px 30px #00000014}.dp .watch .explore span{color:var(--w-soft)}.dp .watch .explore button{color:var(--ink);background:#f4f5f2;padding:10px;font-size:13.5px}.dp .watch .card-stage{background:0 0;justify-content:center;padding:4% 18px}.dp .watch .card-stage h2{margin-bottom:16px;font-size:23px}.dp .watch .card-points{gap:12px}.dp .watch .card-points li{font-size:17px;line-height:1.35}.dp .watch .card-numbers{grid-template-columns:1fr 1fr;gap:10px}.dp .watch .card-numbers div{border-radius:12px;padding:12px}.dp .watch .card-numbers b{font-size:26px}.dp .watch .card-numbers span{font-size:12.5px}.dp .watch .card-compare,.dp .watch .card-compare tbody{background:0 0;border:0;display:block}.dp .watch .card-compare thead{display:none}.dp .watch .card-compare tr{border:1px solid var(--line);background:#fff;border-radius:12px;margin-bottom:8px;padding:10px 12px;display:block}.dp .watch .card-compare td{border:0;padding:0;font-size:14px;line-height:1.35;display:block}.dp .watch .card-compare td:first-child{color:var(--teal);margin-bottom:3px;font-size:14.5px}.dp .topbar{max-width:1200px;margin:0 auto;padding:16px 20px 0}.dp .topbar a{color:var(--teal);font-size:14px;font-weight:600;text-decoration:none}.dp .library{max-width:1200px;margin:0 auto;padding:28px 20px 60px}.dp .lib-head h1{letter-spacing:-.5px;color:var(--ink);margin:0;font-size:30px}.dp .lib-head p{color:var(--soft);margin:6px 0 16px;font-family:Georgia,Times New Roman,serif;font-size:17px}.dp .lib-search{border:1px solid var(--line);background:#fff;border-radius:12px;align-items:center;gap:10px;max-width:560px;padding:0 14px;display:flex}.dp .lib-search svg{fill:none;width:18px;height:18px;stroke:var(--muted);stroke-width:2px;stroke-linecap:round;flex:none}.dp .lib-search input{color:var(--ink);background:0 0;border:0;outline:0;flex:1;min-width:0;padding:12px 0;font:15px Inter,system-ui,sans-serif}.dp .lib-row{margin-top:26px}.dp .lib-row h2,.dp .lib-path h2{color:var(--ink);margin:0 0 10px;font-size:16px}.dp .lib-rail{scrollbar-width:none;gap:14px;padding-bottom:6px;display:flex;overflow-x:auto}.dp .lib-rail::-webkit-scrollbar{display:none}.dp .lib-rail .lib-tile{flex:none;width:240px}.dp .lib-tabs{border-bottom:1px solid var(--line);scrollbar-width:none;gap:6px;margin:28px 0 0;display:flex;overflow-x:auto}.dp .lib-tabs button{color:var(--muted);white-space:nowrap;background:0 0;border:0;border-bottom:2px solid #0000;margin-bottom:-1px;padding:10px 14px;font-size:15px;font-weight:600}.dp .lib-tabs button span{color:var(--muted);margin-left:4px;font-size:12.5px;font-weight:500}.dp .lib-tabs button.on{color:var(--teal);border-bottom-color:var(--teal)}.dp .lib-results{color:var(--soft);margin:24px 0 0;font-size:14px}.dp .lib-chips{scrollbar-width:none;gap:8px;margin-top:14px;display:flex;overflow-x:auto}.dp .lib-chips button{border:1px solid var(--line);color:var(--soft);background:#fff;border-radius:999px;flex:none;padding:6px 13px;font-size:13.5px}.dp .lib-chips button.on{border-color:var(--teal);background:var(--teal-tint);color:var(--teal);font-weight:600}.dp .lib-grid{grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px;margin-top:18px;display:grid}.dp .lib-empty{color:var(--muted)}.dp .lib-tile{color:inherit;border:1px solid var(--line);background:#fff;border-radius:14px;flex-direction:column;text-decoration:none;transition:box-shadow .2s,transform .2s;display:flex;overflow:hidden}.dp .lib-tile:hover{transform:translateY(-2px);box-shadow:0 8px 24px #00000012}.dp .lib-thumb{aspect-ratio:16/10;border-bottom:1px solid var(--line);background:#f4f5f2;position:relative}.dp .lib-thumb img{object-fit:contain;width:calc(100% - 16px);height:calc(100% - 16px);position:absolute;inset:8px}.dp .lib-thumb em{letter-spacing:.6px;text-transform:uppercase;border-radius:999px;padding:3px 8px;font:700 10.5px Inter,sans-serif;position:absolute;top:8px;left:8px}.dp .lib-thumb em.new{background:var(--teal);color:#fff}.dp .lib-thumb em.upd{color:#8a5a12;background:#f6ead2}.dp .lib-thumb .dur{color:#fff;font-variant-numeric:tabular-nums;background:#1d2826d1;border-radius:6px;padding:2px 7px;font-size:11.5px;font-weight:600;position:absolute;bottom:8px;right:8px}.dp .lib-thumb i{background:var(--teal);height:3px;position:absolute;bottom:0;left:0}.dp .lib-meta{flex-direction:column;gap:2px;padding:10px 12px 12px;display:flex}.dp .lib-meta small{color:var(--khaki);text-transform:capitalize;font-size:11.5px;font-weight:600}.dp .lib-meta b{color:var(--ink);font-size:15.5px;line-height:1.3}.dp .lib-meta p{color:var(--soft);margin:4px 0 0;font-family:Georgia,Times New Roman,serif;font-size:14px;line-height:1.4}.dp .lib-paths{gap:18px;margin-top:18px;display:grid}.dp .lib-path{border:1px solid var(--line);background:#fff;border-radius:14px;padding:16px 18px}.dp .lib-path header p{color:var(--soft);margin:0 0 4px;font-family:Georgia,Times New Roman,serif}.dp .lib-path header span{color:var(--muted);font-size:12.5px}.dp .lib-path ol{gap:6px;margin:12px 0 0;padding:0;list-style:none;display:grid}.dp .lib-path li{border-radius:10px;align-items:center;gap:12px;padding:8px 6px;display:flex}.dp .lib-path li>b{border:1.5px solid var(--teal);width:28px;height:28px;color:var(--teal);border-radius:50%;flex:none;justify-content:center;align-items:center;font-size:13px;display:inline-flex}.dp .lib-path li.done>b{background:var(--teal);color:#fff}.dp .lib-path li.soon{opacity:.55}.dp .lib-path li.soon>b{border-color:var(--line);color:var(--muted)}.dp .lib-path li a,.dp .lib-path li>span{color:var(--ink);text-transform:none;flex-direction:column;flex:1;font-weight:600;text-decoration:none;display:flex}.dp .lib-path li>span{text-transform:capitalize}.dp .lib-path li small{color:var(--muted);font-size:12.5px;font-weight:400}.dp .lib-path li a:hover span{color:var(--teal)}.dp .topic-chips{flex-wrap:wrap;align-items:center;gap:8px;margin-top:12px;display:flex}.dp .topic-chips span{color:var(--muted);font-size:13px}.dp .topic-chips a{color:var(--teal);background:var(--teal-tint);border:1px solid var(--teal);border-radius:999px;padding:5px 12px;font-size:13.5px;font-weight:600;text-decoration:none}.dp .w-chips{scrollbar-width:none;gap:8px;padding:0 12px 10px;display:flex;overflow-x:auto}.dp .w-chips::-webkit-scrollbar{display:none}.dp .watch .w-chips button{color:var(--teal);background:var(--teal-tint);border:1px solid var(--teal);border-radius:999px;flex:none;padding:7px 13px;font-size:13.5px;font-weight:600}.dp .watch .w-sheet section+section{margin-top:6px}.dp .watch .w-sheet button img{object-fit:contain;border:1px solid var(--line);background:#f4f5f2;border-radius:8px;flex:none;width:64px;height:42px}.dp .watch .w-sheet .w-browse{background:var(--teal);color:#fff;justify-content:center;margin-top:10px;font-weight:700}@media (width<=700px){.dp .library{padding:18px 14px 40px}.dp .lib-head h1{font-size:24px}.dp .lib-head p{font-size:15px}.dp .lib-tabs{margin-top:20px}.dp .lib-grid{grid-template-columns:1fr 1fr;gap:12px}.dp .lib-meta{padding:8px 10px 10px}.dp .lib-meta b{font-size:14px}.dp .lib-meta p{display:none}.dp .lib-rail .lib-tile{width:180px}}.dp .watch .card-compare td:nth-child(n+3){color:var(--soft);margin-top:3px;font-size:13.5px}.dp h1,.dp h2,.dp h3,.dp h4,.dp .lib-head h1{font-weight:700}.dp p{margin-top:0}", d = "", f = "", p = null;
function m(e) {
	e.base !== void 0 && (d = e.base.replace(/\/$/, "")), e.assets !== void 0 && (f = e.assets.replace(/\/$/, "")), e.audio !== void 0 && (p = e.audio.replace(/\/$/, ""));
}
var h = (e) => /^https?:/.test(e) ? e : p !== null && e.startsWith("/audio/") ? `${p}${e.slice(6)}` : `${f}${e}`, g = {
	pattern: "p",
	company: "c"
};
function _(e, t) {
	return `${d}/${g[e.meta?.kind ?? "pattern"] ?? "p"}/${e.id}${t ? `#ch=${t}` : ""}`;
}
var v = /* @__PURE__ */ new Set([
	"patterns",
	"related",
	"wild"
]), y = /* @__PURE__ */ e(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), b = /* @__PURE__ */ e(((e, t) => {
	t.exports = y();
})), x = a(), S = b();
function C({ card: e, shotMs: t, offsetMs: n, playing: r, epoch: i }) {
	let a = e.kind ?? "points", o = a === "compare" ? e.points.slice(1) : e.points, s = t * .75 / Math.max(o.length, 1), c = (e) => ({
		animationDelay: `${e * s - n}ms`,
		animationPlayState: r ? "running" : "paused"
	}), l = (e) => e.split("|").map((e) => e.trim());
	return /* @__PURE__ */ (0, S.jsxs)("div", {
		className: `card-stage is-${a}`,
		children: [/* @__PURE__ */ (0, S.jsx)("h2", { children: e.heading }), a === "numbers" ? /* @__PURE__ */ (0, S.jsx)("div", {
			className: "card-numbers",
			children: o.map((e, t) => {
				let [n, r] = l(e);
				return /* @__PURE__ */ (0, S.jsxs)("div", {
					className: "card-in",
					style: c(t),
					children: [/* @__PURE__ */ (0, S.jsx)("b", { children: n }), /* @__PURE__ */ (0, S.jsx)("span", { children: r })]
				}, e);
			})
		}) : a === "compare" ? /* @__PURE__ */ (0, S.jsxs)("table", {
			className: "card-compare",
			children: [/* @__PURE__ */ (0, S.jsx)("thead", { children: /* @__PURE__ */ (0, S.jsx)("tr", { children: l(e.points[0]).map((e) => /* @__PURE__ */ (0, S.jsx)("th", { children: e }, e)) }) }), /* @__PURE__ */ (0, S.jsx)("tbody", { children: o.map((e, t) => /* @__PURE__ */ (0, S.jsx)("tr", {
				className: "card-in",
				style: c(t),
				children: l(e).map((e, t) => /* @__PURE__ */ (0, S.jsx)("td", { children: e }, t))
			}, e)) })]
		}) : /* @__PURE__ */ (0, S.jsx)("ul", {
			className: "card-points",
			children: o.map((e, t) => /* @__PURE__ */ (0, S.jsx)("li", {
				className: "card-in",
				style: c(t),
				children: e
			}, e))
		})]
	}, i);
}
//#endregion
//#region node_modules/gsap/gsap-core.js
function w(e) {
	if (e === void 0) throw ReferenceError("this hasn't been initialised - super() hasn't been called");
	return e;
}
function T(e, t) {
	e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e.__proto__ = t;
}
var E = {
	autoSleep: 120,
	force3D: "auto",
	nullTargetWarn: 1,
	units: { lineHeight: "" }
}, D = {
	duration: .5,
	overwrite: !1,
	delay: 0
}, O, k, A, j = 1e8, M = 1 / j, N = Math.PI * 2, P = N / 4, F = 0, ee = Math.sqrt, I = Math.cos, te = Math.sin, L = function(e) {
	return typeof e == "string";
}, R = function(e) {
	return typeof e == "function";
}, z = function(e) {
	return typeof e == "number";
}, ne = function(e) {
	return e === void 0;
}, re = function(e) {
	return typeof e == "object";
}, ie = function(e) {
	return e !== !1;
}, ae = function() {
	return typeof window < "u";
}, oe = function(e) {
	return R(e) || L(e);
}, se = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {}, ce = Array.isArray, le = /random\([^)]+\)/g, ue = /,\s*/g, B = /(?:-?\.?\d|\.)+/gi, V = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, de = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, fe = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, pe = /[+-]=-?[.\d]+/, me = /[^,'"\[\]\s]+/gi, he = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, H, ge, _e, ve, ye = {}, be = {}, xe, Se = function(e) {
	return (be = et(e, ye)) && _r;
}, Ce = function(e, t) {
	return console.warn("Invalid property", e, "set to", t, "Missing plugin? gsap.registerPlugin()");
}, we = function(e, t) {
	return !t && console.warn(e);
}, Te = function(e, t) {
	return e && (ye[e] = t) && be && (be[e] = t) || ye;
}, Ee = function() {
	return 0;
}, De = {
	suppressEvents: !0,
	isStart: !0,
	kill: !1
}, Oe = {
	suppressEvents: !0,
	kill: !1
}, ke = { suppressEvents: !0 }, Ae = {}, je = [], Me = {}, Ne, Pe = {}, Fe = {}, Ie = 30, Le = [], Re = "", ze = function(e) {
	var t = e[0], n, r;
	if (re(t) || R(t) || (e = [e]), !(n = (t._gsap || {}).harness)) {
		for (r = Le.length; r-- && !Le[r].targetTest(t););
		n = Le[r];
	}
	for (r = e.length; r--;) e[r] && (e[r]._gsap || (e[r]._gsap = new Dn(e[r], n))) || e.splice(r, 1);
	return e;
}, Be = function(e) {
	return e._gsap || ze(It(e))[0]._gsap;
}, Ve = function(e, t, n) {
	return (n = e[t]) && R(n) ? e[t]() : ne(n) && e.getAttribute && e.getAttribute(t) || n;
}, He = function(e, t) {
	return (e = e.split(",")).forEach(t) || e;
}, Ue = function(e) {
	return Math.round(e * 1e5) / 1e5 || 0;
}, We = function(e) {
	return Math.round(e * 1e7) / 1e7 || 0;
}, Ge = function(e, t) {
	var n = t.charAt(0), r = parseFloat(t.substr(2));
	return e = parseFloat(e), n === "+" ? e + r : n === "-" ? e - r : n === "*" ? e * r : e / r;
}, Ke = function(e, t) {
	for (var n = t.length, r = 0; e.indexOf(t[r]) < 0 && ++r < n;);
	return r < n;
}, qe = function() {
	var e = je.length, t = je.slice(0), n, r;
	for (Me = {}, je.length = 0, n = 0; n < e; n++) r = t[n], r && r._lazy && (r.render(r._lazy[0], r._lazy[1], !0)._lazy = 0);
}, Je = function(e) {
	return !!(e._initted || e._startAt || e.add);
}, Ye = function(e, t, n, r) {
	je.length && !k && qe(), e.render(t, n, r || !!(k && t < 0 && Je(e))), je.length && !k && qe();
}, Xe = function(e) {
	var t = parseFloat(e);
	return (t || t === 0) && (e + "").match(me).length < 2 ? t : L(e) ? e.trim() : e;
}, Ze = function(e) {
	return e;
}, Qe = function(e, t) {
	for (var n in t) n in e || (e[n] = t[n]);
	return e;
}, $e = function(e) {
	return function(t, n) {
		for (var r in n) r in t || r === "duration" && e || r === "ease" || (t[r] = n[r]);
	};
}, et = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, tt = function e(t, n) {
	for (var r in n) r !== "__proto__" && r !== "constructor" && r !== "prototype" && (t[r] = re(n[r]) ? e(t[r] || (t[r] = {}), n[r]) : n[r]);
	return t;
}, nt = function(e, t) {
	var n = {}, r;
	for (r in e) r in t || (n[r] = e[r]);
	return n;
}, rt = function(e) {
	var t = e.parent || H, n = e.keyframes ? $e(ce(e.keyframes)) : Qe;
	if (ie(e.inherit)) for (; t;) n(e, t.vars.defaults), t = t.parent || t._dp;
	return e;
}, it = function(e, t) {
	for (var n = e.length, r = n === t.length; r && n-- && e[n] === t[n];);
	return n < 0;
}, at = function(e, t, n, r, i) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var a = e[r], o;
	if (i) for (o = t[i]; a && a[i] > o;) a = a._prev;
	return a ? (t._next = a._next, a._next = t) : (t._next = e[n], e[n] = t), t._next ? t._next._prev = t : e[r] = t, t._prev = a, t.parent = t._dp = e, t;
}, ot = function(e, t, n, r) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var i = t._prev, a = t._next;
	i ? i._next = a : e[n] === t && (e[n] = a), a ? a._prev = i : e[r] === t && (e[r] = i), t._next = t._prev = t.parent = null;
}, st = function(e, t) {
	e.parent && (!t || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, ct = function(e, t) {
	if (e && (!t || t._end > e._dur || t._start < 0)) for (var n = e; n;) n._dirty = 1, n = n.parent;
	return e;
}, lt = function(e) {
	for (var t = e.parent; t && t.parent;) t._dirty = 1, t.totalDuration(), t = t.parent;
	return e;
}, ut = function(e, t, n, r) {
	return e._startAt && (k ? e._startAt.revert(Oe) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(t, !0, r));
}, dt = function e(t) {
	return !t || t._ts && e(t.parent);
}, ft = function(e) {
	return e._repeat ? pt(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, pt = function(e, t) {
	var n = Math.floor(e = We(e / t));
	return e && n === e ? n - 1 : n;
}, mt = function(e, t) {
	return (e - t._start) * t._ts + (t._ts >= 0 ? 0 : t._dirty ? t.totalDuration() : t._tDur);
}, ht = function(e) {
	return e._end = We(e._start + (e._tDur / Math.abs(e._ts || e._rts || M) || 0));
}, gt = function(e, t) {
	var n = e._dp;
	return n && n.smoothChildTiming && e._ts && (e._start = We(n._time - (e._ts > 0 ? t / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - t) / -e._ts)), ht(e), n._dirty || ct(n, e)), e;
}, _t = function(e, t) {
	var n;
	if ((t._time || !t._dur && t._initted || t._start < e._time && (t._dur || !t.add)) && (n = mt(e.rawTime(), t), (!t._dur || jt(0, t.totalDuration(), n) - t._tTime > M) && t.render(n, !0)), ct(e, t)._dp && e._initted && e._time >= e._dur && e._ts) {
		if (e._dur < e.duration()) for (n = e; n._dp;) n.rawTime() >= 0 && n.totalTime(n._tTime), n = n._dp;
		e._zTime = -M;
	}
}, vt = function(e, t, n, r) {
	return t.parent && st(t), t._start = We((z(n) ? n : n || e !== H ? Ot(e, n, t) : e._time) + t._delay), t._end = We(t._start + (t.totalDuration() / Math.abs(t.timeScale()) || 0)), at(e, t, "_first", "_last", e._sort ? "_start" : 0), St(t) || (e._recent = t), r || _t(e, t), e._ts < 0 && gt(e, e._tTime), e;
}, yt = function(e, t) {
	return (ye.ScrollTrigger || Ce("scrollTrigger", t)) && ye.ScrollTrigger.create(t, e);
}, bt = function(e, t, n, r, i) {
	if (In(e, t, i), !e._initted) return 1;
	if (!n && e._pt && !k && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && Ne !== mn.frame) return je.push(e), e._lazy = [i, r], 1;
}, xt = function e(t) {
	var n = t.parent;
	return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || e(n));
}, St = function(e) {
	var t = e.data;
	return t === "isFromStart" || t === "isStart";
}, Ct = function(e, t, n, r) {
	var i = e.ratio, a = t < 0 || !t && (!e._start && xt(e) && (e._initted || !St(e)) || (e._ts < 0 || e._dp._ts < 0) && !St(e)) ? 0 : 1, o = e._rDelay, s = 0, c, l, u;
	if (o && e._repeat && (s = jt(0, e._tDur, t), l = pt(s, o), e._yoyo && l & 1 && (a = 1 - a), l !== pt(e._tTime, o) && (i = 1 - a, e.vars.repeatRefresh && e._initted && e.invalidate())), a !== i || k || r || e._zTime === M || !t && e._zTime) {
		if (!e._initted && bt(e, t, r, n, s)) return;
		for (u = e._zTime, e._zTime = t || (n ? M : 0), n ||= t && !u, e.ratio = a, e._from && (a = 1 - a), e._time = 0, e._tTime = s, c = e._pt; c;) c.r(a, c.d), c = c._next;
		t < 0 && ut(e, t, n, !0), e._onUpdate && !n && Qt(e, "onUpdate"), s && e._repeat && !n && e.parent && Qt(e, "onRepeat"), (t >= e._tDur || t < 0) && e.ratio === a && (a && st(e, 1), !n && !k && (Qt(e, a ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
	} else e._zTime ||= t;
}, wt = function(e, t, n) {
	var r;
	if (n > t) for (r = e._first; r && r._start <= n;) {
		if (r.data === "isPause" && r._start > t) return r;
		r = r._next;
	}
	else for (r = e._last; r && r._start >= n;) {
		if (r.data === "isPause" && r._start < t) return r;
		r = r._prev;
	}
}, Tt = function(e, t, n, r) {
	var i = e._repeat, a = We(t) || 0, o = e._tTime / e._tDur;
	return o && !r && (e._time *= a / e._dur), e._dur = a, e._tDur = i ? i < 0 ? 1e10 : We(a * (i + 1) + e._rDelay * i) : a, o > 0 && !r && gt(e, e._tTime = e._tDur * o), e.parent && ht(e), n || ct(e.parent, e), e;
}, Et = function(e) {
	return e instanceof kn ? ct(e) : Tt(e, e._dur);
}, Dt = {
	_start: 0,
	endTime: Ee,
	totalDuration: Ee
}, Ot = function e(t, n, r) {
	var i = t.labels, a = t._recent || Dt, o = t.duration() >= j ? a.endTime(!1) : t._dur, s, c, l;
	return L(n) && (isNaN(n) || n in i) ? (c = n.charAt(0), l = n.substr(-1) === "%", s = n.indexOf("="), c === "<" || c === ">" ? (s >= 0 && (n = n.replace(/=/, "")), (c === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (l ? (s < 0 ? a : r).totalDuration() / 100 : 1)) : s < 0 ? (n in i || (i[n] = o), i[n]) : (c = parseFloat(n.charAt(s - 1) + n.substr(s + 1)), l && r && (c = c / 100 * (ce(r) ? r[0] : r).totalDuration()), s > 1 ? e(t, n.substr(0, s - 1), r) + c : o + c)) : n == null ? o : +n;
}, kt = function(e, t, n) {
	var r = z(t[1]), i = (r ? 2 : 1) + (e < 2 ? 0 : 1), a = t[i], o, s;
	if (r && (a.duration = t[1]), a.parent = n, e) {
		for (o = a, s = n; s && !("immediateRender" in o);) o = s.vars.defaults || {}, s = ie(s.vars.inherit) && s.parent;
		a.immediateRender = ie(o.immediateRender), e < 2 ? a.runBackwards = 1 : a.startAt = t[i - 1];
	}
	return new Un(t[0], a, t[i + 1]);
}, At = function(e, t) {
	return e || e === 0 ? t(e) : t;
}, jt = function(e, t, n) {
	return n < e ? e : n > t ? t : n;
}, U = function(e, t) {
	return !L(e) || !(t = he.exec(e)) ? "" : t[1];
}, Mt = function(e, t, n) {
	return At(n, function(n) {
		return jt(e, t, n);
	});
}, Nt = [].slice, Pt = function(e, t) {
	return e && re(e) && "length" in e && (!t && !e.length || e.length - 1 in e && re(e[0])) && !e.nodeType && e !== ge;
}, Ft = function(e, t, n) {
	return n === void 0 && (n = []), e.forEach(function(e) {
		var r;
		return L(e) && !t || Pt(e, 1) ? (r = n).push.apply(r, It(e)) : n.push(e);
	}) || n;
}, It = function(e, t, n) {
	return A && !t && A.selector ? A.selector(e) : L(e) && !n && (_e || !hn()) ? Nt.call((t || ve).querySelectorAll(e), 0) : ce(e) ? Ft(e, n) : Pt(e) ? Nt.call(e, 0) : e ? [e] : [];
}, Lt = function(e) {
	return e = It(e)[0] || we("Invalid scope") || {}, function(t) {
		var n = e.current || e.nativeElement || e;
		return It(t, n.querySelectorAll ? n : n === e ? we("Invalid scope") || ve.createElement("div") : e);
	};
}, Rt = function(e) {
	return e.sort(function() {
		return .5 - Math.random();
	});
}, zt = function(e) {
	if (R(e)) return e;
	var t = re(e) ? e : { each: e }, n = Sn(t.ease), r = t.from || 0, i = parseFloat(t.base) || 0, a = {}, o = r > 0 && r < 1, s = isNaN(r) || o, c = t.axis, l = r, u = r;
	return L(r) ? l = u = {
		center: .5,
		edges: .5,
		end: 1
	}[r] || 0 : !o && s && (l = r[0], u = r[1]), function(e, o, d) {
		var f = (d || t).length, p = a[f], m, h, g, _, v, y, b, x, S;
		if (!p) {
			if (S = t.grid === "auto" ? 0 : (t.grid || [1, j])[1], !S) {
				for (b = -j; b < (b = d[S++].getBoundingClientRect().left) && S < f;);
				S < f && S--;
			}
			for (p = a[f] = [], m = s ? Math.min(S, f) * l - .5 : r % S, h = S === j ? 0 : s ? f * u / S - .5 : r / S | 0, b = 0, x = j, y = 0; y < f; y++) g = y % S - m, _ = h - (y / S | 0), p[y] = v = c ? Math.abs(c === "y" ? _ : g) : ee(g * g + _ * _), v > b && (b = v), v < x && (x = v);
			r === "random" && Rt(p), p.max = b - x, p.min = x, p.v = f = (parseFloat(t.amount) || parseFloat(t.each) * (S > f ? f - 1 : c ? c === "y" ? f / S : S : Math.max(S, f / S)) || 0) * (r === "edges" ? -1 : 1), p.b = f < 0 ? i - f : i, p.u = U(t.amount || t.each) || 0, n = n && f < 0 ? xn(n) : n;
		}
		return f = (p[e] - p.min) / p.max || 0, We(p.b + (n ? n(f) : f) * p.v) + p.u;
	};
}, Bt = function(e) {
	var t = 10 ** ((e + "").split(".")[1] || "").length;
	return function(n) {
		var r = We(Math.round(parseFloat(n) / e) * e * t);
		return (r - r % 1) / t + (z(n) ? 0 : U(n));
	};
}, W = function(e, t) {
	var n = ce(e), r, i;
	return !n && re(e) && (r = n = e.radius || j, e.values ? (e = It(e.values), (i = !z(e[0])) && (r *= r)) : e = Bt(e.increment)), At(t, n ? R(e) ? function(t) {
		return i = e(t), Math.abs(i - t) <= r ? i : t;
	} : function(t) {
		for (var n = parseFloat(i ? t.x : t), a = parseFloat(i ? t.y : 0), o = j, s = 0, c = e.length, l, u; c--;) i ? (l = e[c].x - n, u = e[c].y - a, l = l * l + u * u) : l = Math.abs(e[c] - n), l < o && (o = l, s = c);
		return s = !r || o <= r ? e[s] : t, i || s === t || z(t) ? s : s + U(t);
	} : Bt(e));
}, Vt = function(e, t, n, r) {
	return At(ce(e) ? !t : n === !0 ? !!(n = 0) : !r, function() {
		return ce(e) ? e[~~(Math.random() * e.length)] : (n ||= 1e-5) && (r = n < 1 ? 10 ** ((n + "").length - 2) : 1) && Math.floor(Math.round((e - n / 2 + Math.random() * (t - e + n * .99)) / n) * n * r) / r;
	});
}, Ht = function() {
	var e = [...arguments];
	return function(t) {
		return e.reduce(function(e, t) {
			return t(e);
		}, t);
	};
}, Ut = function(e, t) {
	return function(n) {
		return e(parseFloat(n)) + (t || U(n));
	};
}, Wt = function(e, t, n) {
	return Yt(e, t, 0, 1, n);
}, Gt = function(e, t, n) {
	return At(n, function(n) {
		return e[~~t(n)];
	});
}, Kt = function e(t, n, r) {
	var i = n - t;
	return ce(t) ? Gt(t, e(0, t.length), n) : At(r, function(e) {
		return (i + (e - t) % i) % i + t;
	});
}, qt = function e(t, n, r) {
	var i = n - t, a = i * 2;
	return ce(t) ? Gt(t, e(0, t.length - 1), n) : At(r, function(e) {
		return e = (a + (e - t) % a) % a || 0, t + (e > i ? a - e : e);
	});
}, Jt = function(e) {
	return e.replace(le, function(e) {
		var t = e.indexOf("[") + 1, n = e.substring(t || 7, t ? e.indexOf("]") : e.length - 1).split(ue);
		return Vt(t ? n : +n[0], t ? 0 : +n[1], +n[2] || 1e-5);
	});
}, Yt = function(e, t, n, r, i) {
	var a = t - e, o = r - n;
	return At(i, function(t) {
		return n + ((t - e) / a * o || 0);
	});
}, Xt = function e(t, n, r, i) {
	var a = isNaN(t + n) ? 0 : function(e) {
		return (1 - e) * t + e * n;
	};
	if (!a) {
		var o = L(t), s = {}, c, l, u, d, f;
		if (r === !0 && (i = 1) && (r = null), o) t = { p: t }, n = { p: n };
		else if (ce(t) && !ce(n)) {
			for (u = [], d = t.length, f = d - 2, l = 1; l < d; l++) u.push(e(t[l - 1], t[l]));
			d--, a = function(e) {
				e *= d;
				var t = Math.min(f, ~~e);
				return u[t](e - t);
			}, r = n;
		} else i || (t = et(ce(t) ? [] : {}, t));
		if (!u) {
			for (c in n) jn.call(s, t, c, "get", n[c]);
			a = function(e) {
				return Qn(e, s) || (o ? t.p : t);
			};
		}
	}
	return At(r, a);
}, Zt = function(e, t, n) {
	var r = e.labels, i = j, a, o, s;
	for (a in r) o = r[a] - t, o < 0 == !!n && o && i > (o = Math.abs(o)) && (s = a, i = o);
	return s;
}, Qt = function(e, t, n) {
	var r = e.vars, i = r[t], a = A, o = e._ctx, s, c, l;
	if (i) return s = r[t + "Params"], c = r.callbackScope || e, n && je.length && qe(), o && (A = o), l = s ? i.apply(c, s) : i.call(c), A = a, l;
}, $t = function(e) {
	return st(e), e.scrollTrigger && e.scrollTrigger.kill(!!k), e.progress() < 1 && Qt(e, "onInterrupt"), e;
}, en, tn = [], nn = function(e) {
	if (e) {
		if (e = !e.name && e.default || e, ae() || e.headless) {
			var t = e.name, n = R(e), r = t && !n && e.init ? function() {
				this._props = [];
			} : e, i = {
				init: Ee,
				render: Qn,
				add: jn,
				kill: er,
				modifier: $n,
				rawVars: 0
			}, a = {
				targetTest: 0,
				get: 0,
				getSetter: Jn,
				aliases: {},
				register: 0
			};
			if (hn(), e !== r) {
				if (Pe[t]) return;
				Qe(r, Qe(nt(e, i), a)), et(r.prototype, et(i, nt(e, a))), Pe[r.prop = t] = r, e.targetTest && (Le.push(r), Ae[t] = 1), t = (t === "css" ? "CSS" : t.charAt(0).toUpperCase() + t.substr(1)) + "Plugin";
			}
			Te(t, r), e.register && e.register(_r, r, rr);
		} else tn.push(e);
	}
}, rn = 255, an = {
	aqua: [
		0,
		rn,
		rn
	],
	lime: [
		0,
		rn,
		0
	],
	silver: [
		192,
		192,
		192
	],
	black: [
		0,
		0,
		0
	],
	maroon: [
		128,
		0,
		0
	],
	teal: [
		0,
		128,
		128
	],
	blue: [
		0,
		0,
		rn
	],
	navy: [
		0,
		0,
		128
	],
	white: [
		rn,
		rn,
		rn
	],
	olive: [
		128,
		128,
		0
	],
	yellow: [
		rn,
		rn,
		0
	],
	orange: [
		rn,
		165,
		0
	],
	gray: [
		128,
		128,
		128
	],
	purple: [
		128,
		0,
		128
	],
	green: [
		0,
		128,
		0
	],
	red: [
		rn,
		0,
		0
	],
	pink: [
		rn,
		192,
		203
	],
	cyan: [
		0,
		rn,
		rn
	],
	transparent: [
		rn,
		rn,
		rn,
		0
	]
}, on = function(e, t, n) {
	return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? t + (n - t) * e * 6 : e < .5 ? n : e * 3 < 2 ? t + (n - t) * (2 / 3 - e) * 6 : t) * rn + .5 | 0;
}, sn = function(e, t, n) {
	var r = e ? z(e) ? [
		e >> 16,
		e >> 8 & rn,
		e & rn
	] : 0 : an.black, i, a, o, s, c, l, u, d, f, p;
	if (!r) {
		if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), an[e]) r = an[e];
		else if (e.charAt(0) === "#") {
			if (e.length < 6 && (i = e.charAt(1), a = e.charAt(2), o = e.charAt(3), e = "#" + i + i + a + a + o + o + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9) return r = parseInt(e.substr(1, 6), 16), [
				r >> 16,
				r >> 8 & rn,
				r & rn,
				parseInt(e.substr(7), 16) / 255
			];
			e = parseInt(e.substr(1), 16), r = [
				e >> 16,
				e >> 8 & rn,
				e & rn
			];
		} else if (e.substr(0, 3) === "hsl") {
			if (r = p = e.match(B), !t) s = r[0] % 360 / 360, c = r[1] / 100, l = r[2] / 100, a = l <= .5 ? l * (c + 1) : l + c - l * c, i = l * 2 - a, r.length > 3 && (r[3] *= 1), r[0] = on(s + 1 / 3, i, a), r[1] = on(s, i, a), r[2] = on(s - 1 / 3, i, a);
			else if (~e.indexOf("=")) return r = e.match(V), n && r.length < 4 && (r[3] = 1), r;
		} else r = e.match(B) || an.transparent;
		r = r.map(Number);
	}
	return t && !p && (i = r[0] / rn, a = r[1] / rn, o = r[2] / rn, u = Math.max(i, a, o), d = Math.min(i, a, o), l = (u + d) / 2, u === d ? s = c = 0 : (f = u - d, c = l > .5 ? f / (2 - u - d) : f / (u + d), s = u === i ? (a - o) / f + (a < o ? 6 : 0) : u === a ? (o - i) / f + 2 : (i - a) / f + 4, s *= 60), r[0] = ~~(s + .5), r[1] = ~~(c * 100 + .5), r[2] = ~~(l * 100 + .5)), n && r.length < 4 && (r[3] = 1), r;
}, cn = function(e) {
	var t = [], n = [], r = -1;
	return e.split(un).forEach(function(e) {
		var i = e.match(de) || [];
		t.push.apply(t, i), n.push(r += i.length + 1);
	}), t.c = n, t;
}, ln = function(e, t, n) {
	var r = "", i = (e + r).match(un), a = t ? "hsla(" : "rgba(", o = 0, s, c, l, u;
	if (!i) return e;
	if (i = i.map(function(e) {
		return (e = sn(e, t, 1)) && a + (t ? e[0] + "," + e[1] + "%," + e[2] + "%," + e[3] : e.join(",")) + ")";
	}), n && (l = cn(e), s = n.c, s.join(r) !== l.c.join(r))) for (c = e.replace(un, "1").split(de), u = c.length - 1; o < u; o++) r += c[o] + (~s.indexOf(o) ? i.shift() || a + "0,0,0,0)" : (l.length ? l : i.length ? i : n).shift());
	if (!c) for (c = e.split(un), u = c.length - 1; o < u; o++) r += c[o] + i[o];
	return r + c[u];
}, un = function() {
	var e = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", t;
	for (t in an) e += "|" + t + "\\b";
	return RegExp(e + ")", "gi");
}(), dn = /hsl[a]?\(/, fn = function(e) {
	var t = e.join(" "), n;
	if (un.lastIndex = 0, un.test(t)) return n = dn.test(t), e[1] = ln(e[1], n), e[0] = ln(e[0], n, cn(e[1])), !0;
}, pn, mn = function() {
	var e = Date.now, t = 500, n = 33, r = e(), i = r, a = 1e3 / 240, o = a, s = [], c, l, u, d, f, p, m = function u(m) {
		var h = e() - i, g = m === !0, _, v, y, b;
		if ((h > t || h < 0) && (r += h - n), i += h, y = i - r, _ = y - o, (_ > 0 || g) && (b = ++d.frame, f = y - d.time * 1e3, d.time = y /= 1e3, o += _ + (_ >= a ? 4 : a - _), v = 1), g || (c = l(u)), v) for (p = 0; p < s.length; p++) s[p](y, f, b, m);
	};
	return d = {
		time: 0,
		frame: 0,
		tick: function() {
			m(!0);
		},
		deltaRatio: function(e) {
			return f / (1e3 / (e || 60));
		},
		wake: function() {
			xe && (!_e && ae() && (ge = _e = window, ve = ge.document || {}, ye.gsap = _r, (ge.gsapVersions || (ge.gsapVersions = [])).push(_r.version), Se(be || ge.GreenSockGlobals || !ge.gsap && ge || {}), tn.forEach(nn)), u = typeof requestAnimationFrame < "u" && requestAnimationFrame, c && d.sleep(), l = u || function(e) {
				return setTimeout(e, o - d.time * 1e3 + 1 | 0);
			}, pn = 1, m(2));
		},
		sleep: function() {
			(u ? cancelAnimationFrame : clearTimeout)(c), pn = 0, l = Ee;
		},
		lagSmoothing: function(e, r) {
			t = e || Infinity, n = Math.min(r || 33, t);
		},
		fps: function(e) {
			a = 1e3 / (e || 240), o = d.time * 1e3 + a;
		},
		add: function(e, t, n) {
			var r = t ? function(t, n, i, a) {
				e(t, n, i, a), d.remove(r);
			} : e;
			return d.remove(e), s[n ? "unshift" : "push"](r), hn(), r;
		},
		remove: function(e, t) {
			~(t = s.indexOf(e)) && s.splice(t, 1) && p >= t && p--;
		},
		_listeners: s
	}, d;
}(), hn = function() {
	return !pn && mn.wake();
}, G = {}, gn = /^[\d.\-M][\d.\-,\s]/, _n = /["']/g, vn = function(e) {
	for (var t = {}, n = e.substr(1, e.length - 3).split(":"), r = n[0], i = 1, a = n.length, o, s, c; i < a; i++) s = n[i], o = i === a - 1 ? s.length : s.lastIndexOf(","), c = s.substr(0, o), t[r] = isNaN(c) ? c.replace(_n, "").trim() : +c, r = s.substr(o + 1).trim();
	return t;
}, yn = function(e) {
	var t = e.indexOf("(") + 1, n = e.indexOf(")"), r = e.indexOf("(", t);
	return e.substring(t, ~r && r < n ? e.indexOf(")", n + 1) : n);
}, bn = function(e) {
	var t = (e + "").split("("), n = G[t[0]];
	return n && t.length > 1 && n.config ? n.config.apply(null, ~e.indexOf("{") ? [vn(t[1])] : yn(e).split(",").map(Xe)) : G._CE && gn.test(e) ? G._CE("", e) : n;
}, xn = function(e) {
	return function(t) {
		return 1 - e(1 - t);
	};
}, Sn = function(e, t) {
	return e && (R(e) ? e : G[e] || bn(e)) || t;
}, Cn = function(e, t, n, r) {
	n === void 0 && (n = function(e) {
		return 1 - t(1 - e);
	}), r === void 0 && (r = function(e) {
		return e < .5 ? t(e * 2) / 2 : 1 - t((1 - e) * 2) / 2;
	});
	var i = {
		easeIn: t,
		easeOut: n,
		easeInOut: r
	}, a;
	return He(e, function(e) {
		for (var t in G[e] = ye[e] = i, G[a = e.toLowerCase()] = n, i) G[a + (t === "easeIn" ? ".in" : t === "easeOut" ? ".out" : ".inOut")] = G[e + "." + t] = i[t];
	}), i;
}, wn = function(e) {
	return function(t) {
		return t < .5 ? (1 - e(1 - t * 2)) / 2 : .5 + e((t - .5) * 2) / 2;
	};
}, Tn = function e(t, n, r) {
	var i = n >= 1 ? n : 1, a = (r || (t ? .3 : .45)) / (n < 1 ? n : 1), o = a / N * (Math.asin(1 / i) || 0), s = function(e) {
		return e === 1 ? 1 : i * 2 ** (-10 * e) * te((e - o) * a) + 1;
	}, c = t === "out" ? s : t === "in" ? function(e) {
		return 1 - s(1 - e);
	} : wn(s);
	return a = N / a, c.config = function(n, r) {
		return e(t, n, r);
	}, c;
}, En = function e(t, n) {
	n === void 0 && (n = 1.70158);
	var r = function(e) {
		return e ? --e * e * ((n + 1) * e + n) + 1 : 0;
	}, i = t === "out" ? r : t === "in" ? function(e) {
		return 1 - r(1 - e);
	} : wn(r);
	return i.config = function(n) {
		return e(t, n);
	}, i;
};
He("Linear,Quad,Cubic,Quart,Quint,Strong", function(e, t) {
	var n = t < 5 ? t + 1 : t;
	Cn(e + ",Power" + (n - 1), t ? function(e) {
		return e ** +n;
	} : function(e) {
		return e;
	}, function(e) {
		return 1 - (1 - e) ** n;
	}, function(e) {
		return e < .5 ? (e * 2) ** n / 2 : 1 - ((1 - e) * 2) ** n / 2;
	});
}), G.Linear.easeNone = G.none = G.Linear.easeIn, Cn("Elastic", Tn("in"), Tn("out"), Tn()), (function(e, t) {
	var n = 1 / t, r = 2 * n, i = 2.5 * n, a = function(a) {
		return a < n ? e * a * a : a < r ? e * (a - 1.5 / t) ** 2 + .75 : a < i ? e * (a -= 2.25 / t) * a + .9375 : e * (a - 2.625 / t) ** 2 + .984375;
	};
	Cn("Bounce", function(e) {
		return 1 - a(1 - e);
	}, a);
})(7.5625, 2.75), Cn("Expo", function(e) {
	return 2 ** (10 * (e - 1)) * e + e * e * e * e * e * e * (1 - e);
}), Cn("Circ", function(e) {
	return -(ee(1 - e * e) - 1);
}), Cn("Sine", function(e) {
	return e === 1 ? 1 : -I(e * P) + 1;
}), Cn("Back", En("in"), En("out"), En()), G.SteppedEase = G.steps = ye.SteppedEase = { config: function(e, t) {
	e === void 0 && (e = 1);
	var n = 1 / e, r = e + +!t, i = +!!t, a = 1 - M;
	return function(e) {
		return ((r * jt(0, a, e) | 0) + i) * n;
	};
} }, D.ease = G["quad.out"], He("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(e) {
	return Re += e + "," + e + "Params,";
});
var Dn = function(e, t) {
	this.id = F++, e._gsap = this, this.target = e, this.harness = t, this.get = t ? t.get : Ve, this.set = t ? t.getSetter : Jn;
}, On = /*#__PURE__*/ function() {
	function e(e) {
		this.vars = e, this._delay = +e.delay || 0, (this._repeat = e.repeat === Infinity ? -2 : e.repeat || 0) && (this._rDelay = e.repeatDelay || 0, this._yoyo = !!e.yoyo || !!e.yoyoEase), this._ts = 1, Tt(this, +e.duration, 1, 1), this.data = e.data, A && (this._ctx = A, A.data.push(this)), pn || mn.wake();
	}
	var t = e.prototype;
	return t.delay = function(e) {
		return e || e === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + e - this._delay), this._delay = e, this) : this._delay;
	}, t.duration = function(e) {
		return arguments.length ? this.totalDuration(this._repeat > 0 ? e + (e + this._rDelay) * this._repeat : e) : this.totalDuration() && this._dur;
	}, t.totalDuration = function(e) {
		return arguments.length ? (this._dirty = 0, Tt(this, this._repeat < 0 ? e : (e - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
	}, t.totalTime = function(e, t) {
		if (hn(), !arguments.length) return this._tTime;
		var n = this._dp;
		if (n && n.smoothChildTiming && this._ts) {
			for (gt(this, e), !n._dp || n.parent || _t(n, this); n && n.parent;) n.parent._time !== n._start + (n._ts >= 0 ? n._tTime / n._ts : (n.totalDuration() - n._tTime) / -n._ts) && n.totalTime(n._tTime, !0), n = n.parent;
			!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && e < this._tDur || this._ts < 0 && e > 0 || !this._tDur && !e) && vt(this._dp, this, this._start - this._delay);
		}
		return (this._tTime !== e || !this._dur && !t || this._initted && Math.abs(this._zTime) === M || !this._initted && this._dur && e || !e && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = e), Ye(this, e, t)), this;
	}, t.time = function(e, t) {
		return arguments.length ? this.totalTime(Math.min(this.totalDuration(), e + ft(this)) % (this._dur + this._rDelay) || (e ? this._dur : 0), t) : this._time;
	}, t.totalProgress = function(e, t) {
		return arguments.length ? this.totalTime(this.totalDuration() * e, t) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
	}, t.progress = function(e, t) {
		return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - e : e) + ft(this), t) : this.duration() ? Math.min(1, this._time / this._dur) : +(this.rawTime() > 0);
	}, t.iteration = function(e, t) {
		var n = this.duration() + this._rDelay;
		return arguments.length ? this.totalTime(this._time + (e - 1) * n, t) : this._repeat ? pt(this._tTime, n) + 1 : 1;
	}, t.timeScale = function(e, t) {
		if (!arguments.length) return this._rts === -M ? 0 : this._rts;
		if (this._rts === e) return this;
		var n = this.parent && this._ts ? mt(this.parent._time, this) : this._tTime;
		return this._rts = +e || 0, this._ts = this._ps || e === -M ? 0 : this._rts, this.totalTime(jt(-Math.abs(this._delay), this.totalDuration(), n), t !== !1), ht(this), lt(this);
	}, t.paused = function(e) {
		return arguments.length ? (this._ps !== e && (this._ps = e, e ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (hn(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== M && (this._tTime -= M)))), this) : this._ps;
	}, t.startTime = function(e) {
		if (arguments.length) {
			this._start = We(e);
			var t = this.parent || this._dp;
			return t && (t._sort || !this.parent) && vt(t, this, this._start - this._delay), this;
		}
		return this._start;
	}, t.endTime = function(e) {
		return this._start + (ie(e) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	}, t.rawTime = function(e) {
		var t = this.parent || this._dp;
		return t ? e && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? mt(t.rawTime(e), this) : this._tTime : this._tTime;
	}, t.revert = function(e) {
		e === void 0 && (e = ke);
		var t = k;
		return k = e, Je(this) && (this.timeline && this.timeline.revert(e), this.totalTime(-.01, e.suppressEvents)), this.data !== "nested" && e.kill !== !1 && this.kill(), k = t, this;
	}, t.globalTime = function(e) {
		for (var t = this, n = arguments.length ? e : t.rawTime(); t;) n = t._start + n / (Math.abs(t._ts) || 1), t = t._dp;
		return !this.parent && this._sat ? this._sat.globalTime(e) : n;
	}, t.repeat = function(e) {
		return arguments.length ? (this._repeat = e === Infinity ? -2 : e, Et(this)) : this._repeat === -2 ? Infinity : this._repeat;
	}, t.repeatDelay = function(e) {
		if (arguments.length) {
			var t = this._time;
			return this._rDelay = e, Et(this), t ? this.time(t) : this;
		}
		return this._rDelay;
	}, t.yoyo = function(e) {
		return arguments.length ? (this._yoyo = e, this) : this._yoyo;
	}, t.seek = function(e, t) {
		return this.totalTime(Ot(this, e), ie(t));
	}, t.restart = function(e, t) {
		return this.play().totalTime(e ? -this._delay : 0, ie(t)), this._dur || (this._zTime = -M), this;
	}, t.play = function(e, t) {
		return e != null && this.seek(e, t), this.reversed(!1).paused(!1);
	}, t.reverse = function(e, t) {
		return e != null && this.seek(e || this.totalDuration(), t), this.reversed(!0).paused(!1);
	}, t.pause = function(e, t) {
		return e != null && this.seek(e, t), this.paused(!0);
	}, t.resume = function() {
		return this.paused(!1);
	}, t.reversed = function(e) {
		return arguments.length ? (!!e !== this.reversed() && this.timeScale(-this._rts || (e ? -M : 0)), this) : this._rts < 0;
	}, t.invalidate = function() {
		return this._initted = this._act = 0, this._zTime = -M, this;
	}, t.isActive = function() {
		var e = this.parent || this._dp, t = this._start, n;
		return !!(!e || this._ts && this._initted && e.isActive() && (n = e.rawTime(!0)) >= t && n < this.endTime(!0) - M);
	}, t.eventCallback = function(e, t, n) {
		var r = this.vars;
		return arguments.length > 1 ? (t ? (r[e] = t, n && (r[e + "Params"] = n), e === "onUpdate" && (this._onUpdate = t)) : delete r[e], this) : r[e];
	}, t.then = function(e) {
		var t = this, n = t._prom;
		return new Promise(function(r) {
			var i = R(e) ? e : Ze, a = function() {
				var e = t.then;
				t.then = null, n && n(), R(i) && (i = i(t)) && (i.then || i === t) && (t.then = e), r(i), t.then = e;
			};
			t._initted && t.totalProgress() === 1 && t._ts >= 0 || !t._tTime && t._ts < 0 ? a() : t._prom = a;
		});
	}, t.kill = function() {
		$t(this);
	}, e;
}();
Qe(On.prototype, {
	_time: 0,
	_start: 0,
	_end: 0,
	_tTime: 0,
	_tDur: 0,
	_dirty: 0,
	_repeat: 0,
	_yoyo: !1,
	parent: null,
	_initted: !1,
	_rDelay: 0,
	_ts: 1,
	_dp: 0,
	ratio: 0,
	_zTime: -M,
	_prom: 0,
	_ps: !1,
	_rts: 1
});
var kn = /*#__PURE__*/ function(e) {
	T(t, e);
	function t(t, n) {
		var r;
		return t === void 0 && (t = {}), r = e.call(this, t) || this, r.labels = {}, r.smoothChildTiming = !!t.smoothChildTiming, r.autoRemoveChildren = !!t.autoRemoveChildren, r._sort = ie(t.sortChildren), H && vt(t.parent || H, w(r), n), t.reversed && r.reverse(), t.paused && r.paused(!0), t.scrollTrigger && yt(w(r), t.scrollTrigger), r;
	}
	var n = t.prototype;
	return n.to = function(e, t, n) {
		return kt(0, arguments, this), this;
	}, n.from = function(e, t, n) {
		return kt(1, arguments, this), this;
	}, n.fromTo = function(e, t, n, r) {
		return kt(2, arguments, this), this;
	}, n.set = function(e, t, n) {
		return t.duration = 0, t.parent = this, rt(t).repeatDelay || (t.repeat = 0), t.immediateRender = !!t.immediateRender, new Un(e, t, Ot(this, n), 1), this;
	}, n.call = function(e, t, n) {
		return vt(this, Un.delayedCall(0, e, t), n);
	}, n.staggerTo = function(e, t, n, r, i, a, o) {
		return n.duration = t, n.stagger = n.stagger || r, n.onComplete = a, n.onCompleteParams = o, n.parent = this, new Un(e, n, Ot(this, i)), this;
	}, n.staggerFrom = function(e, t, n, r, i, a, o) {
		return n.runBackwards = 1, rt(n).immediateRender = ie(n.immediateRender), this.staggerTo(e, t, n, r, i, a, o);
	}, n.staggerFromTo = function(e, t, n, r, i, a, o, s) {
		return r.startAt = n, rt(r).immediateRender = ie(r.immediateRender), this.staggerTo(e, t, r, i, a, o, s);
	}, n.render = function(e, t, n) {
		var r = this._time, i = this._dirty ? this.totalDuration() : this._tDur, a = this._dur, o = e <= 0 ? 0 : We(e), s = this._zTime < 0 != e < 0 && (this._initted || !a), c, l, u, d, f, p, m, h, g, _, v, y;
		if (this !== H && o > i && e >= 0 && (o = i), o !== this._tTime || n || s) {
			if (r !== this._time && a && (o += this._time - r, e += this._time - r), c = o, g = this._start, h = this._ts, p = !h, s && (a || (r = this._zTime), (e || !t) && (this._zTime = e)), this._repeat) {
				if (v = this._yoyo, f = a + this._rDelay, this._repeat < -1 && e < 0) return this.totalTime(f * 100 + e, t, n);
				if (c = We(o % f), o === i ? (d = this._repeat, c = a) : (_ = We(o / f), d = ~~_, d && d === _ && (c = a, d--), c > a && (c = a)), _ = pt(this._tTime, f), !r && this._tTime && _ !== d && this._tTime - _ * f - this._dur <= 0 && (_ = d), v && d & 1 && (c = a - c, y = 1), d !== _ && !this._lock) {
					var b = v && _ & 1, x = b === (v && d & 1);
					if (d < _ && (b = !b), r = b ? 0 : o % a ? a : o, this._lock = 1, this.render(r || (y ? 0 : We(d * f)), t, !a)._lock = 0, this._tTime = o, !t && this.parent && Qt(this, "onRepeat"), this.vars.repeatRefresh && !y && (this.invalidate()._lock = 1, _ = d), r && r !== this._time || p !== !this._ts || this.vars.onRepeat && !this.parent && !this._act || (a = this._dur, i = this._tDur, x && (this._lock = 2, r = b ? a : -1e-4, this.render(r, !0), this.vars.repeatRefresh && !y && this.invalidate()), this._lock = 0, !this._ts && !p)) return this;
				}
			}
			if (this._hasPause && !this._forcing && this._lock < 2 && (m = wt(this, We(r), We(c)), m && (o -= c - (c = m._start))), this._tTime = o, this._time = c, this._act = !!h, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = e, r = 0), !r && o && a && !t && !_ && (Qt(this, "onStart"), this._tTime !== o)) return this;
			if (c >= r && e >= 0) for (l = this._first; l;) {
				if (u = l._next, (l._act || c >= l._start) && l._ts && m !== l) {
					if (l.parent !== this) return this.render(e, t, n);
					if (l.render(l._ts > 0 ? (c - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (c - l._start) * l._ts, t, n), c !== this._time || !this._ts && !p) {
						m = 0, u && (o += this._zTime = -M);
						break;
					}
				}
				l = u;
			}
			else {
				l = this._last;
				for (var S = e < 0 ? e : c; l;) {
					if (u = l._prev, (l._act || S <= l._end) && l._ts && m !== l) {
						if (l.parent !== this) return this.render(e, t, n);
						if (l.render(l._ts > 0 ? (S - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (S - l._start) * l._ts, t, n || k && Je(l)), c !== this._time || !this._ts && !p) {
							m = 0, u && (o += this._zTime = S ? -M : M);
							break;
						}
					}
					l = u;
				}
			}
			if (m && !t && (this.pause(), m.render(c >= r ? 0 : -M)._zTime = c >= r ? 1 : -1, this._ts)) return this._start = g, ht(this), this.render(e, t, n);
			this._onUpdate && !t && Qt(this, "onUpdate", !0), (o === i && this._tTime >= this.totalDuration() || !o && r) && (g === this._start || Math.abs(h) !== Math.abs(this._ts)) && (this._lock || ((e || !a) && (o === i && this._ts > 0 || !o && this._ts < 0) && st(this, 1), !t && !(e < 0 && !r) && (o || r || !i) && (Qt(this, o === i && e >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(o < i && this.timeScale() > 0) && this._prom())));
		}
		return this;
	}, n.add = function(e, t) {
		var n = this;
		if (z(t) || (t = Ot(this, t, e)), !(e instanceof On)) {
			if (ce(e)) return e.forEach(function(e) {
				return n.add(e, t);
			}), this;
			if (L(e)) return this.addLabel(e, t);
			if (R(e)) e = Un.delayedCall(0, e);
			else return this;
		}
		return this === e ? this : vt(this, e, t);
	}, n.getChildren = function(e, t, n, r) {
		e === void 0 && (e = !0), t === void 0 && (t = !0), n === void 0 && (n = !0), r === void 0 && (r = -j);
		for (var i = [], a = this._first; a;) a._start >= r && (a instanceof Un ? t && i.push(a) : (n && i.push(a), e && i.push.apply(i, a.getChildren(!0, t, n)))), a = a._next;
		return i;
	}, n.getById = function(e) {
		for (var t = this.getChildren(1, 1, 1), n = t.length; n--;) if (t[n].vars.id === e) return t[n];
	}, n.remove = function(e) {
		return L(e) ? this.removeLabel(e) : R(e) ? this.killTweensOf(e) : (e.parent === this && ot(this, e), e === this._recent && (this._recent = this._last), ct(this));
	}, n.totalTime = function(t, n) {
		return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = We(mn.time - (this._ts > 0 ? t / this._ts : (this.totalDuration() - t) / -this._ts))), e.prototype.totalTime.call(this, t, n), this._forcing = 0, this) : this._tTime;
	}, n.addLabel = function(e, t) {
		return this.labels[e] = Ot(this, t), this;
	}, n.removeLabel = function(e) {
		return delete this.labels[e], this;
	}, n.addPause = function(e, t, n) {
		var r = Un.delayedCall(0, t || Ee, n);
		return r.data = "isPause", this._hasPause = 1, vt(this, r, Ot(this, e));
	}, n.removePause = function(e) {
		var t = this._first;
		for (e = Ot(this, e); t;) t._start === e && t.data === "isPause" && st(t), t = t._next;
	}, n.killTweensOf = function(e, t, n) {
		for (var r = this.getTweensOf(e, n), i = r.length; i--;) Pn !== r[i] && r[i].kill(e, t);
		return this;
	}, n.getTweensOf = function(e, t) {
		for (var n = [], r = It(e), i = this._first, a = z(t), o; i;) i instanceof Un ? Ke(i._targets, r) && (a ? (!Pn || i._initted && i._ts) && i.globalTime(0) <= t && i.globalTime(i.totalDuration()) > t : !t || i.isActive()) && n.push(i) : (o = i.getTweensOf(r, t)).length && n.push.apply(n, o), i = i._next;
		return n;
	}, n.tweenTo = function(e, t) {
		t ||= {};
		var n = this, r = Ot(n, e), i = t, a = i.startAt, o = i.onStart, s = i.onStartParams, c = i.immediateRender, l, u = Un.to(n, Qe({
			ease: t.ease || "none",
			lazy: !1,
			immediateRender: !1,
			time: r,
			overwrite: "auto",
			duration: t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale()) || M,
			onStart: function() {
				if (n.pause(), !l) {
					var e = t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale());
					u._dur !== e && Tt(u, e, 0, 1).render(u._time, !0, !0), l = 1;
				}
				o && o.apply(u, s || []);
			}
		}, t));
		return c ? u.render(0) : u;
	}, n.tweenFromTo = function(e, t, n) {
		return this.tweenTo(t, Qe({ startAt: { time: Ot(this, e) } }, n));
	}, n.recent = function() {
		return this._recent;
	}, n.nextLabel = function(e) {
		return e === void 0 && (e = this._time), Zt(this, Ot(this, e));
	}, n.previousLabel = function(e) {
		return e === void 0 && (e = this._time), Zt(this, Ot(this, e), 1);
	}, n.currentLabel = function(e) {
		return arguments.length ? this.seek(e, !0) : this.previousLabel(this._time + M);
	}, n.shiftChildren = function(e, t, n) {
		n === void 0 && (n = 0);
		var r = this._first, i = this.labels, a;
		for (e = We(e); r;) r._start >= n && (r._start += e, r._end += e), r = r._next;
		if (t) for (a in i) i[a] >= n && (i[a] += e);
		return ct(this);
	}, n.invalidate = function(t) {
		var n = this._first;
		for (this._lock = 0; n;) n.invalidate(t), n = n._next;
		return e.prototype.invalidate.call(this, t);
	}, n.clear = function(e) {
		e === void 0 && (e = !0);
		for (var t = this._first, n; t;) n = t._next, this.remove(t), t = n;
		return this._dp && (this._time = this._tTime = this._pTime = 0), e && (this.labels = {}), ct(this);
	}, n.totalDuration = function(e) {
		var t = 0, n = this, r = n._last, i = j, a, o, s;
		if (arguments.length) return n.timeScale((n._repeat < 0 ? n.duration() : n.totalDuration()) / (n.reversed() ? -e : e));
		if (n._dirty) {
			for (s = n.parent; r;) a = r._prev, r._dirty && r.totalDuration(), o = r._start, o > i && n._sort && r._ts && !n._lock ? (n._lock = 1, vt(n, r, o - r._delay, 1)._lock = 0) : i = o, o < 0 && r._ts && (t -= o, (!s && !n._dp || s && s.smoothChildTiming) && (n._start += We(o / n._ts), n._time -= o, n._tTime -= o), n.shiftChildren(-o, !1, -Infinity), i = 0), r._end > t && r._ts && (t = r._end), r = a;
			Tt(n, n === H && n._time > t ? n._time : t, 1, 1), n._dirty = 0;
		}
		return n._tDur;
	}, t.updateRoot = function(e) {
		if (H._ts && (Ye(H, mt(e, H)), Ne = mn.frame), mn.frame >= Ie) {
			Ie += E.autoSleep || 120;
			var t = H._first;
			if ((!t || !t._ts) && E.autoSleep && mn._listeners.length < 2) {
				for (; t && !t._ts;) t = t._next;
				t || mn.sleep();
			}
		}
	}, t;
}(On);
Qe(kn.prototype, {
	_lock: 0,
	_hasPause: 0,
	_forcing: 0
});
var An = function(e, t, n, r, i, a, o) {
	var s = new rr(this._pt, e, t, 0, 1, Zn, null, i), c = 0, l = 0, u, d, f, p, m, h, g, _;
	for (s.b = n, s.e = r, n += "", r += "", (g = ~r.indexOf("random(")) && (r = Jt(r)), a && (_ = [n, r], a(_, e, t), n = _[0], r = _[1]), d = n.match(fe) || []; u = fe.exec(r);) p = u[0], m = r.substring(c, u.index), f ? f = (f + 1) % 5 : m.substr(-5) === "rgba(" && (f = 1), p !== d[l++] && (h = parseFloat(d[l - 1]) || 0, s._pt = {
		_next: s._pt,
		p: m || l === 1 ? m : ",",
		s: h,
		c: p.charAt(1) === "=" ? Ge(h, p) - h : parseFloat(p) - h,
		m: f && f < 4 ? Math.round : 0
	}, c = fe.lastIndex);
	return s.c = c < r.length ? r.substring(c, r.length) : "", s.fp = o, (pe.test(r) || g) && (s.e = 0), this._pt = s, s;
}, jn = function(e, t, n, r, i, a, o, s, c, l) {
	R(r) && (r = r(i || 0, e, a));
	var u = e[t], d = n === "get" ? R(u) ? c ? e[t.indexOf("set") || !R(e["get" + t.substr(3)]) ? t : "get" + t.substr(3)](c) : e[t]() : u : n, f = R(u) ? c ? Kn : Gn : Wn, p;
	if (L(r) && (~r.indexOf("random(") && (r = Jt(r)), r.charAt(1) === "=" && (p = Ge(d, r) + (U(d) || 0), (p || p === 0) && (r = p))), !l || d !== r || Fn) return !isNaN(d * r) && r !== "" ? (p = new rr(this._pt, e, t, +d || 0, r - (d || 0), typeof u == "boolean" ? Xn : Yn, 0, f), c && (p.fp = c), o && p.modifier(o, this, e), this._pt = p) : (!u && !(t in e) && Ce(t, r), An.call(this, e, t, d, r, f, s || E.stringFilter, c));
}, Mn = function(e, t, n, r, i) {
	if (R(e) && (e = Bn(e, i, t, n, r)), !re(e) || e.style && e.nodeType || ce(e) || se(e)) return L(e) ? Bn(e, i, t, n, r) : e;
	var a = {}, o;
	for (o in e) a[o] = Bn(e[o], i, t, n, r);
	return a;
}, Nn = function(e, t, n, r, i, a) {
	var o, s, c, l;
	if (Pe[e] && (o = new Pe[e]()).init(i, o.rawVars ? t[e] : Mn(t[e], r, i, a, n), n, r, a) !== !1 && (n._pt = s = new rr(n._pt, i, e, 0, 1, o.render, o, 0, o.priority), n !== en)) for (c = n._ptLookup[n._targets.indexOf(i)], l = o._props.length; l--;) c[o._props[l]] = s;
	return o;
}, Pn, Fn, In = function e(t, n, r) {
	var i = t.vars, a = i.ease, o = i.startAt, s = i.immediateRender, c = i.lazy, l = i.onUpdate, u = i.runBackwards, d = i.yoyoEase, f = i.keyframes, p = i.autoRevert, m = t._dur, h = t._startAt, g = t._targets, _ = t.parent, v = _ && _.data === "nested" ? _.vars.targets : g, y = t._overwrite === "auto" && !O, b = t.timeline, x = i.easeReverse || d, S, C, w, T, E, A, N, P, F, ee, I, te, L;
	if (b && (!f || !a) && (a = "none"), t._ease = Sn(a, D.ease), t._rEase = x && (Sn(x) || t._ease), t._from = !b && !!i.runBackwards, t._from && (t.ratio = 1), !b || f && !i.stagger) {
		if (P = g[0] ? Be(g[0]).harness : 0, te = P && i[P.prop], S = nt(i, Ae), h && (h._zTime < 0 && h.progress(1), n < 0 && u && s && !p ? h.render(-1, !0) : h.revert(u && m ? Oe : De), h._lazy = 0), o) {
			if (st(t._startAt = Un.set(g, Qe({
				data: "isStart",
				overwrite: !1,
				parent: _,
				immediateRender: !0,
				lazy: !h && ie(c),
				startAt: null,
				delay: 0,
				onUpdate: l && function() {
					return Qt(t, "onUpdate");
				},
				stagger: 0
			}, o))), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (k || !s && !p) && t._startAt.revert(Oe), s && m && n <= 0 && r <= 0) {
				n && (t._zTime = n);
				return;
			}
		} else if (u && m && !h) {
			if (n && (s = !1), w = Qe({
				overwrite: !1,
				data: "isFromStart",
				lazy: s && !h && ie(c),
				immediateRender: s,
				stagger: 0,
				parent: _
			}, S), te && (w[P.prop] = te), st(t._startAt = Un.set(g, w)), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (k ? t._startAt.revert(Oe) : t._startAt.render(-1, !0)), t._zTime = n, !s) e(t._startAt, M, M);
			else if (!n) return;
		}
		for (t._pt = t._ptCache = 0, c = m && ie(c) || c && !m, C = 0; C < g.length; C++) {
			if (E = g[C], N = E._gsap || ze(g)[C]._gsap, t._ptLookup[C] = ee = {}, Me[N.id] && je.length && qe(), I = v === g ? C : v.indexOf(E), P && (F = new P()).init(E, te || S, t, I, v) !== !1 && (t._pt = T = new rr(t._pt, E, F.name, 0, 1, F.render, F, 0, F.priority), F._props.forEach(function(e) {
				ee[e] = T;
			}), F.priority && (A = 1)), !P || te) for (w in S) Pe[w] && (F = Nn(w, S, t, I, E, v)) ? F.priority && (A = 1) : ee[w] = T = jn.call(t, E, w, "get", S[w], I, v, 0, i.stringFilter);
			t._op && t._op[C] && t.kill(E, t._op[C]), y && t._pt && (Pn = t, H.killTweensOf(E, ee, t.globalTime(n)), L = !t.parent, Pn = 0), t._pt && c && (Me[N.id] = 1);
		}
		A && nr(t), t._onInit && t._onInit(t);
	}
	t._onUpdate = l, t._initted = (!t._op || t._pt) && !L, f && n <= 0 && b.render(j, !0, !0);
}, Ln = function(e, t, n, r, i, a, o, s) {
	var c = (e._pt && e._ptCache || (e._ptCache = {}))[t], l, u, d, f;
	if (!c) for (c = e._ptCache[t] = [], d = e._ptLookup, f = e._targets.length; f--;) {
		if (l = d[f][t], l && l.d && l.d._pt) for (l = l.d._pt; l && l.p !== t && l.fp !== t;) l = l._next;
		if (!l) return Fn = 1, e.vars[t] = "+=0", In(e, o), Fn = 0, s ? we(t + " not eligible for reset. Try splitting into individual properties") : 1;
		c.push(l);
	}
	for (f = c.length; f--;) u = c[f], l = u._pt || u, l.s = (r || r === 0) && !i ? r : l.s + (r || 0) + a * l.c, l.c = n - l.s, u.e && (u.e = Ue(n) + U(u.e)), u.b && (u.b = l.s + U(u.b));
}, Rn = function(e, t) {
	var n = e[0] ? Be(e[0]).harness : 0, r = n && n.aliases, i, a, o, s;
	if (!r) return t;
	for (a in i = et({}, t), r) if (a in i) for (s = r[a].split(","), o = s.length; o--;) i[s[o]] = i[a];
	return i;
}, zn = function(e, t, n, r) {
	var i = t.ease || r || "power1.inOut", a, o;
	if (ce(t)) o = n[e] || (n[e] = []), t.forEach(function(e, n) {
		return o.push({
			t: n / (t.length - 1) * 100,
			v: e,
			e: i
		});
	});
	else for (a in t) o = n[a] || (n[a] = []), a === "ease" || o.push({
		t: parseFloat(e),
		v: t[a],
		e: i
	});
}, Bn = function(e, t, n, r, i) {
	return R(e) ? e.call(t, n, r, i) : L(e) && ~e.indexOf("random(") ? Jt(e) : e;
}, Vn = Re + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert", Hn = {};
He(Vn + ",id,stagger,delay,duration,paused,scrollTrigger", function(e) {
	return Hn[e] = 1;
});
var Un = /*#__PURE__*/ function(e) {
	T(t, e);
	function t(t, n, r, i) {
		var a;
		typeof n == "number" && (r.duration = n, n = r, r = null), a = e.call(this, i ? n : rt(n)) || this;
		var o = a.vars, s = o.duration, c = o.delay, l = o.immediateRender, u = o.stagger, d = o.overwrite, f = o.keyframes, p = o.defaults, m = o.scrollTrigger, h = n.parent || H, g = (ce(t) || se(t) ? z(t[0]) : "length" in n) ? [t] : It(t), _, v, y, b, x, S, C, T;
		if (a._targets = g.length ? ze(g) : we("GSAP target " + t + " not found. https://gsap.com", !E.nullTargetWarn) || [], a._ptLookup = [], a._overwrite = d, f || u || oe(s) || oe(c)) {
			n = a.vars;
			var D = n.easeReverse || n.yoyoEase;
			if (_ = a.timeline = new kn({
				data: "nested",
				defaults: p || {},
				targets: h && h.data === "nested" ? h.vars.targets : g
			}), _.kill(), _.parent = _._dp = w(a), _._start = 0, u || oe(s) || oe(c)) {
				if (b = g.length, C = u && zt(u), re(u)) for (x in u) ~Vn.indexOf(x) && (T ||= {}, T[x] = u[x]);
				for (v = 0; v < b; v++) y = nt(n, Hn), y.stagger = 0, D && (y.easeReverse = D), T && et(y, T), S = g[v], y.duration = +Bn(s, w(a), v, S, g), y.delay = (+Bn(c, w(a), v, S, g) || 0) - a._delay, !u && b === 1 && y.delay && (a._delay = c = y.delay, a._start += c, y.delay = 0), _.to(S, y, C ? C(v, S, g) : 0), _._ease = G.none;
				_.duration() ? s = c = 0 : a.timeline = 0;
			} else if (f) {
				rt(Qe(_.vars.defaults, { ease: "none" })), _._ease = Sn(f.ease || n.ease || "none");
				var k = 0, A, j, N;
				if (ce(f)) f.forEach(function(e) {
					return _.to(g, e, ">");
				}), _.duration();
				else {
					for (x in y = {}, f) x === "ease" || x === "easeEach" || zn(x, f[x], y, f.easeEach);
					for (x in y) for (A = y[x].sort(function(e, t) {
						return e.t - t.t;
					}), k = 0, v = 0; v < A.length; v++) j = A[v], N = {
						ease: j.e,
						duration: (j.t - (v ? A[v - 1].t : 0)) / 100 * s
					}, N[x] = j.v, _.to(g, N, k), k += N.duration;
					_.duration() < s && _.to({}, { duration: s - _.duration() });
				}
			}
			s || a.duration(s = _.duration());
		} else a.timeline = 0;
		return d === !0 && !O && (Pn = w(a), H.killTweensOf(g), Pn = 0), vt(h, w(a), r), n.reversed && a.reverse(), n.paused && a.paused(!0), (l || !s && !f && a._start === We(h._time) && ie(l) && dt(w(a)) && h.data !== "nested") && (a._tTime = -M, a.render(Math.max(0, -c) || 0)), m && yt(w(a), m), a;
	}
	var n = t.prototype;
	return n.render = function(e, t, n) {
		var r = this._time, i = this._tDur, a = this._dur, o = e < 0, s = e > i - M && !o ? i : e < M ? 0 : e, c, l, u, d, f, p, m, h;
		if (!a) Ct(this, e, t, n);
		else if (s !== this._tTime || !e || n || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== o || this._lazy) {
			if (c = s, h = this.timeline, this._repeat) {
				if (d = a + this._rDelay, this._repeat < -1 && o) return this.totalTime(d * 100 + e, t, n);
				if (c = We(s % d), s === i ? (u = this._repeat, c = a) : (f = We(s / d), u = ~~f, u && u === f ? (c = a, u--) : c > a && (c = a)), p = this._yoyo && u & 1, p && (c = a - c), f = pt(this._tTime, d), c === r && !n && this._initted && u === f) return this._tTime = s, this;
				u !== f && this.vars.repeatRefresh && !p && !this._lock && c !== d && this._initted && (this._lock = n = 1, this.render(We(d * u), !0).invalidate()._lock = 0);
			}
			if (!this._initted) {
				if (bt(this, o ? e : c, n, t, s)) return this._tTime = 0, this;
				if (r !== this._time && !(n && this.vars.repeatRefresh && u !== f)) return this;
				if (a !== this._dur) return this.render(e, t, n);
			}
			if (this._rEase) {
				var g = c < r;
				if (g !== this._inv) {
					var _ = g ? r : a - r;
					this._inv = g, this._from && (this.ratio = 1 - this.ratio), this._invRatio = this.ratio, this._invTime = r, this._invRecip = _ ? (g ? -1 : 1) / _ : 0, this._invScale = g ? -this.ratio : 1 - this.ratio, this._invEase = g ? this._rEase : this._ease;
				}
				this.ratio = m = this._invRatio + this._invScale * this._invEase((c - this._invTime) * this._invRecip);
			} else this.ratio = m = this._ease(c / a);
			if (this._from && (this.ratio = m = 1 - m), this._tTime = s, this._time = c, !this._act && this._ts && (this._act = 1, this._lazy = 0), !r && s && !t && !f && (Qt(this, "onStart"), this._tTime !== s)) return this;
			for (l = this._pt; l;) l.r(m, l.d), l = l._next;
			h && h.render(e < 0 ? e : h._dur * h._ease(c / this._dur), t, n) || this._startAt && (this._zTime = e), this._onUpdate && !t && (o && ut(this, e, t, n), Qt(this, "onUpdate")), this._repeat && u !== f && this.vars.onRepeat && !t && this.parent && Qt(this, "onRepeat"), (s === this._tDur || !s) && this._tTime === s && (o && !this._onUpdate && ut(this, e, !0, !0), (e || !a) && (s === this._tDur && this._ts > 0 || !s && this._ts < 0) && st(this, 1), !t && (!o || r) && (s || r || p) && (Qt(this, s === i ? "onComplete" : "onReverseComplete", !0), this._prom && !(s < i && this.timeScale() > 0) && this._prom()));
		}
		return this;
	}, n.targets = function() {
		return this._targets;
	}, n.invalidate = function(t) {
		return (!t || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(t), e.prototype.invalidate.call(this, t);
	}, n.resetTo = function(e, t, n, r, i) {
		pn || mn.wake(), this._ts || this.play();
		var a = Math.min(this._dur, (this._dp._time - this._start) * this._ts), o;
		return this._initted || In(this, a), o = this._ease(a / this._dur), Ln(this, e, t, n, r, o, a, i) ? this.resetTo(e, t, n, r, 1) : (gt(this, 0), this.parent || at(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
	}, n.kill = function(e, t) {
		if (t === void 0 && (t = "all"), !e && (!t || t === "all")) return this._lazy = this._pt = 0, this.parent ? $t(this) : this.scrollTrigger && this.scrollTrigger.kill(!!k), this;
		if (this.timeline) {
			var n = this.timeline.totalDuration();
			return this.timeline.killTweensOf(e, t, Pn && Pn.vars.overwrite !== !0)._first || $t(this), this.parent && n !== this.timeline.totalDuration() && Tt(this, this._dur * this.timeline._tDur / n, 0, 1), this;
		}
		var r = this._targets, i = e ? It(e) : r, a = this._ptLookup, o = this._pt, s, c, l, u, d, f, p;
		if ((!t || t === "all") && it(r, i)) return t === "all" && (this._pt = 0), $t(this);
		for (s = this._op = this._op || [], t !== "all" && (L(t) && (d = {}, He(t, function(e) {
			return d[e] = 1;
		}), t = d), t = Rn(r, t)), p = r.length; p--;) if (~i.indexOf(r[p])) for (d in c = a[p], t === "all" ? (s[p] = t, u = c, l = {}) : (l = s[p] = s[p] || {}, u = t), u) f = c && c[d], f && ((!("kill" in f.d) || f.d.kill(d) === !0) && ot(this, f, "_pt"), delete c[d]), l !== "all" && (l[d] = 1);
		return this._initted && !this._pt && o && $t(this), this;
	}, t.to = function(e, n) {
		return new t(e, n, arguments[2]);
	}, t.from = function(e, t) {
		return kt(1, arguments);
	}, t.delayedCall = function(e, n, r, i) {
		return new t(n, 0, {
			immediateRender: !1,
			lazy: !1,
			overwrite: !1,
			delay: e,
			onComplete: n,
			onReverseComplete: n,
			onCompleteParams: r,
			onReverseCompleteParams: r,
			callbackScope: i
		});
	}, t.fromTo = function(e, t, n) {
		return kt(2, arguments);
	}, t.set = function(e, n) {
		return n.duration = 0, n.repeatDelay || (n.repeat = 0), new t(e, n);
	}, t.killTweensOf = function(e, t, n) {
		return H.killTweensOf(e, t, n);
	}, t;
}(On);
Qe(Un.prototype, {
	_targets: [],
	_lazy: 0,
	_startAt: 0,
	_op: 0,
	_onInit: 0
}), He("staggerTo,staggerFrom,staggerFromTo", function(e) {
	Un[e] = function() {
		var t = new kn(), n = Nt.call(arguments, 0);
		return n.splice(e === "staggerFromTo" ? 5 : 4, 0, 0), t[e].apply(t, n);
	};
});
var Wn = function(e, t, n) {
	return e[t] = n;
}, Gn = function(e, t, n) {
	return e[t](n);
}, Kn = function(e, t, n, r) {
	return e[t](r.fp, n);
}, qn = function(e, t, n) {
	return e.setAttribute(t, n);
}, Jn = function(e, t) {
	return R(e[t]) ? Gn : ne(e[t]) && e.setAttribute ? qn : Wn;
}, Yn = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e6) / 1e6, t);
}, Xn = function(e, t) {
	return t.set(t.t, t.p, !!(t.s + t.c * e), t);
}, Zn = function(e, t) {
	var n = t._pt, r = "";
	if (!e && t.b) r = t.b;
	else if (e === 1 && t.e) r = t.e;
	else {
		for (; n;) r = n.p + (n.m ? n.m(n.s + n.c * e) : Math.round((n.s + n.c * e) * 1e4) / 1e4) + r, n = n._next;
		r += t.c;
	}
	t.set(t.t, t.p, r, t);
}, Qn = function(e, t) {
	for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
}, $n = function(e, t, n, r) {
	for (var i = this._pt, a; i;) a = i._next, i.p === r && i.modifier(e, t, n), i = a;
}, er = function(e) {
	for (var t = this._pt, n, r; t;) r = t._next, t.p === e && !t.op || t.op === e ? ot(this, t, "_pt") : t.dep || (n = 1), t = r;
	return !n;
}, tr = function(e, t, n, r) {
	r.mSet(e, t, r.m.call(r.tween, n, r.mt), r);
}, nr = function(e) {
	for (var t = e._pt, n, r, i, a; t;) {
		for (n = t._next, r = i; r && r.pr > t.pr;) r = r._next;
		(t._prev = r ? r._prev : a) ? t._prev._next = t : i = t, (t._next = r) ? r._prev = t : a = t, t = n;
	}
	e._pt = i;
}, rr = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a, o, s, c) {
		this.t = t, this.s = r, this.c = i, this.p = n, this.r = a || Yn, this.d = o || this, this.set = s || Wn, this.pr = c || 0, this._next = e, e && (e._prev = this);
	}
	var t = e.prototype;
	return t.modifier = function(e, t, n) {
		this.mSet = this.mSet || this.set, this.set = tr, this.m = e, this.mt = n, this.tween = t;
	}, e;
}();
He(Re + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse", function(e) {
	return Ae[e] = 1;
}), ye.TweenMax = ye.TweenLite = Un, ye.TimelineLite = ye.TimelineMax = kn, H = new kn({
	sortChildren: !1,
	defaults: D,
	autoRemoveChildren: !0,
	id: "root",
	smoothChildTiming: !0
}), E.stringFilter = fn;
var ir = [], ar = {}, or = [], sr = 0, cr = 0, lr = function(e) {
	return (ar[e] || or).map(function(e) {
		return e();
	});
}, ur = function() {
	var e = Date.now(), t = [];
	e - sr > 2 && (lr("matchMediaInit"), ir.forEach(function(e) {
		var n = e.queries, r = e.conditions, i, a, o, s;
		for (a in n) i = ge.matchMedia(n[a]).matches, i && (o = 1), i !== r[a] && (r[a] = i, s = 1);
		s && (e.revert(), o && t.push(e));
	}), lr("matchMediaRevert"), t.forEach(function(e) {
		return e.onMatch(e, function(t) {
			return e.add(null, t);
		});
	}), sr = e, lr("matchMedia"));
}, dr = /*#__PURE__*/ function() {
	function e(e, t) {
		this.selector = t && Lt(t), this.data = [], this._r = [], this.isReverted = !1, this.id = cr++, e && this.add(e);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		R(e) && (n = t, t = e, e = R);
		var r = this, i = function() {
			var e = A, i = r.selector, a;
			return e && e !== r && e.data.push(r), n && (r.selector = Lt(n)), A = r, a = t.apply(r, arguments), R(a) && r._r.push(a), A = e, r.selector = i, r.isReverted = !1, a;
		};
		return r.last = i, e === R ? i(r, function(e) {
			return r.add(null, e);
		}) : e ? r[e] = i : i;
	}, t.ignore = function(e) {
		var t = A;
		A = null, e(this), A = t;
	}, t.getTweens = function() {
		var t = [];
		return this.data.forEach(function(n) {
			return n instanceof e ? t.push.apply(t, n.getTweens()) : n instanceof Un && !(n.parent && n.parent.data === "nested") && t.push(n);
		}), t;
	}, t.clear = function() {
		this._r.length = this.data.length = 0;
	}, t.kill = function(e, t) {
		var n = this;
		if (e ? (function() {
			for (var t = n.getTweens(), r = n.data.length, i; r--;) i = n.data[r], i.data === "isFlip" && (i.revert(), i.getChildren(!0, !0, !1).forEach(function(e) {
				return t.splice(t.indexOf(e), 1);
			}));
			for (t.map(function(e) {
				return {
					g: e._dur || e._delay || e._sat && !e._sat.vars.immediateRender ? e.globalTime(0) : -Infinity,
					t: e
				};
			}).sort(function(e, t) {
				return t.g - e.g || -Infinity;
			}).forEach(function(t) {
				return t.t.revert(e);
			}), r = n.data.length; r--;) i = n.data[r], i instanceof kn ? i.data !== "nested" && (i.scrollTrigger && i.scrollTrigger.revert(), i.kill()) : !(i instanceof Un) && i.revert && i.revert(e);
			n._r.forEach(function(t) {
				return t(e, n);
			}), n.isReverted = !0;
		})() : this.data.forEach(function(e) {
			return e.kill && e.kill();
		}), this.clear(), t) for (var r = ir.length; r--;) ir[r].id === this.id && ir.splice(r, 1);
	}, t.revert = function(e) {
		this.kill(e || {});
	}, e;
}(), fr = /*#__PURE__*/ function() {
	function e(e) {
		this.contexts = [], this.scope = e, A && A.data.push(this);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		re(e) || (e = { matches: e });
		var r = new dr(0, n || this.scope), i = r.conditions = {}, a, o, s;
		for (o in A && !r.selector && (r.selector = A.selector), this.contexts.push(r), t = r.add("onMatch", t), r.queries = e, e) o === "all" ? s = 1 : (a = ge.matchMedia(e[o]), a && (ir.indexOf(r) < 0 && ir.push(r), (i[o] = a.matches) && (s = 1), a.addListener ? a.addListener(ur) : a.addEventListener("change", ur)));
		return s && t(r, function(e) {
			return r.add(null, e);
		}), this;
	}, t.revert = function(e) {
		this.kill(e || {});
	}, t.kill = function(e) {
		this.contexts.forEach(function(t) {
			return t.kill(e, !0);
		});
	}, e;
}(), pr = {
	registerPlugin: function() {
		[...arguments].forEach(function(e) {
			return nn(e);
		});
	},
	timeline: function(e) {
		return new kn(e);
	},
	getTweensOf: function(e, t) {
		return H.getTweensOf(e, t);
	},
	getProperty: function(e, t, n, r) {
		L(e) && (e = It(e)[0]);
		var i = Be(e || {}).get, a = n ? Ze : Xe;
		return n === "native" && (n = ""), e && (t ? a((Pe[t] && Pe[t].get || i)(e, t, n, r)) : function(t, n, r) {
			return a((Pe[t] && Pe[t].get || i)(e, t, n, r));
		});
	},
	quickSetter: function(e, t, n) {
		if (e = It(e), e.length > 1) {
			var r = e.map(function(e) {
				return _r.quickSetter(e, t, n);
			}), i = r.length;
			return function(e) {
				for (var t = i; t--;) r[t](e);
			};
		}
		e = e[0] || {};
		var a = Pe[t], o = Be(e), s = o.harness && (o.harness.aliases || {})[t] || t, c = a ? function(t) {
			var r = new a();
			en._pt = 0, r.init(e, n ? t + n : t, en, 0, [e]), r.render(1, r), en._pt && Qn(1, en);
		} : o.set(e, s);
		return a ? c : function(t) {
			return c(e, s, n ? t + n : t, o, 1);
		};
	},
	quickTo: function(e, t, n) {
		var r, i = _r.to(e, Qe((r = {}, r[t] = "+=0.1", r.paused = !0, r.stagger = 0, r), n || {})), a = function(e, n, r) {
			return i.resetTo(t, e, n, r);
		};
		return a.tween = i, a;
	},
	isTweening: function(e) {
		return H.getTweensOf(e, !0).length > 0;
	},
	defaults: function(e) {
		return e && e.ease && (e.ease = Sn(e.ease, D.ease)), tt(D, e || {});
	},
	config: function(e) {
		return tt(E, e || {});
	},
	registerEffect: function(e) {
		var t = e.name, n = e.effect, r = e.plugins, i = e.defaults, a = e.extendTimeline;
		(r || "").split(",").forEach(function(e) {
			return e && !Pe[e] && !ye[e] && we(t + " effect requires " + e + " plugin.");
		}), Fe[t] = function(e, t, r) {
			return n(It(e), Qe(t || {}, i), r);
		}, a && (kn.prototype[t] = function(e, n, r) {
			return this.add(Fe[t](e, re(n) ? n : (r = n) && {}, this), r);
		});
	},
	registerEase: function(e, t) {
		G[e] = Sn(t);
	},
	parseEase: function(e, t) {
		return arguments.length ? Sn(e, t) : G;
	},
	getById: function(e) {
		return H.getById(e);
	},
	exportRoot: function(e, t) {
		e === void 0 && (e = {});
		var n = new kn(e), r, i;
		for (n.smoothChildTiming = ie(e.smoothChildTiming), H.remove(n), n._dp = 0, n._time = n._tTime = H._time, r = H._first; r;) i = r._next, (t || !(!r._dur && r instanceof Un && r.vars.onComplete === r._targets[0])) && vt(n, r, r._start - r._delay), r = i;
		return vt(H, n, 0), n;
	},
	context: function(e, t) {
		return e ? new dr(e, t) : A;
	},
	matchMedia: function(e) {
		return new fr(e);
	},
	matchMediaRefresh: function() {
		return ir.forEach(function(e) {
			var t = e.conditions, n, r;
			for (r in t) t[r] && (t[r] = !1, n = 1);
			n && e.revert();
		}) || ur();
	},
	addEventListener: function(e, t) {
		var n = ar[e] || (ar[e] = []);
		~n.indexOf(t) || n.push(t);
	},
	removeEventListener: function(e, t) {
		var n = ar[e], r = n && n.indexOf(t);
		r >= 0 && n.splice(r, 1);
	},
	utils: {
		wrap: Kt,
		wrapYoyo: qt,
		distribute: zt,
		random: Vt,
		snap: W,
		normalize: Wt,
		getUnit: U,
		clamp: Mt,
		splitColor: sn,
		toArray: It,
		selector: Lt,
		mapRange: Yt,
		pipe: Ht,
		unitize: Ut,
		interpolate: Xt,
		shuffle: Rt
	},
	install: Se,
	effects: Fe,
	ticker: mn,
	updateRoot: kn.updateRoot,
	plugins: Pe,
	globalTimeline: H,
	core: {
		PropTween: rr,
		globals: Te,
		Tween: Un,
		Timeline: kn,
		Animation: On,
		getCache: Be,
		_removeLinkedListItem: ot,
		reverting: function() {
			return k;
		},
		context: function(e) {
			return e && A && (A.data.push(e), e._ctx = A), A;
		},
		suppressOverwrites: function(e) {
			return O = e;
		}
	}
};
He("to,from,fromTo,delayedCall,set,killTweensOf", function(e) {
	return pr[e] = Un[e];
}), mn.add(kn.updateRoot), en = pr.to({}, { duration: 0 });
var mr = function(e, t) {
	for (var n = e._pt; n && n.p !== t && n.op !== t && n.fp !== t;) n = n._next;
	return n;
}, hr = function(e, t) {
	var n = e._targets, r, i, a;
	for (r in t) for (i = n.length; i--;) a = e._ptLookup[i][r], (a &&= a.d) && (a._pt && (a = mr(a, r)), a && a.modifier && a.modifier(t[r], e, n[i], r));
}, gr = function(e, t) {
	return {
		name: e,
		headless: 1,
		rawVars: 1,
		init: function(e, n, r) {
			r._onInit = function(e) {
				var r, i;
				if (L(n) && (r = {}, He(n, function(e) {
					return r[e] = 1;
				}), n = r), t) {
					for (i in r = {}, n) r[i] = t(n[i]);
					n = r;
				}
				hr(e, n);
			};
		}
	};
}, _r = pr.registerPlugin({
	name: "attr",
	init: function(e, t, n, r, i) {
		var a, o, s;
		for (a in this.tween = n, t) s = e.getAttribute(a) || "", o = this.add(e, "setAttribute", (s || 0) + "", t[a], r, i, 0, 0, a), o.op = a, o.b = s, this._props.push(a);
	},
	render: function(e, t) {
		for (var n = t._pt; n;) k ? n.set(n.t, n.p, n.b, n) : n.r(e, n.d), n = n._next;
	}
}, {
	name: "endArray",
	headless: 1,
	init: function(e, t) {
		for (var n = t.length; n--;) this.add(e, n, e[n] || 0, t[n], 0, 0, 0, 0, 0, 1);
	}
}, gr("roundProps", Bt), gr("modifiers"), gr("snap", W)) || pr;
Un.version = kn.version = _r.version = "3.15.0", xe = 1, ae() && hn(), G.Power0, G.Power1, G.Power2, G.Power3, G.Power4, G.Linear, G.Quad, G.Cubic, G.Quart, G.Quint, G.Strong, G.Elastic, G.Back, G.SteppedEase, G.Bounce, G.Sine, G.Expo, G.Circ;
//#endregion
//#region node_modules/gsap/CSSPlugin.js
var vr, yr, br, xr, Sr, Cr, wr, Tr = function() {
	return typeof window < "u";
}, Er = {}, Dr = 180 / Math.PI, Or = Math.PI / 180, kr = Math.atan2, Ar = 1e8, jr = /([A-Z])/g, Mr = /(left|right|width|margin|padding|x)/i, Nr = /[\s,\(]\S/, Pr = {
	autoAlpha: "opacity,visibility",
	scale: "scaleX,scaleY",
	alpha: "opacity"
}, Fr = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, Ir = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, Lr = function(e, t) {
	return t.set(t.t, t.p, e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, Rr = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, zr = function(e, t) {
	var n = t.s + t.c * e;
	t.set(t.t, t.p, ~~(n + (n < 0 ? -.5 : .5)) + t.u, t);
}, Br = function(e, t) {
	return t.set(t.t, t.p, e ? t.e : t.b, t);
}, Vr = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : t.b, t);
}, Hr = function(e, t, n) {
	return e.style[t] = n;
}, Ur = function(e, t, n) {
	return e.style.setProperty(t, n);
}, Wr = function(e, t, n) {
	return e._gsap[t] = n;
}, Gr = function(e, t, n) {
	return e._gsap.scaleX = e._gsap.scaleY = n;
}, Kr = function(e, t, n, r, i) {
	var a = e._gsap;
	a.scaleX = a.scaleY = n, a.renderTransform(i, a);
}, qr = function(e, t, n, r, i) {
	var a = e._gsap;
	a[t] = n, a.renderTransform(i, a);
}, Jr = "transform", Yr = Jr + "Origin", Xr = function e(t, n) {
	var r = this, i = this.target, a = i.style, o = i._gsap;
	if (t in Er && a) {
		if (this.tfm = this.tfm || {}, t !== "transform") t = Pr[t] || t, ~t.indexOf(",") ? t.split(",").forEach(function(e) {
			return r.tfm[e] = hi(i, e);
		}) : this.tfm[t] = o.x ? o[t] : hi(i, t), t === Yr && (this.tfm.zOrigin = o.zOrigin);
		else return Pr.transform.split(",").forEach(function(t) {
			return e.call(r, t, n);
		});
		if (this.props.indexOf(Jr) >= 0) return;
		o.svg && (this.svgo = i.getAttribute("data-svg-origin"), this.props.push(Yr, n, "")), t = Jr;
	}
	(a || n) && this.props.push(t, n, a[t]);
}, Zr = function(e) {
	e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, Qr = function() {
	for (var e = this.props, t = this.target, n = t.style, r = t._gsap, i = 0, a; i < e.length; i += 3) e[i + 1] ? e[i + 1] === 2 ? t[e[i]](e[i + 2]) : t[e[i]] = e[i + 2] : e[i + 2] ? n[e[i]] = e[i + 2] : n.removeProperty(e[i].substr(0, 2) === "--" ? e[i] : e[i].replace(jr, "-$1").toLowerCase());
	if (this.tfm) {
		for (a in this.tfm) r[a] = this.tfm[a];
		r.svg && (r.renderTransform(), t.setAttribute("data-svg-origin", this.svgo || "")), i = wr(), (!i || !i.isStart) && !n[Jr] && (Zr(n), r.zOrigin && n[Yr] && (n[Yr] += " " + r.zOrigin + "px", r.zOrigin = 0, r.renderTransform()), r.uncache = 1);
	}
}, $r = function(e, t) {
	var n = {
		target: e,
		props: [],
		revert: Qr,
		save: Xr
	};
	return e._gsap || _r.core.getCache(e), t && e.style && e.nodeType && t.split(",").forEach(function(e) {
		return n.save(e);
	}), n;
}, ei, ti = function(e, t) {
	var n = yr.createElementNS ? yr.createElementNS((t || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : yr.createElement(e);
	return n && n.style ? n : yr.createElement(e);
}, ni = function e(t, n, r) {
	var i = getComputedStyle(t);
	return i[n] || i.getPropertyValue(n.replace(jr, "-$1").toLowerCase()) || i.getPropertyValue(n) || !r && e(t, ii(n) || n, 1) || "";
}, ri = "O,Moz,ms,Ms,Webkit".split(","), ii = function(e, t, n) {
	var r = (t || Sr).style, i = 5;
	if (e in r && !n) return e;
	for (e = e.charAt(0).toUpperCase() + e.substr(1); i-- && !(ri[i] + e in r););
	return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? ri[i] : "") + e;
}, ai = function() {
	Tr() && window.document && (vr = window, yr = vr.document, br = yr.documentElement, Sr = ti("div") || { style: {} }, ti("div"), Jr = ii(Jr), Yr = Jr + "Origin", Sr.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", ei = !!ii("perspective"), wr = _r.core.reverting, xr = 1);
}, oi = function(e) {
	var t = e.ownerSVGElement, n = ti("svg", t && t.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), r = e.cloneNode(!0), i;
	r.style.display = "block", n.appendChild(r), br.appendChild(n);
	try {
		i = r.getBBox();
	} catch {}
	return n.removeChild(r), br.removeChild(n), i;
}, si = function(e, t) {
	for (var n = t.length; n--;) if (e.hasAttribute(t[n])) return e.getAttribute(t[n]);
}, ci = function(e) {
	var t, n;
	try {
		t = e.getBBox();
	} catch {
		t = oi(e), n = 1;
	}
	return t && (t.width || t.height) || n || (t = oi(e)), t && !t.width && !t.x && !t.y ? {
		x: +si(e, [
			"x",
			"cx",
			"x1"
		]) || 0,
		y: +si(e, [
			"y",
			"cy",
			"y1"
		]) || 0,
		width: 0,
		height: 0
	} : t;
}, li = function(e) {
	return !(!e.getCTM || e.parentNode && !e.ownerSVGElement || !ci(e));
}, ui = function(e, t) {
	if (t) {
		var n = e.style, r;
		t in Er && t !== Yr && (t = Jr), n.removeProperty ? (r = t.substr(0, 2), (r === "ms" || t.substr(0, 6) === "webkit") && (t = "-" + t), n.removeProperty(r === "--" ? t : t.replace(jr, "-$1").toLowerCase())) : n.removeAttribute(t);
	}
}, di = function(e, t, n, r, i, a) {
	var o = new rr(e._pt, t, n, 0, 1, a ? Vr : Br);
	return e._pt = o, o.b = r, o.e = i, e._props.push(n), o;
}, fi = {
	deg: 1,
	rad: 1,
	turn: 1
}, pi = {
	grid: 1,
	flex: 1
}, mi = function e(t, n, r, i) {
	var a = parseFloat(r) || 0, o = (r + "").trim().substr((a + "").length) || "px", s = Sr.style, c = Mr.test(n), l = t.tagName.toLowerCase() === "svg", u = (l ? "client" : "offset") + (c ? "Width" : "Height"), d = 100, f = i === "px", p = i === "%", m, h, g, _;
	if (i === o || !a || fi[i] || fi[o]) return a;
	if (o !== "px" && !f && (a = e(t, n, r, "px")), _ = t.getCTM && li(t), (p || o === "%") && (Er[n] || ~n.indexOf("adius"))) return m = _ ? t.getBBox()[c ? "width" : "height"] : t[u], Ue(p ? a / m * d : a / 100 * m);
	if (s[c ? "width" : "height"] = d + (f ? o : i), h = i !== "rem" && ~n.indexOf("adius") || i === "em" && t.appendChild && !l ? t : t.parentNode, _ && (h = (t.ownerSVGElement || {}).parentNode), (!h || h === yr || !h.appendChild) && (h = yr.body), g = h._gsap, g && p && g.width && c && g.time === mn.time && !g.uncache) return Ue(a / g.width * d);
	if (p && (n === "height" || n === "width")) {
		var v = t.style[n];
		t.style[n] = d + i, m = t[u], v ? t.style[n] = v : ui(t, n);
	} else (p || o === "%") && !pi[ni(h, "display")] && (s.position = ni(t, "position")), h === t && (s.position = "static"), h.appendChild(Sr), m = Sr[u], h.removeChild(Sr), s.position = "absolute";
	return c && p && (g = Be(h), g.time = mn.time, g.width = h[u]), Ue(f ? m * a / d : m && a ? d / m * a : 0);
}, hi = function(e, t, n, r) {
	var i;
	return xr || ai(), t in Pr && t !== "transform" && (t = Pr[t], ~t.indexOf(",") && (t = t.split(",")[0])), Er[t] && t !== "transform" ? (i = Di(e, r), i = t === "transformOrigin" ? i.svg ? i.origin : Oi(ni(e, Yr)) + " " + i.zOrigin + "px" : i[t]) : (i = e.style[t], (!i || i === "auto" || r || ~(i + "").indexOf("calc(")) && (i = bi[t] && bi[t](e, t, n) || ni(e, t) || Ve(e, t) || +(t === "opacity"))), n && !~(i + "").trim().indexOf(" ") ? mi(e, t, i, n) + n : i;
}, gi = function(e, t, n, r) {
	if (!n || n === "none") {
		var i = ii(t, e, 1), a = i && ni(e, i, 1);
		a && a !== n ? (t = i, n = a) : t === "borderColor" && (n = ni(e, "borderTopColor"));
	}
	var o = new rr(this._pt, e.style, t, 0, 1, Zn), s = 0, c = 0, l, u, d, f, p, m, h, g, _, v, y, b;
	if (o.b = n, o.e = r, n += "", r += "", r.substring(0, 6) === "var(--" && (r = ni(e, r.substring(4, r.indexOf(")")))), r === "auto" && (m = e.style[t], e.style[t] = r, r = ni(e, t) || r, m ? e.style[t] = m : ui(e, t)), l = [n, r], fn(l), n = l[0], r = l[1], d = n.match(de) || [], b = r.match(de) || [], b.length) {
		for (; u = de.exec(r);) h = u[0], _ = r.substring(s, u.index), p ? p = (p + 1) % 5 : (_.substr(-5) === "rgba(" || _.substr(-5) === "hsla(") && (p = 1), h !== (m = d[c++] || "") && (f = parseFloat(m) || 0, y = m.substr((f + "").length), h.charAt(1) === "=" && (h = Ge(f, h) + y), g = parseFloat(h), v = h.substr((g + "").length), s = de.lastIndex - v.length, v || (v = v || E.units[t] || y, s === r.length && (r += v, o.e += v)), y !== v && (f = mi(e, t, m, v) || 0), o._pt = {
			_next: o._pt,
			p: _ || c === 1 ? _ : ",",
			s: f,
			c: g - f,
			m: p && p < 4 || t === "zIndex" ? Math.round : 0
		});
		o.c = s < r.length ? r.substring(s, r.length) : "";
	} else o.r = t === "display" && r === "none" ? Vr : Br;
	return pe.test(r) && (o.e = 0), this._pt = o, o;
}, _i = {
	top: "0%",
	bottom: "100%",
	left: "0%",
	right: "100%",
	center: "50%"
}, vi = function(e) {
	var t = e.split(" "), n = t[0], r = t[1] || "50%";
	return (n === "top" || n === "bottom" || r === "left" || r === "right") && (e = n, n = r, r = e), t[0] = _i[n] || n, t[1] = _i[r] || r, t.join(" ");
}, yi = function(e, t) {
	if (t.tween && t.tween._time === t.tween._dur) {
		var n = t.t, r = n.style, i = t.u, a = n._gsap, o, s, c;
		if (i === "all" || i === !0) r.cssText = "", s = 1;
		else for (i = i.split(","), c = i.length; --c > -1;) o = i[c], Er[o] && (s = 1, o = o === "transformOrigin" ? Yr : Jr), ui(n, o);
		s && (ui(n, Jr), a && (a.svg && n.removeAttribute("transform"), r.scale = r.rotate = r.translate = "none", Di(n, 1), a.uncache = 1, Zr(r)));
	}
}, bi = { clearProps: function(e, t, n, r, i) {
	if (i.data !== "isFromStart") {
		var a = e._pt = new rr(e._pt, t, n, 0, 0, yi);
		return a.u = r, a.pr = -10, a.tween = i, e._props.push(n), 1;
	}
} }, xi = [
	1,
	0,
	0,
	1,
	0,
	0
], Si = {}, Ci = function(e) {
	return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, wi = function(e) {
	var t = ni(e, Jr);
	return Ci(t) ? xi : t.substr(7).match(V).map(Ue);
}, Ti = function(e, t) {
	var n = e._gsap || Be(e), r = e.style, i = wi(e), a, o, s, c;
	return n.svg && e.getAttribute("transform") ? (s = e.transform.baseVal.consolidate().matrix, i = [
		s.a,
		s.b,
		s.c,
		s.d,
		s.e,
		s.f
	], i.join(",") === "1,0,0,1,0,0" ? xi : i) : (i === xi && !e.offsetParent && e !== br && !n.svg && (s = r.display, r.display = "block", a = e.parentNode, (!a || !e.offsetParent && !e.getBoundingClientRect().width) && (c = 1, o = e.nextElementSibling, br.appendChild(e)), i = wi(e), s ? r.display = s : ui(e, "display"), c && (o ? a.insertBefore(e, o) : a ? a.appendChild(e) : br.removeChild(e))), t && i.length > 6 ? [
		i[0],
		i[1],
		i[4],
		i[5],
		i[12],
		i[13]
	] : i);
}, Ei = function(e, t, n, r, i, a) {
	var o = e._gsap, s = i || Ti(e, !0), c = o.xOrigin || 0, l = o.yOrigin || 0, u = o.xOffset || 0, d = o.yOffset || 0, f = s[0], p = s[1], m = s[2], h = s[3], g = s[4], _ = s[5], v = t.split(" "), y = parseFloat(v[0]) || 0, b = parseFloat(v[1]) || 0, x, S, C, w;
	n ? s !== xi && (S = f * h - p * m) && (C = h / S * y + b * (-m / S) + (m * _ - h * g) / S, w = y * (-p / S) + f / S * b - (f * _ - p * g) / S, y = C, b = w) : (x = ci(e), y = x.x + (~v[0].indexOf("%") ? y / 100 * x.width : y), b = x.y + (~(v[1] || v[0]).indexOf("%") ? b / 100 * x.height : b)), r || r !== !1 && o.smooth ? (g = y - c, _ = b - l, o.xOffset = u + (g * f + _ * m) - g, o.yOffset = d + (g * p + _ * h) - _) : o.xOffset = o.yOffset = 0, o.xOrigin = y, o.yOrigin = b, o.smooth = !!r, o.origin = t, o.originIsAbsolute = !!n, e.style[Yr] = "0px 0px", a && (di(a, o, "xOrigin", c, y), di(a, o, "yOrigin", l, b), di(a, o, "xOffset", u, o.xOffset), di(a, o, "yOffset", d, o.yOffset)), e.setAttribute("data-svg-origin", y + " " + b);
}, Di = function(e, t) {
	var n = e._gsap || new Dn(e);
	if ("x" in n && !t && !n.uncache) return n;
	var r = e.style, i = n.scaleX < 0, a = "px", o = "deg", s = getComputedStyle(e), c = ni(e, Yr) || "0", l = u = d = m = h = g = _ = v = y = 0, u, d, f = p = 1, p, m, h, g, _, v, y, b, x, S, C, w, T, D, O, k, A, j, M, N, P, F, ee, I, te, L, R, z;
	return n.svg = !!(e.getCTM && li(e)), s.translate && ((s.translate !== "none" || s.scale !== "none" || s.rotate !== "none") && (r[Jr] = (s.translate === "none" ? "" : "translate3d(" + (s.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") ") + (s.rotate === "none" ? "" : "rotate(" + s.rotate + ") ") + (s.scale === "none" ? "" : "scale(" + s.scale.split(" ").join(",") + ") ") + (s[Jr] === "none" ? "" : s[Jr])), r.scale = r.rotate = r.translate = "none"), S = Ti(e, n.svg), n.svg && (n.uncache ? (P = e.getBBox(), c = n.xOrigin - P.x + "px " + (n.yOrigin - P.y) + "px", N = "") : N = !t && e.getAttribute("data-svg-origin"), Ei(e, N || c, !!N || n.originIsAbsolute, n.smooth !== !1, S)), b = n.xOrigin || 0, x = n.yOrigin || 0, S !== xi && (D = S[0], O = S[1], k = S[2], A = S[3], l = j = S[4], u = M = S[5], S.length === 6 ? (f = Math.sqrt(D * D + O * O), p = Math.sqrt(A * A + k * k), m = D || O ? kr(O, D) * Dr : 0, _ = k || A ? kr(k, A) * Dr + m : 0, _ && (p *= Math.abs(Math.cos(_ * Or))), n.svg && (l -= b - (b * D + x * k), u -= x - (b * O + x * A))) : (z = S[6], L = S[7], ee = S[8], I = S[9], te = S[10], R = S[11], l = S[12], u = S[13], d = S[14], C = kr(z, te), h = C * Dr, C && (w = Math.cos(-C), T = Math.sin(-C), N = j * w + ee * T, P = M * w + I * T, F = z * w + te * T, ee = j * -T + ee * w, I = M * -T + I * w, te = z * -T + te * w, R = L * -T + R * w, j = N, M = P, z = F), C = kr(-k, te), g = C * Dr, C && (w = Math.cos(-C), T = Math.sin(-C), N = D * w - ee * T, P = O * w - I * T, F = k * w - te * T, R = A * T + R * w, D = N, O = P, k = F), C = kr(O, D), m = C * Dr, C && (w = Math.cos(C), T = Math.sin(C), N = D * w + O * T, P = j * w + M * T, O = O * w - D * T, M = M * w - j * T, D = N, j = P), h && Math.abs(h) + Math.abs(m) > 359.9 && (h = m = 0, g = 180 - g), f = Ue(Math.sqrt(D * D + O * O + k * k)), p = Ue(Math.sqrt(M * M + z * z)), C = kr(j, M), _ = Math.abs(C) > 2e-4 ? C * Dr : 0, y = R ? 1 / (R < 0 ? -R : R) : 0), n.svg && (N = e.getAttribute("transform"), n.forceCSS = e.setAttribute("transform", "") || !Ci(ni(e, Jr)), N && e.setAttribute("transform", N))), Math.abs(_) > 90 && Math.abs(_) < 270 && (i ? (f *= -1, _ += m <= 0 ? 180 : -180, m += m <= 0 ? 180 : -180) : (p *= -1, _ += _ <= 0 ? 180 : -180)), t ||= n.uncache, n.x = l - ((n.xPercent = l && (!t && n.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0))) ? e.offsetWidth * n.xPercent / 100 : 0) + a, n.y = u - ((n.yPercent = u && (!t && n.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-u) ? -50 : 0))) ? e.offsetHeight * n.yPercent / 100 : 0) + a, n.z = d + a, n.scaleX = Ue(f), n.scaleY = Ue(p), n.rotation = Ue(m) + o, n.rotationX = Ue(h) + o, n.rotationY = Ue(g) + o, n.skewX = _ + o, n.skewY = v + o, n.transformPerspective = y + a, (n.zOrigin = parseFloat(c.split(" ")[2]) || !t && n.zOrigin || 0) && (r[Yr] = Oi(c)), n.xOffset = n.yOffset = 0, n.force3D = E.force3D, n.renderTransform = n.svg ? Fi : ei ? Pi : Ai, n.uncache = 0, n;
}, Oi = function(e) {
	return (e = e.split(" "))[0] + " " + e[1];
}, ki = function(e, t, n) {
	var r = U(t);
	return Ue(parseFloat(t) + parseFloat(mi(e, "x", n + "px", r))) + r;
}, Ai = function(e, t) {
	t.z = "0px", t.rotationY = t.rotationX = "0deg", t.force3D = 0, Pi(e, t);
}, ji = "0deg", Mi = "0px", Ni = ") ", Pi = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.z, c = n.rotation, l = n.rotationY, u = n.rotationX, d = n.skewX, f = n.skewY, p = n.scaleX, m = n.scaleY, h = n.transformPerspective, g = n.force3D, _ = n.target, v = n.zOrigin, y = "", b = g === "auto" && e && e !== 1 || g === !0;
	if (v && (u !== ji || l !== ji)) {
		var x = parseFloat(l) * Or, S = Math.sin(x), C = Math.cos(x), w;
		x = parseFloat(u) * Or, w = Math.cos(x), a = ki(_, a, S * w * -v), o = ki(_, o, -Math.sin(x) * -v), s = ki(_, s, C * w * -v + v);
	}
	h !== Mi && (y += "perspective(" + h + Ni), (r || i) && (y += "translate(" + r + "%, " + i + "%) "), (b || a !== Mi || o !== Mi || s !== Mi) && (y += s !== Mi || b ? "translate3d(" + a + ", " + o + ", " + s + ") " : "translate(" + a + ", " + o + Ni), c !== ji && (y += "rotate(" + c + Ni), l !== ji && (y += "rotateY(" + l + Ni), u !== ji && (y += "rotateX(" + u + Ni), (d !== ji || f !== ji) && (y += "skew(" + d + ", " + f + Ni), (p !== 1 || m !== 1) && (y += "scale(" + p + ", " + m + Ni), _.style[Jr] = y || "translate(0, 0)";
}, Fi = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.rotation, c = n.skewX, l = n.skewY, u = n.scaleX, d = n.scaleY, f = n.target, p = n.xOrigin, m = n.yOrigin, h = n.xOffset, g = n.yOffset, _ = n.forceCSS, v = parseFloat(a), y = parseFloat(o), b, x, S, C, w;
	s = parseFloat(s), c = parseFloat(c), l = parseFloat(l), l && (l = parseFloat(l), c += l, s += l), s || c ? (s *= Or, c *= Or, b = Math.cos(s) * u, x = Math.sin(s) * u, S = Math.sin(s - c) * -d, C = Math.cos(s - c) * d, c && (l *= Or, w = Math.tan(c - l), w = Math.sqrt(1 + w * w), S *= w, C *= w, l && (w = Math.tan(l), w = Math.sqrt(1 + w * w), b *= w, x *= w)), b = Ue(b), x = Ue(x), S = Ue(S), C = Ue(C)) : (b = u, C = d, x = S = 0), (v && !~(a + "").indexOf("px") || y && !~(o + "").indexOf("px")) && (v = mi(f, "x", a, "px"), y = mi(f, "y", o, "px")), (p || m || h || g) && (v = Ue(v + p - (p * b + m * S) + h), y = Ue(y + m - (p * x + m * C) + g)), (r || i) && (w = f.getBBox(), v = Ue(v + r / 100 * w.width), y = Ue(y + i / 100 * w.height)), w = "matrix(" + b + "," + x + "," + S + "," + C + "," + v + "," + y + ")", f.setAttribute("transform", w), _ && (f.style[Jr] = w);
}, Ii = function(e, t, n, r, i) {
	var a = 360, o = L(i), s = parseFloat(i) * (o && ~i.indexOf("rad") ? Dr : 1) - r, c = r + s + "deg", l, u;
	return o && (l = i.split("_")[1], l === "short" && (s %= a, s !== s % (a / 2) && (s += s < 0 ? a : -a)), l === "cw" && s < 0 ? s = (s + a * Ar) % a - ~~(s / a) * a : l === "ccw" && s > 0 && (s = (s - a * Ar) % a - ~~(s / a) * a)), e._pt = u = new rr(e._pt, t, n, r, s, Ir), u.e = c, u.u = "deg", e._props.push(n), u;
}, Li = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, Ri = function(e, t, n) {
	var r = Li({}, n._gsap), i = "perspective,force3D,transformOrigin,svgOrigin", a = n.style, o, s, c, l, u, d, f, p;
	for (s in r.svg ? (c = n.getAttribute("transform"), n.setAttribute("transform", ""), a[Jr] = t, o = Di(n, 1), ui(n, Jr), n.setAttribute("transform", c)) : (c = getComputedStyle(n)[Jr], a[Jr] = t, o = Di(n, 1), a[Jr] = c), Er) c = r[s], l = o[s], c !== l && i.indexOf(s) < 0 && (f = U(c), p = U(l), u = f === p ? parseFloat(c) : mi(n, s, c, p), d = parseFloat(l), e._pt = new rr(e._pt, o, s, u, d - u, Fr), e._pt.u = p || 0, e._props.push(s));
	Li(o, r);
};
He("padding,margin,Width,Radius", function(e, t) {
	var n = "Top", r = "Right", i = "Bottom", a = "Left", o = (t < 3 ? [
		n,
		r,
		i,
		a
	] : [
		n + a,
		n + r,
		i + r,
		i + a
	]).map(function(n) {
		return t < 2 ? e + n : "border" + n + e;
	});
	bi[t > 1 ? "border" + e : e] = function(e, t, n, r, i) {
		var a, s;
		if (arguments.length < 4) return a = o.map(function(t) {
			return hi(e, t, n);
		}), s = a.join(" "), s.split(a[0]).length === 5 ? a[0] : s;
		a = (r + "").split(" "), s = {}, o.forEach(function(e, t) {
			return s[e] = a[t] = a[t] || a[(t - 1) / 2 | 0];
		}), e.init(t, s, i);
	};
});
var zi = {
	name: "css",
	register: ai,
	targetTest: function(e) {
		return e.style && e.nodeType;
	},
	init: function(e, t, n, r, i) {
		var a = this._props, o = e.style, s = n.vars.startAt, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w;
		for (m in xr || ai(), this.styles = this.styles || $r(e), C = this.styles.props, this.tween = n, t) if (m !== "autoRound" && (l = t[m], !(Pe[m] && Nn(m, t, n, r, e, i)))) {
			if (f = typeof l, p = bi[m], f === "function" && (l = l.call(n, r, e, i), f = typeof l), f === "string" && ~l.indexOf("random(") && (l = Jt(l)), p) p(this, e, m, l, n) && (S = 1);
			else if (m.substr(0, 2) === "--") c = (getComputedStyle(e).getPropertyValue(m) + "").trim(), l += "", un.lastIndex = 0, un.test(c) || (h = U(c), g = U(l), g ? h !== g && (c = mi(e, m, c, g) + g) : h && (l += h)), this.add(o, "setProperty", c, l, r, i, 0, 0, m), a.push(m), C.push(m, 0, o[m]);
			else if (f !== "undefined") {
				if (s && m in s ? (c = typeof s[m] == "function" ? s[m].call(n, r, e, i) : s[m], L(c) && ~c.indexOf("random(") && (c = Jt(c)), U(c + "") || c === "auto" || (c += E.units[m] || U(hi(e, m)) || ""), (c + "").charAt(1) === "=" && (c = hi(e, m))) : c = hi(e, m), d = parseFloat(c), _ = f === "string" && l.charAt(1) === "=" && l.substr(0, 2), _ && (l = l.substr(2)), u = parseFloat(l), m in Pr && (m === "autoAlpha" && (d === 1 && hi(e, "visibility") === "hidden" && u && (d = 0), C.push("visibility", 0, o.visibility), di(this, o, "visibility", d ? "inherit" : "hidden", u ? "inherit" : "hidden", !u)), m !== "scale" && m !== "transform" && (m = Pr[m], ~m.indexOf(",") && (m = m.split(",")[0]))), v = m in Er, v) {
					if (this.styles.save(m), w = l, f === "string" && l.substring(0, 6) === "var(--") {
						if (l = ni(e, l.substring(4, l.indexOf(")"))), l.substring(0, 5) === "calc(") {
							var T = e.style.perspective;
							e.style.perspective = l, l = ni(e, "perspective"), T ? e.style.perspective = T : ui(e, "perspective");
						}
						u = parseFloat(l);
					}
					if (y || (b = e._gsap, b.renderTransform && !t.parseTransform || Di(e, t.parseTransform), x = t.smoothOrigin !== !1 && b.smooth, y = this._pt = new rr(this._pt, o, Jr, 0, 1, b.renderTransform, b, 0, -1), y.dep = 1), m === "scale") this._pt = new rr(this._pt, b, "scaleY", b.scaleY, (_ ? Ge(b.scaleY, _ + u) : u) - b.scaleY || 0, Fr), this._pt.u = 0, a.push("scaleY", m), m += "X";
					else if (m === "transformOrigin") {
						C.push(Yr, 0, o[Yr]), l = vi(l), b.svg ? Ei(e, l, 0, x, 0, this) : (g = parseFloat(l.split(" ")[2]) || 0, g !== b.zOrigin && di(this, b, "zOrigin", b.zOrigin, g), di(this, o, m, Oi(c), Oi(l)));
						continue;
					} else if (m === "svgOrigin") {
						Ei(e, l, 1, x, 0, this);
						continue;
					} else if (m in Si) {
						Ii(this, b, m, d, _ ? Ge(d, _ + l) : l);
						continue;
					} else if (m === "smoothOrigin") {
						di(this, b, "smooth", b.smooth, l);
						continue;
					} else if (m === "force3D") {
						b[m] = l;
						continue;
					} else if (m === "transform") {
						Ri(this, l, e);
						continue;
					}
				} else m in o || (m = ii(m) || m);
				if (v || (u || u === 0) && (d || d === 0) && !Nr.test(l) && m in o) h = (c + "").substr((d + "").length), u ||= 0, g = U(l) || (m in E.units ? E.units[m] : h), h !== g && (d = mi(e, m, c, g)), this._pt = new rr(this._pt, v ? b : o, m, d, (_ ? Ge(d, _ + u) : u) - d, !v && (g === "px" || m === "zIndex") && t.autoRound !== !1 ? zr : Fr), this._pt.u = g || 0, v && w !== l ? (this._pt.b = c, this._pt.e = w, this._pt.r = Rr) : h !== g && g !== "%" && (this._pt.b = c, this._pt.r = Lr);
				else if (m in o) gi.call(this, e, m, c, _ ? _ + l : l);
				else if (m in e) this.add(e, m, c || e[m], _ ? _ + l : l, r, i);
				else if (m !== "parseTransform") {
					Ce(m, l);
					continue;
				}
				v || (m in o ? C.push(m, 0, o[m]) : typeof e[m] == "function" ? C.push(m, 2, e[m]()) : C.push(m, 1, c || e[m])), a.push(m);
			}
		}
		S && nr(this);
	},
	render: function(e, t) {
		if (t.tween._time || !wr()) for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
		else t.styles.revert();
	},
	get: hi,
	aliases: Pr,
	getSetter: function(e, t, n) {
		var r = Pr[t];
		return r && r.indexOf(",") < 0 && (t = r), t in Er && t !== Yr && (e._gsap.x || hi(e, "x")) ? n && Cr === n ? t === "scale" ? Gr : Wr : (Cr = n || {}) && (t === "scale" ? Kr : qr) : e.style && !ne(e.style[t]) ? Hr : ~t.indexOf("-") ? Ur : Jn(e, t);
	},
	core: {
		_removeProperty: ui,
		_getMatrix: Ti
	}
};
_r.utils.checkPrefix = ii, _r.core.getStyleSaver = $r, (function(e, t, n, r) {
	var i = He(e + "," + t + "," + n, function(e) {
		Er[e] = 1;
	});
	He(t, function(e) {
		E.units[e] = "deg", Si[e] = 1;
	}), Pr[i[13]] = e + "," + t, He(r, function(e) {
		var t = e.split(":");
		Pr[t[1]] = i[t[0]];
	});
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY"), He("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(e) {
	E.units[e] = "px";
}), _r.registerPlugin(zi);
//#endregion
//#region node_modules/gsap/index.js
var Bi = _r.registerPlugin(zi) || _r;
Bi.core.Tween;
//#endregion
//#region node_modules/gsap/DrawSVGPlugin.js
var Vi, Hi, Ui, Wi, Gi, Ki, qi, Ji, Yi = function() {
	return typeof window < "u";
}, Xi = function() {
	return Vi || Yi() && (Vi = window.gsap) && Vi.registerPlugin && Vi;
}, Zi = /[-+=\.]*\d+[\.e\-\+]*\d*[e\-\+]*\d*/gi, Qi = {
	rect: ["width", "height"],
	circle: ["r", "r"],
	ellipse: ["rx", "ry"],
	line: ["x2", "y2"]
}, K = function(e) {
	return Math.round(e * 1e4) / 1e4;
}, $i = function(e) {
	return parseFloat(e) || 0;
}, ea = function(e, t) {
	var n = $i(e);
	return ~e.indexOf("%") ? n / 100 * t : n;
}, ta = function(e, t) {
	return $i(e.getAttribute(t));
}, na = Math.sqrt, ra = function(e, t, n, r, i, a) {
	return na((($i(n) - $i(e)) * i) ** 2 + (($i(r) - $i(t)) * a) ** 2);
}, ia = function(e) {
	return console.warn(e);
}, aa = function(e) {
	return e.getAttribute("vector-effect") === "non-scaling-stroke";
}, oa = 1, sa = function(e, t, n) {
	var r = e.indexOf(" "), i, a;
	return r < 0 ? (i = n === void 0 ? e : n + "", a = e) : (i = e.substr(0, r), a = e.substr(r + 1)), i = ea(i, t), a = ea(a, t), i > a ? [a, i] : [i, a];
}, ca = function(e) {
	if (e = Hi(e)[0], !e) return 0;
	var t = e.tagName.toLowerCase(), n = e.style, r = 1, i = 1, a, o, s, c, l, u, d;
	aa(e) && (i = e.getScreenCTM(), r = na(i.a * i.a + i.b * i.b), i = na(i.d * i.d + i.c * i.c));
	try {
		o = e.getBBox();
	} catch {
		ia("Some browsers won't measure invisible elements (like display:none or masks inside defs).");
	}
	var f = o || {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	}, p = f.x, m = f.y, h = f.width, g = f.height;
	if ((!o || !h && !g) && Qi[t] && (h = ta(e, Qi[t][0]), g = ta(e, Qi[t][1]), t !== "rect" && t !== "line" && (h *= 2, g *= 2), t === "line" && (p = ta(e, "x1"), m = ta(e, "y1"), h = Math.abs(h - p), g = Math.abs(g - m))), t === "path") c = n.strokeDasharray, n.strokeDasharray = "none", a = e.getTotalLength() || 0, K(r) !== K(i) && !Ki && (Ki = 1) && ia("Warning: <path> length cannot be measured when vector-effect is non-scaling-stroke and the element isn't proportionally scaled."), a *= (r + i) / 2, n.strokeDasharray = c;
	else if (t === "rect") a = h * 2 * r + g * 2 * i;
	else if (t === "line") a = ra(p, m, p + h, m + g, r, i);
	else if (t === "polyline" || t === "polygon") for (s = e.getAttribute("points").match(Zi) || [], t === "polygon" && s.push(s[0], s[1]), a = 0, l = 2; l < s.length; l += 2) a += ra(s[l - 2], s[l - 1], s[l], s[l + 1], r, i) || 0;
	else (t === "circle" || t === "ellipse") && (u = h / 2 * r, d = g / 2 * i, a = Math.PI * (3 * (u + d) - na((3 * u + d) * (u + 3 * d))));
	return a || 0;
}, la = function(e, t) {
	if (e = Hi(e)[0], !e) return [0, 0];
	t ||= ca(e) + 1;
	var n = Ui.getComputedStyle(e), r = n.strokeDasharray || "", i = $i(n.strokeDashoffset), a = r.indexOf(",");
	return a < 0 && (a = r.indexOf(" ")), r = a < 0 ? t : $i(r.substr(0, a)), r > t && (r = t), [-i || 0, r - i || 0];
}, ua = function() {
	Yi() && (Ui = window, Gi = Vi = Xi(), Hi = Vi.utils.toArray, qi = Vi.core.getStyleSaver, Ji = Vi.core.reverting || function() {}, Wi = ((Ui.navigator || {}).userAgent || "").indexOf("Edge") !== -1);
}, da = {
	version: "3.15.0",
	name: "drawSVG",
	register: function(e) {
		Vi = e, ua();
	},
	init: function(e, t, n, r, i) {
		if (!e.getBBox) return !1;
		Gi || ua();
		var a = ca(e), o, s, c;
		return this.styles = qi && qi(e, "strokeDashoffset,strokeDasharray,strokeMiterlimit"), this.tween = n, this._style = e.style, this._target = e, t + "" == "true" ? t = "0 100%" : t ? (t + "").indexOf(" ") === -1 && (t = "0 " + t) : t = "0 0", o = la(e, a), s = sa(t, a, o[0]), this._length = K(a), this._dash = K(o[1] - o[0]), this._offset = K(-o[0]), this._dashPT = this.add(this, "_dash", this._dash, K(s[1] - s[0]), 0, 0, 0, 0, 0, 1), this._offsetPT = this.add(this, "_offset", this._offset, K(-s[0]), 0, 0, 0, 0, 0, 1), Wi && (c = Ui.getComputedStyle(e), c.strokeLinecap !== c.strokeLinejoin && (s = $i(c.strokeMiterlimit), this.add(e.style, "strokeMiterlimit", s, s + .01))), this._live = aa(e) || ~(t + "").indexOf("live"), this._nowrap = ~(t + "").indexOf("nowrap"), this._props.push("drawSVG"), oa;
	},
	render: function(e, t) {
		if (t.tween._time || !Ji()) {
			var n = t._pt, r = t._style, i, a, o, s;
			if (n) {
				for (t._live && (i = ca(t._target), i !== t._length && (a = i / t._length, t._length = i, t._offsetPT && (t._offsetPT.s *= a, t._offsetPT.c *= a), t._dashPT ? (t._dashPT.s *= a, t._dashPT.c *= a) : t._dash *= a)); n;) n.r(e, n.d), n = n._next;
				o = t._dash || e && e !== 1 && 1e-4 || 0, i = t._length - o + .1, s = t._offset, o && s && o + Math.abs(s % t._length) > t._length - .05 && (s += s < 0 ? .005 : -.005) && (i += .005), r.strokeDashoffset = o ? s : s + .001, r.strokeDasharray = i < .1 ? "none" : o ? o + "px," + (t._nowrap ? 999999 : i) + "px" : "0px, 999999px";
			}
		} else t.styles.revert();
	},
	getLength: ca,
	getPosition: la
};
Xi() && Vi.registerPlugin(da);
//#endregion
//#region node_modules/gsap/utils/paths.js
var fa = /[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi, pa = /(?:(-)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi, ma = /[\+\-]?\d*\.?\d+e[\+\-]?\d+/gi, ha = /(^[#\.][a-z]|[a-y][a-z])/i, ga = Math.PI / 180, _a = 180 / Math.PI, va = Math.sin, ya = Math.cos, ba = Math.abs, xa = Math.sqrt, Sa = Math.atan2, Ca = 1e8, wa = function(e) {
	return typeof e == "string";
}, Ta = function(e) {
	return typeof e == "number";
}, Ea = function(e) {
	return e === void 0;
}, Da = {}, Oa = {}, ka = 1e5, Aa = function(e) {
	return Math.round((e + Ca) % 1 * ka) / ka || (e < 0 ? 0 : 1);
}, q = function(e) {
	return Math.round(e * ka) / ka || 0;
}, ja = function(e) {
	return Math.round(e * 1e10) / 1e10 || 0;
}, Ma = function(e) {
	return e.closed = Math.abs(e[0] - e[e.length - 2]) < .001 && Math.abs(e[1] - e[e.length - 1]) < .001;
}, Na = function(e, t, n, r) {
	var i = e[t], a = r === 1 ? 6 : Ya(i, n, r);
	if ((a || !r) && a + n + 2 < i.length) return e.splice(t, 0, i.slice(0, n + a + 2)), i.splice(0, n + a), 1;
}, Pa = function(e, t, n) {
	var r = e.length, i = ~~(n * r);
	if (e[i] > t) {
		for (; --i && e[i] > t;);
		i < 0 && (i = 0);
	} else for (; e[++i] < t && i < r;);
	return i < r ? i : r - 1;
}, Fa = function(e, t) {
	var n = e.length;
	for (t || e.reverse(); n--;) e[n].reversed || Ba(e[n]);
}, Ia = function(e, t) {
	return t.totalLength = e.totalLength, e.samples ? (t.samples = e.samples.slice(0), t.lookup = e.lookup.slice(0), t.minLength = e.minLength, t.resolution = e.resolution) : e.totalPoints && (t.totalPoints = e.totalPoints), t;
}, La = function(e, t) {
	var n = e.length, r = e[n - 1] || [], i = r.length;
	n && t[0] === r[i - 2] && t[1] === r[i - 1] && (t = r.concat(t.slice(2)), n--), e[n] = t;
};
function Ra(e) {
	e = wa(e) && ha.test(e) && document.querySelector(e) || e;
	var t = e.getAttribute ? e : 0, n;
	return t && (e = e.getAttribute("d")) ? (t._gsPath ||= {}, n = t._gsPath[e], n && !n._dirty ? n : t._gsPath[e] = eo(e)) : e ? wa(e) ? eo(e) : Ta(e[0]) ? [e] : e : console.warn("Expecting a <path> element or an SVG path data string");
}
function za(e) {
	for (var t = [], n = 0; n < e.length; n++) t[n] = Ia(e[n], e[n].slice(0));
	return Ia(e, t);
}
function Ba(e) {
	var t = 0, n;
	for (e.reverse(); t < e.length; t += 2) n = e[t], e[t] = e[t + 1], e[t + 1] = n;
	e.reversed = !e.reversed;
}
var Va = function(e, t) {
	var n = document.createElementNS("http://www.w3.org/2000/svg", "path"), r = [].slice.call(e.attributes), i = r.length, a;
	for (t = "," + t + ","; --i > -1;) a = r[i].nodeName.toLowerCase(), t.indexOf("," + a + ",") < 0 && n.setAttributeNS(null, a, r[i].nodeValue);
	return n;
}, Ha = {
	rect: "rx,ry,x,y,width,height",
	circle: "r,cx,cy",
	ellipse: "rx,ry,cx,cy",
	line: "x1,x2,y1,y2"
}, Ua = function(e, t) {
	for (var n = t ? t.split(",") : [], r = {}, i = n.length; --i > -1;) r[n[i]] = +e.getAttribute(n[i]) || 0;
	return r;
};
function Wa(e, t) {
	var n = e.tagName.toLowerCase(), r = .552284749831, i, a, o, s, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w, T;
	return n === "path" || !e.getBBox ? e : (l = Va(e, "x,y,width,height,cx,cy,rx,ry,r,x1,x2,y1,y2,points"), T = Ua(e, Ha[n]), n === "rect" ? (s = T.rx, c = T.ry || s, a = T.x, o = T.y, p = T.width - s * 2, m = T.height - c * 2, s || c ? (h = a + s * (1 - r), g = a + s, _ = g + p, v = _ + s * r, y = _ + s, b = o + c * (1 - r), x = o + c, S = x + m, C = S + c * r, w = S + c, i = "M" + y + "," + x + " V" + S + " C" + [
		y,
		C,
		v,
		w,
		_,
		w,
		_ - (_ - g) / 3,
		w,
		g + (_ - g) / 3,
		w,
		g,
		w,
		h,
		w,
		a,
		C,
		a,
		S,
		a,
		S - (S - x) / 3,
		a,
		x + (S - x) / 3,
		a,
		x,
		a,
		b,
		h,
		o,
		g,
		o,
		g + (_ - g) / 3,
		o,
		_ - (_ - g) / 3,
		o,
		_,
		o,
		v,
		o,
		y,
		b,
		y,
		x
	].join(",") + "z") : i = "M" + (a + p) + "," + o + " v" + m + " h" + -p + " v" + -m + " h" + p + "z") : n === "circle" || n === "ellipse" ? (n === "circle" ? (s = c = T.r, d = s * r) : (s = T.rx, c = T.ry, d = c * r), a = T.cx, o = T.cy, u = s * r, i = "M" + (a + s) + "," + o + " C" + [
		a + s,
		o + d,
		a + u,
		o + c,
		a,
		o + c,
		a - u,
		o + c,
		a - s,
		o + d,
		a - s,
		o,
		a - s,
		o - d,
		a - u,
		o - c,
		a,
		o - c,
		a + u,
		o - c,
		a + s,
		o - d,
		a + s,
		o
	].join(",") + "z") : n === "line" ? i = "M" + T.x1 + "," + T.y1 + " L" + T.x2 + "," + T.y2 : (n === "polyline" || n === "polygon") && (f = (e.getAttribute("points") + "").match(pa) || [], a = f.shift(), o = f.shift(), i = "M" + a + "," + o + " L" + f.join(","), n === "polygon" && (i += "," + a + "," + o + "z")), l.setAttribute("d", ro(l._gsRawPath = eo(i))), t && e.parentNode && (e.parentNode.insertBefore(l, e), e.parentNode.removeChild(e)), l);
}
function Ga(e, t, n) {
	var r = e[t], i = e[t + 2], a = e[t + 4], o;
	return r += (i - r) * n, i += (a - i) * n, r += (i - r) * n, o = i + (a + (e[t + 6] - a) * n - i) * n - r, r = e[t + 1], i = e[t + 3], a = e[t + 5], r += (i - r) * n, i += (a - i) * n, r += (i - r) * n, q(Sa(i + (a + (e[t + 7] - a) * n - i) * n - r, o) * _a);
}
function Ka(e, t, n) {
	n = Ea(n) ? 1 : ja(n) || 0, t = ja(t) || 0;
	var r = Math.max(0, ~~(ba(n - t) - 1e-8)), i = za(e);
	if (t > n && (t = 1 - t, n = 1 - n, Fa(i), i.totalLength = 0), t < 0 || n < 0) {
		var a = Math.abs(~~Math.min(t, n)) + 1;
		t += a, n += a;
	}
	i.totalLength || Ja(i);
	var o = n > 1, s = Xa(i, t, Da, !0), c = Xa(i, n, Oa), l = c.segment, u = s.segment, d = c.segIndex, f = s.segIndex, p = c.i, m = s.i, h = f === d, g = p === m && h, _, v, y, b, x, S, C, w;
	if (o || r) {
		for (_ = d < f || h && p < m || g && c.t < s.t, Na(i, f, m, s.t) && (f++, _ || (d++, g ? (c.t = (c.t - s.t) / (1 - s.t), p = 0) : h && (p -= m))), Math.abs(1 - (n - t)) < 1e-5 ? d = f - 1 : !c.t && d ? d-- : Na(i, d, p, c.t) && _ && f++, s.t === 1 && (f = (f + 1) % i.length), x = [], S = i.length, C = 1 + S * r, w = f, C += (S - f + d) % S, b = 0; b < C; b++) La(x, i[w++ % S]);
		i = x;
	} else if (y = c.t === 1 ? 6 : Ya(l, p, c.t), t !== n) for (v = Ya(u, m, g ? s.t / c.t : s.t), h && (y += v), l.splice(p + y + 2), (v || m) && u.splice(0, m + v), b = i.length; b--;) (b < f || b > d) && i.splice(b, 1);
	else l.angle = Ga(l, p + y, 0), p += y, s = l[p], c = l[p + 1], l.length = l.totalLength = 0, l.totalPoints = i.totalPoints = 8, l.push(s, c, s, c, s, c, s, c);
	return i.totalLength = 0, i;
}
function qa(e, t, n) {
	t ||= 0, e.samples || (e.samples = [], e.lookup = []);
	var r = ~~e.resolution || 12, i = 1 / r, a = n ? t + n * 6 + 1 : e.length, o = e[t], s = e[t + 1], c = t ? t / 6 * r : 0, l = e.samples, u = e.lookup, d = (t ? e.minLength : Ca) || Ca, f = l[c + n * r - 1], p = t ? l[c - 1] : 0, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A;
	for (l.length = u.length = 0, h = t + 2; h < a; h += 6) {
		if (g = e[h + 4] - o, _ = e[h + 2] - o, v = e[h] - o, x = e[h + 5] - s, S = e[h + 3] - s, C = e[h + 1] - s, y = b = w = T = 0, ba(g) < .01 && ba(x) < .01 && ba(v) + ba(C) < .01) e.length > 8 && (e.splice(h, 6), h -= 6, a -= 6);
		else for (m = 1; m <= r; m++) D = i * m, E = 1 - D, y = b - (b = (D * D * g + 3 * E * (D * _ + E * v)) * D), w = T - (T = (D * D * x + 3 * E * (D * S + E * C)) * D), k = xa(w * w + y * y), k < d && (d = k), p += k, l[c++] = p;
		o += g, s += x;
	}
	if (f) for (f -= p; c < l.length; c++) l[c] += f;
	if (l.length && d) {
		if (e.totalLength = A = l[l.length - 1] || 0, e.minLength = d, A / d < 9999) for (k = O = 0, m = 0; m < A; m += d) u[k++] = l[O] < m ? ++O : O;
	} else e.totalLength = l[0] = 0;
	return t ? p - l[t / 2 - 1] : p;
}
function Ja(e, t) {
	for (var n, r, i = n = r = 0; i < e.length; i++) e[i].resolution = ~~t || 12, n += qa(e[i]), r += e[i].length;
	return e.totalPoints = r, e.totalLength = n, e;
}
function Ya(e, t, n) {
	if (n <= 0 || n >= 1) return 0;
	var r = e[t], i = e[t + 1], a = e[t + 2], o = e[t + 3], s = e[t + 4], c = e[t + 5], l = e[t + 6], u = e[t + 7], d = r + (a - r) * n, f = a + (s - a) * n, p = i + (o - i) * n, m = o + (c - o) * n, h = d + (f - d) * n, g = p + (m - p) * n, _ = s + (l - s) * n, v = c + (u - c) * n;
	return f += (_ - f) * n, m += (v - m) * n, e.splice(t + 2, 4, q(d), q(p), q(h), q(g), q(h + (f - h) * n), q(g + (m - g) * n), q(f), q(m), q(_), q(v)), e.samples && e.samples.splice(t / 6 * e.resolution | 0, 0, 0, 0, 0, 0, 0, 0), 6;
}
function Xa(e, t, n, r) {
	n ||= {}, e.totalLength || Ja(e), (t < 0 || t > 1) && (t = Aa(t));
	var i = 0, a = e[0], o, s, c, l, u, d, f;
	if (!t) f = d = i = 0, a = e[0];
	else if (t === 1) f = 1, i = e.length - 1, a = e[i], d = a.length - 8;
	else {
		if (e.length > 1) {
			for (c = e.totalLength * t, u = d = 0; (u += e[d++].totalLength) < c;) i = d;
			a = e[i], l = u - a.totalLength, t = (c - l) / (u - l) || 0;
		}
		o = a.samples, s = a.resolution, c = a.totalLength * t, d = a.lookup.length ? a.lookup[~~(c / a.minLength)] || 0 : Pa(o, c, t), l = d ? o[d - 1] : 0, u = o[d], u < c && (l = u, u = o[++d]), f = 1 / s * ((c - l) / (u - l) + d % s), d = ~~(d / s) * 6, r && f === 1 && (d + 6 < a.length ? (d += 6, f = 0) : i + 1 < e.length && (d = f = 0, a = e[++i]));
	}
	return n.t = f, n.i = d, n.path = e, n.segment = a, n.segIndex = i, n;
}
function Za(e, t, n, r) {
	var i = e[0], a = r || {}, o, s, c, l, u, d, f, p, m;
	if ((t < 0 || t > 1) && (t = Aa(t)), i.lookup || Ja(e), e.length > 1) {
		for (c = e.totalLength * t, u = d = 0; (u += e[d++].totalLength) < c;) i = e[d];
		l = u - i.totalLength, t = (c - l) / (u - l) || 0;
	}
	return o = i.samples, s = i.resolution, c = i.totalLength * t, d = i.lookup.length ? i.lookup[t < 1 ? ~~(c / i.minLength) : i.lookup.length - 1] || 0 : Pa(o, c, t), l = d ? o[d - 1] : 0, u = o[d], u < c && (l = u, u = o[++d]), f = 1 / s * ((c - l) / (u - l) + d % s) || 0, m = 1 - f, d = ~~(d / s) * 6, p = i[d], a.x = q((f * f * (i[d + 6] - p) + 3 * m * (f * (i[d + 4] - p) + m * (i[d + 2] - p))) * f + p), a.y = q((f * f * (i[d + 7] - (p = i[d + 1])) + 3 * m * (f * (i[d + 5] - p) + m * (i[d + 3] - p))) * f + p), n && (a.angle = i.totalLength ? Ga(i, d, f >= 1 ? 1 - 1e-9 : f || 1e-9) : i.angle || 0), a;
}
function Qa(e, t, n, r, i, a, o) {
	for (var s = e.length, c, l, u, d, f; --s > -1;) for (c = e[s], l = c.length, u = 0; u < l; u += 2) d = c[u], f = c[u + 1], c[u] = d * t + f * r + a, c[u + 1] = d * n + f * i + o;
	return e._dirty = 1, e;
}
function $a(e, t, n, r, i, a, o, s, c) {
	if (e !== s || t !== c) {
		n = ba(n), r = ba(r);
		var l = i % 360 * ga, u = ya(l), d = va(l), f = Math.PI, p = f * 2, m = (e - s) / 2, h = (t - c) / 2, g = u * m + d * h, _ = -d * m + u * h, v = g * g, y = _ * _, b = v / (n * n) + y / (r * r);
		b > 1 && (n = xa(b) * n, r = xa(b) * r);
		var x = n * n, S = r * r, C = (x * S - x * y - S * v) / (x * y + S * v);
		C < 0 && (C = 0);
		var w = (a === o ? -1 : 1) * xa(C), T = w * (n * _ / r), E = w * -(r * g / n), D = (e + s) / 2, O = (t + c) / 2, k = D + (u * T - d * E), A = O + (d * T + u * E), j = (g - T) / n, M = (_ - E) / r, N = (-g - T) / n, P = (-_ - E) / r, F = j * j + M * M, ee = (M < 0 ? -1 : 1) * Math.acos(j / xa(F)), I = (j * P - M * N < 0 ? -1 : 1) * Math.acos((j * N + M * P) / xa(F * (N * N + P * P)));
		isNaN(I) && (I = f), !o && I > 0 ? I -= p : o && I < 0 && (I += p), ee %= p, I %= p;
		for (var te = Math.ceil(ba(I) / (p / 4)), L = [], R = I / te, z = 4 / 3 * va(R / 2) / (1 + ya(R / 2)), ne = u * n, re = d * n, ie = d * -r, ae = u * r, oe = 0; oe < te; oe++) i = ee + oe * R, g = ya(i), _ = va(i), j = ya(i += R), M = va(i), L.push(g - z * _, _ + z * g, j + z * M, M - z * j, j, M);
		for (oe = 0; oe < L.length; oe += 2) g = L[oe], _ = L[oe + 1], L[oe] = g * ne + _ * ie + k, L[oe + 1] = g * re + _ * ae + A;
		return L[oe - 2] = s, L[oe - 1] = c, L;
	}
}
function eo(e) {
	var t = (e + "").replace(ma, function(e) {
		var t = +e;
		return t < 1e-4 && t > -1e-4 ? 0 : t;
	}).match(fa) || [], n = [], r = 0, i = 0, a = 2 / 3, o = t.length, s = 0, c = "ERROR: malformed path: " + e, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w = function(e, t, n, r) {
		v = (n - e) / 3, y = (r - t) / 3, h.push(e + v, t + y, n - v, r - y, n, r);
	};
	if (!e || !isNaN(t[0]) || isNaN(t[1])) return console.log(c), n;
	for (l = 0; l < o; l++) if (x = p, isNaN(t[l]) ? (p = t[l].toUpperCase(), m = p !== t[l]) : l--, d = +t[l + 1], f = +t[l + 2], m && (d += r, f += i), l || (g = d, _ = f), p === "M") h && (h.length < 8 ? --n.length : s += h.length, Ma(h)), r = g = d, i = _ = f, h = [d, f], n.push(h), l += 2, p = "L";
	else if (p === "C") h ||= [0, 0], m || (r = i = 0), h.push(d, f, r + t[l + 3] * 1, i + t[l + 4] * 1, r += t[l + 5] * 1, i += t[l + 6] * 1), l += 6;
	else if (p === "S") v = r, y = i, (x === "C" || x === "S") && (v += r - h[h.length - 4], y += i - h[h.length - 3]), m || (r = i = 0), h.push(v, y, d, f, r += t[l + 3] * 1, i += t[l + 4] * 1), l += 4;
	else if (p === "Q") v = r + (d - r) * a, y = i + (f - i) * a, m || (r = i = 0), r += t[l + 3] * 1, i += t[l + 4] * 1, h.push(v, y, r + (d - r) * a, i + (f - i) * a, r, i), l += 4;
	else if (p === "T") v = r - h[h.length - 4], y = i - h[h.length - 3], h.push(r + v, i + y, d + (r + v * 1.5 - d) * a, f + (i + y * 1.5 - f) * a, r = d, i = f), l += 2;
	else if (p === "H") w(r, i, r = d, i), l += 1;
	else if (p === "V") w(r, i, r, i = d + (m ? i - r : 0)), l += 1;
	else if (p === "L" || p === "Z") p === "Z" && (d = g, f = _, h.closed = !0), (p === "L" || ba(r - d) > .5 || ba(i - f) > .5) && (w(r, i, d, f), p === "L" && (l += 2)), r = d, i = f;
	else if (p === "A") {
		if (S = t[l + 4], C = t[l + 5], v = t[l + 6], y = t[l + 7], u = 7, S.length > 1 && (S.length < 3 ? (y = v, v = C, u--) : (y = C, v = S.substr(2), u -= 2), C = S.charAt(1), S = S.charAt(0)), b = $a(r, i, +t[l + 1], +t[l + 2], +t[l + 3], +S, +C, (m ? r : 0) + v * 1, (m ? i : 0) + y * 1), l += u, b) for (u = 0; u < b.length; u++) h.push(b[u]);
		r = h[h.length - 2], i = h[h.length - 1];
	} else console.log(c);
	return l = h.length, l < 6 ? (n.pop(), l = 0) : Ma(h), n.totalPoints = s + l, n;
}
function to(e, t) {
	t === void 0 && (t = 1);
	for (var n = e[0], r = 0, i = [n, r], a = 2; a < e.length; a += 2) i.push(n, r, e[a], r = (e[a] - n) * t / 2, n = e[a], -r);
	return i;
}
function no(e, t) {
	ba(e[0] - e[2]) < 1e-4 && ba(e[1] - e[3]) < 1e-4 && (e = e.slice(2));
	var n = e.length - 2, r = +e[0], i = +e[1], a = +e[2], o = +e[3], s = [
		r,
		i,
		r,
		i
	], c = a - r, l = o - i, u = e.nonSmooth || [], d = Math.abs(e[n] - r) < .001 && Math.abs(e[n + 1] - i) < .001, f, p, m, h, g, _, v, y, b, x, S, C, w, T, E;
	if (!n) return [
		r,
		i,
		r,
		i,
		r,
		i,
		r,
		i
	];
	for (d && (e.push(a, o), a = r, o = i, r = e[n - 2], i = e[n - 1], e.unshift(r, i), n += 4, u = [0, 0].concat(u)), t = t || t === 0 ? +t : 1, m = 2; m < n; m += 2) f = r, p = i, r = a, i = o, a = +e[m + 2], o = +e[m + 3], (r !== a || i !== o) && (h = c, g = l, c = a - r, l = o - i, u[m] ? s.push(r - (r - f) / 4, i - (i - p) / 4, r, i, r + (a - r) / 4, i + (o - i) / 4) : (_ = xa(h * h + g * g), v = xa(c * c + l * l), y = xa((c / v + h / _) ** 2 + (l / v + g / _) ** 2), b = (_ + v) * t * .25 / y, x = r - (r - f) * (_ ? b / _ : 0), S = r + (a - r) * (v ? b / v : 0), C = r - (x + ((S - x) * (_ * 3 / (_ + v) + .5) / 4 || 0)), w = i - (i - p) * (_ ? b / _ : 0), T = i + (o - i) * (v ? b / v : 0), E = i - (w + ((T - w) * (_ * 3 / (_ + v) + .5) / 4 || 0)), s.push(q(x + C), q(w + E), q(r), q(i), q(S + C), q(T + E))));
	return r !== a || i !== o || s.length < 4 ? s.push(q(a), q(o), q(a), q(o)) : s.length -= 2, s.length === 2 ? s.push(r, i, r, i, r, i) : d && (s.splice(0, 6), s.length -= 6), s.closed = d, s;
}
function ro(e) {
	Ta(e[0]) && (e = [e]);
	for (var t = "", n = e.length, r, i = 0, a, o; i < n; i++) {
		for (o = e[i], t += "M" + q(o[0]) + "," + q(o[1]) + " C", r = o.length, a = 2; a < r; a++) t += q(o[a++]) + "," + q(o[a++]) + " " + q(o[a++]) + "," + q(o[a++]) + " " + q(o[a++]) + "," + q(o[a]) + " ";
		o.closed && (t += "z");
	}
	return t;
}
//#endregion
//#region node_modules/gsap/utils/matrix.js
var io, ao, oo, so, co, lo, uo, fo, po = "transform", mo = po + "Origin", ho, go = function(e) {
	var t = e.ownerDocument || e;
	for (!(po in e.style) && ("msTransform" in e.style) && (po = "msTransform", mo = po + "Origin"); t.parentNode && (t = t.parentNode););
	if (ao = window, uo = new ko(), t) {
		io = t, oo = t.documentElement, so = t.body, fo = io.createElementNS("http://www.w3.org/2000/svg", "g"), fo.style.transform = "none";
		var n = t.createElement("div"), r = t.createElement("div"), i = t && (t.body || t.firstElementChild);
		i && i.appendChild && (i.appendChild(n), n.appendChild(r), n.style.position = "static", n.style.transform = "translate3d(0,0,1px)", ho = r.offsetParent !== n, i.removeChild(n));
	}
	return t;
}, _o = function(e) {
	for (var t, n; e && e !== so;) n = e._gsap, n && n.uncache && n.get(e, "x"), n && !n.scaleX && !n.scaleY && n.renderTransform && (n.scaleX = n.scaleY = 1e-4, n.renderTransform(1, n), t ? t.push(n) : t = [n]), e = e.parentNode;
	return t;
}, vo = [], yo = [], bo = function() {
	return ao.pageYOffset || io.scrollTop || oo.scrollTop || so.scrollTop || 0;
}, xo = function() {
	return ao.pageXOffset || io.scrollLeft || oo.scrollLeft || so.scrollLeft || 0;
}, So = function(e) {
	return e.ownerSVGElement || ((e.tagName + "").toLowerCase() === "svg" ? e : null);
}, Co = function e(t) {
	if (ao.getComputedStyle(t).position === "fixed") return !0;
	if (t = t.parentNode, t && t.nodeType === 1) return e(t);
}, wo = function e(t, n) {
	if (t.parentNode && (io || go(t))) {
		var r = So(t), i = r ? r.getAttribute("xmlns") || "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml", a = r ? n ? "rect" : "g" : "div", o = n === 2 ? 100 : 0, s = n === 3 ? 100 : 0, c = {
			position: "absolute",
			display: "block",
			pointerEvents: "none",
			margin: "0",
			padding: "0"
		}, l = io.createElementNS ? io.createElementNS(i.replace(/^https/, "http"), a) : io.createElement(a);
		return n && (r ? (lo ||= e(t), l.setAttribute("width", .01), l.setAttribute("height", .01), l.setAttribute("transform", "translate(" + o + "," + s + ")"), l.setAttribute("fill", "transparent"), lo.appendChild(l)) : (co || (co = e(t), Object.assign(co.style, c)), Object.assign(l.style, c, {
			width: "0.1px",
			height: "0.1px",
			top: s + "px",
			left: o + "px"
		}), co.appendChild(l))), l;
	}
	throw "Need document and parent.";
}, To = function(e) {
	for (var t = new ko(), n = 0; n < e.numberOfItems; n++) t.multiply(e.getItem(n).matrix);
	return t;
}, Eo = function(e) {
	var t = e.getCTM(), n;
	return t || (n = e.style[po], e.style[po] = "none", e.appendChild(fo), t = fo.getCTM(), e.removeChild(fo), n ? e.style[po] = n : e.style.removeProperty(po.replace(/([A-Z])/g, "-$1").toLowerCase())), t || uo.clone();
}, Do = function(e, t) {
	var n = So(e), r = e === n, i = n ? vo : yo, a = e.parentNode, o = a && !n && a.shadowRoot && a.shadowRoot.appendChild ? a.shadowRoot : a, s, c, l, u, d, f;
	if (e === ao) return e;
	if (i.length || i.push(wo(e, 1), wo(e, 2), wo(e, 3)), s = n ? lo : co, n) r ? (l = Eo(e), u = -l.e / l.a, d = -l.f / l.d, c = uo) : e.getBBox ? (l = e.getBBox(), c = e.transform ? e.transform.baseVal : {}, c = c.numberOfItems ? c.numberOfItems > 1 ? To(c) : c.getItem(0).matrix : uo, u = c.a * l.x + c.c * l.y, d = c.b * l.x + c.d * l.y) : (c = new ko(), u = d = 0), t && e.tagName.toLowerCase() === "g" && (u = d = 0), (r || !e.getBoundingClientRect().width ? n : a).appendChild(s), s.setAttribute("transform", "matrix(" + c.a + "," + c.b + "," + c.c + "," + c.d + "," + (c.e + u) + "," + (c.f + d) + ")");
	else {
		if (u = d = 0, ho) for (c = e.offsetParent, l = e; (l &&= l.parentNode) && l !== c && l.parentNode;) (ao.getComputedStyle(l)[po] + "").length > 4 && (u = l.offsetLeft, d = l.offsetTop, l = 0);
		if (f = ao.getComputedStyle(e), f.position !== "absolute" && f.position !== "fixed") for (c = e.offsetParent; a && a !== c;) u += a.scrollLeft || 0, d += a.scrollTop || 0, a = a.parentNode;
		l = s.style, l.top = e.offsetTop - d + "px", l.left = e.offsetLeft - u + "px", l[po] = f[po], l[mo] = f[mo], l.position = f.position === "fixed" ? "fixed" : "absolute", o.appendChild(s);
	}
	return s;
}, Oo = function(e, t, n, r, i, a, o) {
	return e.a = t, e.b = n, e.c = r, e.d = i, e.e = a, e.f = o, e;
}, ko = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a) {
		e === void 0 && (e = 1), t === void 0 && (t = 0), n === void 0 && (n = 0), r === void 0 && (r = 1), i === void 0 && (i = 0), a === void 0 && (a = 0), Oo(this, e, t, n, r, i, a);
	}
	var t = e.prototype;
	return t.inverse = function() {
		var e = this.a, t = this.b, n = this.c, r = this.d, i = this.e, a = this.f, o = e * r - t * n || 1e-10;
		return Oo(this, r / o, -t / o, -n / o, e / o, (n * a - r * i) / o, -(e * a - t * i) / o);
	}, t.multiply = function(e) {
		var t = this.a, n = this.b, r = this.c, i = this.d, a = this.e, o = this.f, s = e.a, c = e.c, l = e.b, u = e.d, d = e.e, f = e.f;
		return Oo(this, s * t + l * r, s * n + l * i, c * t + u * r, c * n + u * i, a + d * t + f * r, o + d * n + f * i);
	}, t.clone = function() {
		return new e(this.a, this.b, this.c, this.d, this.e, this.f);
	}, t.equals = function(e) {
		var t = this.a, n = this.b, r = this.c, i = this.d, a = this.e, o = this.f;
		return t === e.a && n === e.b && r === e.c && i === e.d && a === e.e && o === e.f;
	}, t.apply = function(e, t) {
		t === void 0 && (t = {});
		var n = e.x, r = e.y, i = this.a, a = this.b, o = this.c, s = this.d, c = this.e, l = this.f;
		return t.x = n * i + r * o + c || 0, t.y = n * a + r * s + l || 0, t;
	}, e;
}();
function Ao(e, t, n, r) {
	if (!e || !e.parentNode || (io || go(e)).documentElement === e) return new ko();
	var i = _o(e), a = So(e) ? vo : yo, o = Do(e, n), s = a[0].getBoundingClientRect(), c = a[1].getBoundingClientRect(), l = a[2].getBoundingClientRect(), u = o.parentNode, d = !r && Co(e), f = new ko((c.left - s.left) / 100, (c.top - s.top) / 100, (l.left - s.left) / 100, (l.top - s.top) / 100, s.left + (d ? 0 : xo()), s.top + (d ? 0 : bo()));
	if (u.removeChild(o), i) for (s = i.length; s--;) c = i[s], c.scaleX = c.scaleY = 0, c.renderTransform(1, c);
	return t ? f.inverse() : f;
}
//#endregion
//#region node_modules/gsap/MotionPathPlugin.js
var jo = "x,translateX,left,marginLeft,xPercent".split(","), Mo = "y,translateY,top,marginTop,yPercent".split(","), No = Math.PI / 180, Po, Fo, J, Y, Io, Lo, Ro = function() {
	return Po || typeof window < "u" && (Po = window.gsap) && Po.registerPlugin && Po;
}, zo = function(e, t, n, r) {
	for (var i = t.length, a = r === 2 ? 0 : r, o = 0; o < i; o++) e[a] = parseFloat(t[o][n]), r === 2 && (e[a + 1] = 0), a += 2;
	return e;
}, Bo = function(e, t, n) {
	return parseFloat(e._gsap.get(e, t, n || "px")) || 0;
}, Vo = function(e) {
	for (var t = e[0], n = e[1], r = 2; r < e.length; r += 2) t = e[r] += t, n = e[r + 1] += n;
}, Ho = function(e, t, n, r, i, a, o, s, c) {
	return o.type === "cubic" ? t = [t] : (o.fromCurrent !== !1 && t.unshift(Bo(n, r, s), i ? Bo(n, i, c) : 0), o.relative && Vo(t), t = [(i ? no : to)(t, o.curviness)]), t = a(qo(t, n, o)), Jo(e, n, r, t, "x", s), i && Jo(e, n, i, t, "y", c), Ja(t, o.resolution || (o.curviness === 0 ? 20 : 12));
}, Uo = function(e) {
	return e;
}, Wo = /[-+\.]*\d+\.?(?:e-|e\+)?\d*/g, Go = function(e, t, n) {
	var r = Ao(e), i = 0, a = 0, o;
	return (e.tagName + "").toLowerCase() === "svg" ? (o = e.viewBox.baseVal, o.width || (o = {
		width: +e.getAttribute("width"),
		height: +e.getAttribute("height")
	})) : o = t && e.getBBox && e.getBBox(), t && t !== "auto" && (i = t.push ? t[0] * (o ? o.width : e.offsetWidth || 0) : t.x, a = t.push ? t[1] * (o ? o.height : e.offsetHeight || 0) : t.y), n.apply(i || a ? r.apply({
		x: i,
		y: a
	}) : {
		x: r.e,
		y: r.f
	});
}, Ko = function(e, t, n, r) {
	var i = Ao(e.parentNode, !0, !0), a = i.clone().multiply(Ao(t)), o = Go(e, n, i), s = Go(t, r, i), c = s.x, l = s.y, u;
	return a.e = a.f = 0, r === "auto" && t.getTotalLength && t.tagName.toLowerCase() === "path" && (u = t.getAttribute("d").match(Wo) || [], u = a.apply({
		x: +u[0],
		y: +u[1]
	}), c += u.x, l += u.y), u && (u = a.apply(t.getBBox()), c -= u.x, l -= u.y), a.e = c - o.x, a.f = l - o.y, a;
}, qo = function(e, t, n) {
	var r = n.align, i = n.matrix, a = n.offsetX, o = n.offsetY, s = n.alignOrigin, c = e[0][0], l = e[0][1], u = Bo(t, "x"), d = Bo(t, "y"), f, p, m;
	return !e || !e.length ? Ra("M0,0L0,0") : (r && (r === "self" || (f = Y(r)[0] || t) === t ? Qa(e, 1, 0, 0, 1, u - c, d - l) : (s && s[2] !== !1 ? Po.set(t, { transformOrigin: s[0] * 100 + "% " + s[1] * 100 + "%" }) : s = [Bo(t, "xPercent") / -100, Bo(t, "yPercent") / -100], p = Ko(t, f, s, "auto"), m = p.apply({
		x: c,
		y: l
	}), Qa(e, p.a, p.b, p.c, p.d, u + p.e - (m.x - p.e), d + p.f - (m.y - p.f)))), i ? Qa(e, i.a, i.b, i.c, i.d, i.e, i.f) : (a || o) && Qa(e, 1, 0, 0, 1, a || 0, o || 0), e);
}, Jo = function(e, t, n, r, i, a) {
	var o = t._gsap, s = o.harness, c = s && s.aliases && s.aliases[n], l = c && c.indexOf(",") < 0 ? c : n, u = e._pt = new Fo(e._pt, t, l, 0, 0, Uo, 0, o.set(t, l, e));
	u.u = J(o.get(t, l, a)) || 0, u.path = r, u.pp = i, e._props.push(l);
}, Yo = function(e, t) {
	return function(n) {
		return e || t !== 1 ? Ka(n, e, t) : n;
	};
}, Xo = {
	version: "3.15.0",
	name: "motionPath",
	register: function(e, t, n) {
		Po = e, J = Po.utils.getUnit, Y = Po.utils.toArray, Io = Po.core.getStyleSaver, Lo = Po.core.reverting || function() {}, Fo = n;
	},
	init: function(e, t, n) {
		if (!Po) return console.warn("Please gsap.registerPlugin(MotionPathPlugin)"), !1;
		(typeof t != "object" || t.style || !t.path) && (t = { path: t });
		var r = [], i = t, a = i.path, o = i.autoRotate, s = i.unitX, c = i.unitY, l = i.x, u = i.y, d = a[0], f = Yo(t.start, "end" in t ? t.end : 1), p, m;
		if (this.rawPaths = r, this.target = e, this.tween = n, this.styles = Io && Io(e, "transform"), (this.rotate = o || o === 0) && (this.rOffset = parseFloat(o) || 0, this.radians = !!t.useRadians, this.rProp = t.rotation || "rotation", this.rSet = e._gsap.set(e, this.rProp, this), this.ru = J(e._gsap.get(e, this.rProp)) || 0), Array.isArray(a) && !("closed" in a) && typeof d != "number") {
			for (m in d) !l && ~jo.indexOf(m) ? l = m : !u && ~Mo.indexOf(m) && (u = m);
			for (m in l && u ? r.push(Ho(this, zo(zo([], a, l, 0), a, u, 1), e, l, u, f, t, s || J(a[0][l]), c || J(a[0][u]))) : l = u = 0, d) m !== l && m !== u && r.push(Ho(this, zo([], a, m, 2), e, m, 0, f, t, J(a[0][m])));
		} else p = f(qo(Ra(t.path), e, t)), Ja(p, t.resolution), r.push(p), Jo(this, e, t.x || "x", p, "x", t.unitX || "px"), Jo(this, e, t.y || "y", p, "y", t.unitY || "px");
		n.vars.immediateRender && this.render(n.progress(), this);
	},
	render: function(e, t) {
		var n = t.rawPaths, r = n.length, i = t._pt;
		if (t.tween._time || !Lo()) {
			for (e > 1 ? e = 1 : e < 0 && (e = 0); r--;) Za(n[r], e, !r && t.rotate, n[r]);
			for (; i;) i.set(i.t, i.p, i.path[i.pp] + i.u, i.d, e), i = i._next;
			t.rotate && t.rSet(t.target, t.rProp, n[0].angle * (t.radians ? No : 1) + t.rOffset + t.ru, t, e);
		} else t.styles.revert();
	},
	getLength: function(e) {
		return Ja(Ra(e)).totalLength;
	},
	sliceRawPath: Ka,
	getRawPath: Ra,
	pointsToSegment: no,
	stringToRawPath: eo,
	rawPathToString: ro,
	transformRawPath: Qa,
	getGlobalMatrix: Ao,
	getPositionOnPath: Za,
	cacheRawPathMeasurements: Ja,
	convertToPath: function(e, t) {
		return Y(e).map(function(e) {
			return Wa(e, t !== !1);
		});
	},
	convertCoordinates: function(e, t, n) {
		var r = Ao(t, !0, !0).multiply(Ao(e));
		return n ? r.apply(n) : r;
	},
	getAlignMatrix: Ko,
	getRelativePosition: function(e, t, n, r) {
		var i = Ko(e, t, n, r);
		return {
			x: i.e,
			y: i.f
		};
	},
	arrayToRawPath: function(e, t) {
		t ||= {};
		var n = zo(zo([], e, t.x || "x", 0), e, t.y || "y", 1);
		return t.relative && Vo(n), [t.type === "cubic" ? n : no(n, t.curviness)];
	}
};
Ro() && Po.registerPlugin(Xo);
//#endregion
//#region src/diagram/svg.ts
var Zo = {
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
}, Qo = {
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
}, $o = "#1d2826", es = "#4f5d5a", ts = (e) => e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function ns(e, t = 5) {
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
function rs(e) {
	return e.tone ? e.tone : e.kind === "external" ? "external" : e.kind === "store" ? "data" : e.kind === "person" ? "neutral" : "core";
}
function is(e, t, n = {}) {
	let r = n.pad ?? 16, i = t.width + r * 2, a = t.height + r * 2, o = Object.keys(Qo).map((e) => `<marker id="arr-${e}" viewBox="0 0 8 8" refX="7.2" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0.6 L7.4 4 L0 7.4 z" fill="${Qo[e].stroke}"/></marker>`).join(""), s = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${i} ${a}" class="dg" data-diagram="${ts(e.id)}" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" role="img" aria-label="${ts(e.title)}">`, `<defs>${o}</defs><g transform="translate(${r} ${r})">`];
	if (e.kind === "c4") for (let n of e.groups ?? []) {
		let e = t.groups[n.id];
		e && s.push(`<g class="dg-group" data-group="${ts(n.id)}"><rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="12" fill="none" stroke="#c5ccc9" stroke-dasharray="6 5"/><text x="${e.x + 14}" y="${e.y + 22}" class="dg-group-label" fill="${es}" font-size="13" font-weight="600">${ts(n.label)}</text></g>`);
	}
	else for (let n of e.participants) {
		let e = t.nodes[n.id];
		s.push(`<line class="dg-lifeline" data-life="${ts(n.id)}" x1="${e.x + e.w / 2}" y1="${e.y + e.h}" x2="${e.x + e.w / 2}" y2="${t.height}" stroke="#d3d9d6" stroke-dasharray="3 4"/>`);
	}
	let c = e.kind === "c4" ? e.edges : e.messages;
	for (let n of c) {
		let r = t.edges[n.id];
		if (!r) continue;
		let i = n.style ?? "solid", { stroke: a, dash: o } = Qo[i];
		if (s.push(`<g class="dg-edge" data-edge="${ts(n.id)}" data-from="${ts(n.from)}" data-to="${ts(n.to)}"><path d="${ns(r.points)}" fill="none" stroke="${a}" stroke-width="1.6"${o ? ` stroke-dasharray="${o}"` : ""} marker-end="url(#arr-${i})"/>`), n.label) {
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
			s.push(`<text class="dg-edge-label" x="${t.x}" y="${t.y}" text-anchor="middle" font-size="12" fill="${a}" paint-order="stroke" stroke="#f4f5f2" stroke-width="5">${ts(n.label)}</text>`);
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
		let r = Zo[rs(e)], i = e.kind === "system";
		s.push(`<g class="dg-node" data-node="${ts(e.id)}"><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${e.kind === "person" ? 22 : 6}" fill="${r.fill}" stroke="${i ? $o : r.stroke}" stroke-width="${i ? 2 : 1.4}"/><text x="${n.x + n.w / 2}" y="${n.y + (e.sub ? n.h / 2 - 3 : n.h / 2 + 5)}" text-anchor="middle" font-size="14.5" font-weight="600" fill="${$o}">${ts(e.label)}</text>` + (e.sub ? `<text x="${n.x + n.w / 2}" y="${n.y + n.h / 2 + 15}" text-anchor="middle" font-size="12" fill="${es}">${ts(e.sub)}</text>` : "") + "</g>");
	}
	return s.push("</g></svg>"), s.join("");
}
//#endregion
//#region src/DiagramStage.tsx
Bi.registerPlugin(da, Xo);
var as = 16, os = .2, ss = .72, cs = .9, ls = (e) => `${e.x.toFixed(1)} ${e.y.toFixed(1)} ${e.w.toFixed(1)} ${e.h.toFixed(1)}`;
function us(e, t, n) {
	let r = t.width + 32, i = t.height + 32, a = n.w / n.h, o = Math.max(e.w + 120, (e.h + 100) * a);
	o = Math.min(o, n.w / ss), o = Math.max(o, n.w / cs);
	let s = o / a, c = e.x + e.w / 2 + as, l = e.y + e.h / 2 + as;
	return {
		x: o >= r ? (r - o) / 2 : Math.min(Math.max(0, c - o / 2), r - o),
		y: s >= i ? (i - s) / 2 : Math.min(Math.max(0, l - s / 2), i - s),
		w: o,
		h: s
	};
}
function ds(e) {
	let t = Math.min(...e.map((e) => e.x)), n = Math.min(...e.map((e) => e.y)), r = Math.max(...e.map((e) => e.x + e.w)), i = Math.max(...e.map((e) => e.y + e.h));
	return {
		x: t,
		y: n,
		w: r - t,
		h: i - n
	};
}
function fs(e, t) {
	let n = (e.kind === "c4" ? e.edges : e.messages).filter((e) => t.trace.includes(e.id));
	return /* @__PURE__ */ new Set([...t.focus, ...n.flatMap((e) => [e.from, e.to])]);
}
function ps(e, t, n) {
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
	let p = (o + c) / 2 + as, m = (s + l) / 2 + as, h = Math.min(Math.max(0, p - u / 2), i - u), g = Math.min(Math.max(0, m - d / 2), a - d);
	return `${h.toFixed(1)} ${g.toFixed(1)} ${u.toFixed(1)} ${d.toFixed(1)}`;
}
function ms({ diagram: e, layout: t, portraitLayout: n, epoch: r, shot: i, shotMs: a, offsetMs: o, playing: s, onSelect: c, selected: l }) {
	let u = (0, x.useRef)(null), d = (0, x.useRef)(null), [f, p] = (0, x.useState)(null);
	(0, x.useLayoutEffect)(() => {
		let e = u.current;
		if (!e) return;
		let t = () => {
			let t = e.getBoundingClientRect();
			t.width && t.height && p((e) => e && Math.abs(e.w - t.width) < 2 && Math.abs(e.h - t.height) < 2 ? e : {
				w: t.width,
				h: t.height
			});
		};
		t();
		let n = new ResizeObserver(t);
		return n.observe(e), () => n.disconnect();
	}, []);
	let m = f && n && f.h > f.w * .9 ? n : t, h = (0, x.useMemo)(() => is(e, m, { pad: as }), [e, m]), g = !!f && Math.min(f.w / (m.width + 32), f.h / (m.height + 32)) < ss;
	return (0, x.useLayoutEffect)(() => {
		let t = u.current?.querySelector("svg");
		if (!t || !f) return;
		let n = fs(e, i), r = n.size > 0, c = t.querySelectorAll(".dg-node, .dg-edge, .dg-group, .dg-lifeline"), l = t.querySelectorAll(".dg-edge-label");
		t.querySelectorAll(".dg-pulse").forEach((e) => e.remove());
		{
			let e = Bi.timeline({ paused: !0 }), o = (e) => m.nodes[e], s = (e) => {
				let t = m.edges[e]?.points ?? [];
				return t.length ? ds(t.map((e) => ({
					x: e.x,
					y: e.y,
					w: 1,
					h: 1
				}))) : null;
			};
			if (!g) e.to(t, {
				attr: { viewBox: ps(m, n, i.trace) },
				duration: 1.3,
				ease: "power2.inOut"
			}, 0);
			else {
				t.setAttribute("preserveAspectRatio", "xMidYMid meet");
				let r = i.trace.length ? s(i.trace[0]) : null, a = [...n].map(o).filter(Boolean), c = r ?? (a.length ? ds(a) : null), l = {
					x: 0,
					y: 0,
					w: m.width,
					h: m.height
				}, u = c ? us(c, m, f) : us(l, m, {
					w: f.w,
					h: f.h
				}), d = Math.max((m.width + 32) / f.w, (m.height + 32) / f.h), p = {
					x: (m.width + 32 - f.w * d) / 2,
					y: (m.height + 32 - f.h * d) / 2,
					w: f.w * d,
					h: f.h * d
				};
				e.to(t, {
					attr: { viewBox: ls(c ? u : p) },
					duration: 1.1,
					ease: "power2.inOut"
				}, 0);
			}
			e.to(l, {
				opacity: 0,
				duration: .3
			}, 0);
			let u = i.trace.map((e) => t.querySelector(`.dg-edge[data-edge="${CSS.escape(e)}"] path`)).filter((e) => !!e), p = [...t.querySelectorAll(".dg-edge path")].filter((e) => !u.includes(e));
			e.set(p, { clearProps: "strokeDasharray,strokeDashoffset,opacity" }, 0), u.length && e.set(u, {
				drawSVG: "0%",
				opacity: 0
			}, 0);
			let h = r ? [...c].filter((e) => {
				let t = e.dataset.node ?? e.dataset.edge ?? e.dataset.group ?? e.dataset.life ?? "";
				return e.classList.contains("dg-group") ? !i.focus.includes(t) : e.classList.contains("dg-edge") ? !i.trace.includes(t) : !n.has(t);
			}) : [], _ = [...c].filter((e) => !h.includes(e));
			h.length && e.to(h, {
				opacity: os,
				duration: .6,
				ease: "power1.out"
			}, 0), _.length && e.to(_, {
				opacity: 1,
				duration: .6,
				ease: "power1.out"
			}, 0);
			let v = i.trace.length ? Math.max(1.1, (a / 1e3 - 1.2) / i.trace.length) : 0;
			i.trace.forEach((n, r) => {
				let i = t.querySelector(`.dg-edge[data-edge="${CSS.escape(n)}"]`), a = i?.querySelector("path");
				if (!i || !a) return;
				let o = .5 + r * v, c = Math.min(.9, v * .7);
				if (g && r > 0) {
					let r = s(n);
					if (r) {
						let i = m.edges[n].points, a = i[0], s = i[i.length - 1], l = us(r, m, f), u = l.w >= r.w + 60 && l.h >= r.h + 60, d = u ? l : us({
							x: a.x - 40,
							y: a.y - 40,
							w: 80,
							h: 80
						}, m, f);
						e.to(t, {
							attr: { viewBox: ls(d) },
							duration: Math.min(.7, v * .35),
							ease: "power2.inOut"
						}, o - Math.min(.7, v * .35)), u || e.to(t, {
							attr: { viewBox: ls(us({
								x: s.x - 40,
								y: s.y - 40,
								w: 80,
								h: 80
							}, m, f)) },
							duration: c,
							ease: "power1.inOut"
						}, o);
					}
				} else if (g && r === 0) {
					let r = m.edges[n]?.points ?? [], i = s(n);
					if (i && r.length) {
						let n = us(i, m, f);
						if (!(n.w >= i.w + 60 && n.h >= i.h + 60)) {
							let n = r[0], i = r[r.length - 1];
							e.to(t, {
								attr: { viewBox: ls(us({
									x: n.x - 40,
									y: n.y - 40,
									w: 80,
									h: 80
								}, m, f)) },
								duration: .5,
								ease: "power2.inOut"
							}, Math.max(0, o - .5)), e.to(t, {
								attr: { viewBox: ls(us({
									x: i.x - 40,
									y: i.y - 40,
									w: 80,
									h: 80
								}, m, f)) },
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
				u.setAttribute("r", "4.5"), u.setAttribute("class", "dg-pulse"), u.setAttribute("fill", a.getAttribute("stroke") ?? Qo.solid.stroke), u.setAttribute("opacity", "0"), i.appendChild(u), e.set(u, { opacity: 1 }, o).to(u, {
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
		h,
		i,
		a,
		o,
		r,
		f,
		g
	]), (0, x.useLayoutEffect)(() => {
		d.current && (s ? d.current.play() : d.current.pause());
	}, [s]), (0, x.useLayoutEffect)(() => {
		let e = u.current?.querySelector("svg");
		e?.querySelectorAll(".dg-node.is-selected").forEach((e) => e.classList.remove("is-selected")), l && e?.querySelector(`.dg-node[data-node="${CSS.escape(l)}"]`)?.classList.add("is-selected");
	}, [l, h]), /* @__PURE__ */ (0, S.jsx)("div", {
		ref: u,
		className: "stage-svg",
		onClick: (e) => {
			let t = e.target.closest(".dg-node");
			t?.dataset.node && c(t.dataset.node);
		},
		dangerouslySetInnerHTML: { __html: h }
	});
}
function hs(e) {
	let t = e.split(/\s+/).filter(Boolean).length;
	return Math.max(2600, t * 380);
}
function gs(e, t) {
	return `${e.id}-${t}`;
}
function _s(e, t, n) {
	return e.map((e) => (n[gs(e, t)]?.ms ?? hs(e[t])) + 600);
}
function vs(e) {
	let t = [], n = 0;
	for (let r of e) t.push(n), n += r;
	return t;
}
function ys(e, t) {
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
function bs(e, t) {
	return e.chapters.map((n) => {
		let r = e.shots.findIndex((e) => e.chapter === n.id);
		return r === -1 ? null : {
			id: n.id,
			title: n.title,
			start: t[r]
		};
	}).filter((e) => e !== null);
}
function xs(e) {
	let t = e.match(/[^.!?]+[.!?]*/g)?.map((e) => e.trim()).filter(Boolean) ?? [e], n = [];
	for (let e of t) {
		let t = e.split(/\s+/);
		for (let e = 0; e < t.length; e += 14) n.push(t.slice(e, e + 14).join(" "));
	}
	return n;
}
function Ss(e, t) {
	let n = e.reduce((e, t) => e + t.split(/\s+/).length, 0), r = 0;
	for (let i of e) if (r += i.split(/\s+/).length, t * n < r) return i;
	return e[e.length - 1] ?? "";
}
function Cs(e) {
	let t = Math.max(0, Math.floor(e / 1e3));
	return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function ws(e, t) {
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
//#region src/Watch.tsx
var Ts = [
	1,
	1.25,
	1.5,
	2,
	.75
], Es = "(max-width: 700px), (max-height: 500px) and (orientation: landscape)";
function Ds() {
	let e = new URLSearchParams(location.search).get("watch") === "1", [t, n] = (0, x.useState)(() => e || matchMedia(Es).matches);
	return (0, x.useEffect)(() => {
		if (e) return;
		let t = matchMedia(Es), r = () => n(t.matches);
		return t.addEventListener("change", r), () => t.removeEventListener("change", r);
	}, [e]), t;
}
function Os(e) {
	let { w: t, chapters: n, time: r, total: i } = e, [a, o] = (0, x.useState)(null), s = (0, x.useRef)(null), c = Math.max(0, n.findLastIndex((e) => e.start <= r)), l = n[c], u = e.nav?.next, d = (t) => e.nav?.open(_(t)), f = r > 0 || e.playing, p = !e.playing && r >= i - 2;
	(0, x.useEffect)(() => {
		let e = s.current, t = e?.querySelector(".on");
		e && t && e.scrollTo({
			left: t.offsetLeft - e.clientWidth / 2 + t.clientWidth / 2,
			behavior: "smooth"
		});
	}, [c]);
	let m = (r) => {
		r >= n.length ? u && u.id !== t.id && d(u) : e.seek(n[Math.max(0, r)].start + 1);
	}, g = (0, x.useRef)(null), y = (e) => {
		g.current = {
			x: e.clientX,
			y: e.clientY,
			t: performance.now()
		};
	}, b = (t) => {
		let n = g.current;
		if (g.current = null, !n) return;
		let r = t.clientX - n.x, i = t.clientY - n.y;
		Math.abs(i) > 60 && Math.abs(i) > Math.abs(r) * 1.3 ? m(i < 0 ? c + 1 : c - 1) : Math.hypot(r, i) < 10 && performance.now() - n.t < 400 && (e.playing || !t.target.closest(".dg-node")) && e.toggle();
	}, { words: C, said: w } = ws(xs(e.text), e.spoken), T = l ? `${c + 1} · ${l.title}` : t.subtitle ?? "";
	return /* @__PURE__ */ (0, S.jsxs)("div", {
		className: "watch",
		children: [
			/* @__PURE__ */ (0, S.jsx)("div", {
				className: "w-stage",
				onPointerDown: y,
				onPointerUp: b,
				children: /* @__PURE__ */ (0, S.jsx)("div", {
					className: `w-canvas${f ? "" : " dim"}`,
					children: e.stage
				})
			}),
			/* @__PURE__ */ (0, S.jsxs)("header", {
				className: "w-top",
				children: [/* @__PURE__ */ (0, S.jsxs)("button", {
					className: "w-title",
					onClick: () => o("next"),
					"aria-label": "What next",
					children: [/* @__PURE__ */ (0, S.jsxs)("b", { children: [/* @__PURE__ */ (0, S.jsx)("em", { children: t.title }), /* @__PURE__ */ (0, S.jsx)("svg", {
						viewBox: "0 0 24 24",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, S.jsx)("path", { d: "M6 9l6 6 6-6" })
					})] }), /* @__PURE__ */ (0, S.jsx)("span", { children: f ? T : t.subtitle })]
				}), /* @__PURE__ */ (0, S.jsxs)("button", {
					className: "w-pill",
					onClick: () => e.onDepth(e.depth === "engineer" ? "executive" : "engineer"),
					"aria-label": "Switch depth",
					children: [
						e.depth === "engineer" ? "Engineer" : "Executive",
						" ",
						/* @__PURE__ */ (0, S.jsx)("span", { children: "⇄" })
					]
				})]
			}),
			f ? p ? /* @__PURE__ */ (0, S.jsxs)("div", {
				className: "w-intro",
				children: [
					/* @__PURE__ */ (0, S.jsx)("span", {
						className: "w-eyebrow",
						children: "Up next"
					}),
					/* @__PURE__ */ (0, S.jsx)("h1", { children: u?.title }),
					/* @__PURE__ */ (0, S.jsx)("button", {
						className: "w-play",
						onClick: () => u && d(u),
						"aria-label": "Play next topic",
						children: /* @__PURE__ */ (0, S.jsx)("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, S.jsx)("path", { d: "M8 5.5v13l11-6.5z" })
						})
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						className: "w-link",
						onClick: () => e.seek(0),
						children: "Watch again"
					})
				]
			}) : e.playing ? null : /* @__PURE__ */ (0, S.jsxs)("div", {
				className: "w-paused",
				children: [
					/* @__PURE__ */ (0, S.jsx)("button", {
						className: "w-icon",
						onClick: () => m(c - 1),
						"aria-label": "Previous chapter",
						children: /* @__PURE__ */ (0, S.jsx)("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, S.jsx)("path", { d: "M7 6v12M18 6l-8 6 8 6z" })
						})
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						className: "w-icon",
						onClick: () => e.seek(r - 1e4),
						"aria-label": "Back 10 seconds",
						children: "−10"
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						className: "w-play",
						onClick: e.toggle,
						"aria-label": "Resume",
						children: /* @__PURE__ */ (0, S.jsx)("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, S.jsx)("path", { d: "M8 5.5v13l11-6.5z" })
						})
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						className: "w-icon",
						onClick: () => e.seek(r + 1e4),
						"aria-label": "Forward 10 seconds",
						children: "+10"
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						className: "w-icon",
						onClick: () => m(c + 1),
						"aria-label": "Next chapter",
						children: /* @__PURE__ */ (0, S.jsx)("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, S.jsx)("path", { d: "M17 6v12M6 6l8 6-8 6z" })
						})
					})
				]
			}) : /* @__PURE__ */ (0, S.jsxs)("div", {
				className: "w-intro",
				children: [
					/* @__PURE__ */ (0, S.jsx)("span", {
						className: "w-eyebrow",
						children: t.subtitle ?? "Walkthrough"
					}),
					/* @__PURE__ */ (0, S.jsx)("h1", { children: t.title }),
					/* @__PURE__ */ (0, S.jsxs)("p", { children: [
						n.length,
						" chapters · ",
						Cs(i)
					] }),
					/* @__PURE__ */ (0, S.jsx)("button", {
						className: "w-play",
						onClick: e.toggle,
						"aria-label": "Play",
						children: /* @__PURE__ */ (0, S.jsx)("svg", {
							viewBox: "0 0 24 24",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, S.jsx)("path", { d: "M8 5.5v13l11-6.5z" })
						})
					}),
					/* @__PURE__ */ (0, S.jsx)("small", { children: "Tap to play with sound · swipe up for the next chapter" })
				]
			}),
			/* @__PURE__ */ (0, S.jsxs)("div", {
				className: "w-bottom",
				children: [
					f && !p && l && v.has(l.id) && e.nav?.links.length ? /* @__PURE__ */ (0, S.jsx)("div", {
						className: "w-chips",
						children: e.nav.links.map((e) => /* @__PURE__ */ (0, S.jsxs)("button", {
							onClick: () => d(e),
							children: [e.title, " ›"]
						}, e.id))
					}) : null,
					f && e.captions && !p ? /* @__PURE__ */ (0, S.jsxs)("div", {
						className: "w-caption",
						"aria-live": "off",
						children: [/* @__PURE__ */ (0, S.jsx)("span", {
							className: "w-eyebrow",
							children: T
						}), /* @__PURE__ */ (0, S.jsx)("p", { children: C.map((e, t) => /* @__PURE__ */ (0, S.jsxs)("span", {
							className: t < w ? "said" : "",
							children: [e, " "]
						}, t)) })]
					}) : null,
					/* @__PURE__ */ (0, S.jsx)("div", {
						className: "w-strip",
						ref: s,
						children: n.map((t, n) => /* @__PURE__ */ (0, S.jsxs)("button", {
							className: n === c ? "on" : n < c ? "done" : "",
							onClick: () => e.seek(t.start + 1),
							children: [/* @__PURE__ */ (0, S.jsx)("b", { children: n + 1 }), /* @__PURE__ */ (0, S.jsx)("span", { children: t.title })]
						}, t.id))
					}),
					/* @__PURE__ */ (0, S.jsxs)("div", {
						className: "w-progress",
						children: [n.map((e, t) => {
							let a = n[t + 1]?.start ?? i, o = Math.min(1, Math.max(0, (r - e.start) / (a - e.start)));
							return /* @__PURE__ */ (0, S.jsx)("span", {
								style: { flexGrow: a - e.start },
								children: /* @__PURE__ */ (0, S.jsx)("i", { style: { width: `${o * 100}%` } })
							}, e.id);
						}), /* @__PURE__ */ (0, S.jsx)("input", {
							type: "range",
							min: 0,
							max: i,
							step: 100,
							value: r,
							onChange: (t) => e.seek(Number(t.target.value)),
							"aria-label": "Position"
						})]
					}),
					/* @__PURE__ */ (0, S.jsxs)("div", {
						className: "w-bar",
						children: [
							/* @__PURE__ */ (0, S.jsx)("button", {
								className: "w-icon",
								onClick: e.toggle,
								"aria-label": e.playing ? "Pause" : "Play",
								children: e.playing ? /* @__PURE__ */ (0, S.jsx)("svg", {
									viewBox: "0 0 24 24",
									"aria-hidden": "true",
									children: /* @__PURE__ */ (0, S.jsx)("path", { d: "M8 5v14M16 5v14" })
								}) : /* @__PURE__ */ (0, S.jsx)("svg", {
									viewBox: "0 0 24 24",
									"aria-hidden": "true",
									className: "fill",
									children: /* @__PURE__ */ (0, S.jsx)("path", { d: "M8 5.5v13l11-6.5z" })
								})
							}),
							/* @__PURE__ */ (0, S.jsxs)("span", {
								className: "w-time",
								children: [
									Cs(r),
									" / ",
									Cs(i)
								]
							}),
							/* @__PURE__ */ (0, S.jsx)("button", {
								className: "w-icon",
								onClick: () => o("chapters"),
								"aria-label": "Chapters",
								children: /* @__PURE__ */ (0, S.jsx)("svg", {
									viewBox: "0 0 24 24",
									"aria-hidden": "true",
									children: /* @__PURE__ */ (0, S.jsx)("path", { d: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" })
								})
							}),
							/* @__PURE__ */ (0, S.jsx)("button", {
								className: `w-icon w-cc${e.captions ? " on" : ""}`,
								onClick: () => e.setCaptions((e) => !e),
								"aria-label": "Subtitles",
								children: "CC"
							}),
							/* @__PURE__ */ (0, S.jsxs)("button", {
								className: "w-icon w-speed",
								onClick: () => e.setSpeed(Ts[(Ts.indexOf(e.speed) + 1) % Ts.length]),
								"aria-label": "Speed",
								children: [e.speed, "×"]
							})
						]
					})
				]
			}),
			e.explore,
			a ? /* @__PURE__ */ (0, S.jsx)("div", {
				className: "w-sheet-back",
				onClick: () => o(null),
				children: /* @__PURE__ */ (0, S.jsxs)("div", {
					className: "w-sheet",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, S.jsx)("div", { className: "w-grip" }), a === "chapters" ? /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [/* @__PURE__ */ (0, S.jsx)("h2", { children: "Chapters" }), n.map((t, n) => /* @__PURE__ */ (0, S.jsxs)("button", {
						className: n === c ? "on" : "",
						onClick: () => {
							e.seek(t.start + 1), o(null);
						},
						children: [
							/* @__PURE__ */ (0, S.jsx)("b", { children: n + 1 }),
							/* @__PURE__ */ (0, S.jsx)("span", { children: t.title }),
							/* @__PURE__ */ (0, S.jsx)("small", { children: Cs(t.start) })
						]
					}, t.id))] }) : /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [(e.nav?.groups ?? []).map((e) => /* @__PURE__ */ (0, S.jsxs)("section", { children: [/* @__PURE__ */ (0, S.jsx)("h2", { children: e.title }), e.items.map(({ topic: e, note: t }) => /* @__PURE__ */ (0, S.jsxs)("button", {
						onClick: () => {
							o(null), d(e);
						},
						children: [/* @__PURE__ */ (0, S.jsx)("img", {
							src: h(`/thumbs/${e.id}.svg`),
							alt: "",
							loading: "lazy"
						}), /* @__PURE__ */ (0, S.jsxs)("span", { children: [e.title, /* @__PURE__ */ (0, S.jsx)("small", { children: t ?? [e.meta?.category, Cs(e.ms.engineer)].filter(Boolean).join(" · ") })] })]
					}, e.id))] }, e.title)), /* @__PURE__ */ (0, S.jsx)("button", {
						className: "w-browse",
						onClick: () => e.nav?.library(),
						children: "Browse the library"
					})] })]
				})
			}) : null
		]
	});
}
//#endregion
//#region src/Player.tsx
var ks = [
	.75,
	1,
	1.25,
	1.5,
	2
];
function As({ walkthrough: e, manifest: n, layouts: r, nav: i, autoplay: a = !1, startAt: o = 0, startChapter: s, onProgress: c }) {
	let l = Ds(), [u, d] = (0, x.useState)("engineer"), f = (0, x.useMemo)(() => _s(e.shots, u, n), [
		e.shots,
		u,
		n
	]), p = (0, x.useMemo)(() => vs(f), [f]), m = p[p.length - 1] + f[f.length - 1], g = (0, x.useMemo)(() => bs(e, p), [e, p]), [y, b] = (0, x.useState)(0), [w, T] = (0, x.useState)(a), [E, D] = (0, x.useState)(1), [O, k] = (0, x.useState)(!0), [A, j] = (0, x.useState)(null), [M, N] = (0, x.useState)({
		index: 0,
		offset: 0,
		epoch: 0
	}), P = (0, x.useRef)(null), F = (0, x.useRef)(null), ee = (0, x.useRef)({
		time: 0,
		last: 0
	}), { index: I, offset: te } = ys(y, f), L = e.shots[I], R = L.diagram ?? e.shots.slice(0, I).reverse().find((e) => e.diagram)?.diagram ?? e.diagrams[0].id, z = e.diagrams.find((e) => e.id === R), ne = n[gs(L, u)], re = (0, x.useCallback)((e) => {
		let t = Math.max(0, Math.min(m - 1, e));
		ee.current.time = t, b(t);
		let n = ys(t, f);
		N((e) => ({
			index: n.index,
			offset: n.offset,
			epoch: e.epoch + 1
		}));
	}, [f, m]);
	(0, x.useEffect)(() => {
		let e = s ? g.find((e) => e.id === s) : void 0, t = e ? e.start + 1 : o > 5e3 && o < m - 5e3 ? o : 0;
		t && re(t);
	}, []);
	let ie = (0, x.useRef)(0);
	(0, x.useEffect)(() => {
		c && (Math.abs(y - ie.current) > 3e3 || !w) && (ie.current = y, c(y, m));
	}, [
		y,
		w,
		m,
		c
	]), (0, x.useEffect)(() => {
		let e = P.current;
		if (!e) return;
		if (!ne) {
			e.removeAttribute("src");
			return;
		}
		e.src.endsWith(ne.file) || (e.src = h(ne.file));
		let t = M.index === I ? M.offset : 0;
		t < ne.ms && (e.currentTime = t / 1e3), e.playbackRate = E, w && t < ne.ms && e.play().catch(() => void 0);
	}, [
		I,
		u,
		M.epoch,
		ne?.file
	]), (0, x.useEffect)(() => {
		P.current && (P.current.playbackRate = E);
	}, [E]), (0, x.useEffect)(() => {
		let e = P.current;
		e && ne && (w && te < ne.ms ? e.play().catch(() => void 0) : e.pause());
	}, [w]), (0, x.useEffect)(() => {
		if (!w) return;
		let t = 0;
		ee.current.last = performance.now();
		let r = (i) => {
			let a = i - ee.current.last;
			ee.current.last = i;
			let o = ys(ee.current.time, f), s = P.current, c = n[gs(e.shots[o.index], u)], l;
			l = s && c && s.src.endsWith(c.file) && !s.paused && !s.ended ? p[o.index] + s.currentTime * 1e3 : ee.current.time + a * E;
			let d = ys(l, f);
			d.index !== o.index && N((e) => ({
				index: d.index,
				offset: 0,
				epoch: e.epoch
			})), l >= m ? (ee.current.time = m, b(m - 1), T(!1)) : (ee.current.time = l, b(l), t = requestAnimationFrame(r));
		};
		return t = requestAnimationFrame(r), () => cancelAnimationFrame(t);
	}, [
		w,
		f,
		p,
		m,
		E,
		u,
		n,
		e.shots
	]);
	let ae = (t) => {
		if (t === u) return;
		let r = I;
		d(t);
		let i = vs(_s(e.shots, t, n));
		ee.current.time = i[r], b(i[r]), N((e) => ({
			index: r,
			offset: 0,
			epoch: e.epoch + 1
		}));
	}, oe = (0, x.useCallback)(() => {
		!w && y >= m - 2 && re(0), j(null), T((e) => !e);
	}, [
		w,
		y,
		m,
		re
	]);
	(0, x.useEffect)(() => {
		let t = (t) => {
			t.target.tagName !== "SELECT" && (t.key === " " ? (t.preventDefault(), oe()) : t.key === "ArrowRight" ? re(ee.current.time + 1e4) : t.key === "ArrowLeft" ? re(ee.current.time - 1e4) : t.key === "." ? re(p[Math.min(I + 1, e.shots.length - 1)]) : t.key === "," ? re(p[Math.max(I - 1, 0)]) : t.key === "c" && k((e) => !e));
		};
		return window.addEventListener("keydown", t), () => window.removeEventListener("keydown", t);
	}, [
		oe,
		re,
		p,
		I,
		e.shots.length
	]);
	let se = L[u], ce = ne ? Math.min(1, te / ne.ms) : Math.min(1, te / f[I]), le = Ss(xs(se), ce), ue = [...g].reverse().find((e) => e.start <= y);
	(0, x.useEffect)(() => {
		let e = F.current, t = e?.querySelector("button.on");
		e && t && e.scrollWidth > e.clientWidth && e.scrollTo({
			left: t.offsetLeft - e.clientWidth / 2 + t.clientWidth / 2,
			behavior: "smooth"
		});
	}, [ue?.id]);
	let B = A ? e.shots.map((e, t) => ({
		s: e,
		i: t
	})).filter(({ s: e }) => e.focus.includes(A)) : [], V = A && (z.kind === "c4" ? z.elements.find((e) => e.id === A)?.label : z.participants.find((e) => e.id === A)?.label), de = !L.card && z.kind === "c4" && z.legend?.length ? /* @__PURE__ */ (0, S.jsx)("div", {
		className: "legend",
		"aria-label": "Legend",
		children: z.legend.map((e) => /* @__PURE__ */ (0, S.jsxs)("span", {
			style: { color: Qo[e.style].stroke },
			children: [/* @__PURE__ */ (0, S.jsx)("svg", {
				viewBox: "0 0 34 8",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, S.jsx)("line", {
					x1: "0",
					y1: "4",
					x2: "34",
					y2: "4",
					stroke: Qo[e.style].stroke,
					strokeWidth: "2",
					strokeDasharray: Qo[e.style].dash || void 0
				})
			}), e.label]
		}, e.label))
	}) : null, fe = i && ue && v.has(ue.id) ? i.links : [], pe = L.card ? /* @__PURE__ */ (0, S.jsx)(C, {
		card: L.card,
		shotMs: f[I],
		offsetMs: M.index === I ? M.offset : 0,
		playing: w,
		epoch: M.epoch * 1e3 + I
	}) : /* @__PURE__ */ (0, S.jsx)(ms, {
		diagram: z,
		layout: r[z.id],
		portraitLayout: r[`${z.id}${t}`],
		epoch: M.epoch,
		shot: L,
		shotMs: f[I],
		offsetMs: M.index === I ? M.offset : 0,
		playing: w,
		selected: A,
		onSelect: (e) => {
			w || j((t) => t === e ? null : e);
		}
	}, z.id), me = !w && A ? /* @__PURE__ */ (0, S.jsxs)("aside", {
		className: "explore",
		onClick: (e) => e.stopPropagation(),
		children: [/* @__PURE__ */ (0, S.jsx)("strong", { children: V }), B.length ? /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [/* @__PURE__ */ (0, S.jsx)("span", { children: "Explained in:" }), B.map(({ s: e, i: t }) => /* @__PURE__ */ (0, S.jsxs)("button", {
			onClick: () => re(p[t]),
			children: [
				Cs(p[t]),
				" · ",
				e[u].slice(0, 70),
				"…"
			]
		}, e.id))] }) : /* @__PURE__ */ (0, S.jsx)("span", { children: "Not the focus of any shot in this walkthrough." })]
	}) : null, he = /* @__PURE__ */ (0, S.jsx)("audio", {
		ref: P,
		preload: "auto"
	});
	return l ? /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [/* @__PURE__ */ (0, S.jsx)(Os, {
		w: e,
		nav: i,
		stage: pe,
		depth: u,
		onDepth: ae,
		time: y,
		total: m,
		playing: w,
		toggle: oe,
		seek: re,
		chapters: g,
		text: se,
		spoken: ce,
		captions: O,
		setCaptions: k,
		speed: E,
		setSpeed: D,
		explore: me
	}), he] }) : /* @__PURE__ */ (0, S.jsxs)("div", {
		className: "player",
		children: [
			/* @__PURE__ */ (0, S.jsxs)("header", {
				className: "player-head",
				children: [/* @__PURE__ */ (0, S.jsxs)("div", { children: [/* @__PURE__ */ (0, S.jsx)("h1", { children: e.title }), /* @__PURE__ */ (0, S.jsxs)("p", { children: [
					ue?.title,
					" · ",
					L.card ? L.card.heading : z.title
				] })] }), /* @__PURE__ */ (0, S.jsx)("div", {
					className: "depth",
					role: "group",
					"aria-label": "Depth",
					children: ["executive", "engineer"].map((e) => /* @__PURE__ */ (0, S.jsx)("button", {
						className: e === u ? "on" : "",
						onClick: () => ae(e),
						children: e === "engineer" ? "Engineer" : "Executive"
					}, e))
				})]
			}),
			/* @__PURE__ */ (0, S.jsxs)("div", {
				className: "stage",
				onClick: () => w ? oe() : void 0,
				children: [
					pe,
					de,
					O && le ? /* @__PURE__ */ (0, S.jsx)("div", {
						className: "subtitle",
						children: le
					}) : null,
					w ? null : /* @__PURE__ */ (0, S.jsx)("button", {
						className: "big-play",
						onClick: oe,
						"aria-label": y > 0 ? "Resume" : "Play",
						children: "▶"
					}),
					me,
					!w && !A && y > 0 && !L.card ? /* @__PURE__ */ (0, S.jsx)("div", {
						className: "hint",
						children: "Paused · click any part of the diagram to explore it"
					}) : null
				]
			}),
			fe.length ? /* @__PURE__ */ (0, S.jsxs)("div", {
				className: "topic-chips",
				children: [/* @__PURE__ */ (0, S.jsx)("span", { children: ue?.id === "patterns" ? "Watch the patterns" : "Watch next" }), fe.map((e) => /* @__PURE__ */ (0, S.jsxs)("a", {
					href: _(e),
					onClick: (t) => {
						t.preventDefault(), i?.open(_(e));
					},
					children: [e.title, " ›"]
				}, e.id))]
			}) : null,
			/* @__PURE__ */ (0, S.jsxs)("div", {
				className: "controls",
				children: [
					/* @__PURE__ */ (0, S.jsx)("button", {
						onClick: oe,
						"aria-label": w ? "Pause" : "Play",
						children: w ? "❚❚" : "▶"
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						onClick: () => re(p[Math.max(I - 1, 0)]),
						"aria-label": "Previous shot",
						children: "⏮"
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						className: "skip10",
						onClick: () => re(y - 1e4),
						"aria-label": "Back 10 seconds",
						children: "−10"
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						className: "skip10",
						onClick: () => re(y + 1e4),
						"aria-label": "Forward 10 seconds",
						children: "+10"
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						onClick: () => re(p[Math.min(I + 1, e.shots.length - 1)]),
						"aria-label": "Next shot",
						children: "⏭"
					}),
					/* @__PURE__ */ (0, S.jsxs)("div", {
						className: "scrub",
						children: [/* @__PURE__ */ (0, S.jsx)("input", {
							type: "range",
							min: 0,
							max: m,
							step: 100,
							value: y,
							onChange: (e) => re(Number(e.target.value)),
							"aria-label": "Position"
						}), g.map((e) => /* @__PURE__ */ (0, S.jsx)("button", {
							className: "mark",
							style: { left: `${e.start / m * 100}%` },
							title: e.title,
							onClick: () => re(e.start)
						}, e.id))]
					}),
					/* @__PURE__ */ (0, S.jsxs)("span", {
						className: "time",
						children: [
							Cs(y),
							" / ",
							Cs(m)
						]
					}),
					/* @__PURE__ */ (0, S.jsx)("select", {
						value: E,
						onChange: (e) => D(Number(e.target.value)),
						"aria-label": "Speed",
						children: ks.map((e) => /* @__PURE__ */ (0, S.jsxs)("option", {
							value: e,
							children: [e, "×"]
						}, e))
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						className: O ? "on" : "",
						onClick: () => k((e) => !e),
						"aria-label": "Subtitles",
						children: "CC"
					})
				]
			}),
			/* @__PURE__ */ (0, S.jsx)("nav", {
				className: "chapters",
				ref: F,
				children: g.map((e) => /* @__PURE__ */ (0, S.jsxs)("button", {
					className: ue?.id === e.id ? "on" : "",
					onClick: () => re(e.start),
					children: [
						/* @__PURE__ */ (0, S.jsx)("span", { children: Cs(e.start) }),
						" ",
						e.title
					]
				}, e.id))
			}),
			he
		]
	});
}
//#endregion
//#region src/lib/element.tsx
var js = async (e, t) => {
	try {
		let n = await fetch(e);
		return n.ok ? await n.json() : t;
	} catch {
		return t;
	}
}, Ms = class extends HTMLElement {
	static observedAttributes = [
		"src",
		"layouts",
		"manifest",
		"assets"
	];
	root;
	connectedCallback() {
		if (!this.root) {
			let e = this.attachShadow({ mode: "open" }), t = document.createElement("style");
			t.textContent = `:host{display:block}${u}`;
			let n = document.createElement("div");
			n.className = "dp", e.append(t, n), this.root = (0, l.createRoot)(n);
		}
		this.load();
	}
	attributeChangedCallback() {
		this.root && this.load();
	}
	disconnectedCallback() {
		this.root?.unmount(), this.root = void 0;
	}
	async load() {
		let e = this.getAttribute("src");
		if (!e || !this.root) return;
		let t = this.getAttribute("assets") ?? "";
		m({ assets: t });
		let n = await js(e, null);
		if (!n) return;
		let r = this.getAttribute("layouts"), i = r ? await js(r, {}) : await (await import("./layout-Cr5qKKGn.js")).layoutWalkthrough(n), a = await js(this.getAttribute("manifest") ?? `${t}/audio/${n.id}/manifest.json`, {});
		this.root.render(/* @__PURE__ */ (0, S.jsx)(As, {
			walkthrough: n,
			layouts: i,
			manifest: a
		}, n.id));
	}
};
customElements.get("design-player") || customElements.define("design-player", Ms);
//#endregion
export { Ms as DesignPlayerElement };
