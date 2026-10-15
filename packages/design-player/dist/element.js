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
	var te = typeof reportError == "function" ? reportError : function(e) {
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
	function ne(e) {
		var t = T.T, n = {};
		n.types = t === null ? null : t.types, T.T = n;
		try {
			var r = e(), i = T.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(w, te);
		} catch (e) {
			te(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), T.T = t;
		}
	}
	function I(e) {
		var t = T.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else ne(I.bind(null, e));
	}
	var L = {
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
	e.Activity = f, e.Children = L, e.Component = y, e.Fragment = r, e.Profiler = a, e.PureComponent = x, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = T, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return T.H.useMemoCache(e);
		}
	}, e.addTransitionType = I, e.cache = function(e) {
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
	}, e.startTransition = ne, e.unstable_useCacheRefresh = function() {
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
	var D = Object.assign, O = Symbol.for("react.element"), k = Symbol.for("react.transitional.element"), A = Symbol.for("react.portal"), j = Symbol.for("react.fragment"), M = Symbol.for("react.strict_mode"), N = Symbol.for("react.profiler"), P = Symbol.for("react.consumer"), F = Symbol.for("react.context"), ee = Symbol.for("react.forward_ref"), te = Symbol.for("react.suspense"), ne = Symbol.for("react.suspense_list"), I = Symbol.for("react.memo"), L = Symbol.for("react.lazy"), re = Symbol.for("react.activity"), ie = Symbol.for("react.legacy_hidden"), R = Symbol.for("react.memo_cache_sentinel"), ae = Symbol.for("react.view_transition"), oe = Symbol.for("react.recoverable"), se = Symbol.iterator;
	function ce(e) {
		return typeof e != "object" || !e ? null : (e = se && e[se] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var le = Symbol.for("react.client.reference");
	function ue(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === le ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case j: return "Fragment";
			case N: return "Profiler";
			case M: return "StrictMode";
			case te: return "Suspense";
			case ne: return "SuspenseList";
			case re: return "Activity";
			case ae: return "ViewTransition";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case A: return "Portal";
			case F: return e.displayName || "Context";
			case P: return (e._context.displayName || "Context") + ".Consumer";
			case ee:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case I: return t = e.displayName || null, t === null ? ue(e.type) || "Memo" : t;
			case L:
				t = e._payload, e = e._init;
				try {
					return ue(e(t));
				} catch {}
		}
		return null;
	}
	var de = Array.isArray, z = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, B = i.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, fe = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, pe = [], me = -1;
	function he(e) {
		return { current: e };
	}
	function ge(e) {
		0 > me || (e.current = pe[me], pe[me] = null, me--);
	}
	function V(e, t) {
		me++, pe[me] = e.current, e.current = t;
	}
	var _e = he(null), ve = he(null), ye = he(null), be = he(null);
	function xe(e, t) {
		switch (V(ye, t), V(ve, e), V(_e, null), t.nodeType) {
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
		ge(_e), V(_e, e);
	}
	function Se() {
		ge(_e), ge(ve), ge(ye);
	}
	function Ce(e) {
		var t = e.memoizedState;
		t !== null && (sh._currentValue = t.memoizedState, V(be, e)), t = _e.current;
		var n = dp(t, e.type);
		t !== n && (V(ve, e), V(_e, n));
	}
	function we(e) {
		ve.current === e && (ge(_e), ge(ve)), be.current === e && (ge(be), sh._currentValue = fe);
	}
	var Te, Ee;
	function De(e) {
		if (Te === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			Te = t && t[1] || "", Ee = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + Te + e + Ee;
	}
	var Oe = !1;
	function ke(e, t) {
		if (!e || Oe) return "";
		Oe = !0;
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
			Oe = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? De(n) : "";
	}
	function Ae(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return De(e.type);
			case 16: return De("Lazy");
			case 13: return e.child !== t && t !== null ? De("Suspense Fallback") : De("Suspense");
			case 19: return De("SuspenseList");
			case 0:
			case 15: return ke(e.type, !1);
			case 11: return ke(e.type.render, !1);
			case 1: return ke(e.type, !0);
			case 31: return De("Activity");
			case 30: return De("ViewTransition");
			default: return "";
		}
	}
	function je(e) {
		try {
			var t = "", n = null;
			do
				t += Ae(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var Me = Object.prototype.hasOwnProperty, Ne = t.unstable_scheduleCallback, Pe = t.unstable_cancelCallback, Fe = t.unstable_shouldYield, Ie = t.unstable_requestPaint, Le = t.unstable_now, Re = t.unstable_getCurrentPriorityLevel, ze = t.unstable_ImmediatePriority, Be = t.unstable_UserBlockingPriority, Ve = t.unstable_NormalPriority, He = t.unstable_LowPriority, Ue = t.unstable_IdlePriority, We = t.log, Ge = t.unstable_setDisableYieldValue, Ke = null, qe = null;
	function Je(e) {
		if (typeof We == "function" && Ge(e), qe && typeof qe.setStrictMode == "function") try {
			qe.setStrictMode(Ke, e);
		} catch {}
	}
	var Ye = Math.clz32 ? Math.clz32 : Qe, Xe = Math.log, Ze = Math.LN2;
	function Qe(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (Xe(e) / Ze | 0) | 0;
	}
	var $e = 256, et = 262144, tt = 4194304;
	function nt(e) {
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
	function rt(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = nt(n))) : i = nt(o) : i = nt(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = nt(n))) : i = nt(o)) : i = nt(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function it(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function at(e, t) {
		t & 8 && (t |= t & 32);
		var n = e.entangledLanes;
		if (n !== 0) for (e = e.entanglements, n &= t; 0 < n;) {
			var r = 31 - Ye(n), i = 1 << r;
			t |= e[r], n &= ~i;
		}
		return t;
	}
	function ot(e, t) {
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
	function st() {
		var e = tt;
		return tt <<= 1, !(tt & 62914560) && (tt = 4194304), e;
	}
	function ct(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function lt(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function ut(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - Ye(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && dt(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function dt(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - Ye(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function ft(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - Ye(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function pt(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : mt(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function mt(e) {
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
	function ht(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function gt() {
		var e = B.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : Ch(e.type)) : e;
	}
	function _t(e, t) {
		var n = B.p;
		try {
			return B.p = e, t();
		} finally {
			B.p = n;
		}
	}
	var vt = Math.random().toString(36).slice(2), yt = "__reactFiber$" + vt, bt = "__reactProps$" + vt, xt = "__reactContainer$" + vt, St = "__reactEvents$" + vt, Ct = "__reactListeners$" + vt, wt = "__reactHandles$" + vt, Tt = "__reactResources$" + vt, Et = "__reactMarker$" + vt, Dt = "__reactLoad$" + vt;
	function Ot(e) {
		delete e[yt], delete e[bt], delete e[Ct], delete e[wt];
	}
	function kt(e) {
		var t;
		if (t = e[yt]) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[xt] || n[yt]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = fm(e); e !== null;) {
					if (n = e[yt]) return n;
					e = fm(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function At(e) {
		if (e = e[yt] || e[xt]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function jt(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(o(33));
	}
	function Mt(e) {
		var t = e[Tt];
		return t ||= e[Tt] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function H(e) {
		e[Et] = !0;
	}
	function Nt(e) {
		e[Dt] = void 0;
	}
	var Pt = /* @__PURE__ */ new Set(), Ft = {};
	function It(e, t) {
		Lt(e, t), Lt(e + "Capture", t);
	}
	function Lt(e, t) {
		for (Ft[e] = t, e = 0; e < t.length; e++) Pt.add(t[e]);
	}
	var Rt = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), zt = {}, Bt = {};
	function Vt(e) {
		return Me.call(Bt, e) ? !0 : Me.call(zt, e) ? !1 : Rt.test(e) ? Bt[e] = !0 : (zt[e] = !0, !1);
	}
	var U = !1;
	function Ht() {
		var e = U;
		return U = !1, e;
	}
	function Ut(e, t, n) {
		if (Vt(t)) {
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
	function Wt(e, t, n) {
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
	function Gt(e, t, n, r) {
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
	function Kt(e) {
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
	function qt(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function Jt(e, t, n) {
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
	function Yt(e) {
		if (!e._valueTracker) {
			var t = qt(e) ? "checked" : "value";
			e._valueTracker = Jt(e, t, "" + e[t]);
		}
	}
	function Xt(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = qt(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	var Zt = /[\n"\\]/g;
	function Qt(e) {
		return e.replace(Zt, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function $t(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Kt(t)) : e.value !== "" + Kt(t) && (e.value = "" + Kt(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : tn(e, Kt(n)) : o === "number" && e.value == t ? tn(e, Kt(e.value)) : tn(e, Kt(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + Kt(s) : e.removeAttribute("name");
	}
	function en(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				Yt(e);
				return;
			}
			n = n == null ? "" : "" + Kt(n), t = t == null ? n : "" + Kt(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), Yt(e);
	}
	function tn(e, t) {
		e.defaultValue !== "" + t && (e.defaultValue = "" + t);
	}
	function nn(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + Kt(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function rn(e, t, n) {
		t != null && (t = "" + Kt(t), t !== e.value && (e.value = t), n == null) ? e.defaultValue !== t && (e.defaultValue = t) : e.defaultValue = n == null ? "" : "" + Kt(n);
	}
	function an(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(o(92));
				if (de(r)) {
					if (1 < r.length) throw Error(o(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = Kt(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), Yt(e);
	}
	function on(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var sn = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function cn(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || sn.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function ln(e, t, n) {
		if (t != null && typeof t != "object") throw Error(o(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "", U = !0);
			for (var i in t) r = t[i], t.hasOwnProperty(i) && n[i] !== r && (cn(e, i, r), U = !0);
		} else for (var a in t) t.hasOwnProperty(a) && cn(e, a, t[a]);
	}
	function un(e) {
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
	var dn = /* @__PURE__ */ new Map([
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
	]), fn = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function pn(e) {
		return fn.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function mn() {}
	var hn = null;
	function gn(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var W = null, _n = null;
	function vn(e) {
		var t = At(e);
		if (t && (e = t.stateNode)) {
			var n = e[bt] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if ($t(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + Qt("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var i = r[bt] || null;
								if (!i) throw Error(o(90));
								$t(r, i.value, i.defaultValue, i.defaultValue, i.checked, i.defaultChecked, i.type, i.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && Xt(r);
					}
					break a;
				case "textarea":
					rn(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && nn(e, !!n.multiple, t, !1);
			}
		}
	}
	var yn = !1;
	function bn(e, t, n) {
		if (yn) return e(t, n);
		yn = !0;
		try {
			return e(t);
		} finally {
			if (yn = !1, (W !== null || _n !== null) && (Ld(), W && (t = W, e = _n, _n = W = null, vn(t), e))) for (t = 0; t < e.length; t++) vn(e[t]);
		}
	}
	function xn(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[bt] || null;
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
	var Sn = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, Cn = !1;
	if (Sn) try {
		var wn = {};
		Object.defineProperty(wn, "passive", { get: function() {
			Cn = !0;
		} }), window.addEventListener("test", wn, wn), window.removeEventListener("test", wn, wn);
	} catch {
		Cn = !1;
	}
	var Tn = null, En = null, Dn = null;
	function On() {
		if (Dn) return Dn;
		var e, t = En, n = t.length, r, i = "value" in Tn ? Tn.value : Tn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return Dn = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function kn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function An() {
		return !0;
	}
	function jn() {
		return !1;
	}
	function Mn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? An : jn, this.isPropagationStopped = jn, this;
		}
		return D(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = An);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = An);
			},
			persist: function() {},
			isPersistent: An
		}), t;
	}
	var Nn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, Pn = Mn(Nn), Fn = D({}, Nn, {
		view: 0,
		detail: 0
	}), In = Mn(Fn), Ln, Rn, zn, Bn = D({}, Fn, {
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
		getModifierState: Zn,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== zn && (zn && e.type === "mousemove" ? (Ln = e.screenX - zn.screenX, Rn = e.screenY - zn.screenY) : Rn = Ln = 0, zn = e), Ln);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : Rn;
		}
	}), Vn = Mn(Bn), Hn = Mn(D({}, Bn, { dataTransfer: 0 })), Un = Mn(D({}, Fn, { relatedTarget: 0 })), Wn = Mn(D({}, Nn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Gn = Mn(D({}, Nn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), Kn = Mn(D({}, Nn, { data: 0 })), qn = {
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
	}, Jn = {
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
	}, Yn = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function Xn(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = Yn[e]) ? !!t[e] : !1;
	}
	function Zn() {
		return Xn;
	}
	var Qn = Mn(D({}, Fn, {
		key: function(e) {
			if (e.key) {
				var t = qn[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = kn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Jn[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: Zn,
		charCode: function(e) {
			return e.type === "keypress" ? kn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? kn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), $n = Mn(D({}, Bn, {
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
	})), er = Mn(D({}, Nn, { submitter: 0 })), tr = Mn(D({}, Fn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: Zn
	})), nr = Mn(D({}, Nn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), rr = Mn(D({}, Bn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), ir = Mn(D({}, Nn, {
		newState: 0,
		oldState: 0,
		source: 0
	})), ar = [
		9,
		13,
		27,
		32
	], or = Sn && "CompositionEvent" in window, sr = null;
	Sn && "documentMode" in document && (sr = document.documentMode);
	var cr = Sn && "TextEvent" in window && !sr, lr = Sn && (!or || sr && 8 < sr && 11 >= sr), ur = " ", dr = !1;
	function fr(e, t) {
		switch (e) {
			case "keyup": return ar.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function pr(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var mr = !1;
	function hr(e, t) {
		switch (e) {
			case "compositionend": return pr(t);
			case "keypress": return t.which === 32 ? (dr = !0, ur) : null;
			case "textInput": return e = t.data, e === ur && dr ? null : e;
			default: return null;
		}
	}
	function gr(e, t) {
		if (mr) return e === "compositionend" || !or && fr(e, t) ? (e = On(), Dn = En = Tn = null, mr = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return lr && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var _r = {
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
	function vr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!_r[e.type] : t === "textarea";
	}
	function yr(e, t, n, r) {
		W ? _n ? _n.push(r) : _n = [r] : W = r, t = qf(t, "onChange"), 0 < t.length && (n = new Pn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var br = null, xr = null;
	function Sr(e) {
		Bf(e, 0);
	}
	function Cr(e) {
		if (Xt(jt(e))) return e;
	}
	function wr(e, t) {
		if (e === "change") return t;
	}
	var Tr = !1;
	if (Sn) {
		var Er;
		if (Sn) {
			var Dr = "oninput" in document;
			if (!Dr) {
				var Or = document.createElement("div");
				Or.setAttribute("oninput", "return;"), Dr = typeof Or.oninput == "function";
			}
			Er = Dr;
		} else Er = !1;
		Tr = Er && (!document.documentMode || 9 < document.documentMode);
	}
	function kr() {
		br && (br.detachEvent("onpropertychange", Ar), xr = br = null);
	}
	function Ar(e) {
		if (e.propertyName === "value" && Cr(xr)) {
			var t = [];
			yr(t, xr, e, gn(e)), bn(Sr, t);
		}
	}
	function jr(e, t, n) {
		e === "focusin" ? (kr(), br = t, xr = n, br.attachEvent("onpropertychange", Ar)) : e === "focusout" && kr();
	}
	function Mr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return Cr(xr);
	}
	function Nr(e, t) {
		if (e === "click") return Cr(t);
	}
	function Pr(e, t) {
		if (e === "input" || e === "change") return Cr(t);
	}
	function Fr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Ir = typeof Object.is == "function" ? Object.is : Fr;
	function Lr(e, t) {
		if (Ir(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!Me.call(t, i) || !Ir(e[i], t[i])) return !1;
		}
		return !0;
	}
	function Rr(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function zr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Br(e, t) {
		var n = zr(e);
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
			n = zr(n);
		}
	}
	function Vr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Vr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Hr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Rr(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Rr(e.document);
		}
		return t;
	}
	function Ur(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var Wr = Sn && "documentMode" in document && 11 >= document.documentMode, Gr = null, Kr = null, qr = null, Jr = !1;
	function Yr(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		Jr || Gr == null || Gr !== Rr(r) || (r = Gr, "selectionStart" in r && Ur(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), qr && Lr(qr, r) || (qr = r, r = qf(Kr, "onSelect"), 0 < r.length && (t = new Pn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Gr)));
	}
	function Xr(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var Zr = {
		animationend: Xr("Animation", "AnimationEnd"),
		animationiteration: Xr("Animation", "AnimationIteration"),
		animationstart: Xr("Animation", "AnimationStart"),
		transitionrun: Xr("Transition", "TransitionRun"),
		transitionstart: Xr("Transition", "TransitionStart"),
		transitioncancel: Xr("Transition", "TransitionCancel"),
		transitionend: Xr("Transition", "TransitionEnd")
	}, Qr = {}, $r = {};
	Sn && ($r = document.createElement("div").style, "AnimationEvent" in window || (delete Zr.animationend.animation, delete Zr.animationiteration.animation, delete Zr.animationstart.animation), "TransitionEvent" in window || delete Zr.transitionend.transition);
	function ei(e) {
		if (Qr[e]) return Qr[e];
		if (!Zr[e]) return e;
		var t = Zr[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in $r) return Qr[e] = t[n];
		return e;
	}
	var ti = ei("animationend"), ni = ei("animationiteration"), ri = ei("animationstart"), ii = ei("transitionrun"), ai = ei("transitionstart"), oi = ei("transitioncancel"), si = ei("transitionend"), ci = /* @__PURE__ */ new Map(), li = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	li.push("scrollEnd");
	function ui(e, t) {
		ci.set(e, t), It(t, [e]);
	}
	var di = 0;
	function fi(e, t) {
		if (e.name != null && e.name !== "auto") return e.name;
		if (t.autoName !== null) return t.autoName;
		e = vd.identifierPrefix;
		var n = di++;
		return e = "_" + e + "t_" + n.toString(32) + "_", t.autoName = e;
	}
	function pi(e) {
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
	function mi(e, t) {
		return e = pi(e), t = pi(t), t == null ? e === "auto" ? null : e : t === "auto" ? null : t;
	}
	var hi = typeof reportError == "function" ? reportError : function(e) {
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
	}, gi = [], _i = 0, vi = 0;
	function yi() {
		for (var e = _i, t = vi = _i = 0; t < e;) {
			var n = gi[t];
			gi[t++] = null;
			var r = gi[t];
			gi[t++] = null;
			var i = gi[t];
			gi[t++] = null;
			var a = gi[t];
			if (gi[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && Ci(n, i, a);
		}
	}
	function bi(e, t, n, r) {
		gi[_i++] = e, gi[_i++] = t, gi[_i++] = n, gi[_i++] = r, vi |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function xi(e, t, n, r) {
		return bi(e, t, n, r), wi(e);
	}
	function Si(e, t) {
		return bi(e, null, null, t), wi(e);
	}
	function Ci(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - Ye(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function wi(e) {
		if (50 < Dd) throw Dd = 0, Od = null, Error(o(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var Ti = {};
	function Ei(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function Di(e, t, n, r) {
		return new Ei(e, t, n, r);
	}
	function Oi(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function ki(e, t) {
		var n = e.alternate;
		return n === null ? (n = Di(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 1206910976, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function Ai(e, t) {
		e.flags &= 1206910978;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function ji(e, t, n, r, i, a) {
		var s = 0;
		if (r = e, typeof r == "function") Oi(r) && (s = 1);
		else if (typeof r == "string") s = qm(e, n, _e.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (r) {
			case re: return e = Di(31, n, t, i), e.elementType = re, e.lanes = a, e;
			case j: return Mi(n.children, i, a, t);
			case M:
				s = 8, i |= 24;
				break;
			case N: return e = Di(12, n, t, i | 2), e.elementType = N, e.lanes = a, e;
			case te: return e = Di(13, n, t, i), e.elementType = te, e.lanes = a, e;
			case ne: return e = Di(19, n, t, i), e.elementType = ne, e.lanes = a, e;
			case ie:
			case ae: return e = i | 32, e = Di(30, n, t, e), e.elementType = ae, e.lanes = a, e.stateNode = {
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
					case I:
						s = 14;
						break a;
					case L:
						s = 16, r = null;
						break a;
				}
				s = 29, n = Error(o(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = Di(s, n, t, i), t.elementType = e, t.type = r, t.lanes = a, t;
	}
	function Mi(e, t, n, r) {
		return e = Di(7, e, r, t), e.lanes = n, e;
	}
	function Ni(e, t, n) {
		return e = Di(6, e, null, t), e.lanes = n, e;
	}
	function Pi(e) {
		var t = Di(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function Fi(e, t, n) {
		return t = Di(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var Ii = /* @__PURE__ */ new WeakMap();
	function Li(e, t) {
		if (typeof e == "object" && e) {
			var n = Ii.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: je(t)
			}, Ii.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: je(t)
		};
	}
	var Ri = [], zi = 0, Bi = null, Vi = 0, Hi = [], Ui = 0, Wi = null, Gi = 1, Ki = "";
	function qi(e, t) {
		Ri[zi++] = Vi, Ri[zi++] = Bi, Bi = e, Vi = t;
	}
	function Ji(e, t, n) {
		Hi[Ui++] = Gi, Hi[Ui++] = Ki, Hi[Ui++] = Wi, Wi = e;
		var r = Gi;
		e = Ki;
		var i = 32 - Ye(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Ye(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, Gi = 1 << 32 - Ye(t) + i | n << i | r, Ki = a + e;
		} else Gi = 1 << a | n << i | r, Ki = e;
	}
	function Yi(e) {
		e.return !== null && (qi(e, 1), Ji(e, 1, 0));
	}
	function Xi(e) {
		for (; e === Bi;) Bi = Ri[--zi], Ri[zi] = null, Vi = Ri[--zi], Ri[zi] = null;
		for (; e === Wi;) Wi = Hi[--Ui], Hi[Ui] = null, Ki = Hi[--Ui], Hi[Ui] = null, Gi = Hi[--Ui], Hi[Ui] = null;
	}
	function Zi(e, t) {
		Hi[Ui++] = Gi, Hi[Ui++] = Ki, Hi[Ui++] = Wi, Gi = t.id, Ki = t.overflow, Wi = e;
	}
	var Qi = null, $i = null, G = !1, ea = null, ta = !1, na = Error(o(519));
	function ra(e) {
		throw la(Li(Error(o(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), na;
	}
	function ia(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[yt] = e, t[bt] = r, n) {
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
				$("invalid", t), en(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				$("invalid", t);
				break;
			case "textarea": $("invalid", t), an(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || $f(t.textContent, n) ? (r.popover != null && ($("beforetoggle", t), $("toggle", t)), r.onScroll != null && $("scroll", t), r.onScrollEnd != null && $("scrollend", t), r.onClick != null && (t.onclick = mn), t = !0) : t = !1, t || ra(e, !0);
	}
	function aa(e) {
		for (Qi = e.return; Qi;) switch (Qi.tag) {
			case 5:
			case 31:
			case 13:
				ta = !1;
				return;
			case 27:
			case 3:
				ta = !0;
				return;
			default: Qi = Qi.return;
		}
	}
	function oa(e) {
		if (e !== Qi) return !1;
		if (!G) return aa(e), G = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || pp(e.type, e.memoizedProps)), n = !n), n && $i && ra(e), aa(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(o(317));
			$i = dm(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(o(317));
			$i = dm(e);
		} else t === 27 ? (t = $i, Sp(e.type) ? (e = um, um = null, $i = e) : $i = t) : $i = Qi ? lm(e.stateNode.nextSibling) : null;
		return !0;
	}
	function sa() {
		$i = Qi = null, G = !1;
	}
	function ca() {
		var e = ea;
		return e !== null && (ud === null ? ud = e : ud.push.apply(ud, e), ea = null), e;
	}
	function la(e) {
		ea === null ? ea = [e] : ea.push(e);
	}
	var ua = he(null), da = null, fa = null;
	function pa(e, t, n) {
		V(ua, t._currentValue), t._currentValue = n;
	}
	function ma(e) {
		e._currentValue = ua.current, ge(ua);
	}
	function ha(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function ga(e, t, n, r) {
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
						a.lanes |= n, c = a.alternate, c !== null && (c.lanes |= n), ha(a.return, n, e), r || (s = null);
						break a;
					}
					a = c.next;
				}
			} else if (i.tag === 18) {
				if (s = i.return, s === null) throw Error(o(341));
				s.lanes |= n, a = s.alternate, a !== null && (a.lanes |= n), ha(s, n, e), s = null;
			} else i.tag === 13 && i.memoizedState !== null && i.memoizedState.dehydrated === null ? (i.lanes |= n, s = i.alternate, s !== null && (s.lanes |= n), ha(i.return, n, e), s = i.child, s = s === null ? null : s.sibling) : s = i.child;
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
	function _a(e, t, n, r) {
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
					Ir(i.pendingProps.value, s.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (i === be.current) {
				if (s = i.alternate, s === null) throw Error(o(387));
				s.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e === null ? e = [sh] : e.push(sh));
			}
			i = i.return;
		}
		return e !== null && ga(t, e, n, r), t.flags |= 262144, e !== null;
	}
	function va(e) {
		for (e = e.firstContext; e !== null;) {
			if (!Ir(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function ya(e) {
		da = e, fa = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function ba(e) {
		return Sa(da, e);
	}
	function xa(e, t) {
		return da === null && ya(e), Sa(e, t);
	}
	function Sa(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, fa === null) {
			if (e === null) throw Error(o(308));
			fa = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else fa = fa.next = t;
		return n;
	}
	var Ca = typeof AbortController < "u" ? AbortController : function() {
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
	}, wa = t.unstable_scheduleCallback, Ta = t.unstable_NormalPriority, Ea = {
		$$typeof: F,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function Da() {
		return {
			controller: new Ca(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function Oa(e) {
		e.refCount--, e.refCount === 0 && wa(Ta, function() {
			e.controller.abort();
		});
	}
	function ka(e, t) {
		if (e.pendingLanes & 4194048) {
			var n = e.transitionTypes;
			for (n === null && (n = e.transitionTypes = []), e = 0; e < t.length; e++) {
				var r = t[e];
				n.indexOf(r) === -1 && n.push(r);
			}
		}
	}
	var Aa = null;
	function ja(e) {
		var t = e.transitionTypes;
		return e.transitionTypes = null, t;
	}
	var K = null, Ma = 0, Na = 0, Pa = null;
	function Fa(e, t) {
		if (K === null) {
			var n = K = [];
			Ma = 0, Na = Nf(), Pa = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return Ma++, t.then(Ia, Ia), t;
	}
	function Ia() {
		if (--Ma === 0 && (Aa = null, K !== null)) {
			Pa !== null && (Pa.status = "fulfilled");
			var e = K;
			K = null, Na = 0, Pa = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function La(e, t) {
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
	var Ra = z.S;
	z.S = function(e, t) {
		if (pd = Le(), typeof t == "object" && t && typeof t.then == "function" && Fa(e, t), Aa !== null) for (var n = yf; n !== null;) ka(n, Aa), n = n.next;
		if (n = e.types, n !== null) {
			for (var r = yf; r !== null;) ka(r, n), r = r.next;
			if (Na !== 0) {
				r = Aa, r === null && (r = Aa = []);
				for (var i = 0; i < n.length; i++) {
					var a = n[i];
					r.indexOf(a) === -1 && r.push(a);
				}
			}
		}
		Ra !== null && Ra(e, t);
	};
	var za = he(null);
	function Ba() {
		var e = za.current;
		return e === null ? Xu.pooledCache : e;
	}
	function Va(e, t) {
		t === null ? V(za, za.current) : V(za, t.pool);
	}
	function Ha() {
		var e = Ba();
		return e === null ? null : {
			parent: Ea._currentValue,
			pool: e
		};
	}
	var Ua = Error(o(460)), Wa = Error(o(474)), Ga = Error(o(542)), Ka = { then: function() {} };
	function qa(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function Ja(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(mn, mn), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, Qa(e), e === void 0 && !("reason" in t) ? Error(o(600)) : e;
			default:
				if (typeof t.status == "string") t.then(mn, mn);
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
					case "rejected": throw e = t.reason, Qa(e), e;
				}
				throw Xa = t, Ua;
		}
	}
	function Ya(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (Xa = e, Ua) : e;
		}
	}
	var Xa = null;
	function Za() {
		if (Xa === null) throw Error(o(459));
		var e = Xa;
		return Xa = null, e;
	}
	function Qa(e) {
		if (e === Ua || e === Ga) throw Error(o(483));
	}
	var $a = null, eo = 0;
	function to(e) {
		var t = eo;
		return eo += 1, $a === null && ($a = []), Ja($a, e, t);
	}
	function no(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function ro(e, t) {
		throw t.$$typeof === O ? Error(o(525)) : (e = Object.prototype.toString.call(t), Error(o(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function io(e) {
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
			return e = ki(e, t), e.index = 0, e.sibling = null, e;
		}
		function a(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 134217730, n) : (r = r.index, r < n ? (t.flags |= 2, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 134217730), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = Ni(n, e.mode, r), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var a = n.type;
			return a === j ? (e = d(e, t, n.props.children, r, n.key), no(e, n), e) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === L && Ya(a) === t.type) ? (t = i(t, n.props), no(t, n), t.return = e, t) : (t = ji(n.type, n.key, n.props, null, e.mode, r), no(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = Fi(n, e.mode, r), t.return = e, t) : (t = i(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, a) {
			return t === null || t.tag !== 7 ? (t = Mi(n, e.mode, r, a), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = Ni("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case k: return n = ji(t.type, t.key, t.props, null, e.mode, n), no(n, t), n.return = e, n;
					case A: return t = Fi(t, e.mode, n), t.return = e, t;
					case L: return t = Ya(t), f(e, t, n);
				}
				if (de(t) || ce(t)) return t = Mi(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, to(t), n);
				if (t.$$typeof === F) return f(e, xa(e, t), n);
				ro(e, t);
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
					case L: return n = Ya(n), p(e, t, n, r);
				}
				if (de(n) || ce(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, to(n), r);
				if (n.$$typeof === F) return p(e, t, xa(e, n), r);
				ro(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case k: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case A: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case L: return r = Ya(r), m(e, t, n, r, i);
				}
				if (de(r) || ce(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, to(r), i);
				if (r.$$typeof === F) return m(e, t, n, xa(t, r), i);
				ro(t, r);
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
			if (h === s.length) return n(i, d), G && qi(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (o = a(d, o, h), u === null ? l = d : u.sibling = d, u = d);
				return G && qi(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && (_ = g.alternate, _ !== null && d.delete(_.key === null ? h : _.key)), o = a(g, o, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), G && qi(i, h), l;
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
			if (v.done) return n(i, h), G && qi(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (s = a(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return G && qi(i, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && (_ = v.alternate, _ !== null && h.delete(_.key === null ? g : _.key)), s = a(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), G && qi(i, g), u;
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
											n(e, r.sibling), c = i(r, a.props.children), no(c, a), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === L && Ya(l) === r.type) {
										n(e, r.sibling), c = i(r, a.props), no(c, a), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							a.type === j ? (c = Mi(a.props.children, e.mode, c, a.key), no(c, a), c.return = e, e = c) : (c = ji(a.type, a.key, a.props, null, e.mode, c), no(c, a), c.return = e, e = c);
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
							c = Fi(a, e.mode, c), c.return = e, e = c;
						}
						return s(e);
					case L: return a = Ya(a), _(e, r, a, c);
				}
				if (de(a)) return h(e, r, a, c);
				if (ce(a)) {
					if (l = ce(a), typeof l != "function") throw Error(o(150));
					return a = l.call(a), g(e, r, a, c);
				}
				if (typeof a.then == "function") return _(e, r, to(a), c);
				if (a.$$typeof === F) return _(e, r, xa(e, a), c);
				ro(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" || typeof a == "bigint" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), c = i(r, a), c.return = e, e = c) : (n(e, r), c = Ni(a, e.mode, c), c.return = e, e = c), s(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				eo = 0;
				var i = _(e, t, n, r);
				return $a = null, i;
			} catch (t) {
				if (t === Ua || t === Ga) throw t;
				var a = Di(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var ao = io(!0), oo = io(!1), so = !1;
	function co(e) {
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
	function lo(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function uo(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function fo(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, X & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = wi(e), Ci(e, null, n), t;
		}
		return bi(e, r, t, n), wi(e);
	}
	function po(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, ft(e, n);
		}
	}
	function mo(e, t) {
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
	var ho = !1;
	function go() {
		if (ho) {
			var e = Pa;
			if (e !== null) throw e;
		}
	}
	function _o(e, t, n, r) {
		ho = !1;
		var i = e.updateQueue;
		so = !1;
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
					f !== 0 && f === Na && (ho = !0), u !== null && (u = u.next = {
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
							case 2: so = !0;
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
	function vo(e, t) {
		if (typeof e != "function") throw Error(o(191, e));
		e.call(t);
	}
	function yo(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) vo(n[e], t);
	}
	var bo = he(null), xo = he(0);
	function So(e, t) {
		e = nd, V(xo, e), V(bo, t), nd = e | t.baseLanes;
	}
	function Co() {
		V(xo, nd), V(bo, bo.current);
	}
	function wo() {
		nd = xo.current, ge(bo), ge(xo);
	}
	var To = he(null), Eo = null;
	function Do(e) {
		var t = e.alternate;
		V(Mo, Mo.current & 1), V(To, e), Eo === null && (t === null || bo.current !== null || t.memoizedState !== null) && (Eo = e);
	}
	function Oo(e) {
		V(Mo, Mo.current), V(To, e), Eo === null && (Eo = e);
	}
	function ko(e) {
		e.tag === 22 ? (V(Mo, Mo.current), V(To, e), Eo === null && (Eo = e)) : Ao();
	}
	function Ao() {
		V(Mo, Mo.current), V(To, To.current);
	}
	function jo(e) {
		ge(To), Eo === e && (Eo = null), ge(Mo);
	}
	var Mo = he(0);
	function No(e, t) {
		V(To, To.current), V(Mo, t);
	}
	function Po(e) {
		ge(Mo), ge(To), Eo === e && (Eo = null);
	}
	function Fo(e) {
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
	var Io = 0, q = null, J = null, Lo = null, Ro = !1, zo = !1, Bo = !1, Vo = 0, Ho = 0, Uo = null, Wo = 0;
	function Go() {
		throw Error(o(321));
	}
	function Ko(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Ir(e[n], t[n])) return !1;
		return !0;
	}
	function qo(e, t, n, r, i, a) {
		return Io = a, q = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, z.H = e === null || e.memoizedState === null ? uc : dc, Bo = !1, a = n(r, i), Bo = !1, zo && (a = Yo(t, n, r, i)), Jo(e), a;
	}
	function Jo(e) {
		z.H = lc;
		var t = J !== null && J.next !== null;
		if (Io = 0, Lo = J = q = null, Ro = !1, Ho = 0, Uo = null, t) throw Error(o(300));
		e === null || Oc || (e = e.dependencies, e !== null && va(e) && (Oc = !0));
	}
	function Yo(e, t, n, r) {
		q = e;
		var i = 0;
		do {
			if (zo && (Uo = null), Ho = 0, zo = !1, 25 <= i) throw Error(o(301));
			if (i += 1, Lo = J = null, e.updateQueue != null) {
				var a = e.updateQueue;
				a.lastEffect = null, a.events = null, a.stores = null, a.memoCache != null && (a.memoCache.index = 0);
			}
			z.H = fc, a = t(n, r);
		} while (zo);
		return a;
	}
	function Xo() {
		var e = z.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? rs(t) : t, e = e.useState()[0], (J === null ? null : J.memoizedState) !== e && (q.flags |= 1024), t;
	}
	function Zo() {
		var e = Vo !== 0;
		return Vo = 0, e;
	}
	function Qo(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function $o(e) {
		if (Ro) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			Ro = !1;
		}
		Io = 0, Lo = J = q = null, zo = !1, Ho = Vo = 0, Uo = null;
	}
	function es() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return Lo === null ? q.memoizedState = Lo = e : Lo = Lo.next = e, Lo;
	}
	function ts() {
		if (J === null) {
			var e = q.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = J.next;
		var t = Lo === null ? q.memoizedState : Lo.next;
		if (t !== null) Lo = t, J = e;
		else {
			if (e === null) throw q.alternate === null ? Error(o(467)) : Error(o(310));
			J = e, e = {
				memoizedState: J.memoizedState,
				baseState: J.baseState,
				baseQueue: J.baseQueue,
				queue: J.queue,
				next: null
			}, Lo === null ? q.memoizedState = Lo = e : Lo = Lo.next = e;
		}
		return Lo;
	}
	function ns() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function rs(e) {
		var t = Ho;
		return Ho += 1, Uo === null && (Uo = []), e = Ja(Uo, e, t), t = q, (Lo === null ? t.memoizedState : Lo.next) === null && (t = t.alternate, z.H = t === null || t.memoizedState === null ? uc : dc), e;
	}
	function is(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return rs(e);
			if (e.$$typeof === oe) return;
			if (e.$$typeof === F) return ba(e);
		}
		throw Error(o(438, String(e)));
	}
	function as(e) {
		var t = null, n = q.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = q.alternate;
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
		}, n === null && (n = ns(), q.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = R;
		return t.index++, n;
	}
	function os(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function ss(e) {
		return cs(ts(), J, e);
	}
	function cs(e, t, n) {
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
				if (f === u.lane ? (Io & f) === f : (Q & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === Na && (d = !0);
					else if ((Io & p) === p) {
						u = u.next, p === Na && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, s = a) : l = l.next = f, q.lanes |= p, id |= p;
					f = u.action, Bo && n(a, f), a = u.hasEagerState ? u.eagerState : n(a, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, s = a) : l = l.next = p, q.lanes |= f, id |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? s = a : l.next = c, !Ir(a, e.memoizedState) && (Oc = !0, d && (n = Pa, n !== null))) throw n;
			e.memoizedState = a, e.baseState = s, e.baseQueue = l, r.lastRenderedState = a;
		}
		return i === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function ls(e) {
		var t = ts(), n = t.queue;
		if (n === null) throw Error(o(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, i = n.pending, a = t.memoizedState;
		if (i !== null) {
			n.pending = null;
			var s = i = i.next;
			do
				a = e(a, s.action), s = s.next;
			while (s !== i);
			Ir(a, t.memoizedState) || (Oc = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
		}
		return [a, r];
	}
	function us(e, t, n) {
		var r = q, i = ts(), a = G;
		if (a) {
			if (n === void 0) throw Error(o(407));
			n = n();
		} else n = t();
		var s = !Ir((J || i).memoizedState, n);
		if (s && (i.memoizedState = n, Oc = !0), i = i.queue, Fs(ps.bind(null, r, i, e), [e]), e = i.getSnapshot !== t || s || Lo !== null && !!(Lo.memoizedState.tag & 1), As(e ? 9 : 8, { destroy: void 0 }, fs.bind(null, r, i, n, t), null), e) {
			if (r.flags |= 2048, Xu === null) throw Error(o(349));
			a || Io & 127 || ds(r, t, n);
		}
		return n;
	}
	function ds(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = q.updateQueue, t === null ? (t = ns(), q.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function fs(e, t, n, r) {
		t.value = n, t.getSnapshot = r, ms(t) && hs(e);
	}
	function ps(e, t, n) {
		return n(function() {
			ms(t) && hs(e);
		});
	}
	function ms(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Ir(e, n);
		} catch {
			return !0;
		}
	}
	function hs(e) {
		var t = Si(e, 2);
		t !== null && Md(t, e, 2);
	}
	function gs(e) {
		var t = es();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), Bo) {
				Je(!0);
				try {
					n();
				} finally {
					Je(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: os,
			lastRenderedState: e
		}, t;
	}
	function _s(e, t, n, r) {
		return e.baseState = n, cs(e, J, typeof r == "function" ? r : os);
	}
	function vs(e, t, n, r, i) {
		if (oc(e)) throw Error(o(485));
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
			z.T === null ? a.isTransition = !1 : n(!0), r(a), n = t.pending, n === null ? (a.next = t.pending = a, ys(t, a)) : (a.next = n.next, t.pending = n.next = a);
		}
	}
	function ys(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = z.T, o = {};
			o.types = a === null ? null : a.types, z.T = o;
			try {
				var s = n(i, r), c = z.S;
				c !== null && c(o, s), bs(e, t, s);
			} catch (n) {
				Ss(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), z.T = a;
			}
		} else try {
			a = n(i, r), bs(e, t, a);
		} catch (n) {
			Ss(e, t, n);
		}
	}
	function bs(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			xs(e, t, n);
		}, function(n) {
			return Ss(e, t, n);
		}) : xs(e, t, n);
	}
	function xs(e, t, n) {
		t.status = "fulfilled", t.value = n, Cs(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, ys(e, n)));
	}
	function Ss(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, Cs(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function Cs(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function ws(e, t) {
		return t;
	}
	function Ts(e, t) {
		if (G) {
			var n = Xu.formState;
			if (n !== null) {
				a: {
					var r = q;
					if (G) {
						if ($i) {
							b: {
								for (var i = $i, a = ta; i.nodeType !== 8;) if (!a || (i = lm(i.nextSibling), i === null)) {
									i = null;
									break b;
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								$i = lm(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						ra(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = es(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: ws,
			lastRenderedState: t
		}, n.queue = r, n = rc.bind(null, q, r), r.dispatch = n, r = gs(!1), a = ac.bind(null, q, !1, r.queue), r = es(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = vs.bind(null, q, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function Es(e) {
		return Ds(ts(), J, e);
	}
	function Ds(e, t, n) {
		if (t = cs(e, t, ws)[0], e = ss(os)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = rs(t);
		} catch (e) {
			throw e === Ua ? Ga : e;
		}
		else r = t;
		t = ts();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (q.flags |= 2048, As(9, { destroy: void 0 }, Os.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function Os(e, t) {
		e.action = t;
	}
	function ks(e) {
		var t = ts(), n = J;
		if (n !== null) return Ds(t, n, e);
		ts(), t = t.memoizedState, n = ts();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function As(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = q.updateQueue, t === null && (t = ns(), q.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function js() {
		return ts().memoizedState;
	}
	function Ms(e, t, n, r) {
		var i = es();
		q.flags |= e, i.memoizedState = As(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function Ns(e, t, n, r) {
		var i = ts();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		J !== null && r !== null && Ko(r, J.memoizedState.deps) ? i.memoizedState = As(t, a, n, r) : (q.flags |= e, i.memoizedState = As(1 | t, a, n, r));
	}
	function Ps(e, t) {
		Ms(8390656, 8, e, t);
	}
	function Fs(e, t) {
		Ns(2048, 8, e, t);
	}
	function Is(e) {
		q.flags |= 4;
		var t = q.updateQueue;
		if (t === null) t = ns(), q.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function Ls(e) {
		var t = ts().memoizedState;
		return Is({
			ref: t,
			nextImpl: e
		}), function() {
			if (X & 2) throw Error(o(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function Rs(e, t) {
		return Ns(4, 2, e, t);
	}
	function zs(e, t) {
		return Ns(4, 4, e, t);
	}
	function Bs(e, t) {
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
	function Vs(e, t, n) {
		n = n == null ? null : n.concat([e]), Ns(4, 4, Bs.bind(null, t, e), n);
	}
	function Hs() {}
	function Us(e, t) {
		var n = ts();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && Ko(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function Ws(e, t) {
		var n = ts();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && Ko(t, r[1])) return r[0];
		if (r = e(), Bo) {
			Je(!0);
			try {
				e();
			} finally {
				Je(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function Gs(e, t, n) {
		return n === void 0 || Io & 1073741824 && !(Q & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = Ad(), q.lanes |= e, id |= e, n);
	}
	function Ks(e, t, n, r) {
		return Ir(n, t) ? n : bo.current === null ? !(Io & 106) || Io & 1073741824 && !(Q & 261930) ? (Oc = !0, e.memoizedState = n) : (e = Ad(), q.lanes |= e, id |= e, t) : (e = Gs(e, n, r), Ir(e, t) || (Oc = !0), e);
	}
	function qs(e, t, n, r, i) {
		var a = B.p;
		B.p = a !== 0 && 8 > a ? a : 8;
		var o = z.T, s = {};
		s.types = o === null ? null : o.types, z.T = s, ac(e, !1, t, n);
		try {
			var c = i(), l = z.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? ic(e, t, La(c, r), kd(e)) : ic(e, t, r, kd(e));
		} catch (n) {
			ic(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, kd());
		} finally {
			B.p = a, o !== null && s.types !== null && (o.types = s.types), z.T = o;
		}
	}
	function Js() {}
	function Ys(e, t, n, r) {
		if (e.tag !== 5) throw Error(o(476));
		var i = Xs(e).queue;
		qs(e, i, t, fe, n === null ? Js : function() {
			return Zs(e), n(r);
		});
	}
	function Xs(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: fe,
			baseState: fe,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: os,
				lastRenderedState: fe
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
				lastRenderedReducer: os,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function Zs(e) {
		var t = Xs(e);
		t.next === null && (t = e.alternate.memoizedState), ic(e, t.next.queue, {}, kd());
	}
	function Qs() {
		return ba(sh);
	}
	function $s() {
		return ts().memoizedState;
	}
	function ec() {
		return ts().memoizedState;
	}
	function tc(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = kd();
					e = uo(n);
					var r = fo(t, e, n);
					r !== null && (Md(r, t, n), po(r, t, n)), t = { cache: Da() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function nc(e, t, n) {
		var r = kd();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, oc(e) ? sc(t, n) : (n = xi(e, t, n, r), n !== null && (Md(n, e, r), cc(n, t, r)));
	}
	function rc(e, t, n) {
		ic(e, t, n, kd());
	}
	function ic(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (oc(e)) sc(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, Ir(s, o)) return bi(e, t, i, 0), Xu === null && yi(), !1;
			} catch {}
			if (n = xi(e, t, i, r), n !== null) return Md(n, e, r), cc(n, t, r), !0;
		}
		return !1;
	}
	function ac(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: Nf(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, oc(e)) {
			if (t) throw Error(o(479));
		} else t = xi(e, n, r, 2), t !== null && Md(t, e, 2);
	}
	function oc(e) {
		var t = e.alternate;
		return e === q || t !== null && t === q;
	}
	function sc(e, t) {
		zo = Ro = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function cc(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, ft(e, n);
		}
	}
	var lc = {
		readContext: ba,
		use: is,
		useCallback: Go,
		useContext: Go,
		useEffect: Go,
		useImperativeHandle: Go,
		useLayoutEffect: Go,
		useInsertionEffect: Go,
		useMemo: Go,
		useReducer: Go,
		useRef: Go,
		useState: Go,
		useDebugValue: Go,
		useDeferredValue: Go,
		useTransition: Go,
		useSyncExternalStore: Go,
		useId: Go,
		useHostTransitionStatus: Go,
		useFormState: Go,
		useActionState: Go,
		useOptimistic: Go,
		useMemoCache: Go,
		useCacheRefresh: Go,
		useEffectEvent: Go
	}, uc = {
		readContext: ba,
		use: is,
		useCallback: function(e, t) {
			return es().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: ba,
		useEffect: Ps,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), Ms(4194308, 4, Bs.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return Ms(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			Ms(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = es();
			t = t === void 0 ? null : t;
			var r = e();
			if (Bo) {
				Je(!0);
				try {
					e();
				} finally {
					Je(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = es();
			if (n !== void 0) {
				var i = n(t);
				if (Bo) {
					Je(!0);
					try {
						n(t);
					} finally {
						Je(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = nc.bind(null, q, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = es();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = gs(e);
			var t = e.queue, n = rc.bind(null, q, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: Hs,
		useDeferredValue: function(e, t) {
			return Gs(es(), e, t);
		},
		useTransition: function() {
			var e = gs(!1);
			return e = qs.bind(null, q, e.queue, !0, !1), es().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = q, i = es();
			if (G) {
				if (n === void 0) throw Error(o(407));
				n = n();
			} else {
				if (n = t(), Xu === null) throw Error(o(349));
				Q & 127 || ds(r, t, n);
			}
			i.memoizedState = n;
			var a = {
				value: n,
				getSnapshot: t
			};
			return i.queue = a, Ps(ps.bind(null, r, a, e), [e]), r.flags |= 2048, As(9, { destroy: void 0 }, fs.bind(null, r, a, n, t), null), n;
		},
		useId: function() {
			var e = es(), t = Xu.identifierPrefix;
			if (G) {
				var n = Ki, r = Gi;
				n = (r & ~(1 << 32 - Ye(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = Vo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = Wo++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: Qs,
		useFormState: Ts,
		useActionState: Ts,
		useOptimistic: function(e) {
			var t = es();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = ac.bind(null, q, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: as,
		useCacheRefresh: function() {
			return es().memoizedState = tc.bind(null, q);
		},
		useEffectEvent: function(e) {
			var t = es(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (X & 2) throw Error(o(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, dc = {
		readContext: ba,
		use: is,
		useCallback: Us,
		useContext: ba,
		useEffect: Fs,
		useImperativeHandle: Vs,
		useInsertionEffect: Rs,
		useLayoutEffect: zs,
		useMemo: Ws,
		useReducer: ss,
		useRef: js,
		useState: function() {
			return ss(os);
		},
		useDebugValue: Hs,
		useDeferredValue: function(e, t) {
			return Ks(ts(), J.memoizedState, e, t);
		},
		useTransition: function() {
			var e = ss(os)[0], t = ts().memoizedState;
			return [typeof e == "boolean" ? e : rs(e), t];
		},
		useSyncExternalStore: us,
		useId: $s,
		useHostTransitionStatus: Qs,
		useFormState: Es,
		useActionState: Es,
		useOptimistic: function(e, t) {
			return _s(ts(), J, e, t);
		},
		useMemoCache: as,
		useCacheRefresh: ec,
		useEffectEvent: Ls
	}, fc = {
		readContext: ba,
		use: is,
		useCallback: Us,
		useContext: ba,
		useEffect: Fs,
		useImperativeHandle: Vs,
		useInsertionEffect: Rs,
		useLayoutEffect: zs,
		useMemo: Ws,
		useReducer: ls,
		useRef: js,
		useState: function() {
			return ls(os);
		},
		useDebugValue: Hs,
		useDeferredValue: function(e, t) {
			var n = ts();
			return J === null ? Gs(n, e, t) : Ks(n, J.memoizedState, e, t);
		},
		useTransition: function() {
			var e = ls(os)[0], t = ts().memoizedState;
			return [typeof e == "boolean" ? e : rs(e), t];
		},
		useSyncExternalStore: us,
		useId: $s,
		useHostTransitionStatus: Qs,
		useFormState: ks,
		useActionState: ks,
		useOptimistic: function(e, t) {
			var n = ts();
			return J === null ? (n.baseState = e, [e, n.queue.dispatch]) : _s(n, J, e, t);
		},
		useMemoCache: as,
		useCacheRefresh: ec,
		useEffectEvent: Ls
	};
	function pc(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : D({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var mc = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = kd(), i = uo(r);
			i.payload = t, n != null && (i.callback = n), t = fo(e, i, r), t !== null && (Md(t, e, r), po(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = kd(), i = uo(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = fo(e, i, r), t !== null && (Md(t, e, r), po(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = kd(), r = uo(n);
			r.tag = 2, t != null && (r.callback = t), t = fo(e, r, n), t !== null && (Md(t, e, n), po(t, e, n));
		}
	};
	function hc(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Lr(n, r) || !Lr(i, a) : !0;
	}
	function gc(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && mc.enqueueReplaceState(t, t.state, null);
	}
	function _c(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = D({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function vc(e) {
		hi(e);
	}
	function yc(e) {
		console.error(e);
	}
	function bc(e) {
		hi(e);
	}
	function xc(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Sc(e, t, n) {
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
	function Cc(e, t, n) {
		return n = uo(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			xc(e, t);
		}, n;
	}
	function wc(e) {
		return e = uo(e), e.tag = 3, e;
	}
	function Tc(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				Sc(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			Sc(t, n, r), typeof i != "function" && (gd === null ? gd = /* @__PURE__ */ new Set([this]) : gd.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function Ec(e, t, n, r, i) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && _a(t, n, i, !0), n = To.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13:
					case 19: return Eo === null ? Wd() : n.alternate === null && rd === 0 && (rd = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, r === Ka ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), pf(e, r, i)), !1;
					case 22: return n.flags |= 65536, r === Ka ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), pf(e, r, i)), !1;
				}
				throw Error(o(435, n.tag));
			}
			return pf(e, r, i), Wd(), !1;
		}
		if (G) return t = To.current, t === null ? (r !== na && (t = Error(o(423), { cause: r }), la(Li(t, n))), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, r = Li(r, n), i = Cc(e.stateNode, r, i), mo(e, i), rd !== 4 && (rd = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = i, r !== na && (e = Error(o(422), { cause: r }), la(Li(e, n)))), !1;
		var a = Error(o(520), { cause: r });
		if (a = Li(a, n), ld === null ? ld = [a] : ld.push(a), rd !== 4 && (rd = 2), t === null) return !0;
		r = Li(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = i & -i, n.lanes |= e, e = Cc(n.stateNode, r, e), mo(n, e), !1;
				case 1:
					if (t = n.type, a = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || a !== null && typeof a.componentDidCatch == "function" && (gd === null || !gd.has(a)))) return n.flags |= 65536, i &= -i, n.lanes |= i, i = wc(i), Tc(i, e, n, r), mo(n, i), !1;
					break;
				case 22: if (n.memoizedState !== null) return n.flags |= 65536, !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Dc = Error(o(461)), Oc = !1;
	function kc(e, t, n, r) {
		t.child = e === null ? oo(t, null, n, r) : ao(t, e.child, n, r);
	}
	function Ac(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return ya(t), r = qo(e, t, n, o, a, i), s = Zo(), e !== null && !Oc ? (Qo(e, t, i), il(e, t, i)) : (G && s && Yi(t), t.flags |= 1, kc(e, t, r, i), t.child);
	}
	function jc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !Oi(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, Mc(e, t, a, r, i)) : (e = ji(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !al(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Lr : n, n(o, r) && e.ref === t.ref) return il(e, t, i);
		}
		return t.flags |= 1, e = ki(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function Mc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Lr(a, r) && e.ref === t.ref) {
				if (Oc = !1, t.pendingProps = r = a, al(e, i)) e.flags & 131072 && (Oc = !0);
				else return t.lanes = e.lanes, il(e, t, i);
			}
		}
		return Bc(e, t, n, r, i);
	}
	function Nc(e, t, n, r) {
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
				return Fc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && Va(t, a === null ? null : a.cachePool), a === null ? Co() : So(t, a), ko(t);
			else return r = t.lanes = 536870912, Fc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && Va(t, null), Co(), Ao()) : (Va(t, a.cachePool), So(t, a), Ao(), t.memoizedState = null);
		return kc(e, t, i, n), t.child;
	}
	function Pc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function Fc(e, t, n, r, i) {
		var a = Ba();
		return a = a === null ? null : {
			parent: Ea._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && Va(t, null), Co(), ko(t), e !== null && _a(e, t, r, !0), t.childLanes = i, null;
	}
	function Ic(e, t) {
		return t = Yc({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function Lc(e, t, n) {
		return ao(t, e.child, null, n), e = Ic(t, t.pendingProps), e.flags |= 2, jo(t), t.memoizedState = null, e;
	}
	function Rc(e, t, n) {
		var r = t.pendingProps, i = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (G) {
				if (r.mode === "hidden") return e = Ic(t, r), t.lanes = 536870912, e.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, Pc(null, e);
				if (Oo(t), (e = $i) ? (e = am(e, ta), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Wi === null ? null : {
						id: Gi,
						overflow: Ki
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Pi(e), n.return = t, t.child = n, Qi = t, $i = null)) : e = null, e === null) throw ra(t);
				return t.lanes = 536870912, null;
			}
			return Ic(t, r);
		}
		var a = e.memoizedState;
		if (a !== null) {
			var s = a.dehydrated;
			if (Oo(t), i) {
				if (t.flags & 256) t.flags &= -257, t = Lc(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(o(558));
			} else if (Oc || _a(e, t, n, !1), i = (n & e.childLanes) !== 0, Oc || i) {
				if (bo.current === null) {
					if (r = Xu, r !== null && (s = pt(r, n), s !== 0 && s !== a.retryLane)) throw a.retryLane = s, Si(e, s), Md(r, e, s), Dc;
					Wd();
				}
				t = Lc(e, t, n);
			} else e = a.treeContext, $i = lm(s.nextSibling), Qi = t, G = !0, ea = null, ta = !1, e !== null && Zi(t, e), t = Ic(t, r), t.flags |= 134221824;
			return t;
		}
		return e = ki(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function zc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(o(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function Bc(e, t, n, r, i) {
		return ya(t), n = qo(e, t, n, r, void 0, i), r = Zo(), e !== null && !Oc ? (Qo(e, t, i), il(e, t, i)) : (G && r && Yi(t), t.flags |= 1, kc(e, t, n, i), t.child);
	}
	function Vc(e, t, n, r, i, a) {
		return ya(t), t.updateQueue = null, n = Yo(t, r, n, i), Jo(e), r = Zo(), e !== null && !Oc ? (Qo(e, t, a), il(e, t, a)) : (G && r && Yi(t), t.flags |= 1, kc(e, t, n, a), t.child);
	}
	function Hc(e, t, n, r, i) {
		if (ya(t), t.stateNode === null) {
			var a = Ti, o = n.contextType;
			typeof o == "object" && o && (a = ba(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = mc, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, co(t), o = n.contextType, a.context = typeof o == "object" && o ? ba(o) : Ti, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (pc(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && mc.enqueueReplaceState(a, a.state, null), _o(t, r, a, i), go(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = _c(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = Ti, typeof u == "object" && u && (o = ba(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && gc(t, a, r, o), so = !1;
			var f = t.memoizedState;
			a.state = f, _o(t, r, a, i), go(), l = t.memoizedState, s || f !== l || so ? (typeof d == "function" && (pc(t, n, d, r), l = t.memoizedState), (c = so || hc(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, lo(e, t), o = t.memoizedProps, u = _c(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = Ti, typeof l == "object" && l && (c = ba(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && gc(t, a, r, c), so = !1, f = t.memoizedState, a.state = f, _o(t, r, a, i), go();
			var p = t.memoizedState;
			o !== d || f !== p || so || e !== null && e.dependencies !== null && va(e.dependencies) ? (typeof s == "function" && (pc(t, n, s, r), p = t.memoizedState), (u = so || hc(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && va(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, zc(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = ao(t, e.child, null, i), t.child = ao(t, null, n, i)) : kc(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = il(e, t, i), e;
	}
	function Uc(e, t, n, r) {
		return sa(), t.flags |= 256, kc(e, t, n, r), t.child;
	}
	var Wc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function Gc(e) {
		return {
			baseLanes: e,
			cachePool: Ha()
		};
	}
	function Kc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= sd), e;
	}
	function qc(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : !!(Mo.current & 2)), o && (i = !0, t.flags &= -129), o = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (G) {
				if (i ? Do(t) : Ao(), (e = $i) ? (e = am(e, ta), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Wi === null ? null : {
						id: Gi,
						overflow: Ki
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Pi(e), n.return = t, t.child = n, Qi = t, $i = null)) : e = null, e === null) throw ra(t);
				return t.lanes = sm(e) ? 32 : 536870912, null;
			}
			return a = r.children, r = r.fallback, i ? (Ao(), i = t.mode, a = Yc({
				mode: "hidden",
				children: a
			}, i), r = Mi(r, i, n, null), a.return = t, r.return = t, a.sibling = r, t.child = a, r = t.child, r.memoizedState = Gc(n), r.childLanes = Kc(e, o, n), t.memoizedState = Wc, Pc(null, r)) : (Do(t), Jc(t, a));
		}
		var s = e.memoizedState;
		if (s !== null) {
			var c = s.dehydrated;
			if (c !== null) return Zc(e, t, a, o, r, c, s, n);
		}
		return i ? (Ao(), i = r.fallback, a = t.mode, s = e.child, c = s.sibling, r = ki(s, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = s.subtreeFlags & 1206910976, c === null ? (i = Mi(i, a, n, null), i.flags |= 2) : i = ki(c, i), i.return = t, r.return = t, r.sibling = i, t.child = r, Pc(null, r), r = t.child, i = e.child.memoizedState, i === null ? i = Gc(n) : (a = i.cachePool, a === null ? a = Ha() : (s = Ea._currentValue, a = a.parent === s ? a : {
			parent: s,
			pool: s
		}), i = {
			baseLanes: i.baseLanes | n,
			cachePool: a
		}), r.memoizedState = i, r.childLanes = Kc(e, o, n), t.memoizedState = Wc, Pc(e.child, r)) : (Do(t), n = e.child, e = n.sibling, n = ki(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function Jc(e, t) {
		return t = Yc({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function Yc(e, t) {
		return e = Di(22, e, null, t), e.lanes = 0, e;
	}
	function Xc(e, t, n) {
		return ao(t, e.child, null, n), e = Jc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function Zc(e, t, n, r, i, a, s, c) {
		if (n) return t.flags & 256 ? (Do(t), t.flags &= -257, Xc(e, t, c)) : t.memoizedState === null ? (Ao(), a = i.fallback, s = t.mode, i = Yc({
			mode: "visible",
			children: i.children
		}, s), a = Mi(a, s, c, null), a.flags |= 2, i.return = t, a.return = t, i.sibling = a, t.child = i, ao(t, e.child, null, c), i = t.child, i.memoizedState = Gc(c), i.childLanes = Kc(e, r, c), t.memoizedState = Wc, Pc(null, i)) : (Ao(), t.child = e.child, t.flags |= 128, null);
		if (Do(t), sm(a)) {
			if (r = a.nextSibling && a.nextSibling.dataset, r) var l = r.dgst;
			return r = l, r !== "" && (i = Error(o(419)), i.stack = "", i.digest = r, la({
				value: i,
				source: null,
				stack: null
			})), Xc(e, t, c);
		}
		if (Oc || _a(e, t, c, !1), r = (c & e.childLanes) !== 0, Oc || r) {
			if (bo.current !== null) return Xc(e, t, c);
			if (r = Xu, r !== null && (i = pt(r, c), i !== 0 && i !== s.retryLane)) throw s.retryLane = i, Si(e, i), Md(r, e, i), Dc;
			return om(a) || Wd(), Xc(e, t, c);
		}
		return om(a) ? (t.flags |= 192, t.child = e.child, null) : (e = s.treeContext, $i = lm(a.nextSibling), Qi = t, G = !0, ea = null, ta = !1, e !== null && Zi(t, e), t = Jc(t, i.children), t.flags |= 134221824, t);
	}
	function Qc(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), ha(e.return, t, n);
	}
	function $c(e) {
		for (var t = null; e !== null;) {
			var n = e.alternate;
			n !== null && Fo(n) === null && (t = e), e = e.sibling;
		}
		return t;
	}
	function el(e, t, n, r, i, a) {
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
	function tl(e) {
		var t = e.child;
		for (e.child = null; t !== null;) {
			var n = t.sibling;
			t.sibling = e.child, e.child = t, t = n;
		}
	}
	function nl(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = Mo.current;
		if (t.flags & 128) return No(t, o), null;
		var s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, No(t, o), i === "backwards" && e !== null ? (tl(e), kc(e, t, r, n), tl(e)) : kc(e, t, r, n), r = G ? Vi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && Qc(e, n, t);
			else if (e.tag === 19) Qc(e, n, t);
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
				n = $c(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null, tl(t)), el(t, !0, i, null, a, r);
				break;
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && Fo(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				el(t, !0, n, null, a, r);
				break;
			case "together":
				el(t, !1, null, null, void 0, r);
				break;
			case "independent":
				t.memoizedState = null;
				break;
			default: n = $c(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), el(t, !1, i, n, a, r);
		}
		return t.child;
	}
	function rl(e, t, n) {
		var r = t.pendingProps;
		return pa(t, t.type, r.value), kc(e, t, r.children, n), t.child;
	}
	function il(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), id |= t.lanes, (n & t.childLanes) === 0) {
			if (e !== null) {
				if (_a(e, t, n, !1), (n & t.childLanes) === 0) return null;
			} else return null;
		}
		if (e !== null && t.child !== e.child) throw Error(o(153));
		if (t.child !== null) {
			for (e = t.child, n = ki(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = ki(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function al(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && va(e)));
	}
	function ol(e, t, n) {
		switch (t.tag) {
			case 3:
				xe(t, t.stateNode.containerInfo), pa(t, Ea, e.memoizedState.cache), sa();
				break;
			case 27:
			case 5:
				Ce(t);
				break;
			case 4:
				xe(t, t.stateNode.containerInfo);
				break;
			case 10:
				pa(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, Oo(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) {
					if (r.dehydrated !== null) return Do(t), t.flags |= 128, null;
					r = _a(e, t, n, !1);
					var i = t.child.childLanes;
					return r || (n & i) !== 0 ? qc(e, t, n) : (Do(t), e = il(e, t, n), e === null ? null : e.sibling);
				}
				Do(t);
				break;
			case 19:
				if (t.flags & 128) return nl(e, t, n);
				if (i = !!(e.flags & 128), r = (n & t.childLanes) !== 0, r ||= (_a(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return nl(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), No(t, Mo.current), r) break;
				return null;
			case 22: return t.lanes = 0, Nc(e, t, n, t.pendingProps);
			case 24: pa(t, Ea, e.memoizedState.cache);
		}
		return il(e, t, n);
	}
	function sl(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) Oc = !0;
			else {
				if (!al(e, n) && !(t.flags & 128)) return Oc = !1, ol(e, t, n);
				Oc = !!(e.flags & 131072);
			}
		} else Oc = !1, G && t.flags & 1048576 && Ji(t, Vi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = Ya(t.elementType), t.type = e, typeof e == "function") Oi(e) ? (r = _c(e, r), t.tag = 1, t = Hc(null, t, e, r, n)) : (t.tag = 0, t = Bc(null, t, e, r, n));
					else {
						if (e != null) {
							var i = e.$$typeof;
							if (i === ee) {
								t.tag = 11, t = Ac(null, t, e, r, n);
								break a;
							}
							if (i === I) {
								t.tag = 14, t = jc(null, t, e, r, n);
								break a;
							}
							if (i === F) {
								t.tag = 10, t.type = e, t = rl(null, t, n);
								break a;
							}
						}
						throw t = ue(e) || e, Error(o(306, t, ""));
					}
				}
				return t;
			case 0: return Bc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, i = _c(r, t.pendingProps), Hc(e, t, r, i, n);
			case 3:
				a: {
					if (xe(t, t.stateNode.containerInfo), e === null) throw Error(o(387));
					r = t.pendingProps;
					var a = t.memoizedState;
					i = a.element, lo(e, t), _o(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.cache, pa(t, Ea, r), r !== a.cache && ga(t, [Ea], n, !0), go(), r = s.element, a.isDehydrated) {
						if (a = {
							element: r,
							isDehydrated: !1,
							cache: s.cache
						}, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
							t = Uc(e, t, r, n);
							break a;
						}
						if (r !== i) {
							i = Li(Error(o(424)), t), la(i), t = Uc(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for ($i = lm(e.firstChild), Qi = t, G = !0, ea = null, ta = !0, n = oo(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 134221824, n = n.sibling;
					} else {
						if (sa(), r === i) {
							t = il(e, t, n);
							break a;
						}
						kc(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return zc(e, t), e === null ? (n = Nm(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : G || (t.stateNode = fp(t.type, t.pendingProps, ye.current, t)) : t.memoizedState = Nm(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return Ce(t), e === null && G && (r = t.stateNode = hm(t.type, t.pendingProps, ye.current), Qi = t, ta = !0, i = $i, Sp(t.type) ? (um = i, $i = lm(r.firstChild)) : $i = i), kc(e, t, t.pendingProps.children, n), zc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && G && ((i = r = $i) && (r = rm(r, t.type, t.pendingProps, ta), r === null ? i = !1 : (t.stateNode = r, Qi = t, $i = lm(r.firstChild), ta = !1, i = !0)), i || ra(t)), Ce(t), i = t.type, a = t.pendingProps, s = e === null ? null : e.memoizedProps, r = a.children, pp(i, a) ? r = null : s !== null && pp(i, s) && (t.flags |= 32), t.memoizedState !== null && (i = qo(e, t, Xo, null, null, n), sh._currentValue = i), zc(e, t), kc(e, t, r, n), t.child;
			case 6: return e === null && G && ((e = n = $i) && (n = im(n, t.pendingProps, ta), n === null ? e = !1 : (t.stateNode = n, Qi = t, $i = null, e = !0)), e || ra(t)), null;
			case 13: return qc(e, t, n);
			case 4: return xe(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = ao(t, null, r, n) : kc(e, t, r, n), t.child;
			case 11: return Ac(e, t, t.type, t.pendingProps, n);
			case 7: return r = t.pendingProps, zc(e, t), kc(e, t, r, n), t.child;
			case 8: return kc(e, t, t.pendingProps.children, n), t.child;
			case 12: return kc(e, t, t.pendingProps.children, n), t.child;
			case 10: return rl(e, t, n);
			case 9: return i = t.type._context, r = t.pendingProps.children, ya(t), i = ba(i), r = r(i), t.flags |= 1, kc(e, t, r, n), t.child;
			case 14: return jc(e, t, t.type, t.pendingProps, n);
			case 15: return Mc(e, t, t.type, t.pendingProps, n);
			case 19: return nl(e, t, n);
			case 31: return Rc(e, t, n);
			case 22: return Nc(e, t, n, t.pendingProps);
			case 24: return ya(t), r = ba(Ea), e === null ? (i = Ba(), i === null && (i = Xu, a = Da(), i.pooledCache = a, a.refCount++, a !== null && (i.pooledCacheLanes |= n), i = a), t.memoizedState = {
				parent: r,
				cache: i
			}, co(t), pa(t, Ea, i)) : ((e.lanes & n) !== 0 && (lo(e, t), _o(t, null, null, n), go()), i = e.memoizedState, a = t.memoizedState, i.parent === r ? (r = a.cache, pa(t, Ea, r), r !== i.cache && ga(t, [Ea], n, !0)) : (i = {
				parent: r,
				cache: r
			}, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), pa(t, Ea, r))), kc(e, t, t.pendingProps.children, n), t.child;
			case 30: return t.stateNode === null && (t.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}), r = t.pendingProps, r.name != null && r.name !== "auto" ? t.flags |= e === null ? 18882560 : 18874368 : G && Yi(t), e !== null && e.memoizedProps.name !== r.name ? t.flags |= 4194816 : zc(e, t), kc(e, t, r.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(o(156, t.tag));
	}
	function cl(e) {
		e.flags |= 4;
	}
	function ll(e, t, n, r, i) {
		var a;
		if ((a = !!(e.mode & 32)) && (a = n === null ? Jm(t, r) : Jm(t, r) && (r.src !== n.src || r.srcSet !== n.srcSet)), a) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (Vd()) e.flags |= 8192;
				else throw Xa = Ka, Wa;
			}
		} else e.flags &= -16777217;
	}
	function ul(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Ym(t)) {
			if (Vd()) e.flags |= 8192;
			else throw Xa = Ka, Wa;
		}
	}
	function dl(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : st(), e.lanes |= t, cd |= t);
	}
	function fl(e, t) {
		if (!G) switch (e.tailMode) {
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
	function pl(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 1206910976, r |= i.flags & 1206910976, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function ml(e, t, n) {
		var r = t.pendingProps;
		switch (Xi(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return pl(t), null;
			case 1: return pl(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), ma(Ea), Se(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (oa(t) ? cl(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, ca())), pl(t), null;
			case 26:
				var i = t.type, a = t.memoizedState;
				return e === null ? (cl(t), a === null ? (pl(t), ll(t, i, null, r, n)) : (pl(t), ul(t, a))) : a ? a === e.memoizedState ? (pl(t), t.flags &= -16777217) : (cl(t), pl(t), ul(t, a)) : (e = e.memoizedProps, e !== r && cl(t), pl(t), ll(t, i, e, r, n)), null;
			case 27:
				if (we(t), n = ye.current, i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && cl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(o(166));
						return pl(t), t.subtreeFlags &= -33554433, null;
					}
					e = _e.current, oa(t) ? ia(t, e) : (e = hm(i, r, n), t.stateNode = e, cl(t));
				}
				return pl(t), t.subtreeFlags &= -33554433, null;
			case 5:
				if (we(t), i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && cl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(o(166));
						return pl(t), t.subtreeFlags &= -33554433, null;
					}
					if (a = _e.current, oa(t)) ia(t, a);
					else {
						var s = lp(ye.current);
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
						a[yt] = t, a[bt] = r;
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
						r && cl(t);
					}
				}
				return pl(t), t.subtreeFlags &= -33554433, ll(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && cl(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(o(166));
					if (e = ye.current, oa(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, i = Qi, i !== null) switch (i.tag) {
							case 27:
							case 5: r = i.memoizedProps;
						}
						e[yt] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || $f(e.nodeValue, n)), e || ra(t, !0);
					} else e = lp(e).createTextNode(r), e[yt] = t, t.stateNode = e;
				}
				return pl(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = oa(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(o(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(o(557));
							e[yt] = t;
						} else sa(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						pl(t), e = !1;
					} else n = ca(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (jo(t), t) : (jo(t), null);
					if (t.flags & 128) throw Error(o(558));
				}
				return pl(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (i = oa(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!i) throw Error(o(318));
							if (i = t.memoizedState, i = i === null ? null : i.dehydrated, !i) throw Error(o(317));
							i[yt] = t;
						} else sa(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						pl(t), i = !1;
					} else i = ca(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
					if (!i) return t.flags & 256 ? (jo(t), t) : (jo(t), null);
				}
				return jo(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool), a = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (a = r.memoizedState.cachePool.pool), a !== i && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), dl(t, t.updateQueue), pl(t), null);
			case 4: return Se(), e === null && Uf(t.stateNode.containerInfo), t.flags |= 67108864, pl(t), null;
			case 10: return ma(t.type), pl(t), null;
			case 19:
				if (Po(t), r = t.memoizedState, r === null) return pl(t), null;
				if (i = !!(t.flags & 128), a = r.rendering, a === null) {
					if (i) fl(r, !1);
					else {
						if (rd !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (a = Fo(e), a !== null) {
								for (t.flags |= 128, fl(r, !1), e = a.updateQueue, t.updateQueue = e, dl(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) Ai(n, e), n = n.sibling;
								return No(t, Mo.current & 1 | 2), G && qi(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && Le() > md && (t.flags |= 128, i = !0, fl(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!i) {
						if (e = Fo(a), e !== null) {
							if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, dl(t, e), fl(r, !0), r.tail === null && r.tailMode !== "collapsed" && r.tailMode !== "visible" && !a.alternate && !G) return pl(t), null;
						} else 2 * Le() - r.renderingStartTime > md && n !== 536870912 && (t.flags |= 128, i = !0, fl(r, !1), t.lanes = 4194304);
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
					return r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Le(), e.sibling = null, a = Mo.current, a = i ? a & 1 | 2 : a & 1, r.tailMode === "visible" || r.tailMode === "collapsed" || !n || G ? No(t, a) : (n = a, V(To, t), V(Mo, n), Eo === null && (Eo = t)), G && qi(t, r.treeForkCount), e;
				}
				return pl(t), null;
			case 22:
			case 23: return jo(t), wo(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (pl(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : pl(t), n = t.updateQueue, n !== null && dl(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && ge(za), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), ma(Ea), pl(t), null;
			case 25: return null;
			case 30: return t.flags |= 33554432, pl(t), null;
		}
		throw Error(o(156, t.tag));
	}
	function hl(e, t) {
		switch (Xi(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return ma(Ea), Se(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return we(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (jo(t), t.alternate === null) throw Error(o(340));
					sa();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (jo(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(o(340));
					sa();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return Po(t), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, e = t.memoizedState, e !== null && (e.rendering = null, e.tail = null), t.flags |= 4, t) : null;
			case 4: return Se(), null;
			case 10: return ma(t.type), null;
			case 22:
			case 23: return jo(t), wo(), e !== null && ge(za), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return ma(Ea), null;
			case 25: return null;
			default: return null;
		}
	}
	function gl(e, t) {
		switch (Xi(t), t.tag) {
			case 3:
				ma(Ea), Se();
				break;
			case 26:
			case 27:
			case 5:
				we(t);
				break;
			case 4:
				Se();
				break;
			case 31:
				t.memoizedState !== null && jo(t);
				break;
			case 13:
				jo(t);
				break;
			case 19:
				Po(t);
				break;
			case 10:
				ma(t.type);
				break;
			case 22:
			case 23:
				jo(t), wo(), e !== null && ge(za);
				break;
			case 24: ma(Ea);
		}
	}
	function _l(e, t) {
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
	function vl(e, t, n) {
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
	function yl(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				yo(t, n);
			} catch (t) {
				ff(e, e.return, t);
			}
		}
	}
	function bl(e, t, n) {
		n.props = _c(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			ff(e, t, n);
		}
	}
	function xl(e, t) {
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
						var i = e.stateNode, a = fi(e.memoizedProps, i);
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
	function Sl(e, t) {
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
	function Cl(e, t) {
		if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && e.alternate === null && t !== null) for (var n = 0; n < t.length; n++) em(e.stateNode, t[n]);
	}
	function wl(e) {
		for (var t = e.return; t !== null && (Dl(t) && em(e.stateNode, t.stateNode), !El(t));) t = t.return;
	}
	function Tl(e) {
		for (var t = e.return; t !== null && (Dl(t) && tm(e.stateNode, t.stateNode), !El(t));) t = t.return;
	}
	function El(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 27;
	}
	function Dl(e) {
		return e && e.tag === 7 && e.stateNode !== null;
	}
	function Ol(e) {
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
	function kl(e, t, n) {
		try {
			var r = e.stateNode;
			ip(r, e.type, n, t), r[bt] = t;
		} catch (t) {
			ff(e, e.return, t);
		}
	}
	function Al(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Sp(e.type) || e.tag === 4;
	}
	function jl(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Al(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Sp(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Ml(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(i, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(i), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = mn)), Cl(e, r), U = !0;
		else if (i !== 4 && (i === 27 && (Cl(e, r), r = null, Sp(e.type) && (n = e.stateNode, t = null)), e = e.child, e !== null)) for (Ml(e, t, n, r), e = e.sibling; e !== null;) Ml(e, t, n, r), e = e.sibling;
	}
	function Nl(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? n.insertBefore(i, t) : n.appendChild(i), Cl(e, r), U = !0;
		else if (i !== 4 && (i === 27 && (Cl(e, r), r = null, Sp(e.type) && (n = e.stateNode)), e = e.child, e !== null)) for (Nl(e, t, n, r), e = e.sibling; e !== null;) Nl(e, t, n, r), e = e.sibling;
	}
	function Pl(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			np(t, r, n), t[yt] = e, t[bt] = n;
		} catch (t) {
			ff(e, e.return, t);
		}
	}
	var Fl = !1, Il = null;
	function Ll(e) {
		(e.tag === 30 || e.subtreeFlags & 33554432) && (Fl = !0);
	}
	var Rl = null;
	function zl() {
		var e = Rl;
		return Rl = null, e;
	}
	var Bl = 0;
	function Vl(e, t, n, r, i) {
		return Bl = 0, Hl(e.child, t, n, r, i);
	}
	function Hl(e, t, n, r, i) {
		for (var a = !1; e !== null;) {
			if (e.tag === 5) {
				var o = e.stateNode;
				if (r !== null) {
					var s = Op(o);
					r.push(s), s.view && (a = !0);
				} else a || Op(o).view && (a = !0);
				Fl = !0, Tp(o, Bl === 0 ? t : t + "_" + Bl, n), Bl++;
			} else (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && i || Hl(e.child, t, n, r, i) && (a = !0));
			e = e.sibling;
		}
		return a;
	}
	function Ul(e, t) {
		for (; e !== null;) e.tag === 5 ? Ep(e.stateNode, e.memoizedProps) : (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && t || Ul(e.child, t)), e = e.sibling;
	}
	function Wl(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if ((e.tag !== 22 || e.memoizedState === null) && (Wl(e), e.tag === 30 && e.flags & 18874368 && e.stateNode.paired)) {
				var t = e.memoizedProps;
				if (t.name == null || t.name === "auto") throw Error(o(544));
				var n = t.name;
				t = mi(t.default, t.share), t !== "none" && (Vl(e, n, t, null, !1) || Ul(e.child, !1));
			}
			e = e.sibling;
		}
	}
	function Gl(e, t) {
		if (e.tag === 30) {
			var n = e.stateNode, r = e.memoizedProps, i = fi(r, n), a = mi(r.default, n.paired ? r.share : r.enter);
			a === "none" ? Wl(e) : Vl(e, i, a, null, !1) ? (Wl(e), n.paired || t || jd(e, r.onEnter)) : Ul(e.child, !1);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Gl(e, t), e = e.sibling;
		else Wl(e);
	}
	function Kl(e) {
		if (Il !== null && Il.size !== 0) {
			var t = Il;
			if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
				if (e.tag !== 22 || e.memoizedState === null) {
					if (e.tag === 30 && e.flags & 18874368) {
						var n = e.memoizedProps, r = n.name;
						if (r != null && r !== "auto") {
							var i = t.get(r);
							if (i !== void 0) {
								var a = mi(n.default, n.share);
								if (a !== "none" && (Vl(e, r, a, null, !1) ? (a = e.stateNode, i.paired = a, a.paired = i, jd(e, n.onShare)) : Ul(e.child, !1)), t.delete(r), t.size === 0) break;
							}
						}
					}
					Kl(e);
				}
				e = e.sibling;
			}
		}
	}
	function ql(e) {
		if (e.tag === 30) {
			var t = e.memoizedProps, n = fi(t, e.stateNode), r = Il === null ? void 0 : Il.get(n), i = mi(t.default, r === void 0 ? t.exit : t.share);
			i !== "none" && (Vl(e, n, i, null, !1) ? r === void 0 ? jd(e, t.onExit) : (i = e.stateNode, r.paired = i, i.paired = r, Il.delete(n), jd(e, t.onShare)) : Ul(e.child, !1)), Il !== null && Kl(e);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) ql(e), e = e.sibling;
		else Il !== null && Kl(e);
	}
	function Jl(e) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var t = e.memoizedProps, n = fi(t, e.stateNode);
				t = mi(t.default, t.update), e.flags &= -5, t !== "none" && Vl(e, n, t, e.memoizedState = [], !1);
			} else e.subtreeFlags & 33554432 && Jl(e);
			e = e.sibling;
		}
	}
	function Yl(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if (e.tag !== 22 || e.memoizedState === null) {
				if (e.tag === 30 && e.flags & 18874368) {
					var t = e.stateNode;
					t.paired !== null && (t.paired = null, Ul(e.child, !1));
				}
				Yl(e);
			}
			e = e.sibling;
		}
	}
	function Xl(e) {
		if (e.tag === 30) e.stateNode.paired = null, Ul(e.child, !1), Yl(e);
		else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Xl(e), e = e.sibling;
		else Yl(e);
	}
	function Zl(e) {
		for (e = e.child; e !== null;) e.tag === 30 ? Ul(e.child, !1) : e.subtreeFlags & 33554432 && Zl(e), e = e.sibling;
	}
	function Ql(e, t, n, r, i, a, o) {
		for (var s = !1; t !== null;) {
			if (t.tag === 5) {
				var c = t.stateNode;
				if (a !== null && Bl < a.length) {
					var l = a[Bl], u = Op(c);
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
				e.flags & 4 && Tp(c, Bl === 0 ? n : n + "_" + Bl, i), s && e.flags & 4 || (Rl === null && (Rl = []), Rl.push(c, Bl === 0 ? r : r + "_" + Bl, t.memoizedProps)), Bl++;
			} else (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && o ? e.flags |= t.flags & 32 : Ql(e, t.child, n, r, i, a, o) && (s = !0));
			t = t.sibling;
		}
		return s;
	}
	function $l(e, t) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var n = e.memoizedProps, r = e.stateNode, i = fi(n, r), a = mi(n.default, n.update);
				if (t) {
					r = r.clones;
					var o = r === null ? null : r.map(kp);
				} else o = e.memoizedState, e.memoizedState = null;
				r = e;
				var s = e.child;
				Bl = 0, i = Ql(r, s, i, i, a, o, !1), e.flags & 4 && i && (t || jd(e, n.onUpdate));
			} else e.subtreeFlags & 33554432 && $l(e, t);
			e = e.sibling;
		}
	}
	var eu = !1, Y = !1, tu = !1, nu = !1, ru = typeof WeakSet == "function" ? WeakSet : Set, iu = null, au = !1, ou = !1, su = !1, cu = !1;
	function lu(e, t, n) {
		if (e = e.containerInfo, sp = gh, e = Hr(e), Ur(e)) {
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
			if (e = iu, n && (r = e.deletions, r !== null)) for (a = 0; a < r.length; a++) n && ql(r[a]);
			if (e.alternate === null && e.flags & 2) n && Ll(e), uu(n);
			else {
				if (e.tag === 22) {
					if (r = e.alternate, e.memoizedState !== null) {
						r !== null && r.memoizedState === null && n && ql(r), uu(n);
						continue;
					}
					if (r !== null && r.memoizedState !== null) {
						n && Ll(e), uu(n);
						continue;
					}
				}
				r = e.child, (e.subtreeFlags & t) !== 0 && r !== null ? (r.return = e, iu = r) : (n && Jl(e), uu(n));
			}
		}
		Il = null;
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
							var s = _c(t.type, i);
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
					n && r !== null && (n = fi(r.memoizedProps, r.stateNode), i = t.memoizedProps, i = mi(i.default, i.update), i !== "none" && Vl(r, n, i, r.memoizedState = [], !0));
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
				ju(e, n), r & 4 && _l(5, n);
				break;
			case 1:
				if (ju(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						ff(n, n.return, e);
					}
					else {
						var i = _c(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							ff(n, n.return, e);
						}
					}
				}
				r & 64 && yl(n), r & 512 && xl(n, n.return);
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
						yo(e, t);
					} catch (e) {
						ff(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Pl(n);
			case 26:
			case 5:
				ju(e, n), t === null && r & 4 && Ol(n), r & 512 && xl(n, n.return);
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
				if (r = n.memoizedState !== null || eu, !r) {
					var a = t !== null && t.memoizedState !== null || Y;
					t = eu, i = Y, eu = r, (Y = a) && !i ? (r = 2, n.subtreeFlags & 8772 && (r |= 1), Nu(e, n, r)) : ju(e, n), eu = t, Y = i;
				}
				break;
			case 30:
				ju(e, n), r & 512 && xl(n, n.return);
				break;
			case 7: r & 512 && xl(n, n.return);
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
					e.stateNode.nodeValue = t ? "" : e.memoizedProps, U = !0;
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
		t !== null && (e.alternate = null, hu(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && Ot(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var gu = null, _u = !1;
	function vu(e, t, n) {
		for (n = n.child; n !== null;) yu(e, t, n), n = n.sibling;
	}
	function yu(e, t, n) {
		if (qe && typeof qe.onCommitFiberUnmount == "function") try {
			qe.onCommitFiberUnmount(Ke, n);
		} catch {}
		switch (n.tag) {
			case 26:
				Y || Sl(n, t), vu(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && !Y && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				Y || Sl(n, t), Tl(n);
				var r = gu, i = _u;
				Sp(n.type) && (gu = n.stateNode, _u = !1), vu(e, t, n), gm(n.stateNode, n.type, n.memoizedProps), gu = r, _u = i;
				break;
			case 5: Y || Sl(n, t), Tl(n);
			case 6:
				if (n.tag === 6 && Tl(n), r = gu, i = _u, gu = null, vu(e, t, n), gu = r, _u = i, gu !== null) {
					if (_u) try {
						(gu.nodeType === 9 ? gu.body : gu.nodeName === "HTML" ? gu.ownerDocument.body : gu).removeChild(n.stateNode), U = !0;
					} catch (e) {
						ff(n, t, e);
					}
					else try {
						gu.removeChild(n.stateNode), U = !0;
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
				vl(2, n, t), Y || vl(4, n, t), vu(e, t, n);
				break;
			case 1:
				Y || (Sl(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && bl(n, t, r)), vu(e, t, n);
				break;
			case 21:
				vu(e, t, n);
				break;
			case 22:
				Y = (r = Y) || n.memoizedState !== null, vu(e, t, n), Y = r;
				break;
			case 30:
				Sl(n, t), vu(e, t, n);
				break;
			case 7:
				Y || Sl(n, t), vu(e, t, n);
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
				wu(t, e, n), Du(e), i & 4 && (vl(3, e, e.return), _l(3, e), vl(5, e, e.return));
				break;
			case 1:
				wu(t, e, n), Du(e), i & 512 && (Y || r === null || Sl(r, r.return)), i & 64 && eu && (e = e.updateQueue, e !== null && (t = e.callbacks, t !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? t : n.concat(t))));
				break;
			case 26:
				if (a = Tu, wu(t, e, n), Du(e), i & 512 && (Y || r === null || Sl(r, r.return)), i & 4) {
					if (i = r === null ? null : r.memoizedState, n = e.memoizedState, r === null) {
						if (n === null) {
							if (e.stateNode === null) {
								if (eu) e.stateNode = fp(e.type, e.memoizedProps, t.containerInfo, e);
								else {
									a: {
										t = e.type, n = e.memoizedProps, i = a.ownerDocument || a;
										b: switch (t) {
											case "title":
												r = i.getElementsByTagName("title")[0], (!r || r[Et] || r[yt] || r.namespaceURI === "http://www.w3.org/2000/svg" || r.hasAttribute("itemprop")) && (r = i.createElement(t), i.head.insertBefore(r, i.querySelector("head > title"))), np(r, t, n), r[yt] = e, H(r), t = r;
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
										r[yt] = e, H(r), t = r;
									}
									e.stateNode = t;
								}
							} else eu || Km(a, e.type, e.stateNode);
						} else e.stateNode = Bm(a, n, e.memoizedProps);
					} else i === n ? n === null && e.stateNode !== null && kl(e, e.memoizedProps, r.memoizedProps) : (i === null ? (t = r.stateNode, t === null || Y || t.parentNode.removeChild(t)) : i.count--, n === null ? eu || Km(a, e.type, e.stateNode) : Bm(a, n, e.memoizedProps));
				}
				break;
			case 27:
				wu(t, e, n), Du(e), i & 512 && (Y || r === null || Sl(r, r.return)), r !== null && i & 4 && kl(e, e.memoizedProps, r.memoizedProps);
				break;
			case 5:
				if (a = tu, tu = !1, wu(t, e, n), tu = a, Du(e), i & 512 && (Y || r === null || Sl(r, r.return)), e.flags & 32) {
					t = e.stateNode;
					try {
						on(t, ""), U = !0;
					} catch (t) {
						ff(e, e.return, t);
					}
				}
				i & 4 && e.stateNode != null && (t = e.memoizedProps, kl(e, t, r === null ? t : r.memoizedProps)), i & 1024 && (nu = !0);
				break;
			case 6:
				if (wu(t, e, n), Du(e), i & 4) {
					if (e.stateNode === null) throw Error(o(162));
					t = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = t, U = !0;
					} catch (t) {
						ff(e, e.return, t);
					}
				}
				break;
			case 3:
				if (U = !1, Wm = null, a = Tu, Tu = bm(t.containerInfo), wu(t, e, n), Tu = a, Du(e), i & 4 && r !== null && r.memoizedState.isDehydrated) try {
					Hh(t.containerInfo);
				} catch (t) {
					ff(e, e.return, t);
				}
				nu && (nu = !1, Ou(e)), U = !1;
				break;
			case 4:
				i = tu, tu = eu, r = Ht(), a = Tu, Tu = bm(e.stateNode.containerInfo), wu(t, e, n), Du(e), Tu = a, U && ou && (su = !0), U = r, tu = i;
				break;
			case 12:
				wu(t, e, n), Du(e);
				break;
			case 31:
				wu(t, e, n), Du(e), i & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Cu(e, t)));
				break;
			case 13:
				wu(t, e, n), Du(e), e.child.flags & 8192 && e.memoizedState !== null != (r !== null && r.memoizedState !== null) && (fd = Le()), i & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Cu(e, t)));
				break;
			case 22:
				a = e.memoizedState !== null, s = r !== null && r.memoizedState !== null;
				var c = eu, l = Y, u = tu;
				eu = c || a, tu = u || a, Y = l || s, wu(t, e, n), Y = l, tu = u, eu = c, Du(e), i & 8192 && (t = e.stateNode, t._visibility = a ? t._visibility & -2 : t._visibility | 1, !a || r === null || s || eu || Y || (t = s || Y, n = eu, r = Y, eu = a || eu, Y = t, Mu(e, 2), eu = n, Y = r), !a && tu || fu(e, a)), i & 4 && (t = e.updateQueue, t !== null && (n = t.retryQueue, n !== null && (t.retryQueue = null, Cu(e, n))));
				break;
			case 19:
				wu(t, e, n), Du(e), i & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Cu(e, t)));
				break;
			case 30:
				i & 512 && (Y || r === null || Sl(r, r.return)), i = Ht(), a = ou, s = (n & 335544064) === n, c = e.memoizedProps, ou = s && mi(c.default, c.update) !== "none", wu(t, e, n), Du(e), s && r !== null && U && (e.flags |= 4), ou = a, U = i;
				break;
			case 21: break;
			case 7: i & 512 && (Y || r === null || Sl(r, r.return)), r && r.stateNode !== null && (r.stateNode._fragmentFiber = e);
			default: wu(t, e, n), Du(e);
		}
	}
	function Du(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (Al(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				r = null;
				for (var i = e.return; i !== null;) {
					if (Dl(i)) {
						var a = i.stateNode;
						r === null ? r = [a] : r.push(a);
					}
					if (El(i)) break;
					i = i.return;
				}
				var s = r;
				if (n == null) throw Error(o(160));
				switch (n.tag) {
					case 27:
						var c = n.stateNode;
						Nl(e, jl(e), c, s);
						break;
					case 5:
						var l = n.stateNode;
						n.flags & 32 && (on(l, ""), n.flags &= -33), Nl(e, jl(e), l, s);
						break;
					case 3:
					case 4:
						var u = n.stateNode.containerInfo;
						Ml(e, jl(e), u, s);
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
		else $l(t, !1);
	}
	function Au(e, t) {
		var n = e.alternate;
		if (n === null) Gl(e, !1);
		else switch (e.tag) {
			case 3:
				if (cu = au = !1, zl(), ku(t, e), !au && !su) {
					if (e = Rl, e !== null) for (var r = 0; r < e.length; r += 3) {
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
				Rl = null;
				break;
			case 5:
				ku(t, e);
				break;
			case 4:
				r = au, au = !1, ku(t, e), au && (su = !0), au = r;
				break;
			case 22:
				e.memoizedState === null && (n.memoizedState === null ? ku(t, e) : Gl(e, !1));
				break;
			case 30:
				r = au, i = zl(), au = !1, ku(t, e), au && (e.flags |= 4);
				var a = e.memoizedProps, o = e.stateNode;
				t = fi(a, o), o = fi(n.memoizedProps, o);
				var s = mi(a.default, a.update);
				s === "none" ? t = !1 : (a = n.memoizedState, n.memoizedState = null, n = e.child, Bl = 0, t = Ql(e, n, t, o, s, a, !0), Bl !== (a === null ? 0 : a.length) && (e.flags |= 32)), e.flags & 4 && t ? (jd(e, e.memoizedProps.onUpdate), Rl = i) : i !== null && (i.push.apply(i, Rl), Rl = i), au = e.flags & 32 ? !0 : r;
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
					vl(4, n, n.return), Mu(n, r);
					break;
				case 1:
					Sl(n, n.return);
					var i = n.stateNode;
					typeof i.componentWillUnmount == "function" && bl(n, n.return, i), Mu(n, r);
					break;
				case 27: r & 2 && gm(n.stateNode, n.type, n.memoizedProps);
				case 5:
					Sl(n, n.return), n.tag !== 5 && n.tag !== 27 || Tl(n), Mu(n, r);
					break;
				case 6:
					Tl(n);
					break;
				case 26:
					Sl(n, n.return), i = n.stateNode, n.memoizedState !== null || i === null || Y || i.parentNode.removeChild(i), Mu(n, r);
					break;
				case 22:
					n.memoizedState === null && Mu(n, r);
					break;
				case 30:
					Sl(n, n.return), Mu(n, r);
					break;
				case 7: Sl(n, n.return);
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
					Nu(i, a, n), _l(4, a);
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
							if (l !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < l.length; i++) vo(l[i], c);
						} catch (e) {
							ff(r, r.return, e);
						}
					}
					s && o & 64 && yl(a), xl(a, a.return);
					break;
				case 27: n & 2 && Pl(a);
				case 5:
					a.tag !== 5 && a.tag !== 27 || wl(a), Nu(i, a, n), s && r === null && o & 4 && Ol(a), xl(a, a.return);
					break;
				case 6:
					wl(a);
					break;
				case 26:
					c = a.stateNode, a.memoizedState !== null || c === null || eu || Km(bm(c.ownerDocument), a.type, c), Nu(i, a, n), s && r === null && o & 4 && Ol(a), xl(a, a.return);
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
					a.memoizedState === null && Nu(i, a, n), xl(a, a.return);
					break;
				case 30:
					Nu(i, a, n), xl(a, a.return);
					break;
				case 7: xl(a, a.return);
				default: Nu(i, a, n);
			}
			t = t.sibling;
		}
	}
	function Pu(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && Oa(n));
	}
	function Fu(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Oa(e));
	}
	function Iu(e, t, n, r) {
		var i = (n & 335544064) === n;
		if (t.subtreeFlags & (i ? 10262 : 10256)) for (t = t.child; t !== null;) Lu(e, t, n, r), t = t.sibling;
		else i && Zl(t);
	}
	function Lu(e, t, n, r) {
		var i = (n & 335544064) === n;
		i && t.alternate === null && t.return !== null && t.return.alternate !== null && Xl(t);
		var a = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				Iu(e, t, n, r), a & 2048 && _l(9, t);
				break;
			case 1:
				Iu(e, t, n, r);
				break;
			case 3:
				Iu(e, t, n, r), i && cu && (e = e.containerInfo, e = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, e.style.viewTransitionName === "root" && (e.style.viewTransitionName = ""), e = e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "none" && (e.style.viewTransitionName = "")), a & 2048 && (a = null, t.alternate !== null && (a = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== a && (t.refCount++, a != null && Oa(a)));
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
				o = t.stateNode, s = t.alternate, t.memoizedState === null ? (i && s !== null && s.memoizedState !== null && Xl(t), o._visibility & 2 ? Iu(e, t, n, r) : (o._visibility |= 2, Ru(e, t, n, r, !!(t.subtreeFlags & 10256) || !1))) : (i && s !== null && s.memoizedState === null && Xl(s), o._visibility & 2 ? Iu(e, t, n, r) : zu(e, t)), a & 2048 && Pu(s, t);
				break;
			case 24:
				Iu(e, t, n, r), a & 2048 && Fu(t.alternate, t);
				break;
			case 30:
				i && (a = t.alternate, a !== null && (Ul(a.child, !0), Ul(t.child, !0))), Iu(e, t, n, r);
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
					Ru(a, o, s, c, i), _l(8, o);
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
					i.paired = null, Il === null && (Il = /* @__PURE__ */ new Map()), Il.set(r, i);
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
				Wu(e), e.flags & 2048 && vl(9, e, e.return);
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
					vl(8, t, t.return), Ku(t);
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
					vl(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: Oa(n.memoizedState.cache);
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
			var t = ba(Ea), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return ba(Ea).controller.signal;
		}
	}, Yu = typeof WeakMap == "function" ? WeakMap : Map, X = 0, Xu = null, Z = null, Q = 0, Zu = 0, Qu = null, $u = !1, ed = !1, td = !1, nd = 0, rd = 0, id = 0, ad = 0, od = 0, sd = 0, cd = 0, ld = null, ud = null, dd = !1, fd = 0, pd = 0, md = Infinity, hd = null, gd = null, _d = 0, vd = null, yd = null, bd = 0, xd = 0, Sd = null, Cd = null, wd = null, Td = null, Ed = null, Dd = 0, Od = null;
	function kd() {
		return X & 2 && Q !== 0 ? Q & -Q : z.T === null ? gt() : Nf();
	}
	function Ad() {
		if (sd === 0) {
			if (!(Q & 536870912) || G) {
				var e = et;
				et <<= 1, !(et & 3932160) && (et = 262144), sd = e;
			} else sd = 536870912;
		}
		return e = To.current, e !== null && (e.flags |= 32), sd;
	}
	function jd(e, t) {
		if (t != null) {
			var n = e.stateNode, r = n.ref;
			r === null && (r = n.ref = Pp(fi(e.memoizedProps, n))), Td === null && (Td = []), Td.push(t.bind(null, r));
		}
	}
	function Md(e, t, n) {
		(e === Xu && (Zu === 2 || Zu === 9) || e.cancelPendingCommit !== null) && (zd(e, 0), Id(e, Q, sd, !1)), lt(e, n), (!(X & 2) || e !== Xu) && (e === Xu && (!(X & 2) && (ad |= n), rd === 4 && Id(e, Q, sd, !1)), Tf(e));
	}
	function Nd(e, t, n) {
		if (X & 6) throw Error(o(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || it(e, t), i = r ? qd(e, t) : Gd(e, t, !0), a = r;
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
					if ((t & 62914560) === t && (i = fd + 300 - Le(), 10 < i)) {
						if (Id(r, t, sd, !$u), rt(r, 0, !0) !== 0) break a;
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
			unsuspend: mn
		}, Il = null, Hu(t, a, d), h && (m = d, h = e.containerInfo, h = (h.nodeType === 9 ? h : h.ownerDocument).__reactViewTransition, h != null && (m.count++, m.waitingForViewTransition = !0, m = nh.bind(m), h.finished.then(m, m))), m = (a & 62914560) === a ? fd - Le() : (a & 4194048) === a ? pd - Le() : 0, m = eh(d, m), m !== null) ? (bd = a, e.cancelPendingCommit = m(ef.bind(null, e, t, a, n, r, i, o, s, c, l, u, d, null, f, p)), Id(e, a, o, !l)) : ef(e, t, a, n, r, i, o, s, c, l, u, d);
	}
	function Fd(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!Ir(a(), i)) return !1;
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
		t = at(e, t), t &= ~od, t &= ~ad, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - Ye(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && dt(e, n, t);
	}
	function Ld() {
		return X & 6 ? !0 : (Ef(0, !1), !1);
	}
	function Rd() {
		if (Z !== null) {
			if (Zu === 0) var e = Z.return;
			else e = Z, fa = da = null, $o(e), $a = null, eo = 0, e = Z;
			for (; e !== null;) gl(e.alternate, e), e = e.return;
			Z = null;
		}
	}
	function zd(e, t) {
		var n = e.timeoutHandle;
		return n !== -1 && (e.timeoutHandle = -1, _p(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), bd = 0, Rd(), Xu = e, Z = n = ki(e.current, null), Q = t, Zu = 0, Qu = null, $u = !1, ed = it(e, t), td = !1, cd = sd = od = ad = id = rd = 0, ud = ld = null, dd = !1, nd = at(e, t), yi(), n;
	}
	function Bd(e, t) {
		q = null, z.H = lc, t === Ua || t === Ga ? (t = Za(), Zu = 3) : t === Wa ? (t = Za(), Zu = 4) : Zu = t === Dc ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, Qu = t, Z === null && (rd = 1, xc(e, Li(t, e.current)));
	}
	function Vd() {
		var e = To.current;
		return e === null ? !0 : (Q & 4194048) === Q ? Eo === null : (Q & 62914560) === Q || Q & 536870912 ? e === Eo : !1;
	}
	function Hd() {
		var e = z.H;
		return z.H = lc, e === null ? lc : e;
	}
	function Ud() {
		var e = z.A;
		return z.A = Ju, e;
	}
	function Wd() {
		rd = 4, $u || (Q & 4194048) !== Q && To.current !== null || (ed = !0), !(id & 134217727) && !(ad & 134217727) || Xu === null || Id(Xu, Q, sd, !1);
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
							To.current === null && (t = !0);
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
		return t && e.shellSuspendCounter++, fa = da = null, X = r, z.H = i, z.A = a, Z === null && (Xu = null, Q = 0, yi()), o;
	}
	function Kd() {
		for (; Z !== null;) Yd(Z);
	}
	function qd(e, t) {
		var n = X;
		X |= 2;
		var r = Hd(), i = Ud();
		Xu !== e || Q !== t ? (hd = null, md = Le() + 500, zd(e, t)) : ed = it(e, t);
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
							if (qa(a)) {
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
							qa(a) ? (Zu = 0, Qu = null, Xd(t)) : (Zu = 0, Qu = null, Zd(e, t, a, 7));
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
		return fa = da = null, z.H = r, z.A = i, X = n, Z === null ? (Xu = null, Q = 0, yi(), rd) : 0;
	}
	function Jd() {
		for (; Z !== null && !Fe();) Yd(Z);
	}
	function Yd(e) {
		var t = sl(e.alternate, e, nd);
		e.memoizedProps = e.pendingProps, t === null ? Qd(e) : Z = t;
	}
	function Xd(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = Vc(n, t, t.pendingProps, t.type, void 0, Q);
				break;
			case 11:
				t = Vc(n, t, t.pendingProps, t.type.render, t.ref, Q);
				break;
			case 5:
				$o(t);
				var r = t;
				r === Qi && (G ? (aa(r), r.tag === 5 && r.stateNode != null && ($i = r.stateNode)) : (aa(r), G = !0));
			default: gl(n, t), t = Z = Ai(t, nd), t = sl(n, t, nd);
		}
		e.memoizedProps = e.pendingProps, t === null ? Qd(e) : Z = t;
	}
	function Zd(e, t, n, r) {
		fa = da = null, $o(t), $a = null, eo = 0;
		var i = t.return;
		try {
			if (Ec(e, i, t, n, Q)) {
				rd = 1, xc(e, Li(n, e.current)), Z = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw Z = i, t;
			rd = 1, xc(e, Li(n, e.current)), Z = null;
			return;
		}
		t.flags & 32768 ? (G || r === 1 ? e = !0 : ed || Q & 536870912 ? e = !1 : ($u = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = To.current, r !== null && r.tag === 13 && (r.flags |= 16384))), $d(t, e)) : Qd(t);
	}
	function Qd(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				$d(t, $u);
				return;
			}
			e = t.return;
			var n = ml(t.alternate, t, nd);
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
			var n = hl(e.alternate, e);
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
		if (xd = s, s |= vi, ut(e, n, s, r, i, a), Td = null, (n & 335544064) === n ? (Ed = ja(e), r = 10262) : (Ed = null, r = 10256), (t.subtreeFlags & r) !== 0 || (t.flags & r) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, vf(Ve, function() {
			return uf(), null;
		})) : (e.callbackNode = null, e.callbackPriority = 0), Fl = !1, r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
			r = z.T, z.T = null, i = B.p, B.p = 2, a = X, X |= 4;
			try {
				lu(e, t, n);
			} finally {
				X = a, B.p = i, z.T = r;
			}
		}
		_d = 1, Fl ? wd = Mp(o, e.containerInfo, Ed, af, of, rf, sf, uf, nf, null, null) : (af(), of(), sf());
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
				r = z.T, z.T = null;
				var i = B.p;
				B.p = 2;
				var a = X;
				X |= 4;
				try {
					ou = su = !1, Eu(t, e, n), n = cp;
					var o = Hr(e.containerInfo), s = n.focusedElem, c = n.selectionRange;
					if (o !== s && s && s.ownerDocument && Vr(s.ownerDocument.documentElement, s)) {
						if (c !== null && Ur(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = Br(s, h), v = Br(s, g);
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
					X = a, B.p = i, z.T = r;
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
				n = z.T, z.T = null;
				var r = B.p;
				B.p = 2;
				var i = X;
				X |= 4;
				try {
					du(e, t.alternate, t);
				} finally {
					X = i, B.p = r, z.T = n;
				}
			}
			_d = 3;
		}
	}
	function sf() {
		if (_d === 4 || _d === 3) {
			_d = 0;
			var e = wd;
			wd = null, Ie();
			var t = vd, n = yd, r = bd, i = Cd, a = (r & 335544064) === r ? 10262 : 10256;
			if ((n.subtreeFlags & a) !== 0 || (n.flags & a) !== 0 ? _d = 5 : (_d = 0, yd = vd = null, cf(t, t.pendingLanes)), a = t.pendingLanes, a === 0 && (gd = null), ht(r), n = n.stateNode, qe && typeof qe.onCommitFiberRoot == "function") try {
				qe.onCommitFiberRoot(Ke, n, void 0, (n.current.flags & 128) == 128);
			} catch {}
			if (i !== null) {
				n = z.T, a = B.p, B.p = 2, z.T = null;
				try {
					for (var o = t.onRecoverableError, s = 0; s < i.length; s++) {
						var c = i[s];
						o(c.value, { componentStack: c.stack });
					}
				} finally {
					z.T = n, B.p = a;
				}
			}
			if (i = Td, o = Ed, Ed = null, i !== null && (Td = null, o === null && (o = []), e !== null)) for (c = 0; c < i.length; c++) n = (0, i[c])(o), n !== void 0 && e.finished.finally(n);
			bd & 3 && lf(), Tf(t), a = t.pendingLanes, r & 261930 && a & 42 ? t === Od ? Dd++ : (Dd = 0, Od = t) : (Dd = 0, Od = null), Ef(0, !1);
		}
	}
	function cf(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Oa(t)));
	}
	function lf() {
		return wd !== null && (wd.skipTransition(), wd = null), af(), of(), sf(), uf();
	}
	function uf() {
		if (_d !== 5) return !1;
		var e = vd, t = xd;
		xd = 0;
		var n = ht(bd), r = z.T, i = B.p;
		try {
			B.p = 32 > n ? 32 : n, z.T = null, n = Sd, Sd = null;
			var a = vd, s = bd;
			if (_d = 0, yd = vd = null, bd = 0, X & 6) throw Error(o(331));
			var c = X;
			if (X |= 4, Gu(a.current), Lu(a, a.current, s, n), X = c, Ef(0, !1), qe && typeof qe.onPostCommitFiberRoot == "function") try {
				qe.onPostCommitFiberRoot(Ke, a);
			} catch {}
			return !0;
		} finally {
			B.p = i, z.T = r, cf(e, t);
		}
	}
	function df(e, t, n) {
		t = Li(n, t), t = Cc(e.stateNode, t, 2), e = fo(e, t, 2), e !== null && (lt(e, 2), Tf(e));
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
					e = Li(n, e), n = wc(2), r = fo(t, n, 2), r !== null && (Tc(n, r, t, e), lt(r, 2), Tf(r));
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
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Xu === e && (Q & n) === n && (rd === 4 || rd === 3 && (Q & 62914560) === Q && 300 > Le() - fd ? X & 2 ? od |= n : zd(e, 0) : od |= n, cd === Q && (cd = 0)), Tf(e);
	}
	function hf(e, t) {
		t === 0 && (t = st()), e = Si(e, t), e !== null && (lt(e, t), Tf(e));
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
		return Ne(e, t);
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
								a = (1 << 31 - Ye(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, jf(r, a));
						} else a = Q, a = rt(r, r === Xu ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || it(r, a) || (n = !0, jf(r, a));
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
		for (var t = Le(), n = null, r = yf; r !== null;) {
			var i = r.next, a = kf(r, t);
			a === 0 ? (r.next = null, n === null ? yf = i : n.next = i, i === null && (bf = n)) : (n = r, (e !== 0 || a & 3) && (Sf = !0)), r = i;
		}
		_d !== 0 && _d !== 5 || Ef(e, !1), wf !== 0 && (wf = 0);
	}
	function kf(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - Ye(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = ot(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = Xu, n = Q, n = rt(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (Zu === 2 || Zu === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && Pe(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || it(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && Pe(r), ht(n)) {
				case 2:
				case 8:
					n = Be;
					break;
				case 32:
					n = Ve;
					break;
				case 268435456:
					n = Ue;
					break;
				default: n = Ve;
			}
			return r = Af.bind(null, e), n = Ne(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && Pe(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function Af(e, t) {
		if (_d !== 0 && _d !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (lf() && e.callbackNode !== n) return null;
		var r = Q;
		return r = rt(e, e === Xu ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (Nd(e, r, t), kf(e, Le()), e.callbackNode != null && e.callbackNode === n ? Af.bind(null, e) : null);
	}
	function jf(e, t) {
		if (lf()) return null;
		Nd(e, t, !0);
	}
	function Mf() {
		bp(function() {
			X & 6 ? Ne(ze, Df) : Of();
		});
	}
	function Nf() {
		if (wf === 0) {
			var e = Na;
			e === 0 && (e = $e, $e <<= 1, !($e & 261888) && ($e = 256)), wf = e;
		}
		return wf;
	}
	function Pf(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : pn(e);
	}
	function Ff(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = Pf((i[bt] || null).action), o = r.submitter;
			o && (t = (t = o[bt] || null) ? Pf(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new Pn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (wf !== 0) {
								var e = new FormData(i, o);
								Ys(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = new FormData(i, o), Ys(n, {
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
	for (var If = 0; If < li.length; If++) {
		var Lf = li[If];
		ui(Lf.toLowerCase(), "on" + (Lf[0].toUpperCase() + Lf.slice(1)));
	}
	ui(ti, "onAnimationEnd"), ui(ni, "onAnimationIteration"), ui(ri, "onAnimationStart"), ui("dblclick", "onDoubleClick"), ui("focusin", "onFocus"), ui("focusout", "onBlur"), ui(ii, "onTransitionRun"), ui(ai, "onTransitionStart"), ui(oi, "onTransitionCancel"), ui(si, "onTransitionEnd"), Lt("onMouseEnter", ["mouseout", "mouseover"]), Lt("onMouseLeave", ["mouseout", "mouseover"]), Lt("onPointerEnter", ["pointerout", "pointerover"]), Lt("onPointerLeave", ["pointerout", "pointerover"]), It("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), It("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), It("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), It("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), It("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), It("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
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
						hi(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						hi(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function $(e, t) {
		var n = t[St];
		n === void 0 && (n = t[St] = /* @__PURE__ */ new Set());
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
			e[Hf] = !0, Pt.forEach(function(t) {
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
		n = i.bind(null, t, n, e), i = void 0, !Cn || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
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
					if (o = kt(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6 || c === 26 || c === 27) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		bn(function() {
			var r = a, i = gn(n), o = [];
			a: {
				var s = ci.get(e);
				if (s !== void 0) {
					var c = Pn, u = e;
					switch (e) {
						case "keypress": if (kn(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = Qn;
							break;
						case "focusin":
							u = "focus", c = Un;
							break;
						case "focusout":
							u = "blur", c = Un;
							break;
						case "beforeblur":
						case "afterblur":
							c = Un;
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
							c = Vn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = Hn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							c = tr;
							break;
						case ti:
						case ni:
						case ri:
							c = Wn;
							break;
						case si:
							c = nr;
							break;
						case "scroll":
						case "scrollend":
							c = In;
							break;
						case "wheel":
							c = rr;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = Gn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							c = $n;
							break;
						case "submit":
							c = er;
							break;
						case "toggle":
						case "beforetoggle": c = ir;
					}
					var d = !!(t & 4), f = !d && (e === "scroll" || e === "scrollend"), p = d ? s === null ? null : s + "Capture" : s;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = xn(m, p), g != null && d.push(Kf(m, g, h))), f) break;
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
					if (c = e === "mouseover" || e === "pointerover", s = e === "mouseout" || e === "pointerout", c && n !== hn && (u = n.relatedTarget || n.fromElement) && (kt(u) || u[xt])) break a;
					(s || c) && (u = i.window === i ? i : (c = i.ownerDocument) ? c.defaultView || c.parentWindow : window, s ? (c = n.relatedTarget || n.toElement, s = r, c = c ? kt(c) : null, c !== null && (f = l(c), d = c.tag, c !== f || d !== 5 && d !== 27 && d !== 6) && (c = null)) : (s = null, c = r), s !== c && (d = Vn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = $n, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = s == null ? u : jt(s), h = c == null ? u : jt(c), u = new d(g, m + "leave", s, n, i), u.target = f, u.relatedTarget = h, g = null, kt(i) === r && (d = new d(p, m + "enter", c, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, d = s && c ? E(s, c, Jf) : null, s !== null && Yf(o, u, s, d, !1), c !== null && f !== null && Yf(o, f, c, d, !0)));
				}
				a: {
					if (s = r ? jt(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var _ = wr;
					else if (vr(s)) {
						if (Tr) _ = Pr;
						else {
							_ = Mr;
							var v = jr;
						}
					} else c = s.nodeName, !c || c.toLowerCase() !== "input" || s.type !== "checkbox" && s.type !== "radio" ? r && un(r.elementType) && (_ = wr) : _ = Nr;
					if (_ &&= _(e, r)) {
						yr(o, _, n, i);
						break a;
					}
					v && v(e, s, r);
				}
				switch (v = r ? jt(r) : window, e) {
					case "focusin":
						(vr(v) || v.contentEditable === "true") && (Gr = v, Kr = r, qr = null);
						break;
					case "focusout":
						qr = Kr = Gr = null;
						break;
					case "mousedown":
						Jr = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						Jr = !1, Yr(o, n, i);
						break;
					case "selectionchange": if (Wr) break;
					case "keydown":
					case "keyup": Yr(o, n, i);
				}
				var y;
				if (or) b: {
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
				else mr ? fr(e, n) && (b = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (b = "onCompositionStart");
				b && (lr && n.locale !== "ko" && (mr || b !== "onCompositionStart" ? b === "onCompositionEnd" && mr && (y = On()) : (Tn = i, En = "value" in Tn ? Tn.value : Tn.textContent, mr = !0)), v = qf(r, b), 0 < v.length && (b = new Kn(b, e, null, n, i), o.push({
					event: b,
					listeners: v
				}), y ? b.data = y : (y = pr(n), y !== null && (b.data = y)))), (y = cr ? hr(e, n) : gr(e, n)) && (b = qf(r, "onBeforeInput"), 0 < b.length && (v = new Kn("onBeforeInput", "beforeinput", null, n, i), o.push({
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
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = xn(e, n), i != null && r.unshift(Kf(e, i, a)), i = xn(e, t), i != null && r.push(Kf(e, i, a))), e.tag === 3) return r;
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
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = xn(n, a), l != null && o.unshift(Kf(n, l, c))) : i || (l = xn(n, a), l != null && o.push(Kf(n, l, c)))), n = n.return;
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
				if (typeof r == "string") t === "body" || t === "textarea" && r === "" || on(e, r);
				else if (typeof r == "number" || typeof r == "bigint") t !== "body" && on(e, "" + r);
				else return;
				break;
			case "className":
				Wt(e, "class", r);
				break;
			case "tabIndex":
				Wt(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				Wt(e, n, r);
				break;
			case "style":
				ln(e, r, a);
				return;
			case "data": if (t !== "object") {
				Wt(e, "data", r);
				break;
			}
			case "src":
			case "href":
				if (r === "" && (t !== "a" || n !== "href") || r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = pn(r), e.setAttribute(n, r);
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
				r = pn(r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = mn);
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
				n = pn(r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
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
				$("beforetoggle", e), $("toggle", e), Ut(e, "popover", r);
				break;
			case "xlinkActuate":
				Gt(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				Gt(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				Gt(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				Gt(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				Gt(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				Gt(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				Gt(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				Gt(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				Gt(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				Ut(e, "is", r);
				break;
			case "innerText":
			case "textContent": return;
			default: if (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") n = dn.get(n) || n, Ut(e, n, r);
			else return;
		}
		U = !0;
	}
	function tp(e, t, n, r, i, a) {
		switch (n) {
			case "style":
				ln(e, r, a);
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
				if (typeof r == "string") on(e, r);
				else if (typeof r == "number" || typeof r == "bigint") on(e, "" + r);
				else return;
				break;
			case "onScroll":
				r != null && $("scroll", e);
				return;
			case "onScrollEnd":
				r != null && $("scrollend", e);
				return;
			case "onClick":
				r != null && (e.onclick = mn);
				return;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": return;
			case "innerText":
			case "textContent": return;
			default:
				if (!Ft.hasOwnProperty(n)) a: {
					if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), a = n.slice(2, i ? n.length - 7 : void 0), t = e[bt] || null, t = t == null ? null : t[n], typeof t == "function" && e.removeEventListener(a, t, i), typeof r == "function")) {
						typeof t != "function" && t !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(a, r, i);
						break a;
					}
					U = !0, n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : Ut(e, n, r);
				}
				return;
		}
		U = !0;
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
				en(e, a, c, l, u, s, i, !1);
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
				t = a, n = s, e.multiple = !!r, t == null ? n != null && nn(e, !!r, n, !0) : nn(e, !!r, t, !1);
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
				an(e, r, i, a);
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
			default: if (un(t)) {
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
							m !== f && (U = !0), a = m;
							break;
						case "name":
							m !== f && (U = !0), i = m;
							break;
						case "checked":
							m !== f && (U = !0), u = m;
							break;
						case "defaultChecked":
							m !== f && (U = !0), d = m;
							break;
						case "value":
							m !== f && (U = !0), s = m;
							break;
						case "defaultValue":
							m !== f && (U = !0), c = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(o(137, t));
							break;
						default: m !== f && ep(e, t, p, m, r, f);
					}
				}
				$t(e, s, c, l, u, d, a, i);
				return;
			case "select":
				for (a in m = s = c = p = null, n) if (l = n[a], n.hasOwnProperty(a) && l != null) switch (a) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(a) || ep(e, t, a, null, r, l);
				}
				for (i in r) if (a = r[i], l = n[i], r.hasOwnProperty(i) && (a != null || l != null)) switch (i) {
					case "value":
						a !== l && (U = !0), p = a;
						break;
					case "defaultValue":
						a !== l && (U = !0), c = a;
						break;
					case "multiple": a !== l && (U = !0), s = a;
					default: a !== l && ep(e, t, i, a, r, l);
				}
				t = c, n = s, r = m, p == null ? !!r != !!n && (t == null ? nn(e, !!n, n ? [] : "", !1) : nn(e, !!n, t, !0)) : nn(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (i = n[c], n.hasOwnProperty(c) && i != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: ep(e, t, c, null, r, i);
				}
				for (s in r) if (i = r[s], a = n[s], r.hasOwnProperty(s) && (i != null || a != null)) switch (s) {
					case "value":
						i !== a && (U = !0), p = i;
						break;
					case "defaultValue":
						i !== a && (U = !0), m = i;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (i != null) throw Error(o(91));
						break;
					default: i !== a && ep(e, t, s, i, r, a);
				}
				rn(e, p, m);
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
						p !== m && (U = !0), e.selected = p && typeof p != "function" && typeof p != "symbol";
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
			default: if (un(t)) {
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
		return n = lp(n).createElement(e), n[yt] = r, n[bt] = t, np(n, e, t), H(n), n;
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
						a[Et] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
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
		var a = kt(i);
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
					nm(n), Ot(n);
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
			} else if (!e[Et]) switch (t) {
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
		n.dangerouslySetInnerHTML != null && (e.textContent = ""), e.onclick === mn && (e.onclick = null), Ot(e);
	}
	function _m(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		Ot(e);
	}
	var vm = /* @__PURE__ */ new Map(), ym = /* @__PURE__ */ new Set();
	function bm(e) {
		if (typeof e.getRootNode == "function") {
			var t = e.getRootNode();
			if (t.nodeType === 9 || t.nodeType === 11) return t;
		}
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	var xm = B.d;
	B.d = {
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
		var t = At(e);
		t !== null && t.tag === 5 && t.type === "form" ? Zs(t) : xm.r(e);
	}
	var wm = typeof document > "u" ? null : document;
	function Tm(e, t, n) {
		var r = wm;
		if (r && typeof t == "string" && t) {
			var i = Qt(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), ym.has(i) || (ym.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), np(t, "link", e), H(t), r.head.appendChild(t)));
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
			var i = "link[rel=\"preload\"][as=\"" + Qt(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + Qt(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + Qt(n.imageSizes) + "\"]")) : i += "[href=\"" + Qt(e) + "\"]";
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
				np(o, "link", e), t === "style" && (o[Dt] = !0, o.onload = o.onerror = function() {
					Nt(o);
				}), H(o), r.head.appendChild(o);
			}
		}
	}
	function km(e, t) {
		xm.m(e, t);
		var n = wm;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + Qt(r) + "\"][href=\"" + Qt(e) + "\"]", a = i;
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
				r = n.createElement("link"), np(r, "link", e), H(r), n.head.appendChild(r);
			}
		}
	}
	function Am(e, t, n) {
		xm.S(e, t, n);
		var r = wm;
		if (r && e) {
			var i = Mt(r).hoistableStyles, a = Pm(e);
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
					H(c), np(c, "link", e), c._p = new Promise(function(e, t) {
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
			var r = Mt(n).hoistableScripts, i = Rm(e), a = r.get(i);
			a || (a = n.querySelector(zm(i)), a || (e = D({
				src: e,
				async: !0
			}, t), (t = vm.get(i)) && Um(e, t), a = n.createElement("script"), H(a), np(a, "link", e), n.head.appendChild(a)), a = {
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
			var r = Mt(n).hoistableScripts, i = Rm(e), a = r.get(i);
			a || (a = n.querySelector(zm(i)), a || (e = D({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = vm.get(i)) && Um(e, t), a = n.createElement("script"), H(a), np(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Nm(e, t, n, r) {
		var i = (i = ye.current) ? bm(i) : null;
		if (!i) throw Error(o(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (n = Pm(n.href), t = Mt(i).hoistableStyles, r = t.get(n), r || (r = {
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
					var a = Mt(i).hoistableStyles, s = a.get(e);
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
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (n = Rm(n), t = Mt(i).hoistableScripts, r = t.get(n), r || (r = {
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
		return "href=\"" + Qt(e) + "\"";
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
			if (!0 !== t[Dt]) {
				r.loading = 1;
				return;
			}
		} else t = e.createElement("link"), t[Dt] = !0, t.onload = t.onerror = Nt.bind(null, t), np(t, "link", n), H(t), e.head.appendChild(t);
		r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		});
	}
	function Rm(e) {
		return "[src=\"" + Qt(e) + "\"]";
	}
	function zm(e) {
		return "script[async]" + e;
	}
	function Bm(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + Qt(n.href) + "\"]");
				if (r) return t.instance = r, H(r), r;
				var i = D({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), H(r), np(r, "style", i), Vm(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				i = Pm(n.href);
				var a = e.querySelector(Fm(i));
				if (a) return t.state.loading |= 4, t.instance = a, H(a), a;
				r = Im(n), (i = vm.get(i)) && Hm(r, i), a = (e.ownerDocument || e).createElement("link"), H(a);
				var s = a;
				return s._p = new Promise(function(e, t) {
					s.onload = e, s.onerror = t;
				}), np(a, "link", r), t.state.loading |= 4, Vm(a, n.precedence, e), t.instance = a;
			case "script": return a = Rm(n.src), (i = e.querySelector(zm(a))) ? (t.instance = i, H(i), i) : (r = n, (i = vm.get(a)) && (r = D({}, n), Um(r, i)), e = e.ownerDocument || e, i = e.createElement("script"), H(i), np(i, "link", r), e.head.appendChild(i), t.instance = i);
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
			if (!(a[Et] || a[yt] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
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
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = nh.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, H(a);
					return;
				}
				a = t.ownerDocument || t, r = Im(r), (i = vm.get(i)) && Hm(r, i), a = a.createElement("link"), H(a);
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
		_currentValue: fe,
		_currentValue2: fe,
		_threadCount: 0
	};
	function ch(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = ct(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = ct(0), this.hiddenUpdates = ct(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.transitionTypes = null, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function lh(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new ch(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = Di(3, null, null, t), e.current = a, a.stateNode = e, t = Da(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, co(a), e;
	}
	function uh(e) {
		return e ? (e = Ti, e) : Ti;
	}
	function dh(e, t, n, r, i, a) {
		i = uh(i), r.context === null ? r.context = i : r.pendingContext = i, r = uo(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = fo(e, r, t), n !== null && (Md(n, e, t), po(n, e, t));
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
			var t = Si(e, 67108864);
			t !== null && Md(t, e, 67108864), ph(e, 67108864);
		}
	}
	function hh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = kd();
			t = mt(t);
			var n = Si(e, t);
			n !== null && Md(n, e, t), ph(e, t);
		}
	}
	var gh = !0;
	function _h(e, t, n, r) {
		var i = z.T;
		z.T = null;
		var a = B.p;
		try {
			B.p = 2, yh(e, t, n, r);
		} finally {
			B.p = a, z.T = i;
		}
	}
	function vh(e, t, n, r) {
		var i = z.T;
		z.T = null;
		var a = B.p;
		try {
			B.p = 8, yh(e, t, n, r);
		} finally {
			B.p = a, z.T = i;
		}
	}
	function yh(e, t, n, r) {
		if (gh) {
			var i = bh(r);
			if (i === null) Gf(e, t, r, xh, n), Mh(e, r);
			else if (Ph(i, e, t, n, r)) r.stopPropagation();
			else if (Mh(e, r), t & 4 && -1 < jh.indexOf(e)) {
				for (; i !== null;) {
					var a = At(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = nt(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - Ye(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									Tf(a), !(X & 6) && (md = Le() + 500, Ef(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Si(a, 2), s !== null && Md(s, a, 2), Ld(), ph(a, 2);
					}
					if (a = bh(r), a === null && Gf(e, t, r, xh, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Gf(e, t, r, null, n);
		}
	}
	function bh(e) {
		return e = gn(e), Sh(e);
	}
	var xh = null;
	function Sh(e) {
		if (xh = null, e = kt(e), e !== null) {
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
			case "message": switch (Re()) {
				case ze: return 2;
				case Be: return 8;
				case Ve:
				case He: return 32;
				case Ue: return 268435456;
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
		}, t !== null && (t = At(t), t !== null && mh(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
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
		var t = kt(e.target);
		if (t !== null) {
			var n = l(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = u(n), t !== null) {
						e.blockedOn = t, _t(e.priority, function() {
							hh(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = d(n), t !== null) {
						e.blockedOn = t, _t(e.priority, function() {
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
				hn = r, n.target.dispatchEvent(r), hn = null;
			} else return t = At(n), t !== null && mh(t), e.blockedOn = n, !1;
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
				var a = At(n);
				a !== null && (e.splice(t, 3), t -= 3, Ys(a, {
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
			var i = n[r], a = n[r + 1], o = i[bt] || null;
			if (typeof a == "function") o || Vh(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[bt] || null) s = o.formAction;
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
			dh(e.current, 2, null, e, null, null), Ld(), t[xt] = null;
		}
	};
	function Gh(e) {
		this._internalRoot = e;
	}
	Gh.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = gt();
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
	B.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(o(188)) : (e = Object.keys(e).join(","), Error(o(268, e)));
		return e = p(t), e = e === null ? null : m(e), e = e === null ? null : e.stateNode, e;
	};
	var qh = {
		bundleType: 0,
		version: "19.3.0",
		rendererPackageName: "react-dom",
		currentDispatcherRef: z,
		reconcilerVersion: "19.3.0"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Jh = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Jh.isDisabled && Jh.supportsFiber) try {
			Ke = Jh.inject(qh), qe = Jh;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!c(e)) throw Error(o(299));
		var n = !1, r = "", i = vc, a = yc, s = bc;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (a = t.onCaughtError), t.onRecoverableError !== void 0 && (s = t.onRecoverableError)), t = lh(e, 1, !1, null, null, n, r, null, i, a, s, Uh), e[xt] = t.current, Uf(e), new Wh(t);
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
}, O, k, A, j = 1e8, M = 1 / j, N = Math.PI * 2, P = N / 4, F = 0, ee = Math.sqrt, te = Math.cos, ne = Math.sin, I = function(e) {
	return typeof e == "string";
}, L = function(e) {
	return typeof e == "function";
}, re = function(e) {
	return typeof e == "number";
}, ie = function(e) {
	return e === void 0;
}, R = function(e) {
	return typeof e == "object";
}, ae = function(e) {
	return e !== !1;
}, oe = function() {
	return typeof window < "u";
}, se = function(e) {
	return L(e) || I(e);
}, ce = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {}, le = Array.isArray, ue = /random\([^)]+\)/g, de = /,\s*/g, z = /(?:-?\.?\d|\.)+/gi, B = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, fe = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, pe = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, me = /[+-]=-?[.\d]+/, he = /[^,'"\[\]\s]+/gi, ge = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, V, _e, ve, ye, be = {}, xe = {}, Se, Ce = function(e) {
	return (xe = tt(e, be)) && vr;
}, we = function(e, t) {
	return console.warn("Invalid property", e, "set to", t, "Missing plugin? gsap.registerPlugin()");
}, Te = function(e, t) {
	return !t && console.warn(e);
}, Ee = function(e, t) {
	return e && (be[e] = t) && xe && (xe[e] = t) || be;
}, De = function() {
	return 0;
}, Oe = {
	suppressEvents: !0,
	isStart: !0,
	kill: !1
}, ke = {
	suppressEvents: !0,
	kill: !1
}, Ae = { suppressEvents: !0 }, je = {}, Me = [], Ne = {}, Pe, Fe = {}, Ie = {}, Le = 30, Re = [], ze = "", Be = function(e) {
	var t = e[0], n, r;
	if (R(t) || L(t) || (e = [e]), !(n = (t._gsap || {}).harness)) {
		for (r = Re.length; r-- && !Re[r].targetTest(t););
		n = Re[r];
	}
	for (r = e.length; r--;) e[r] && (e[r]._gsap || (e[r]._gsap = new On(e[r], n))) || e.splice(r, 1);
	return e;
}, Ve = function(e) {
	return e._gsap || Be(Lt(e))[0]._gsap;
}, He = function(e, t, n) {
	return (n = e[t]) && L(n) ? e[t]() : ie(n) && e.getAttribute && e.getAttribute(t) || n;
}, Ue = function(e, t) {
	return (e = e.split(",")).forEach(t) || e;
}, We = function(e) {
	return Math.round(e * 1e5) / 1e5 || 0;
}, Ge = function(e) {
	return Math.round(e * 1e7) / 1e7 || 0;
}, Ke = function(e, t) {
	var n = t.charAt(0), r = parseFloat(t.substr(2));
	return e = parseFloat(e), n === "+" ? e + r : n === "-" ? e - r : n === "*" ? e * r : e / r;
}, qe = function(e, t) {
	for (var n = t.length, r = 0; e.indexOf(t[r]) < 0 && ++r < n;);
	return r < n;
}, Je = function() {
	var e = Me.length, t = Me.slice(0), n, r;
	for (Ne = {}, Me.length = 0, n = 0; n < e; n++) r = t[n], r && r._lazy && (r.render(r._lazy[0], r._lazy[1], !0)._lazy = 0);
}, Ye = function(e) {
	return !!(e._initted || e._startAt || e.add);
}, Xe = function(e, t, n, r) {
	Me.length && !k && Je(), e.render(t, n, r || !!(k && t < 0 && Ye(e))), Me.length && !k && Je();
}, Ze = function(e) {
	var t = parseFloat(e);
	return (t || t === 0) && (e + "").match(he).length < 2 ? t : I(e) ? e.trim() : e;
}, Qe = function(e) {
	return e;
}, $e = function(e, t) {
	for (var n in t) n in e || (e[n] = t[n]);
	return e;
}, et = function(e) {
	return function(t, n) {
		for (var r in n) r in t || r === "duration" && e || r === "ease" || (t[r] = n[r]);
	};
}, tt = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, nt = function e(t, n) {
	for (var r in n) r !== "__proto__" && r !== "constructor" && r !== "prototype" && (t[r] = R(n[r]) ? e(t[r] || (t[r] = {}), n[r]) : n[r]);
	return t;
}, rt = function(e, t) {
	var n = {}, r;
	for (r in e) r in t || (n[r] = e[r]);
	return n;
}, it = function(e) {
	var t = e.parent || V, n = e.keyframes ? et(le(e.keyframes)) : $e;
	if (ae(e.inherit)) for (; t;) n(e, t.vars.defaults), t = t.parent || t._dp;
	return e;
}, at = function(e, t) {
	for (var n = e.length, r = n === t.length; r && n-- && e[n] === t[n];);
	return n < 0;
}, ot = function(e, t, n, r, i) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var a = e[r], o;
	if (i) for (o = t[i]; a && a[i] > o;) a = a._prev;
	return a ? (t._next = a._next, a._next = t) : (t._next = e[n], e[n] = t), t._next ? t._next._prev = t : e[r] = t, t._prev = a, t.parent = t._dp = e, t;
}, st = function(e, t, n, r) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var i = t._prev, a = t._next;
	i ? i._next = a : e[n] === t && (e[n] = a), a ? a._prev = i : e[r] === t && (e[r] = i), t._next = t._prev = t.parent = null;
}, ct = function(e, t) {
	e.parent && (!t || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, lt = function(e, t) {
	if (e && (!t || t._end > e._dur || t._start < 0)) for (var n = e; n;) n._dirty = 1, n = n.parent;
	return e;
}, ut = function(e) {
	for (var t = e.parent; t && t.parent;) t._dirty = 1, t.totalDuration(), t = t.parent;
	return e;
}, dt = function(e, t, n, r) {
	return e._startAt && (k ? e._startAt.revert(ke) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(t, !0, r));
}, ft = function e(t) {
	return !t || t._ts && e(t.parent);
}, pt = function(e) {
	return e._repeat ? mt(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, mt = function(e, t) {
	var n = Math.floor(e = Ge(e / t));
	return e && n === e ? n - 1 : n;
}, ht = function(e, t) {
	return (e - t._start) * t._ts + (t._ts >= 0 ? 0 : t._dirty ? t.totalDuration() : t._tDur);
}, gt = function(e) {
	return e._end = Ge(e._start + (e._tDur / Math.abs(e._ts || e._rts || M) || 0));
}, _t = function(e, t) {
	var n = e._dp;
	return n && n.smoothChildTiming && e._ts && (e._start = Ge(n._time - (e._ts > 0 ? t / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - t) / -e._ts)), gt(e), n._dirty || lt(n, e)), e;
}, vt = function(e, t) {
	var n;
	if ((t._time || !t._dur && t._initted || t._start < e._time && (t._dur || !t.add)) && (n = ht(e.rawTime(), t), (!t._dur || Mt(0, t.totalDuration(), n) - t._tTime > M) && t.render(n, !0)), lt(e, t)._dp && e._initted && e._time >= e._dur && e._ts) {
		if (e._dur < e.duration()) for (n = e; n._dp;) n.rawTime() >= 0 && n.totalTime(n._tTime), n = n._dp;
		e._zTime = -M;
	}
}, yt = function(e, t, n, r) {
	return t.parent && ct(t), t._start = Ge((re(n) ? n : n || e !== V ? kt(e, n, t) : e._time) + t._delay), t._end = Ge(t._start + (t.totalDuration() / Math.abs(t.timeScale()) || 0)), ot(e, t, "_first", "_last", e._sort ? "_start" : 0), Ct(t) || (e._recent = t), r || vt(e, t), e._ts < 0 && _t(e, e._tTime), e;
}, bt = function(e, t) {
	return (be.ScrollTrigger || we("scrollTrigger", t)) && be.ScrollTrigger.create(t, e);
}, xt = function(e, t, n, r, i) {
	if (Ln(e, t, i), !e._initted) return 1;
	if (!n && e._pt && !k && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && Pe !== hn.frame) return Me.push(e), e._lazy = [i, r], 1;
}, St = function e(t) {
	var n = t.parent;
	return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || e(n));
}, Ct = function(e) {
	var t = e.data;
	return t === "isFromStart" || t === "isStart";
}, wt = function(e, t, n, r) {
	var i = e.ratio, a = t < 0 || !t && (!e._start && St(e) && (e._initted || !Ct(e)) || (e._ts < 0 || e._dp._ts < 0) && !Ct(e)) ? 0 : 1, o = e._rDelay, s = 0, c, l, u;
	if (o && e._repeat && (s = Mt(0, e._tDur, t), l = mt(s, o), e._yoyo && l & 1 && (a = 1 - a), l !== mt(e._tTime, o) && (i = 1 - a, e.vars.repeatRefresh && e._initted && e.invalidate())), a !== i || k || r || e._zTime === M || !t && e._zTime) {
		if (!e._initted && xt(e, t, r, n, s)) return;
		for (u = e._zTime, e._zTime = t || (n ? M : 0), n ||= t && !u, e.ratio = a, e._from && (a = 1 - a), e._time = 0, e._tTime = s, c = e._pt; c;) c.r(a, c.d), c = c._next;
		t < 0 && dt(e, t, n, !0), e._onUpdate && !n && $t(e, "onUpdate"), s && e._repeat && !n && e.parent && $t(e, "onRepeat"), (t >= e._tDur || t < 0) && e.ratio === a && (a && ct(e, 1), !n && !k && ($t(e, a ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
	} else e._zTime ||= t;
}, Tt = function(e, t, n) {
	var r;
	if (n > t) for (r = e._first; r && r._start <= n;) {
		if (r.data === "isPause" && r._start > t) return r;
		r = r._next;
	}
	else for (r = e._last; r && r._start >= n;) {
		if (r.data === "isPause" && r._start < t) return r;
		r = r._prev;
	}
}, Et = function(e, t, n, r) {
	var i = e._repeat, a = Ge(t) || 0, o = e._tTime / e._tDur;
	return o && !r && (e._time *= a / e._dur), e._dur = a, e._tDur = i ? i < 0 ? 1e10 : Ge(a * (i + 1) + e._rDelay * i) : a, o > 0 && !r && _t(e, e._tTime = e._tDur * o), e.parent && gt(e), n || lt(e.parent, e), e;
}, Dt = function(e) {
	return e instanceof An ? lt(e) : Et(e, e._dur);
}, Ot = {
	_start: 0,
	endTime: De,
	totalDuration: De
}, kt = function e(t, n, r) {
	var i = t.labels, a = t._recent || Ot, o = t.duration() >= j ? a.endTime(!1) : t._dur, s, c, l;
	return I(n) && (isNaN(n) || n in i) ? (c = n.charAt(0), l = n.substr(-1) === "%", s = n.indexOf("="), c === "<" || c === ">" ? (s >= 0 && (n = n.replace(/=/, "")), (c === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (l ? (s < 0 ? a : r).totalDuration() / 100 : 1)) : s < 0 ? (n in i || (i[n] = o), i[n]) : (c = parseFloat(n.charAt(s - 1) + n.substr(s + 1)), l && r && (c = c / 100 * (le(r) ? r[0] : r).totalDuration()), s > 1 ? e(t, n.substr(0, s - 1), r) + c : o + c)) : n == null ? o : +n;
}, At = function(e, t, n) {
	var r = re(t[1]), i = (r ? 2 : 1) + (e < 2 ? 0 : 1), a = t[i], o, s;
	if (r && (a.duration = t[1]), a.parent = n, e) {
		for (o = a, s = n; s && !("immediateRender" in o);) o = s.vars.defaults || {}, s = ae(s.vars.inherit) && s.parent;
		a.immediateRender = ae(o.immediateRender), e < 2 ? a.runBackwards = 1 : a.startAt = t[i - 1];
	}
	return new Wn(t[0], a, t[i + 1]);
}, jt = function(e, t) {
	return e || e === 0 ? t(e) : t;
}, Mt = function(e, t, n) {
	return n < e ? e : n > t ? t : n;
}, H = function(e, t) {
	return !I(e) || !(t = ge.exec(e)) ? "" : t[1];
}, Nt = function(e, t, n) {
	return jt(n, function(n) {
		return Mt(e, t, n);
	});
}, Pt = [].slice, Ft = function(e, t) {
	return e && R(e) && "length" in e && (!t && !e.length || e.length - 1 in e && R(e[0])) && !e.nodeType && e !== _e;
}, It = function(e, t, n) {
	return n === void 0 && (n = []), e.forEach(function(e) {
		var r;
		return I(e) && !t || Ft(e, 1) ? (r = n).push.apply(r, Lt(e)) : n.push(e);
	}) || n;
}, Lt = function(e, t, n) {
	return A && !t && A.selector ? A.selector(e) : I(e) && !n && (ve || !gn()) ? Pt.call((t || ye).querySelectorAll(e), 0) : le(e) ? It(e, n) : Ft(e) ? Pt.call(e, 0) : e ? [e] : [];
}, Rt = function(e) {
	return e = Lt(e)[0] || Te("Invalid scope") || {}, function(t) {
		var n = e.current || e.nativeElement || e;
		return Lt(t, n.querySelectorAll ? n : n === e ? Te("Invalid scope") || ye.createElement("div") : e);
	};
}, zt = function(e) {
	return e.sort(function() {
		return .5 - Math.random();
	});
}, Bt = function(e) {
	if (L(e)) return e;
	var t = R(e) ? e : { each: e }, n = Cn(t.ease), r = t.from || 0, i = parseFloat(t.base) || 0, a = {}, o = r > 0 && r < 1, s = isNaN(r) || o, c = t.axis, l = r, u = r;
	return I(r) ? l = u = {
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
			r === "random" && zt(p), p.max = b - x, p.min = x, p.v = f = (parseFloat(t.amount) || parseFloat(t.each) * (S > f ? f - 1 : c ? c === "y" ? f / S : S : Math.max(S, f / S)) || 0) * (r === "edges" ? -1 : 1), p.b = f < 0 ? i - f : i, p.u = H(t.amount || t.each) || 0, n = n && f < 0 ? Sn(n) : n;
		}
		return f = (p[e] - p.min) / p.max || 0, Ge(p.b + (n ? n(f) : f) * p.v) + p.u;
	};
}, Vt = function(e) {
	var t = 10 ** ((e + "").split(".")[1] || "").length;
	return function(n) {
		var r = Ge(Math.round(parseFloat(n) / e) * e * t);
		return (r - r % 1) / t + (re(n) ? 0 : H(n));
	};
}, U = function(e, t) {
	var n = le(e), r, i;
	return !n && R(e) && (r = n = e.radius || j, e.values ? (e = Lt(e.values), (i = !re(e[0])) && (r *= r)) : e = Vt(e.increment)), jt(t, n ? L(e) ? function(t) {
		return i = e(t), Math.abs(i - t) <= r ? i : t;
	} : function(t) {
		for (var n = parseFloat(i ? t.x : t), a = parseFloat(i ? t.y : 0), o = j, s = 0, c = e.length, l, u; c--;) i ? (l = e[c].x - n, u = e[c].y - a, l = l * l + u * u) : l = Math.abs(e[c] - n), l < o && (o = l, s = c);
		return s = !r || o <= r ? e[s] : t, i || s === t || re(t) ? s : s + H(t);
	} : Vt(e));
}, Ht = function(e, t, n, r) {
	return jt(le(e) ? !t : n === !0 ? !!(n = 0) : !r, function() {
		return le(e) ? e[~~(Math.random() * e.length)] : (n ||= 1e-5) && (r = n < 1 ? 10 ** ((n + "").length - 2) : 1) && Math.floor(Math.round((e - n / 2 + Math.random() * (t - e + n * .99)) / n) * n * r) / r;
	});
}, Ut = function() {
	var e = [...arguments];
	return function(t) {
		return e.reduce(function(e, t) {
			return t(e);
		}, t);
	};
}, Wt = function(e, t) {
	return function(n) {
		return e(parseFloat(n)) + (t || H(n));
	};
}, Gt = function(e, t, n) {
	return Xt(e, t, 0, 1, n);
}, Kt = function(e, t, n) {
	return jt(n, function(n) {
		return e[~~t(n)];
	});
}, qt = function e(t, n, r) {
	var i = n - t;
	return le(t) ? Kt(t, e(0, t.length), n) : jt(r, function(e) {
		return (i + (e - t) % i) % i + t;
	});
}, Jt = function e(t, n, r) {
	var i = n - t, a = i * 2;
	return le(t) ? Kt(t, e(0, t.length - 1), n) : jt(r, function(e) {
		return e = (a + (e - t) % a) % a || 0, t + (e > i ? a - e : e);
	});
}, Yt = function(e) {
	return e.replace(ue, function(e) {
		var t = e.indexOf("[") + 1, n = e.substring(t || 7, t ? e.indexOf("]") : e.length - 1).split(de);
		return Ht(t ? n : +n[0], t ? 0 : +n[1], +n[2] || 1e-5);
	});
}, Xt = function(e, t, n, r, i) {
	var a = t - e, o = r - n;
	return jt(i, function(t) {
		return n + ((t - e) / a * o || 0);
	});
}, Zt = function e(t, n, r, i) {
	var a = isNaN(t + n) ? 0 : function(e) {
		return (1 - e) * t + e * n;
	};
	if (!a) {
		var o = I(t), s = {}, c, l, u, d, f;
		if (r === !0 && (i = 1) && (r = null), o) t = { p: t }, n = { p: n };
		else if (le(t) && !le(n)) {
			for (u = [], d = t.length, f = d - 2, l = 1; l < d; l++) u.push(e(t[l - 1], t[l]));
			d--, a = function(e) {
				e *= d;
				var t = Math.min(f, ~~e);
				return u[t](e - t);
			}, r = n;
		} else i || (t = tt(le(t) ? [] : {}, t));
		if (!u) {
			for (c in n) Mn.call(s, t, c, "get", n[c]);
			a = function(e) {
				return $n(e, s) || (o ? t.p : t);
			};
		}
	}
	return jt(r, a);
}, Qt = function(e, t, n) {
	var r = e.labels, i = j, a, o, s;
	for (a in r) o = r[a] - t, o < 0 == !!n && o && i > (o = Math.abs(o)) && (s = a, i = o);
	return s;
}, $t = function(e, t, n) {
	var r = e.vars, i = r[t], a = A, o = e._ctx, s, c, l;
	if (i) return s = r[t + "Params"], c = r.callbackScope || e, n && Me.length && Je(), o && (A = o), l = s ? i.apply(c, s) : i.call(c), A = a, l;
}, en = function(e) {
	return ct(e), e.scrollTrigger && e.scrollTrigger.kill(!!k), e.progress() < 1 && $t(e, "onInterrupt"), e;
}, tn, nn = [], rn = function(e) {
	if (e) {
		if (e = !e.name && e.default || e, oe() || e.headless) {
			var t = e.name, n = L(e), r = t && !n && e.init ? function() {
				this._props = [];
			} : e, i = {
				init: De,
				render: $n,
				add: Mn,
				kill: tr,
				modifier: er,
				rawVars: 0
			}, a = {
				targetTest: 0,
				get: 0,
				getSetter: Yn,
				aliases: {},
				register: 0
			};
			if (gn(), e !== r) {
				if (Fe[t]) return;
				$e(r, $e(rt(e, i), a)), tt(r.prototype, tt(i, rt(e, a))), Fe[r.prop = t] = r, e.targetTest && (Re.push(r), je[t] = 1), t = (t === "css" ? "CSS" : t.charAt(0).toUpperCase() + t.substr(1)) + "Plugin";
			}
			Ee(t, r), e.register && e.register(vr, r, ir);
		} else nn.push(e);
	}
}, an = 255, on = {
	aqua: [
		0,
		an,
		an
	],
	lime: [
		0,
		an,
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
		an
	],
	navy: [
		0,
		0,
		128
	],
	white: [
		an,
		an,
		an
	],
	olive: [
		128,
		128,
		0
	],
	yellow: [
		an,
		an,
		0
	],
	orange: [
		an,
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
		an,
		0,
		0
	],
	pink: [
		an,
		192,
		203
	],
	cyan: [
		0,
		an,
		an
	],
	transparent: [
		an,
		an,
		an,
		0
	]
}, sn = function(e, t, n) {
	return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? t + (n - t) * e * 6 : e < .5 ? n : e * 3 < 2 ? t + (n - t) * (2 / 3 - e) * 6 : t) * an + .5 | 0;
}, cn = function(e, t, n) {
	var r = e ? re(e) ? [
		e >> 16,
		e >> 8 & an,
		e & an
	] : 0 : on.black, i, a, o, s, c, l, u, d, f, p;
	if (!r) {
		if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), on[e]) r = on[e];
		else if (e.charAt(0) === "#") {
			if (e.length < 6 && (i = e.charAt(1), a = e.charAt(2), o = e.charAt(3), e = "#" + i + i + a + a + o + o + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9) return r = parseInt(e.substr(1, 6), 16), [
				r >> 16,
				r >> 8 & an,
				r & an,
				parseInt(e.substr(7), 16) / 255
			];
			e = parseInt(e.substr(1), 16), r = [
				e >> 16,
				e >> 8 & an,
				e & an
			];
		} else if (e.substr(0, 3) === "hsl") {
			if (r = p = e.match(z), !t) s = r[0] % 360 / 360, c = r[1] / 100, l = r[2] / 100, a = l <= .5 ? l * (c + 1) : l + c - l * c, i = l * 2 - a, r.length > 3 && (r[3] *= 1), r[0] = sn(s + 1 / 3, i, a), r[1] = sn(s, i, a), r[2] = sn(s - 1 / 3, i, a);
			else if (~e.indexOf("=")) return r = e.match(B), n && r.length < 4 && (r[3] = 1), r;
		} else r = e.match(z) || on.transparent;
		r = r.map(Number);
	}
	return t && !p && (i = r[0] / an, a = r[1] / an, o = r[2] / an, u = Math.max(i, a, o), d = Math.min(i, a, o), l = (u + d) / 2, u === d ? s = c = 0 : (f = u - d, c = l > .5 ? f / (2 - u - d) : f / (u + d), s = u === i ? (a - o) / f + (a < o ? 6 : 0) : u === a ? (o - i) / f + 2 : (i - a) / f + 4, s *= 60), r[0] = ~~(s + .5), r[1] = ~~(c * 100 + .5), r[2] = ~~(l * 100 + .5)), n && r.length < 4 && (r[3] = 1), r;
}, ln = function(e) {
	var t = [], n = [], r = -1;
	return e.split(dn).forEach(function(e) {
		var i = e.match(fe) || [];
		t.push.apply(t, i), n.push(r += i.length + 1);
	}), t.c = n, t;
}, un = function(e, t, n) {
	var r = "", i = (e + r).match(dn), a = t ? "hsla(" : "rgba(", o = 0, s, c, l, u;
	if (!i) return e;
	if (i = i.map(function(e) {
		return (e = cn(e, t, 1)) && a + (t ? e[0] + "," + e[1] + "%," + e[2] + "%," + e[3] : e.join(",")) + ")";
	}), n && (l = ln(e), s = n.c, s.join(r) !== l.c.join(r))) for (c = e.replace(dn, "1").split(fe), u = c.length - 1; o < u; o++) r += c[o] + (~s.indexOf(o) ? i.shift() || a + "0,0,0,0)" : (l.length ? l : i.length ? i : n).shift());
	if (!c) for (c = e.split(dn), u = c.length - 1; o < u; o++) r += c[o] + i[o];
	return r + c[u];
}, dn = function() {
	var e = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", t;
	for (t in on) e += "|" + t + "\\b";
	return RegExp(e + ")", "gi");
}(), fn = /hsl[a]?\(/, pn = function(e) {
	var t = e.join(" "), n;
	if (dn.lastIndex = 0, dn.test(t)) return n = fn.test(t), e[1] = un(e[1], n), e[0] = un(e[0], n, ln(e[1])), !0;
}, mn, hn = function() {
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
			Se && (!ve && oe() && (_e = ve = window, ye = _e.document || {}, be.gsap = vr, (_e.gsapVersions || (_e.gsapVersions = [])).push(vr.version), Ce(xe || _e.GreenSockGlobals || !_e.gsap && _e || {}), nn.forEach(rn)), u = typeof requestAnimationFrame < "u" && requestAnimationFrame, c && d.sleep(), l = u || function(e) {
				return setTimeout(e, o - d.time * 1e3 + 1 | 0);
			}, mn = 1, m(2));
		},
		sleep: function() {
			(u ? cancelAnimationFrame : clearTimeout)(c), mn = 0, l = De;
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
			return d.remove(e), s[n ? "unshift" : "push"](r), gn(), r;
		},
		remove: function(e, t) {
			~(t = s.indexOf(e)) && s.splice(t, 1) && p >= t && p--;
		},
		_listeners: s
	}, d;
}(), gn = function() {
	return !mn && hn.wake();
}, W = {}, _n = /^[\d.\-M][\d.\-,\s]/, vn = /["']/g, yn = function(e) {
	for (var t = {}, n = e.substr(1, e.length - 3).split(":"), r = n[0], i = 1, a = n.length, o, s, c; i < a; i++) s = n[i], o = i === a - 1 ? s.length : s.lastIndexOf(","), c = s.substr(0, o), t[r] = isNaN(c) ? c.replace(vn, "").trim() : +c, r = s.substr(o + 1).trim();
	return t;
}, bn = function(e) {
	var t = e.indexOf("(") + 1, n = e.indexOf(")"), r = e.indexOf("(", t);
	return e.substring(t, ~r && r < n ? e.indexOf(")", n + 1) : n);
}, xn = function(e) {
	var t = (e + "").split("("), n = W[t[0]];
	return n && t.length > 1 && n.config ? n.config.apply(null, ~e.indexOf("{") ? [yn(t[1])] : bn(e).split(",").map(Ze)) : W._CE && _n.test(e) ? W._CE("", e) : n;
}, Sn = function(e) {
	return function(t) {
		return 1 - e(1 - t);
	};
}, Cn = function(e, t) {
	return e && (L(e) ? e : W[e] || xn(e)) || t;
}, wn = function(e, t, n, r) {
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
	return Ue(e, function(e) {
		for (var t in W[e] = be[e] = i, W[a = e.toLowerCase()] = n, i) W[a + (t === "easeIn" ? ".in" : t === "easeOut" ? ".out" : ".inOut")] = W[e + "." + t] = i[t];
	}), i;
}, Tn = function(e) {
	return function(t) {
		return t < .5 ? (1 - e(1 - t * 2)) / 2 : .5 + e((t - .5) * 2) / 2;
	};
}, En = function e(t, n, r) {
	var i = n >= 1 ? n : 1, a = (r || (t ? .3 : .45)) / (n < 1 ? n : 1), o = a / N * (Math.asin(1 / i) || 0), s = function(e) {
		return e === 1 ? 1 : i * 2 ** (-10 * e) * ne((e - o) * a) + 1;
	}, c = t === "out" ? s : t === "in" ? function(e) {
		return 1 - s(1 - e);
	} : Tn(s);
	return a = N / a, c.config = function(n, r) {
		return e(t, n, r);
	}, c;
}, Dn = function e(t, n) {
	n === void 0 && (n = 1.70158);
	var r = function(e) {
		return e ? --e * e * ((n + 1) * e + n) + 1 : 0;
	}, i = t === "out" ? r : t === "in" ? function(e) {
		return 1 - r(1 - e);
	} : Tn(r);
	return i.config = function(n) {
		return e(t, n);
	}, i;
};
Ue("Linear,Quad,Cubic,Quart,Quint,Strong", function(e, t) {
	var n = t < 5 ? t + 1 : t;
	wn(e + ",Power" + (n - 1), t ? function(e) {
		return e ** +n;
	} : function(e) {
		return e;
	}, function(e) {
		return 1 - (1 - e) ** n;
	}, function(e) {
		return e < .5 ? (e * 2) ** n / 2 : 1 - ((1 - e) * 2) ** n / 2;
	});
}), W.Linear.easeNone = W.none = W.Linear.easeIn, wn("Elastic", En("in"), En("out"), En()), (function(e, t) {
	var n = 1 / t, r = 2 * n, i = 2.5 * n, a = function(a) {
		return a < n ? e * a * a : a < r ? e * (a - 1.5 / t) ** 2 + .75 : a < i ? e * (a -= 2.25 / t) * a + .9375 : e * (a - 2.625 / t) ** 2 + .984375;
	};
	wn("Bounce", function(e) {
		return 1 - a(1 - e);
	}, a);
})(7.5625, 2.75), wn("Expo", function(e) {
	return 2 ** (10 * (e - 1)) * e + e * e * e * e * e * e * (1 - e);
}), wn("Circ", function(e) {
	return -(ee(1 - e * e) - 1);
}), wn("Sine", function(e) {
	return e === 1 ? 1 : -te(e * P) + 1;
}), wn("Back", Dn("in"), Dn("out"), Dn()), W.SteppedEase = W.steps = be.SteppedEase = { config: function(e, t) {
	e === void 0 && (e = 1);
	var n = 1 / e, r = e + +!t, i = +!!t, a = 1 - M;
	return function(e) {
		return ((r * Mt(0, a, e) | 0) + i) * n;
	};
} }, D.ease = W["quad.out"], Ue("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(e) {
	return ze += e + "," + e + "Params,";
});
var On = function(e, t) {
	this.id = F++, e._gsap = this, this.target = e, this.harness = t, this.get = t ? t.get : He, this.set = t ? t.getSetter : Yn;
}, kn = /*#__PURE__*/ function() {
	function e(e) {
		this.vars = e, this._delay = +e.delay || 0, (this._repeat = e.repeat === Infinity ? -2 : e.repeat || 0) && (this._rDelay = e.repeatDelay || 0, this._yoyo = !!e.yoyo || !!e.yoyoEase), this._ts = 1, Et(this, +e.duration, 1, 1), this.data = e.data, A && (this._ctx = A, A.data.push(this)), mn || hn.wake();
	}
	var t = e.prototype;
	return t.delay = function(e) {
		return e || e === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + e - this._delay), this._delay = e, this) : this._delay;
	}, t.duration = function(e) {
		return arguments.length ? this.totalDuration(this._repeat > 0 ? e + (e + this._rDelay) * this._repeat : e) : this.totalDuration() && this._dur;
	}, t.totalDuration = function(e) {
		return arguments.length ? (this._dirty = 0, Et(this, this._repeat < 0 ? e : (e - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
	}, t.totalTime = function(e, t) {
		if (gn(), !arguments.length) return this._tTime;
		var n = this._dp;
		if (n && n.smoothChildTiming && this._ts) {
			for (_t(this, e), !n._dp || n.parent || vt(n, this); n && n.parent;) n.parent._time !== n._start + (n._ts >= 0 ? n._tTime / n._ts : (n.totalDuration() - n._tTime) / -n._ts) && n.totalTime(n._tTime, !0), n = n.parent;
			!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && e < this._tDur || this._ts < 0 && e > 0 || !this._tDur && !e) && yt(this._dp, this, this._start - this._delay);
		}
		return (this._tTime !== e || !this._dur && !t || this._initted && Math.abs(this._zTime) === M || !this._initted && this._dur && e || !e && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = e), Xe(this, e, t)), this;
	}, t.time = function(e, t) {
		return arguments.length ? this.totalTime(Math.min(this.totalDuration(), e + pt(this)) % (this._dur + this._rDelay) || (e ? this._dur : 0), t) : this._time;
	}, t.totalProgress = function(e, t) {
		return arguments.length ? this.totalTime(this.totalDuration() * e, t) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
	}, t.progress = function(e, t) {
		return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - e : e) + pt(this), t) : this.duration() ? Math.min(1, this._time / this._dur) : +(this.rawTime() > 0);
	}, t.iteration = function(e, t) {
		var n = this.duration() + this._rDelay;
		return arguments.length ? this.totalTime(this._time + (e - 1) * n, t) : this._repeat ? mt(this._tTime, n) + 1 : 1;
	}, t.timeScale = function(e, t) {
		if (!arguments.length) return this._rts === -M ? 0 : this._rts;
		if (this._rts === e) return this;
		var n = this.parent && this._ts ? ht(this.parent._time, this) : this._tTime;
		return this._rts = +e || 0, this._ts = this._ps || e === -M ? 0 : this._rts, this.totalTime(Mt(-Math.abs(this._delay), this.totalDuration(), n), t !== !1), gt(this), ut(this);
	}, t.paused = function(e) {
		return arguments.length ? (this._ps !== e && (this._ps = e, e ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (gn(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== M && (this._tTime -= M)))), this) : this._ps;
	}, t.startTime = function(e) {
		if (arguments.length) {
			this._start = Ge(e);
			var t = this.parent || this._dp;
			return t && (t._sort || !this.parent) && yt(t, this, this._start - this._delay), this;
		}
		return this._start;
	}, t.endTime = function(e) {
		return this._start + (ae(e) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	}, t.rawTime = function(e) {
		var t = this.parent || this._dp;
		return t ? e && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? ht(t.rawTime(e), this) : this._tTime : this._tTime;
	}, t.revert = function(e) {
		e === void 0 && (e = Ae);
		var t = k;
		return k = e, Ye(this) && (this.timeline && this.timeline.revert(e), this.totalTime(-.01, e.suppressEvents)), this.data !== "nested" && e.kill !== !1 && this.kill(), k = t, this;
	}, t.globalTime = function(e) {
		for (var t = this, n = arguments.length ? e : t.rawTime(); t;) n = t._start + n / (Math.abs(t._ts) || 1), t = t._dp;
		return !this.parent && this._sat ? this._sat.globalTime(e) : n;
	}, t.repeat = function(e) {
		return arguments.length ? (this._repeat = e === Infinity ? -2 : e, Dt(this)) : this._repeat === -2 ? Infinity : this._repeat;
	}, t.repeatDelay = function(e) {
		if (arguments.length) {
			var t = this._time;
			return this._rDelay = e, Dt(this), t ? this.time(t) : this;
		}
		return this._rDelay;
	}, t.yoyo = function(e) {
		return arguments.length ? (this._yoyo = e, this) : this._yoyo;
	}, t.seek = function(e, t) {
		return this.totalTime(kt(this, e), ae(t));
	}, t.restart = function(e, t) {
		return this.play().totalTime(e ? -this._delay : 0, ae(t)), this._dur || (this._zTime = -M), this;
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
			var i = L(e) ? e : Qe, a = function() {
				var e = t.then;
				t.then = null, n && n(), L(i) && (i = i(t)) && (i.then || i === t) && (t.then = e), r(i), t.then = e;
			};
			t._initted && t.totalProgress() === 1 && t._ts >= 0 || !t._tTime && t._ts < 0 ? a() : t._prom = a;
		});
	}, t.kill = function() {
		en(this);
	}, e;
}();
$e(kn.prototype, {
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
var An = /*#__PURE__*/ function(e) {
	T(t, e);
	function t(t, n) {
		var r;
		return t === void 0 && (t = {}), r = e.call(this, t) || this, r.labels = {}, r.smoothChildTiming = !!t.smoothChildTiming, r.autoRemoveChildren = !!t.autoRemoveChildren, r._sort = ae(t.sortChildren), V && yt(t.parent || V, w(r), n), t.reversed && r.reverse(), t.paused && r.paused(!0), t.scrollTrigger && bt(w(r), t.scrollTrigger), r;
	}
	var n = t.prototype;
	return n.to = function(e, t, n) {
		return At(0, arguments, this), this;
	}, n.from = function(e, t, n) {
		return At(1, arguments, this), this;
	}, n.fromTo = function(e, t, n, r) {
		return At(2, arguments, this), this;
	}, n.set = function(e, t, n) {
		return t.duration = 0, t.parent = this, it(t).repeatDelay || (t.repeat = 0), t.immediateRender = !!t.immediateRender, new Wn(e, t, kt(this, n), 1), this;
	}, n.call = function(e, t, n) {
		return yt(this, Wn.delayedCall(0, e, t), n);
	}, n.staggerTo = function(e, t, n, r, i, a, o) {
		return n.duration = t, n.stagger = n.stagger || r, n.onComplete = a, n.onCompleteParams = o, n.parent = this, new Wn(e, n, kt(this, i)), this;
	}, n.staggerFrom = function(e, t, n, r, i, a, o) {
		return n.runBackwards = 1, it(n).immediateRender = ae(n.immediateRender), this.staggerTo(e, t, n, r, i, a, o);
	}, n.staggerFromTo = function(e, t, n, r, i, a, o, s) {
		return r.startAt = n, it(r).immediateRender = ae(r.immediateRender), this.staggerTo(e, t, r, i, a, o, s);
	}, n.render = function(e, t, n) {
		var r = this._time, i = this._dirty ? this.totalDuration() : this._tDur, a = this._dur, o = e <= 0 ? 0 : Ge(e), s = this._zTime < 0 != e < 0 && (this._initted || !a), c, l, u, d, f, p, m, h, g, _, v, y;
		if (this !== V && o > i && e >= 0 && (o = i), o !== this._tTime || n || s) {
			if (r !== this._time && a && (o += this._time - r, e += this._time - r), c = o, g = this._start, h = this._ts, p = !h, s && (a || (r = this._zTime), (e || !t) && (this._zTime = e)), this._repeat) {
				if (v = this._yoyo, f = a + this._rDelay, this._repeat < -1 && e < 0) return this.totalTime(f * 100 + e, t, n);
				if (c = Ge(o % f), o === i ? (d = this._repeat, c = a) : (_ = Ge(o / f), d = ~~_, d && d === _ && (c = a, d--), c > a && (c = a)), _ = mt(this._tTime, f), !r && this._tTime && _ !== d && this._tTime - _ * f - this._dur <= 0 && (_ = d), v && d & 1 && (c = a - c, y = 1), d !== _ && !this._lock) {
					var b = v && _ & 1, x = b === (v && d & 1);
					if (d < _ && (b = !b), r = b ? 0 : o % a ? a : o, this._lock = 1, this.render(r || (y ? 0 : Ge(d * f)), t, !a)._lock = 0, this._tTime = o, !t && this.parent && $t(this, "onRepeat"), this.vars.repeatRefresh && !y && (this.invalidate()._lock = 1, _ = d), r && r !== this._time || p !== !this._ts || this.vars.onRepeat && !this.parent && !this._act || (a = this._dur, i = this._tDur, x && (this._lock = 2, r = b ? a : -1e-4, this.render(r, !0), this.vars.repeatRefresh && !y && this.invalidate()), this._lock = 0, !this._ts && !p)) return this;
				}
			}
			if (this._hasPause && !this._forcing && this._lock < 2 && (m = Tt(this, Ge(r), Ge(c)), m && (o -= c - (c = m._start))), this._tTime = o, this._time = c, this._act = !!h, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = e, r = 0), !r && o && a && !t && !_ && ($t(this, "onStart"), this._tTime !== o)) return this;
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
						if (l.render(l._ts > 0 ? (S - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (S - l._start) * l._ts, t, n || k && Ye(l)), c !== this._time || !this._ts && !p) {
							m = 0, u && (o += this._zTime = S ? -M : M);
							break;
						}
					}
					l = u;
				}
			}
			if (m && !t && (this.pause(), m.render(c >= r ? 0 : -M)._zTime = c >= r ? 1 : -1, this._ts)) return this._start = g, gt(this), this.render(e, t, n);
			this._onUpdate && !t && $t(this, "onUpdate", !0), (o === i && this._tTime >= this.totalDuration() || !o && r) && (g === this._start || Math.abs(h) !== Math.abs(this._ts)) && (this._lock || ((e || !a) && (o === i && this._ts > 0 || !o && this._ts < 0) && ct(this, 1), !t && !(e < 0 && !r) && (o || r || !i) && ($t(this, o === i && e >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(o < i && this.timeScale() > 0) && this._prom())));
		}
		return this;
	}, n.add = function(e, t) {
		var n = this;
		if (re(t) || (t = kt(this, t, e)), !(e instanceof kn)) {
			if (le(e)) return e.forEach(function(e) {
				return n.add(e, t);
			}), this;
			if (I(e)) return this.addLabel(e, t);
			if (L(e)) e = Wn.delayedCall(0, e);
			else return this;
		}
		return this === e ? this : yt(this, e, t);
	}, n.getChildren = function(e, t, n, r) {
		e === void 0 && (e = !0), t === void 0 && (t = !0), n === void 0 && (n = !0), r === void 0 && (r = -j);
		for (var i = [], a = this._first; a;) a._start >= r && (a instanceof Wn ? t && i.push(a) : (n && i.push(a), e && i.push.apply(i, a.getChildren(!0, t, n)))), a = a._next;
		return i;
	}, n.getById = function(e) {
		for (var t = this.getChildren(1, 1, 1), n = t.length; n--;) if (t[n].vars.id === e) return t[n];
	}, n.remove = function(e) {
		return I(e) ? this.removeLabel(e) : L(e) ? this.killTweensOf(e) : (e.parent === this && st(this, e), e === this._recent && (this._recent = this._last), lt(this));
	}, n.totalTime = function(t, n) {
		return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = Ge(hn.time - (this._ts > 0 ? t / this._ts : (this.totalDuration() - t) / -this._ts))), e.prototype.totalTime.call(this, t, n), this._forcing = 0, this) : this._tTime;
	}, n.addLabel = function(e, t) {
		return this.labels[e] = kt(this, t), this;
	}, n.removeLabel = function(e) {
		return delete this.labels[e], this;
	}, n.addPause = function(e, t, n) {
		var r = Wn.delayedCall(0, t || De, n);
		return r.data = "isPause", this._hasPause = 1, yt(this, r, kt(this, e));
	}, n.removePause = function(e) {
		var t = this._first;
		for (e = kt(this, e); t;) t._start === e && t.data === "isPause" && ct(t), t = t._next;
	}, n.killTweensOf = function(e, t, n) {
		for (var r = this.getTweensOf(e, n), i = r.length; i--;) Fn !== r[i] && r[i].kill(e, t);
		return this;
	}, n.getTweensOf = function(e, t) {
		for (var n = [], r = Lt(e), i = this._first, a = re(t), o; i;) i instanceof Wn ? qe(i._targets, r) && (a ? (!Fn || i._initted && i._ts) && i.globalTime(0) <= t && i.globalTime(i.totalDuration()) > t : !t || i.isActive()) && n.push(i) : (o = i.getTweensOf(r, t)).length && n.push.apply(n, o), i = i._next;
		return n;
	}, n.tweenTo = function(e, t) {
		t ||= {};
		var n = this, r = kt(n, e), i = t, a = i.startAt, o = i.onStart, s = i.onStartParams, c = i.immediateRender, l, u = Wn.to(n, $e({
			ease: t.ease || "none",
			lazy: !1,
			immediateRender: !1,
			time: r,
			overwrite: "auto",
			duration: t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale()) || M,
			onStart: function() {
				if (n.pause(), !l) {
					var e = t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale());
					u._dur !== e && Et(u, e, 0, 1).render(u._time, !0, !0), l = 1;
				}
				o && o.apply(u, s || []);
			}
		}, t));
		return c ? u.render(0) : u;
	}, n.tweenFromTo = function(e, t, n) {
		return this.tweenTo(t, $e({ startAt: { time: kt(this, e) } }, n));
	}, n.recent = function() {
		return this._recent;
	}, n.nextLabel = function(e) {
		return e === void 0 && (e = this._time), Qt(this, kt(this, e));
	}, n.previousLabel = function(e) {
		return e === void 0 && (e = this._time), Qt(this, kt(this, e), 1);
	}, n.currentLabel = function(e) {
		return arguments.length ? this.seek(e, !0) : this.previousLabel(this._time + M);
	}, n.shiftChildren = function(e, t, n) {
		n === void 0 && (n = 0);
		var r = this._first, i = this.labels, a;
		for (e = Ge(e); r;) r._start >= n && (r._start += e, r._end += e), r = r._next;
		if (t) for (a in i) i[a] >= n && (i[a] += e);
		return lt(this);
	}, n.invalidate = function(t) {
		var n = this._first;
		for (this._lock = 0; n;) n.invalidate(t), n = n._next;
		return e.prototype.invalidate.call(this, t);
	}, n.clear = function(e) {
		e === void 0 && (e = !0);
		for (var t = this._first, n; t;) n = t._next, this.remove(t), t = n;
		return this._dp && (this._time = this._tTime = this._pTime = 0), e && (this.labels = {}), lt(this);
	}, n.totalDuration = function(e) {
		var t = 0, n = this, r = n._last, i = j, a, o, s;
		if (arguments.length) return n.timeScale((n._repeat < 0 ? n.duration() : n.totalDuration()) / (n.reversed() ? -e : e));
		if (n._dirty) {
			for (s = n.parent; r;) a = r._prev, r._dirty && r.totalDuration(), o = r._start, o > i && n._sort && r._ts && !n._lock ? (n._lock = 1, yt(n, r, o - r._delay, 1)._lock = 0) : i = o, o < 0 && r._ts && (t -= o, (!s && !n._dp || s && s.smoothChildTiming) && (n._start += Ge(o / n._ts), n._time -= o, n._tTime -= o), n.shiftChildren(-o, !1, -Infinity), i = 0), r._end > t && r._ts && (t = r._end), r = a;
			Et(n, n === V && n._time > t ? n._time : t, 1, 1), n._dirty = 0;
		}
		return n._tDur;
	}, t.updateRoot = function(e) {
		if (V._ts && (Xe(V, ht(e, V)), Pe = hn.frame), hn.frame >= Le) {
			Le += E.autoSleep || 120;
			var t = V._first;
			if ((!t || !t._ts) && E.autoSleep && hn._listeners.length < 2) {
				for (; t && !t._ts;) t = t._next;
				t || hn.sleep();
			}
		}
	}, t;
}(kn);
$e(An.prototype, {
	_lock: 0,
	_hasPause: 0,
	_forcing: 0
});
var jn = function(e, t, n, r, i, a, o) {
	var s = new ir(this._pt, e, t, 0, 1, Qn, null, i), c = 0, l = 0, u, d, f, p, m, h, g, _;
	for (s.b = n, s.e = r, n += "", r += "", (g = ~r.indexOf("random(")) && (r = Yt(r)), a && (_ = [n, r], a(_, e, t), n = _[0], r = _[1]), d = n.match(pe) || []; u = pe.exec(r);) p = u[0], m = r.substring(c, u.index), f ? f = (f + 1) % 5 : m.substr(-5) === "rgba(" && (f = 1), p !== d[l++] && (h = parseFloat(d[l - 1]) || 0, s._pt = {
		_next: s._pt,
		p: m || l === 1 ? m : ",",
		s: h,
		c: p.charAt(1) === "=" ? Ke(h, p) - h : parseFloat(p) - h,
		m: f && f < 4 ? Math.round : 0
	}, c = pe.lastIndex);
	return s.c = c < r.length ? r.substring(c, r.length) : "", s.fp = o, (me.test(r) || g) && (s.e = 0), this._pt = s, s;
}, Mn = function(e, t, n, r, i, a, o, s, c, l) {
	L(r) && (r = r(i || 0, e, a));
	var u = e[t], d = n === "get" ? L(u) ? c ? e[t.indexOf("set") || !L(e["get" + t.substr(3)]) ? t : "get" + t.substr(3)](c) : e[t]() : u : n, f = L(u) ? c ? qn : Kn : Gn, p;
	if (I(r) && (~r.indexOf("random(") && (r = Yt(r)), r.charAt(1) === "=" && (p = Ke(d, r) + (H(d) || 0), (p || p === 0) && (r = p))), !l || d !== r || In) return !isNaN(d * r) && r !== "" ? (p = new ir(this._pt, e, t, +d || 0, r - (d || 0), typeof u == "boolean" ? Zn : Xn, 0, f), c && (p.fp = c), o && p.modifier(o, this, e), this._pt = p) : (!u && !(t in e) && we(t, r), jn.call(this, e, t, d, r, f, s || E.stringFilter, c));
}, Nn = function(e, t, n, r, i) {
	if (L(e) && (e = Vn(e, i, t, n, r)), !R(e) || e.style && e.nodeType || le(e) || ce(e)) return I(e) ? Vn(e, i, t, n, r) : e;
	var a = {}, o;
	for (o in e) a[o] = Vn(e[o], i, t, n, r);
	return a;
}, Pn = function(e, t, n, r, i, a) {
	var o, s, c, l;
	if (Fe[e] && (o = new Fe[e]()).init(i, o.rawVars ? t[e] : Nn(t[e], r, i, a, n), n, r, a) !== !1 && (n._pt = s = new ir(n._pt, i, e, 0, 1, o.render, o, 0, o.priority), n !== tn)) for (c = n._ptLookup[n._targets.indexOf(i)], l = o._props.length; l--;) c[o._props[l]] = s;
	return o;
}, Fn, In, Ln = function e(t, n, r) {
	var i = t.vars, a = i.ease, o = i.startAt, s = i.immediateRender, c = i.lazy, l = i.onUpdate, u = i.runBackwards, d = i.yoyoEase, f = i.keyframes, p = i.autoRevert, m = t._dur, h = t._startAt, g = t._targets, _ = t.parent, v = _ && _.data === "nested" ? _.vars.targets : g, y = t._overwrite === "auto" && !O, b = t.timeline, x = i.easeReverse || d, S, C, w, T, E, A, N, P, F, ee, te, ne, I;
	if (b && (!f || !a) && (a = "none"), t._ease = Cn(a, D.ease), t._rEase = x && (Cn(x) || t._ease), t._from = !b && !!i.runBackwards, t._from && (t.ratio = 1), !b || f && !i.stagger) {
		if (P = g[0] ? Ve(g[0]).harness : 0, ne = P && i[P.prop], S = rt(i, je), h && (h._zTime < 0 && h.progress(1), n < 0 && u && s && !p ? h.render(-1, !0) : h.revert(u && m ? ke : Oe), h._lazy = 0), o) {
			if (ct(t._startAt = Wn.set(g, $e({
				data: "isStart",
				overwrite: !1,
				parent: _,
				immediateRender: !0,
				lazy: !h && ae(c),
				startAt: null,
				delay: 0,
				onUpdate: l && function() {
					return $t(t, "onUpdate");
				},
				stagger: 0
			}, o))), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (k || !s && !p) && t._startAt.revert(ke), s && m && n <= 0 && r <= 0) {
				n && (t._zTime = n);
				return;
			}
		} else if (u && m && !h) {
			if (n && (s = !1), w = $e({
				overwrite: !1,
				data: "isFromStart",
				lazy: s && !h && ae(c),
				immediateRender: s,
				stagger: 0,
				parent: _
			}, S), ne && (w[P.prop] = ne), ct(t._startAt = Wn.set(g, w)), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (k ? t._startAt.revert(ke) : t._startAt.render(-1, !0)), t._zTime = n, !s) e(t._startAt, M, M);
			else if (!n) return;
		}
		for (t._pt = t._ptCache = 0, c = m && ae(c) || c && !m, C = 0; C < g.length; C++) {
			if (E = g[C], N = E._gsap || Be(g)[C]._gsap, t._ptLookup[C] = ee = {}, Ne[N.id] && Me.length && Je(), te = v === g ? C : v.indexOf(E), P && (F = new P()).init(E, ne || S, t, te, v) !== !1 && (t._pt = T = new ir(t._pt, E, F.name, 0, 1, F.render, F, 0, F.priority), F._props.forEach(function(e) {
				ee[e] = T;
			}), F.priority && (A = 1)), !P || ne) for (w in S) Fe[w] && (F = Pn(w, S, t, te, E, v)) ? F.priority && (A = 1) : ee[w] = T = Mn.call(t, E, w, "get", S[w], te, v, 0, i.stringFilter);
			t._op && t._op[C] && t.kill(E, t._op[C]), y && t._pt && (Fn = t, V.killTweensOf(E, ee, t.globalTime(n)), I = !t.parent, Fn = 0), t._pt && c && (Ne[N.id] = 1);
		}
		A && rr(t), t._onInit && t._onInit(t);
	}
	t._onUpdate = l, t._initted = (!t._op || t._pt) && !I, f && n <= 0 && b.render(j, !0, !0);
}, Rn = function(e, t, n, r, i, a, o, s) {
	var c = (e._pt && e._ptCache || (e._ptCache = {}))[t], l, u, d, f;
	if (!c) for (c = e._ptCache[t] = [], d = e._ptLookup, f = e._targets.length; f--;) {
		if (l = d[f][t], l && l.d && l.d._pt) for (l = l.d._pt; l && l.p !== t && l.fp !== t;) l = l._next;
		if (!l) return In = 1, e.vars[t] = "+=0", Ln(e, o), In = 0, s ? Te(t + " not eligible for reset. Try splitting into individual properties") : 1;
		c.push(l);
	}
	for (f = c.length; f--;) u = c[f], l = u._pt || u, l.s = (r || r === 0) && !i ? r : l.s + (r || 0) + a * l.c, l.c = n - l.s, u.e && (u.e = We(n) + H(u.e)), u.b && (u.b = l.s + H(u.b));
}, zn = function(e, t) {
	var n = e[0] ? Ve(e[0]).harness : 0, r = n && n.aliases, i, a, o, s;
	if (!r) return t;
	for (a in i = tt({}, t), r) if (a in i) for (s = r[a].split(","), o = s.length; o--;) i[s[o]] = i[a];
	return i;
}, Bn = function(e, t, n, r) {
	var i = t.ease || r || "power1.inOut", a, o;
	if (le(t)) o = n[e] || (n[e] = []), t.forEach(function(e, n) {
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
}, Vn = function(e, t, n, r, i) {
	return L(e) ? e.call(t, n, r, i) : I(e) && ~e.indexOf("random(") ? Yt(e) : e;
}, Hn = ze + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert", Un = {};
Ue(Hn + ",id,stagger,delay,duration,paused,scrollTrigger", function(e) {
	return Un[e] = 1;
});
var Wn = /*#__PURE__*/ function(e) {
	T(t, e);
	function t(t, n, r, i) {
		var a;
		typeof n == "number" && (r.duration = n, n = r, r = null), a = e.call(this, i ? n : it(n)) || this;
		var o = a.vars, s = o.duration, c = o.delay, l = o.immediateRender, u = o.stagger, d = o.overwrite, f = o.keyframes, p = o.defaults, m = o.scrollTrigger, h = n.parent || V, g = (le(t) || ce(t) ? re(t[0]) : "length" in n) ? [t] : Lt(t), _, v, y, b, x, S, C, T;
		if (a._targets = g.length ? Be(g) : Te("GSAP target " + t + " not found. https://gsap.com", !E.nullTargetWarn) || [], a._ptLookup = [], a._overwrite = d, f || u || se(s) || se(c)) {
			n = a.vars;
			var D = n.easeReverse || n.yoyoEase;
			if (_ = a.timeline = new An({
				data: "nested",
				defaults: p || {},
				targets: h && h.data === "nested" ? h.vars.targets : g
			}), _.kill(), _.parent = _._dp = w(a), _._start = 0, u || se(s) || se(c)) {
				if (b = g.length, C = u && Bt(u), R(u)) for (x in u) ~Hn.indexOf(x) && (T ||= {}, T[x] = u[x]);
				for (v = 0; v < b; v++) y = rt(n, Un), y.stagger = 0, D && (y.easeReverse = D), T && tt(y, T), S = g[v], y.duration = +Vn(s, w(a), v, S, g), y.delay = (+Vn(c, w(a), v, S, g) || 0) - a._delay, !u && b === 1 && y.delay && (a._delay = c = y.delay, a._start += c, y.delay = 0), _.to(S, y, C ? C(v, S, g) : 0), _._ease = W.none;
				_.duration() ? s = c = 0 : a.timeline = 0;
			} else if (f) {
				it($e(_.vars.defaults, { ease: "none" })), _._ease = Cn(f.ease || n.ease || "none");
				var k = 0, A, j, N;
				if (le(f)) f.forEach(function(e) {
					return _.to(g, e, ">");
				}), _.duration();
				else {
					for (x in y = {}, f) x === "ease" || x === "easeEach" || Bn(x, f[x], y, f.easeEach);
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
		return d === !0 && !O && (Fn = w(a), V.killTweensOf(g), Fn = 0), yt(h, w(a), r), n.reversed && a.reverse(), n.paused && a.paused(!0), (l || !s && !f && a._start === Ge(h._time) && ae(l) && ft(w(a)) && h.data !== "nested") && (a._tTime = -M, a.render(Math.max(0, -c) || 0)), m && bt(w(a), m), a;
	}
	var n = t.prototype;
	return n.render = function(e, t, n) {
		var r = this._time, i = this._tDur, a = this._dur, o = e < 0, s = e > i - M && !o ? i : e < M ? 0 : e, c, l, u, d, f, p, m, h;
		if (!a) wt(this, e, t, n);
		else if (s !== this._tTime || !e || n || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== o || this._lazy) {
			if (c = s, h = this.timeline, this._repeat) {
				if (d = a + this._rDelay, this._repeat < -1 && o) return this.totalTime(d * 100 + e, t, n);
				if (c = Ge(s % d), s === i ? (u = this._repeat, c = a) : (f = Ge(s / d), u = ~~f, u && u === f ? (c = a, u--) : c > a && (c = a)), p = this._yoyo && u & 1, p && (c = a - c), f = mt(this._tTime, d), c === r && !n && this._initted && u === f) return this._tTime = s, this;
				u !== f && this.vars.repeatRefresh && !p && !this._lock && c !== d && this._initted && (this._lock = n = 1, this.render(Ge(d * u), !0).invalidate()._lock = 0);
			}
			if (!this._initted) {
				if (xt(this, o ? e : c, n, t, s)) return this._tTime = 0, this;
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
			if (this._from && (this.ratio = m = 1 - m), this._tTime = s, this._time = c, !this._act && this._ts && (this._act = 1, this._lazy = 0), !r && s && !t && !f && ($t(this, "onStart"), this._tTime !== s)) return this;
			for (l = this._pt; l;) l.r(m, l.d), l = l._next;
			h && h.render(e < 0 ? e : h._dur * h._ease(c / this._dur), t, n) || this._startAt && (this._zTime = e), this._onUpdate && !t && (o && dt(this, e, t, n), $t(this, "onUpdate")), this._repeat && u !== f && this.vars.onRepeat && !t && this.parent && $t(this, "onRepeat"), (s === this._tDur || !s) && this._tTime === s && (o && !this._onUpdate && dt(this, e, !0, !0), (e || !a) && (s === this._tDur && this._ts > 0 || !s && this._ts < 0) && ct(this, 1), !t && (!o || r) && (s || r || p) && ($t(this, s === i ? "onComplete" : "onReverseComplete", !0), this._prom && !(s < i && this.timeScale() > 0) && this._prom()));
		}
		return this;
	}, n.targets = function() {
		return this._targets;
	}, n.invalidate = function(t) {
		return (!t || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(t), e.prototype.invalidate.call(this, t);
	}, n.resetTo = function(e, t, n, r, i) {
		mn || hn.wake(), this._ts || this.play();
		var a = Math.min(this._dur, (this._dp._time - this._start) * this._ts), o;
		return this._initted || Ln(this, a), o = this._ease(a / this._dur), Rn(this, e, t, n, r, o, a, i) ? this.resetTo(e, t, n, r, 1) : (_t(this, 0), this.parent || ot(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
	}, n.kill = function(e, t) {
		if (t === void 0 && (t = "all"), !e && (!t || t === "all")) return this._lazy = this._pt = 0, this.parent ? en(this) : this.scrollTrigger && this.scrollTrigger.kill(!!k), this;
		if (this.timeline) {
			var n = this.timeline.totalDuration();
			return this.timeline.killTweensOf(e, t, Fn && Fn.vars.overwrite !== !0)._first || en(this), this.parent && n !== this.timeline.totalDuration() && Et(this, this._dur * this.timeline._tDur / n, 0, 1), this;
		}
		var r = this._targets, i = e ? Lt(e) : r, a = this._ptLookup, o = this._pt, s, c, l, u, d, f, p;
		if ((!t || t === "all") && at(r, i)) return t === "all" && (this._pt = 0), en(this);
		for (s = this._op = this._op || [], t !== "all" && (I(t) && (d = {}, Ue(t, function(e) {
			return d[e] = 1;
		}), t = d), t = zn(r, t)), p = r.length; p--;) if (~i.indexOf(r[p])) for (d in c = a[p], t === "all" ? (s[p] = t, u = c, l = {}) : (l = s[p] = s[p] || {}, u = t), u) f = c && c[d], f && ((!("kill" in f.d) || f.d.kill(d) === !0) && st(this, f, "_pt"), delete c[d]), l !== "all" && (l[d] = 1);
		return this._initted && !this._pt && o && en(this), this;
	}, t.to = function(e, n) {
		return new t(e, n, arguments[2]);
	}, t.from = function(e, t) {
		return At(1, arguments);
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
		return At(2, arguments);
	}, t.set = function(e, n) {
		return n.duration = 0, n.repeatDelay || (n.repeat = 0), new t(e, n);
	}, t.killTweensOf = function(e, t, n) {
		return V.killTweensOf(e, t, n);
	}, t;
}(kn);
$e(Wn.prototype, {
	_targets: [],
	_lazy: 0,
	_startAt: 0,
	_op: 0,
	_onInit: 0
}), Ue("staggerTo,staggerFrom,staggerFromTo", function(e) {
	Wn[e] = function() {
		var t = new An(), n = Pt.call(arguments, 0);
		return n.splice(e === "staggerFromTo" ? 5 : 4, 0, 0), t[e].apply(t, n);
	};
});
var Gn = function(e, t, n) {
	return e[t] = n;
}, Kn = function(e, t, n) {
	return e[t](n);
}, qn = function(e, t, n, r) {
	return e[t](r.fp, n);
}, Jn = function(e, t, n) {
	return e.setAttribute(t, n);
}, Yn = function(e, t) {
	return L(e[t]) ? Kn : ie(e[t]) && e.setAttribute ? Jn : Gn;
}, Xn = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e6) / 1e6, t);
}, Zn = function(e, t) {
	return t.set(t.t, t.p, !!(t.s + t.c * e), t);
}, Qn = function(e, t) {
	var n = t._pt, r = "";
	if (!e && t.b) r = t.b;
	else if (e === 1 && t.e) r = t.e;
	else {
		for (; n;) r = n.p + (n.m ? n.m(n.s + n.c * e) : Math.round((n.s + n.c * e) * 1e4) / 1e4) + r, n = n._next;
		r += t.c;
	}
	t.set(t.t, t.p, r, t);
}, $n = function(e, t) {
	for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
}, er = function(e, t, n, r) {
	for (var i = this._pt, a; i;) a = i._next, i.p === r && i.modifier(e, t, n), i = a;
}, tr = function(e) {
	for (var t = this._pt, n, r; t;) r = t._next, t.p === e && !t.op || t.op === e ? st(this, t, "_pt") : t.dep || (n = 1), t = r;
	return !n;
}, nr = function(e, t, n, r) {
	r.mSet(e, t, r.m.call(r.tween, n, r.mt), r);
}, rr = function(e) {
	for (var t = e._pt, n, r, i, a; t;) {
		for (n = t._next, r = i; r && r.pr > t.pr;) r = r._next;
		(t._prev = r ? r._prev : a) ? t._prev._next = t : i = t, (t._next = r) ? r._prev = t : a = t, t = n;
	}
	e._pt = i;
}, ir = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a, o, s, c) {
		this.t = t, this.s = r, this.c = i, this.p = n, this.r = a || Xn, this.d = o || this, this.set = s || Gn, this.pr = c || 0, this._next = e, e && (e._prev = this);
	}
	var t = e.prototype;
	return t.modifier = function(e, t, n) {
		this.mSet = this.mSet || this.set, this.set = nr, this.m = e, this.mt = n, this.tween = t;
	}, e;
}();
Ue(ze + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse", function(e) {
	return je[e] = 1;
}), be.TweenMax = be.TweenLite = Wn, be.TimelineLite = be.TimelineMax = An, V = new An({
	sortChildren: !1,
	defaults: D,
	autoRemoveChildren: !0,
	id: "root",
	smoothChildTiming: !0
}), E.stringFilter = pn;
var ar = [], or = {}, sr = [], cr = 0, lr = 0, ur = function(e) {
	return (or[e] || sr).map(function(e) {
		return e();
	});
}, dr = function() {
	var e = Date.now(), t = [];
	e - cr > 2 && (ur("matchMediaInit"), ar.forEach(function(e) {
		var n = e.queries, r = e.conditions, i, a, o, s;
		for (a in n) i = _e.matchMedia(n[a]).matches, i && (o = 1), i !== r[a] && (r[a] = i, s = 1);
		s && (e.revert(), o && t.push(e));
	}), ur("matchMediaRevert"), t.forEach(function(e) {
		return e.onMatch(e, function(t) {
			return e.add(null, t);
		});
	}), cr = e, ur("matchMedia"));
}, fr = /*#__PURE__*/ function() {
	function e(e, t) {
		this.selector = t && Rt(t), this.data = [], this._r = [], this.isReverted = !1, this.id = lr++, e && this.add(e);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		L(e) && (n = t, t = e, e = L);
		var r = this, i = function() {
			var e = A, i = r.selector, a;
			return e && e !== r && e.data.push(r), n && (r.selector = Rt(n)), A = r, a = t.apply(r, arguments), L(a) && r._r.push(a), A = e, r.selector = i, r.isReverted = !1, a;
		};
		return r.last = i, e === L ? i(r, function(e) {
			return r.add(null, e);
		}) : e ? r[e] = i : i;
	}, t.ignore = function(e) {
		var t = A;
		A = null, e(this), A = t;
	}, t.getTweens = function() {
		var t = [];
		return this.data.forEach(function(n) {
			return n instanceof e ? t.push.apply(t, n.getTweens()) : n instanceof Wn && !(n.parent && n.parent.data === "nested") && t.push(n);
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
			}), r = n.data.length; r--;) i = n.data[r], i instanceof An ? i.data !== "nested" && (i.scrollTrigger && i.scrollTrigger.revert(), i.kill()) : !(i instanceof Wn) && i.revert && i.revert(e);
			n._r.forEach(function(t) {
				return t(e, n);
			}), n.isReverted = !0;
		})() : this.data.forEach(function(e) {
			return e.kill && e.kill();
		}), this.clear(), t) for (var r = ar.length; r--;) ar[r].id === this.id && ar.splice(r, 1);
	}, t.revert = function(e) {
		this.kill(e || {});
	}, e;
}(), pr = /*#__PURE__*/ function() {
	function e(e) {
		this.contexts = [], this.scope = e, A && A.data.push(this);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		R(e) || (e = { matches: e });
		var r = new fr(0, n || this.scope), i = r.conditions = {}, a, o, s;
		for (o in A && !r.selector && (r.selector = A.selector), this.contexts.push(r), t = r.add("onMatch", t), r.queries = e, e) o === "all" ? s = 1 : (a = _e.matchMedia(e[o]), a && (ar.indexOf(r) < 0 && ar.push(r), (i[o] = a.matches) && (s = 1), a.addListener ? a.addListener(dr) : a.addEventListener("change", dr)));
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
}(), mr = {
	registerPlugin: function() {
		[...arguments].forEach(function(e) {
			return rn(e);
		});
	},
	timeline: function(e) {
		return new An(e);
	},
	getTweensOf: function(e, t) {
		return V.getTweensOf(e, t);
	},
	getProperty: function(e, t, n, r) {
		I(e) && (e = Lt(e)[0]);
		var i = Ve(e || {}).get, a = n ? Qe : Ze;
		return n === "native" && (n = ""), e && (t ? a((Fe[t] && Fe[t].get || i)(e, t, n, r)) : function(t, n, r) {
			return a((Fe[t] && Fe[t].get || i)(e, t, n, r));
		});
	},
	quickSetter: function(e, t, n) {
		if (e = Lt(e), e.length > 1) {
			var r = e.map(function(e) {
				return vr.quickSetter(e, t, n);
			}), i = r.length;
			return function(e) {
				for (var t = i; t--;) r[t](e);
			};
		}
		e = e[0] || {};
		var a = Fe[t], o = Ve(e), s = o.harness && (o.harness.aliases || {})[t] || t, c = a ? function(t) {
			var r = new a();
			tn._pt = 0, r.init(e, n ? t + n : t, tn, 0, [e]), r.render(1, r), tn._pt && $n(1, tn);
		} : o.set(e, s);
		return a ? c : function(t) {
			return c(e, s, n ? t + n : t, o, 1);
		};
	},
	quickTo: function(e, t, n) {
		var r, i = vr.to(e, $e((r = {}, r[t] = "+=0.1", r.paused = !0, r.stagger = 0, r), n || {})), a = function(e, n, r) {
			return i.resetTo(t, e, n, r);
		};
		return a.tween = i, a;
	},
	isTweening: function(e) {
		return V.getTweensOf(e, !0).length > 0;
	},
	defaults: function(e) {
		return e && e.ease && (e.ease = Cn(e.ease, D.ease)), nt(D, e || {});
	},
	config: function(e) {
		return nt(E, e || {});
	},
	registerEffect: function(e) {
		var t = e.name, n = e.effect, r = e.plugins, i = e.defaults, a = e.extendTimeline;
		(r || "").split(",").forEach(function(e) {
			return e && !Fe[e] && !be[e] && Te(t + " effect requires " + e + " plugin.");
		}), Ie[t] = function(e, t, r) {
			return n(Lt(e), $e(t || {}, i), r);
		}, a && (An.prototype[t] = function(e, n, r) {
			return this.add(Ie[t](e, R(n) ? n : (r = n) && {}, this), r);
		});
	},
	registerEase: function(e, t) {
		W[e] = Cn(t);
	},
	parseEase: function(e, t) {
		return arguments.length ? Cn(e, t) : W;
	},
	getById: function(e) {
		return V.getById(e);
	},
	exportRoot: function(e, t) {
		e === void 0 && (e = {});
		var n = new An(e), r, i;
		for (n.smoothChildTiming = ae(e.smoothChildTiming), V.remove(n), n._dp = 0, n._time = n._tTime = V._time, r = V._first; r;) i = r._next, (t || !(!r._dur && r instanceof Wn && r.vars.onComplete === r._targets[0])) && yt(n, r, r._start - r._delay), r = i;
		return yt(V, n, 0), n;
	},
	context: function(e, t) {
		return e ? new fr(e, t) : A;
	},
	matchMedia: function(e) {
		return new pr(e);
	},
	matchMediaRefresh: function() {
		return ar.forEach(function(e) {
			var t = e.conditions, n, r;
			for (r in t) t[r] && (t[r] = !1, n = 1);
			n && e.revert();
		}) || dr();
	},
	addEventListener: function(e, t) {
		var n = or[e] || (or[e] = []);
		~n.indexOf(t) || n.push(t);
	},
	removeEventListener: function(e, t) {
		var n = or[e], r = n && n.indexOf(t);
		r >= 0 && n.splice(r, 1);
	},
	utils: {
		wrap: qt,
		wrapYoyo: Jt,
		distribute: Bt,
		random: Ht,
		snap: U,
		normalize: Gt,
		getUnit: H,
		clamp: Nt,
		splitColor: cn,
		toArray: Lt,
		selector: Rt,
		mapRange: Xt,
		pipe: Ut,
		unitize: Wt,
		interpolate: Zt,
		shuffle: zt
	},
	install: Ce,
	effects: Ie,
	ticker: hn,
	updateRoot: An.updateRoot,
	plugins: Fe,
	globalTimeline: V,
	core: {
		PropTween: ir,
		globals: Ee,
		Tween: Wn,
		Timeline: An,
		Animation: kn,
		getCache: Ve,
		_removeLinkedListItem: st,
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
Ue("to,from,fromTo,delayedCall,set,killTweensOf", function(e) {
	return mr[e] = Wn[e];
}), hn.add(An.updateRoot), tn = mr.to({}, { duration: 0 });
var hr = function(e, t) {
	for (var n = e._pt; n && n.p !== t && n.op !== t && n.fp !== t;) n = n._next;
	return n;
}, gr = function(e, t) {
	var n = e._targets, r, i, a;
	for (r in t) for (i = n.length; i--;) a = e._ptLookup[i][r], (a &&= a.d) && (a._pt && (a = hr(a, r)), a && a.modifier && a.modifier(t[r], e, n[i], r));
}, _r = function(e, t) {
	return {
		name: e,
		headless: 1,
		rawVars: 1,
		init: function(e, n, r) {
			r._onInit = function(e) {
				var r, i;
				if (I(n) && (r = {}, Ue(n, function(e) {
					return r[e] = 1;
				}), n = r), t) {
					for (i in r = {}, n) r[i] = t(n[i]);
					n = r;
				}
				gr(e, n);
			};
		}
	};
}, vr = mr.registerPlugin({
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
}, _r("roundProps", Vt), _r("modifiers"), _r("snap", U)) || mr;
Wn.version = An.version = vr.version = "3.15.0", Se = 1, oe() && gn(), W.Power0, W.Power1, W.Power2, W.Power3, W.Power4, W.Linear, W.Quad, W.Cubic, W.Quart, W.Quint, W.Strong, W.Elastic, W.Back, W.SteppedEase, W.Bounce, W.Sine, W.Expo, W.Circ;
//#endregion
//#region node_modules/gsap/CSSPlugin.js
var yr, br, xr, Sr, Cr, wr, Tr, Er = function() {
	return typeof window < "u";
}, Dr = {}, Or = 180 / Math.PI, kr = Math.PI / 180, Ar = Math.atan2, jr = 1e8, Mr = /([A-Z])/g, Nr = /(left|right|width|margin|padding|x)/i, Pr = /[\s,\(]\S/, Fr = {
	autoAlpha: "opacity,visibility",
	scale: "scaleX,scaleY",
	alpha: "opacity"
}, Ir = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, Lr = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, Rr = function(e, t) {
	return t.set(t.t, t.p, e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, zr = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, Br = function(e, t) {
	var n = t.s + t.c * e;
	t.set(t.t, t.p, ~~(n + (n < 0 ? -.5 : .5)) + t.u, t);
}, Vr = function(e, t) {
	return t.set(t.t, t.p, e ? t.e : t.b, t);
}, Hr = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : t.b, t);
}, Ur = function(e, t, n) {
	return e.style[t] = n;
}, Wr = function(e, t, n) {
	return e.style.setProperty(t, n);
}, Gr = function(e, t, n) {
	return e._gsap[t] = n;
}, Kr = function(e, t, n) {
	return e._gsap.scaleX = e._gsap.scaleY = n;
}, qr = function(e, t, n, r, i) {
	var a = e._gsap;
	a.scaleX = a.scaleY = n, a.renderTransform(i, a);
}, Jr = function(e, t, n, r, i) {
	var a = e._gsap;
	a[t] = n, a.renderTransform(i, a);
}, Yr = "transform", Xr = Yr + "Origin", Zr = function e(t, n) {
	var r = this, i = this.target, a = i.style, o = i._gsap;
	if (t in Dr && a) {
		if (this.tfm = this.tfm || {}, t !== "transform") t = Fr[t] || t, ~t.indexOf(",") ? t.split(",").forEach(function(e) {
			return r.tfm[e] = gi(i, e);
		}) : this.tfm[t] = o.x ? o[t] : gi(i, t), t === Xr && (this.tfm.zOrigin = o.zOrigin);
		else return Fr.transform.split(",").forEach(function(t) {
			return e.call(r, t, n);
		});
		if (this.props.indexOf(Yr) >= 0) return;
		o.svg && (this.svgo = i.getAttribute("data-svg-origin"), this.props.push(Xr, n, "")), t = Yr;
	}
	(a || n) && this.props.push(t, n, a[t]);
}, Qr = function(e) {
	e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, $r = function() {
	for (var e = this.props, t = this.target, n = t.style, r = t._gsap, i = 0, a; i < e.length; i += 3) e[i + 1] ? e[i + 1] === 2 ? t[e[i]](e[i + 2]) : t[e[i]] = e[i + 2] : e[i + 2] ? n[e[i]] = e[i + 2] : n.removeProperty(e[i].substr(0, 2) === "--" ? e[i] : e[i].replace(Mr, "-$1").toLowerCase());
	if (this.tfm) {
		for (a in this.tfm) r[a] = this.tfm[a];
		r.svg && (r.renderTransform(), t.setAttribute("data-svg-origin", this.svgo || "")), i = Tr(), (!i || !i.isStart) && !n[Yr] && (Qr(n), r.zOrigin && n[Xr] && (n[Xr] += " " + r.zOrigin + "px", r.zOrigin = 0, r.renderTransform()), r.uncache = 1);
	}
}, ei = function(e, t) {
	var n = {
		target: e,
		props: [],
		revert: $r,
		save: Zr
	};
	return e._gsap || vr.core.getCache(e), t && e.style && e.nodeType && t.split(",").forEach(function(e) {
		return n.save(e);
	}), n;
}, ti, ni = function(e, t) {
	var n = br.createElementNS ? br.createElementNS((t || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : br.createElement(e);
	return n && n.style ? n : br.createElement(e);
}, ri = function e(t, n, r) {
	var i = getComputedStyle(t);
	return i[n] || i.getPropertyValue(n.replace(Mr, "-$1").toLowerCase()) || i.getPropertyValue(n) || !r && e(t, ai(n) || n, 1) || "";
}, ii = "O,Moz,ms,Ms,Webkit".split(","), ai = function(e, t, n) {
	var r = (t || Cr).style, i = 5;
	if (e in r && !n) return e;
	for (e = e.charAt(0).toUpperCase() + e.substr(1); i-- && !(ii[i] + e in r););
	return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? ii[i] : "") + e;
}, oi = function() {
	Er() && window.document && (yr = window, br = yr.document, xr = br.documentElement, Cr = ni("div") || { style: {} }, ni("div"), Yr = ai(Yr), Xr = Yr + "Origin", Cr.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", ti = !!ai("perspective"), Tr = vr.core.reverting, Sr = 1);
}, si = function(e) {
	var t = e.ownerSVGElement, n = ni("svg", t && t.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), r = e.cloneNode(!0), i;
	r.style.display = "block", n.appendChild(r), xr.appendChild(n);
	try {
		i = r.getBBox();
	} catch {}
	return n.removeChild(r), xr.removeChild(n), i;
}, ci = function(e, t) {
	for (var n = t.length; n--;) if (e.hasAttribute(t[n])) return e.getAttribute(t[n]);
}, li = function(e) {
	var t, n;
	try {
		t = e.getBBox();
	} catch {
		t = si(e), n = 1;
	}
	return t && (t.width || t.height) || n || (t = si(e)), t && !t.width && !t.x && !t.y ? {
		x: +ci(e, [
			"x",
			"cx",
			"x1"
		]) || 0,
		y: +ci(e, [
			"y",
			"cy",
			"y1"
		]) || 0,
		width: 0,
		height: 0
	} : t;
}, ui = function(e) {
	return !(!e.getCTM || e.parentNode && !e.ownerSVGElement || !li(e));
}, di = function(e, t) {
	if (t) {
		var n = e.style, r;
		t in Dr && t !== Xr && (t = Yr), n.removeProperty ? (r = t.substr(0, 2), (r === "ms" || t.substr(0, 6) === "webkit") && (t = "-" + t), n.removeProperty(r === "--" ? t : t.replace(Mr, "-$1").toLowerCase())) : n.removeAttribute(t);
	}
}, fi = function(e, t, n, r, i, a) {
	var o = new ir(e._pt, t, n, 0, 1, a ? Hr : Vr);
	return e._pt = o, o.b = r, o.e = i, e._props.push(n), o;
}, pi = {
	deg: 1,
	rad: 1,
	turn: 1
}, mi = {
	grid: 1,
	flex: 1
}, hi = function e(t, n, r, i) {
	var a = parseFloat(r) || 0, o = (r + "").trim().substr((a + "").length) || "px", s = Cr.style, c = Nr.test(n), l = t.tagName.toLowerCase() === "svg", u = (l ? "client" : "offset") + (c ? "Width" : "Height"), d = 100, f = i === "px", p = i === "%", m, h, g, _;
	if (i === o || !a || pi[i] || pi[o]) return a;
	if (o !== "px" && !f && (a = e(t, n, r, "px")), _ = t.getCTM && ui(t), (p || o === "%") && (Dr[n] || ~n.indexOf("adius"))) return m = _ ? t.getBBox()[c ? "width" : "height"] : t[u], We(p ? a / m * d : a / 100 * m);
	if (s[c ? "width" : "height"] = d + (f ? o : i), h = i !== "rem" && ~n.indexOf("adius") || i === "em" && t.appendChild && !l ? t : t.parentNode, _ && (h = (t.ownerSVGElement || {}).parentNode), (!h || h === br || !h.appendChild) && (h = br.body), g = h._gsap, g && p && g.width && c && g.time === hn.time && !g.uncache) return We(a / g.width * d);
	if (p && (n === "height" || n === "width")) {
		var v = t.style[n];
		t.style[n] = d + i, m = t[u], v ? t.style[n] = v : di(t, n);
	} else (p || o === "%") && !mi[ri(h, "display")] && (s.position = ri(t, "position")), h === t && (s.position = "static"), h.appendChild(Cr), m = Cr[u], h.removeChild(Cr), s.position = "absolute";
	return c && p && (g = Ve(h), g.time = hn.time, g.width = h[u]), We(f ? m * a / d : m && a ? d / m * a : 0);
}, gi = function(e, t, n, r) {
	var i;
	return Sr || oi(), t in Fr && t !== "transform" && (t = Fr[t], ~t.indexOf(",") && (t = t.split(",")[0])), Dr[t] && t !== "transform" ? (i = Oi(e, r), i = t === "transformOrigin" ? i.svg ? i.origin : ki(ri(e, Xr)) + " " + i.zOrigin + "px" : i[t]) : (i = e.style[t], (!i || i === "auto" || r || ~(i + "").indexOf("calc(")) && (i = xi[t] && xi[t](e, t, n) || ri(e, t) || He(e, t) || +(t === "opacity"))), n && !~(i + "").trim().indexOf(" ") ? hi(e, t, i, n) + n : i;
}, _i = function(e, t, n, r) {
	if (!n || n === "none") {
		var i = ai(t, e, 1), a = i && ri(e, i, 1);
		a && a !== n ? (t = i, n = a) : t === "borderColor" && (n = ri(e, "borderTopColor"));
	}
	var o = new ir(this._pt, e.style, t, 0, 1, Qn), s = 0, c = 0, l, u, d, f, p, m, h, g, _, v, y, b;
	if (o.b = n, o.e = r, n += "", r += "", r.substring(0, 6) === "var(--" && (r = ri(e, r.substring(4, r.indexOf(")")))), r === "auto" && (m = e.style[t], e.style[t] = r, r = ri(e, t) || r, m ? e.style[t] = m : di(e, t)), l = [n, r], pn(l), n = l[0], r = l[1], d = n.match(fe) || [], b = r.match(fe) || [], b.length) {
		for (; u = fe.exec(r);) h = u[0], _ = r.substring(s, u.index), p ? p = (p + 1) % 5 : (_.substr(-5) === "rgba(" || _.substr(-5) === "hsla(") && (p = 1), h !== (m = d[c++] || "") && (f = parseFloat(m) || 0, y = m.substr((f + "").length), h.charAt(1) === "=" && (h = Ke(f, h) + y), g = parseFloat(h), v = h.substr((g + "").length), s = fe.lastIndex - v.length, v || (v = v || E.units[t] || y, s === r.length && (r += v, o.e += v)), y !== v && (f = hi(e, t, m, v) || 0), o._pt = {
			_next: o._pt,
			p: _ || c === 1 ? _ : ",",
			s: f,
			c: g - f,
			m: p && p < 4 || t === "zIndex" ? Math.round : 0
		});
		o.c = s < r.length ? r.substring(s, r.length) : "";
	} else o.r = t === "display" && r === "none" ? Hr : Vr;
	return me.test(r) && (o.e = 0), this._pt = o, o;
}, vi = {
	top: "0%",
	bottom: "100%",
	left: "0%",
	right: "100%",
	center: "50%"
}, yi = function(e) {
	var t = e.split(" "), n = t[0], r = t[1] || "50%";
	return (n === "top" || n === "bottom" || r === "left" || r === "right") && (e = n, n = r, r = e), t[0] = vi[n] || n, t[1] = vi[r] || r, t.join(" ");
}, bi = function(e, t) {
	if (t.tween && t.tween._time === t.tween._dur) {
		var n = t.t, r = n.style, i = t.u, a = n._gsap, o, s, c;
		if (i === "all" || i === !0) r.cssText = "", s = 1;
		else for (i = i.split(","), c = i.length; --c > -1;) o = i[c], Dr[o] && (s = 1, o = o === "transformOrigin" ? Xr : Yr), di(n, o);
		s && (di(n, Yr), a && (a.svg && n.removeAttribute("transform"), r.scale = r.rotate = r.translate = "none", Oi(n, 1), a.uncache = 1, Qr(r)));
	}
}, xi = { clearProps: function(e, t, n, r, i) {
	if (i.data !== "isFromStart") {
		var a = e._pt = new ir(e._pt, t, n, 0, 0, bi);
		return a.u = r, a.pr = -10, a.tween = i, e._props.push(n), 1;
	}
} }, Si = [
	1,
	0,
	0,
	1,
	0,
	0
], Ci = {}, wi = function(e) {
	return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, Ti = function(e) {
	var t = ri(e, Yr);
	return wi(t) ? Si : t.substr(7).match(B).map(We);
}, Ei = function(e, t) {
	var n = e._gsap || Ve(e), r = e.style, i = Ti(e), a, o, s, c;
	return n.svg && e.getAttribute("transform") ? (s = e.transform.baseVal.consolidate().matrix, i = [
		s.a,
		s.b,
		s.c,
		s.d,
		s.e,
		s.f
	], i.join(",") === "1,0,0,1,0,0" ? Si : i) : (i === Si && !e.offsetParent && e !== xr && !n.svg && (s = r.display, r.display = "block", a = e.parentNode, (!a || !e.offsetParent && !e.getBoundingClientRect().width) && (c = 1, o = e.nextElementSibling, xr.appendChild(e)), i = Ti(e), s ? r.display = s : di(e, "display"), c && (o ? a.insertBefore(e, o) : a ? a.appendChild(e) : xr.removeChild(e))), t && i.length > 6 ? [
		i[0],
		i[1],
		i[4],
		i[5],
		i[12],
		i[13]
	] : i);
}, Di = function(e, t, n, r, i, a) {
	var o = e._gsap, s = i || Ei(e, !0), c = o.xOrigin || 0, l = o.yOrigin || 0, u = o.xOffset || 0, d = o.yOffset || 0, f = s[0], p = s[1], m = s[2], h = s[3], g = s[4], _ = s[5], v = t.split(" "), y = parseFloat(v[0]) || 0, b = parseFloat(v[1]) || 0, x, S, C, w;
	n ? s !== Si && (S = f * h - p * m) && (C = h / S * y + b * (-m / S) + (m * _ - h * g) / S, w = y * (-p / S) + f / S * b - (f * _ - p * g) / S, y = C, b = w) : (x = li(e), y = x.x + (~v[0].indexOf("%") ? y / 100 * x.width : y), b = x.y + (~(v[1] || v[0]).indexOf("%") ? b / 100 * x.height : b)), r || r !== !1 && o.smooth ? (g = y - c, _ = b - l, o.xOffset = u + (g * f + _ * m) - g, o.yOffset = d + (g * p + _ * h) - _) : o.xOffset = o.yOffset = 0, o.xOrigin = y, o.yOrigin = b, o.smooth = !!r, o.origin = t, o.originIsAbsolute = !!n, e.style[Xr] = "0px 0px", a && (fi(a, o, "xOrigin", c, y), fi(a, o, "yOrigin", l, b), fi(a, o, "xOffset", u, o.xOffset), fi(a, o, "yOffset", d, o.yOffset)), e.setAttribute("data-svg-origin", y + " " + b);
}, Oi = function(e, t) {
	var n = e._gsap || new On(e);
	if ("x" in n && !t && !n.uncache) return n;
	var r = e.style, i = n.scaleX < 0, a = "px", o = "deg", s = getComputedStyle(e), c = ri(e, Xr) || "0", l = u = d = m = h = g = _ = v = y = 0, u, d, f = p = 1, p, m, h, g, _, v, y, b, x, S, C, w, T, D, O, k, A, j, M, N, P, F, ee, te, ne, I, L, re;
	return n.svg = !!(e.getCTM && ui(e)), s.translate && ((s.translate !== "none" || s.scale !== "none" || s.rotate !== "none") && (r[Yr] = (s.translate === "none" ? "" : "translate3d(" + (s.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") ") + (s.rotate === "none" ? "" : "rotate(" + s.rotate + ") ") + (s.scale === "none" ? "" : "scale(" + s.scale.split(" ").join(",") + ") ") + (s[Yr] === "none" ? "" : s[Yr])), r.scale = r.rotate = r.translate = "none"), S = Ei(e, n.svg), n.svg && (n.uncache ? (P = e.getBBox(), c = n.xOrigin - P.x + "px " + (n.yOrigin - P.y) + "px", N = "") : N = !t && e.getAttribute("data-svg-origin"), Di(e, N || c, !!N || n.originIsAbsolute, n.smooth !== !1, S)), b = n.xOrigin || 0, x = n.yOrigin || 0, S !== Si && (D = S[0], O = S[1], k = S[2], A = S[3], l = j = S[4], u = M = S[5], S.length === 6 ? (f = Math.sqrt(D * D + O * O), p = Math.sqrt(A * A + k * k), m = D || O ? Ar(O, D) * Or : 0, _ = k || A ? Ar(k, A) * Or + m : 0, _ && (p *= Math.abs(Math.cos(_ * kr))), n.svg && (l -= b - (b * D + x * k), u -= x - (b * O + x * A))) : (re = S[6], I = S[7], ee = S[8], te = S[9], ne = S[10], L = S[11], l = S[12], u = S[13], d = S[14], C = Ar(re, ne), h = C * Or, C && (w = Math.cos(-C), T = Math.sin(-C), N = j * w + ee * T, P = M * w + te * T, F = re * w + ne * T, ee = j * -T + ee * w, te = M * -T + te * w, ne = re * -T + ne * w, L = I * -T + L * w, j = N, M = P, re = F), C = Ar(-k, ne), g = C * Or, C && (w = Math.cos(-C), T = Math.sin(-C), N = D * w - ee * T, P = O * w - te * T, F = k * w - ne * T, L = A * T + L * w, D = N, O = P, k = F), C = Ar(O, D), m = C * Or, C && (w = Math.cos(C), T = Math.sin(C), N = D * w + O * T, P = j * w + M * T, O = O * w - D * T, M = M * w - j * T, D = N, j = P), h && Math.abs(h) + Math.abs(m) > 359.9 && (h = m = 0, g = 180 - g), f = We(Math.sqrt(D * D + O * O + k * k)), p = We(Math.sqrt(M * M + re * re)), C = Ar(j, M), _ = Math.abs(C) > 2e-4 ? C * Or : 0, y = L ? 1 / (L < 0 ? -L : L) : 0), n.svg && (N = e.getAttribute("transform"), n.forceCSS = e.setAttribute("transform", "") || !wi(ri(e, Yr)), N && e.setAttribute("transform", N))), Math.abs(_) > 90 && Math.abs(_) < 270 && (i ? (f *= -1, _ += m <= 0 ? 180 : -180, m += m <= 0 ? 180 : -180) : (p *= -1, _ += _ <= 0 ? 180 : -180)), t ||= n.uncache, n.x = l - ((n.xPercent = l && (!t && n.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0))) ? e.offsetWidth * n.xPercent / 100 : 0) + a, n.y = u - ((n.yPercent = u && (!t && n.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-u) ? -50 : 0))) ? e.offsetHeight * n.yPercent / 100 : 0) + a, n.z = d + a, n.scaleX = We(f), n.scaleY = We(p), n.rotation = We(m) + o, n.rotationX = We(h) + o, n.rotationY = We(g) + o, n.skewX = _ + o, n.skewY = v + o, n.transformPerspective = y + a, (n.zOrigin = parseFloat(c.split(" ")[2]) || !t && n.zOrigin || 0) && (r[Xr] = ki(c)), n.xOffset = n.yOffset = 0, n.force3D = E.force3D, n.renderTransform = n.svg ? Ii : ti ? Fi : ji, n.uncache = 0, n;
}, ki = function(e) {
	return (e = e.split(" "))[0] + " " + e[1];
}, Ai = function(e, t, n) {
	var r = H(t);
	return We(parseFloat(t) + parseFloat(hi(e, "x", n + "px", r))) + r;
}, ji = function(e, t) {
	t.z = "0px", t.rotationY = t.rotationX = "0deg", t.force3D = 0, Fi(e, t);
}, Mi = "0deg", Ni = "0px", Pi = ") ", Fi = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.z, c = n.rotation, l = n.rotationY, u = n.rotationX, d = n.skewX, f = n.skewY, p = n.scaleX, m = n.scaleY, h = n.transformPerspective, g = n.force3D, _ = n.target, v = n.zOrigin, y = "", b = g === "auto" && e && e !== 1 || g === !0;
	if (v && (u !== Mi || l !== Mi)) {
		var x = parseFloat(l) * kr, S = Math.sin(x), C = Math.cos(x), w;
		x = parseFloat(u) * kr, w = Math.cos(x), a = Ai(_, a, S * w * -v), o = Ai(_, o, -Math.sin(x) * -v), s = Ai(_, s, C * w * -v + v);
	}
	h !== Ni && (y += "perspective(" + h + Pi), (r || i) && (y += "translate(" + r + "%, " + i + "%) "), (b || a !== Ni || o !== Ni || s !== Ni) && (y += s !== Ni || b ? "translate3d(" + a + ", " + o + ", " + s + ") " : "translate(" + a + ", " + o + Pi), c !== Mi && (y += "rotate(" + c + Pi), l !== Mi && (y += "rotateY(" + l + Pi), u !== Mi && (y += "rotateX(" + u + Pi), (d !== Mi || f !== Mi) && (y += "skew(" + d + ", " + f + Pi), (p !== 1 || m !== 1) && (y += "scale(" + p + ", " + m + Pi), _.style[Yr] = y || "translate(0, 0)";
}, Ii = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.rotation, c = n.skewX, l = n.skewY, u = n.scaleX, d = n.scaleY, f = n.target, p = n.xOrigin, m = n.yOrigin, h = n.xOffset, g = n.yOffset, _ = n.forceCSS, v = parseFloat(a), y = parseFloat(o), b, x, S, C, w;
	s = parseFloat(s), c = parseFloat(c), l = parseFloat(l), l && (l = parseFloat(l), c += l, s += l), s || c ? (s *= kr, c *= kr, b = Math.cos(s) * u, x = Math.sin(s) * u, S = Math.sin(s - c) * -d, C = Math.cos(s - c) * d, c && (l *= kr, w = Math.tan(c - l), w = Math.sqrt(1 + w * w), S *= w, C *= w, l && (w = Math.tan(l), w = Math.sqrt(1 + w * w), b *= w, x *= w)), b = We(b), x = We(x), S = We(S), C = We(C)) : (b = u, C = d, x = S = 0), (v && !~(a + "").indexOf("px") || y && !~(o + "").indexOf("px")) && (v = hi(f, "x", a, "px"), y = hi(f, "y", o, "px")), (p || m || h || g) && (v = We(v + p - (p * b + m * S) + h), y = We(y + m - (p * x + m * C) + g)), (r || i) && (w = f.getBBox(), v = We(v + r / 100 * w.width), y = We(y + i / 100 * w.height)), w = "matrix(" + b + "," + x + "," + S + "," + C + "," + v + "," + y + ")", f.setAttribute("transform", w), _ && (f.style[Yr] = w);
}, Li = function(e, t, n, r, i) {
	var a = 360, o = I(i), s = parseFloat(i) * (o && ~i.indexOf("rad") ? Or : 1) - r, c = r + s + "deg", l, u;
	return o && (l = i.split("_")[1], l === "short" && (s %= a, s !== s % (a / 2) && (s += s < 0 ? a : -a)), l === "cw" && s < 0 ? s = (s + a * jr) % a - ~~(s / a) * a : l === "ccw" && s > 0 && (s = (s - a * jr) % a - ~~(s / a) * a)), e._pt = u = new ir(e._pt, t, n, r, s, Lr), u.e = c, u.u = "deg", e._props.push(n), u;
}, Ri = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, zi = function(e, t, n) {
	var r = Ri({}, n._gsap), i = "perspective,force3D,transformOrigin,svgOrigin", a = n.style, o, s, c, l, u, d, f, p;
	for (s in r.svg ? (c = n.getAttribute("transform"), n.setAttribute("transform", ""), a[Yr] = t, o = Oi(n, 1), di(n, Yr), n.setAttribute("transform", c)) : (c = getComputedStyle(n)[Yr], a[Yr] = t, o = Oi(n, 1), a[Yr] = c), Dr) c = r[s], l = o[s], c !== l && i.indexOf(s) < 0 && (f = H(c), p = H(l), u = f === p ? parseFloat(c) : hi(n, s, c, p), d = parseFloat(l), e._pt = new ir(e._pt, o, s, u, d - u, Ir), e._pt.u = p || 0, e._props.push(s));
	Ri(o, r);
};
Ue("padding,margin,Width,Radius", function(e, t) {
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
	xi[t > 1 ? "border" + e : e] = function(e, t, n, r, i) {
		var a, s;
		if (arguments.length < 4) return a = o.map(function(t) {
			return gi(e, t, n);
		}), s = a.join(" "), s.split(a[0]).length === 5 ? a[0] : s;
		a = (r + "").split(" "), s = {}, o.forEach(function(e, t) {
			return s[e] = a[t] = a[t] || a[(t - 1) / 2 | 0];
		}), e.init(t, s, i);
	};
});
var Bi = {
	name: "css",
	register: oi,
	targetTest: function(e) {
		return e.style && e.nodeType;
	},
	init: function(e, t, n, r, i) {
		var a = this._props, o = e.style, s = n.vars.startAt, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w;
		for (m in Sr || oi(), this.styles = this.styles || ei(e), C = this.styles.props, this.tween = n, t) if (m !== "autoRound" && (l = t[m], !(Fe[m] && Pn(m, t, n, r, e, i)))) {
			if (f = typeof l, p = xi[m], f === "function" && (l = l.call(n, r, e, i), f = typeof l), f === "string" && ~l.indexOf("random(") && (l = Yt(l)), p) p(this, e, m, l, n) && (S = 1);
			else if (m.substr(0, 2) === "--") c = (getComputedStyle(e).getPropertyValue(m) + "").trim(), l += "", dn.lastIndex = 0, dn.test(c) || (h = H(c), g = H(l), g ? h !== g && (c = hi(e, m, c, g) + g) : h && (l += h)), this.add(o, "setProperty", c, l, r, i, 0, 0, m), a.push(m), C.push(m, 0, o[m]);
			else if (f !== "undefined") {
				if (s && m in s ? (c = typeof s[m] == "function" ? s[m].call(n, r, e, i) : s[m], I(c) && ~c.indexOf("random(") && (c = Yt(c)), H(c + "") || c === "auto" || (c += E.units[m] || H(gi(e, m)) || ""), (c + "").charAt(1) === "=" && (c = gi(e, m))) : c = gi(e, m), d = parseFloat(c), _ = f === "string" && l.charAt(1) === "=" && l.substr(0, 2), _ && (l = l.substr(2)), u = parseFloat(l), m in Fr && (m === "autoAlpha" && (d === 1 && gi(e, "visibility") === "hidden" && u && (d = 0), C.push("visibility", 0, o.visibility), fi(this, o, "visibility", d ? "inherit" : "hidden", u ? "inherit" : "hidden", !u)), m !== "scale" && m !== "transform" && (m = Fr[m], ~m.indexOf(",") && (m = m.split(",")[0]))), v = m in Dr, v) {
					if (this.styles.save(m), w = l, f === "string" && l.substring(0, 6) === "var(--") {
						if (l = ri(e, l.substring(4, l.indexOf(")"))), l.substring(0, 5) === "calc(") {
							var T = e.style.perspective;
							e.style.perspective = l, l = ri(e, "perspective"), T ? e.style.perspective = T : di(e, "perspective");
						}
						u = parseFloat(l);
					}
					if (y || (b = e._gsap, b.renderTransform && !t.parseTransform || Oi(e, t.parseTransform), x = t.smoothOrigin !== !1 && b.smooth, y = this._pt = new ir(this._pt, o, Yr, 0, 1, b.renderTransform, b, 0, -1), y.dep = 1), m === "scale") this._pt = new ir(this._pt, b, "scaleY", b.scaleY, (_ ? Ke(b.scaleY, _ + u) : u) - b.scaleY || 0, Ir), this._pt.u = 0, a.push("scaleY", m), m += "X";
					else if (m === "transformOrigin") {
						C.push(Xr, 0, o[Xr]), l = yi(l), b.svg ? Di(e, l, 0, x, 0, this) : (g = parseFloat(l.split(" ")[2]) || 0, g !== b.zOrigin && fi(this, b, "zOrigin", b.zOrigin, g), fi(this, o, m, ki(c), ki(l)));
						continue;
					} else if (m === "svgOrigin") {
						Di(e, l, 1, x, 0, this);
						continue;
					} else if (m in Ci) {
						Li(this, b, m, d, _ ? Ke(d, _ + l) : l);
						continue;
					} else if (m === "smoothOrigin") {
						fi(this, b, "smooth", b.smooth, l);
						continue;
					} else if (m === "force3D") {
						b[m] = l;
						continue;
					} else if (m === "transform") {
						zi(this, l, e);
						continue;
					}
				} else m in o || (m = ai(m) || m);
				if (v || (u || u === 0) && (d || d === 0) && !Pr.test(l) && m in o) h = (c + "").substr((d + "").length), u ||= 0, g = H(l) || (m in E.units ? E.units[m] : h), h !== g && (d = hi(e, m, c, g)), this._pt = new ir(this._pt, v ? b : o, m, d, (_ ? Ke(d, _ + u) : u) - d, !v && (g === "px" || m === "zIndex") && t.autoRound !== !1 ? Br : Ir), this._pt.u = g || 0, v && w !== l ? (this._pt.b = c, this._pt.e = w, this._pt.r = zr) : h !== g && g !== "%" && (this._pt.b = c, this._pt.r = Rr);
				else if (m in o) _i.call(this, e, m, c, _ ? _ + l : l);
				else if (m in e) this.add(e, m, c || e[m], _ ? _ + l : l, r, i);
				else if (m !== "parseTransform") {
					we(m, l);
					continue;
				}
				v || (m in o ? C.push(m, 0, o[m]) : typeof e[m] == "function" ? C.push(m, 2, e[m]()) : C.push(m, 1, c || e[m])), a.push(m);
			}
		}
		S && rr(this);
	},
	render: function(e, t) {
		if (t.tween._time || !Tr()) for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
		else t.styles.revert();
	},
	get: gi,
	aliases: Fr,
	getSetter: function(e, t, n) {
		var r = Fr[t];
		return r && r.indexOf(",") < 0 && (t = r), t in Dr && t !== Xr && (e._gsap.x || gi(e, "x")) ? n && wr === n ? t === "scale" ? Kr : Gr : (wr = n || {}) && (t === "scale" ? qr : Jr) : e.style && !ie(e.style[t]) ? Ur : ~t.indexOf("-") ? Wr : Yn(e, t);
	},
	core: {
		_removeProperty: di,
		_getMatrix: Ei
	}
};
vr.utils.checkPrefix = ai, vr.core.getStyleSaver = ei, (function(e, t, n, r) {
	var i = Ue(e + "," + t + "," + n, function(e) {
		Dr[e] = 1;
	});
	Ue(t, function(e) {
		E.units[e] = "deg", Ci[e] = 1;
	}), Fr[i[13]] = e + "," + t, Ue(r, function(e) {
		var t = e.split(":");
		Fr[t[1]] = i[t[0]];
	});
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY"), Ue("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(e) {
	E.units[e] = "px";
}), vr.registerPlugin(Bi);
//#endregion
//#region node_modules/gsap/index.js
var Vi = vr.registerPlugin(Bi) || vr;
Vi.core.Tween;
//#endregion
//#region node_modules/gsap/DrawSVGPlugin.js
var Hi, Ui, Wi, Gi, Ki, qi, Ji, Yi, Xi = function() {
	return typeof window < "u";
}, Zi = function() {
	return Hi || Xi() && (Hi = window.gsap) && Hi.registerPlugin && Hi;
}, Qi = /[-+=\.]*\d+[\.e\-\+]*\d*[e\-\+]*\d*/gi, $i = {
	rect: ["width", "height"],
	circle: ["r", "r"],
	ellipse: ["rx", "ry"],
	line: ["x2", "y2"]
}, G = function(e) {
	return Math.round(e * 1e4) / 1e4;
}, ea = function(e) {
	return parseFloat(e) || 0;
}, ta = function(e, t) {
	var n = ea(e);
	return ~e.indexOf("%") ? n / 100 * t : n;
}, na = function(e, t) {
	return ea(e.getAttribute(t));
}, ra = Math.sqrt, ia = function(e, t, n, r, i, a) {
	return ra(((ea(n) - ea(e)) * i) ** 2 + ((ea(r) - ea(t)) * a) ** 2);
}, aa = function(e) {
	return console.warn(e);
}, oa = function(e) {
	return e.getAttribute("vector-effect") === "non-scaling-stroke";
}, sa = 1, ca = function(e, t, n) {
	var r = e.indexOf(" "), i, a;
	return r < 0 ? (i = n === void 0 ? e : n + "", a = e) : (i = e.substr(0, r), a = e.substr(r + 1)), i = ta(i, t), a = ta(a, t), i > a ? [a, i] : [i, a];
}, la = function(e) {
	if (e = Ui(e)[0], !e) return 0;
	var t = e.tagName.toLowerCase(), n = e.style, r = 1, i = 1, a, o, s, c, l, u, d;
	oa(e) && (i = e.getScreenCTM(), r = ra(i.a * i.a + i.b * i.b), i = ra(i.d * i.d + i.c * i.c));
	try {
		o = e.getBBox();
	} catch {
		aa("Some browsers won't measure invisible elements (like display:none or masks inside defs).");
	}
	var f = o || {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	}, p = f.x, m = f.y, h = f.width, g = f.height;
	if ((!o || !h && !g) && $i[t] && (h = na(e, $i[t][0]), g = na(e, $i[t][1]), t !== "rect" && t !== "line" && (h *= 2, g *= 2), t === "line" && (p = na(e, "x1"), m = na(e, "y1"), h = Math.abs(h - p), g = Math.abs(g - m))), t === "path") c = n.strokeDasharray, n.strokeDasharray = "none", a = e.getTotalLength() || 0, G(r) !== G(i) && !qi && (qi = 1) && aa("Warning: <path> length cannot be measured when vector-effect is non-scaling-stroke and the element isn't proportionally scaled."), a *= (r + i) / 2, n.strokeDasharray = c;
	else if (t === "rect") a = h * 2 * r + g * 2 * i;
	else if (t === "line") a = ia(p, m, p + h, m + g, r, i);
	else if (t === "polyline" || t === "polygon") for (s = e.getAttribute("points").match(Qi) || [], t === "polygon" && s.push(s[0], s[1]), a = 0, l = 2; l < s.length; l += 2) a += ia(s[l - 2], s[l - 1], s[l], s[l + 1], r, i) || 0;
	else (t === "circle" || t === "ellipse") && (u = h / 2 * r, d = g / 2 * i, a = Math.PI * (3 * (u + d) - ra((3 * u + d) * (u + 3 * d))));
	return a || 0;
}, ua = function(e, t) {
	if (e = Ui(e)[0], !e) return [0, 0];
	t ||= la(e) + 1;
	var n = Wi.getComputedStyle(e), r = n.strokeDasharray || "", i = ea(n.strokeDashoffset), a = r.indexOf(",");
	return a < 0 && (a = r.indexOf(" ")), r = a < 0 ? t : ea(r.substr(0, a)), r > t && (r = t), [-i || 0, r - i || 0];
}, da = function() {
	Xi() && (Wi = window, Ki = Hi = Zi(), Ui = Hi.utils.toArray, Ji = Hi.core.getStyleSaver, Yi = Hi.core.reverting || function() {}, Gi = ((Wi.navigator || {}).userAgent || "").indexOf("Edge") !== -1);
}, fa = {
	version: "3.15.0",
	name: "drawSVG",
	register: function(e) {
		Hi = e, da();
	},
	init: function(e, t, n, r, i) {
		if (!e.getBBox) return !1;
		Ki || da();
		var a = la(e), o, s, c;
		return this.styles = Ji && Ji(e, "strokeDashoffset,strokeDasharray,strokeMiterlimit"), this.tween = n, this._style = e.style, this._target = e, t + "" == "true" ? t = "0 100%" : t ? (t + "").indexOf(" ") === -1 && (t = "0 " + t) : t = "0 0", o = ua(e, a), s = ca(t, a, o[0]), this._length = G(a), this._dash = G(o[1] - o[0]), this._offset = G(-o[0]), this._dashPT = this.add(this, "_dash", this._dash, G(s[1] - s[0]), 0, 0, 0, 0, 0, 1), this._offsetPT = this.add(this, "_offset", this._offset, G(-s[0]), 0, 0, 0, 0, 0, 1), Gi && (c = Wi.getComputedStyle(e), c.strokeLinecap !== c.strokeLinejoin && (s = ea(c.strokeMiterlimit), this.add(e.style, "strokeMiterlimit", s, s + .01))), this._live = oa(e) || ~(t + "").indexOf("live"), this._nowrap = ~(t + "").indexOf("nowrap"), this._props.push("drawSVG"), sa;
	},
	render: function(e, t) {
		if (t.tween._time || !Yi()) {
			var n = t._pt, r = t._style, i, a, o, s;
			if (n) {
				for (t._live && (i = la(t._target), i !== t._length && (a = i / t._length, t._length = i, t._offsetPT && (t._offsetPT.s *= a, t._offsetPT.c *= a), t._dashPT ? (t._dashPT.s *= a, t._dashPT.c *= a) : t._dash *= a)); n;) n.r(e, n.d), n = n._next;
				o = t._dash || e && e !== 1 && 1e-4 || 0, i = t._length - o + .1, s = t._offset, o && s && o + Math.abs(s % t._length) > t._length - .05 && (s += s < 0 ? .005 : -.005) && (i += .005), r.strokeDashoffset = o ? s : s + .001, r.strokeDasharray = i < .1 ? "none" : o ? o + "px," + (t._nowrap ? 999999 : i) + "px" : "0px, 999999px";
			}
		} else t.styles.revert();
	},
	getLength: la,
	getPosition: ua
};
Zi() && Hi.registerPlugin(fa);
//#endregion
//#region node_modules/gsap/utils/paths.js
var pa = /[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi, ma = /(?:(-)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi, ha = /[\+\-]?\d*\.?\d+e[\+\-]?\d+/gi, ga = /(^[#\.][a-z]|[a-y][a-z])/i, _a = Math.PI / 180, va = 180 / Math.PI, ya = Math.sin, ba = Math.cos, xa = Math.abs, Sa = Math.sqrt, Ca = Math.atan2, wa = 1e8, Ta = function(e) {
	return typeof e == "string";
}, Ea = function(e) {
	return typeof e == "number";
}, Da = function(e) {
	return e === void 0;
}, Oa = {}, ka = {}, Aa = 1e5, ja = function(e) {
	return Math.round((e + wa) % 1 * Aa) / Aa || (e < 0 ? 0 : 1);
}, K = function(e) {
	return Math.round(e * Aa) / Aa || 0;
}, Ma = function(e) {
	return Math.round(e * 1e10) / 1e10 || 0;
}, Na = function(e) {
	return e.closed = Math.abs(e[0] - e[e.length - 2]) < .001 && Math.abs(e[1] - e[e.length - 1]) < .001;
}, Pa = function(e, t, n, r) {
	var i = e[t], a = r === 1 ? 6 : Xa(i, n, r);
	if ((a || !r) && a + n + 2 < i.length) return e.splice(t, 0, i.slice(0, n + a + 2)), i.splice(0, n + a), 1;
}, Fa = function(e, t, n) {
	var r = e.length, i = ~~(n * r);
	if (e[i] > t) {
		for (; --i && e[i] > t;);
		i < 0 && (i = 0);
	} else for (; e[++i] < t && i < r;);
	return i < r ? i : r - 1;
}, Ia = function(e, t) {
	var n = e.length;
	for (t || e.reverse(); n--;) e[n].reversed || Va(e[n]);
}, La = function(e, t) {
	return t.totalLength = e.totalLength, e.samples ? (t.samples = e.samples.slice(0), t.lookup = e.lookup.slice(0), t.minLength = e.minLength, t.resolution = e.resolution) : e.totalPoints && (t.totalPoints = e.totalPoints), t;
}, Ra = function(e, t) {
	var n = e.length, r = e[n - 1] || [], i = r.length;
	n && t[0] === r[i - 2] && t[1] === r[i - 1] && (t = r.concat(t.slice(2)), n--), e[n] = t;
};
function za(e) {
	e = Ta(e) && ga.test(e) && document.querySelector(e) || e;
	var t = e.getAttribute ? e : 0, n;
	return t && (e = e.getAttribute("d")) ? (t._gsPath ||= {}, n = t._gsPath[e], n && !n._dirty ? n : t._gsPath[e] = to(e)) : e ? Ta(e) ? to(e) : Ea(e[0]) ? [e] : e : console.warn("Expecting a <path> element or an SVG path data string");
}
function Ba(e) {
	for (var t = [], n = 0; n < e.length; n++) t[n] = La(e[n], e[n].slice(0));
	return La(e, t);
}
function Va(e) {
	var t = 0, n;
	for (e.reverse(); t < e.length; t += 2) n = e[t], e[t] = e[t + 1], e[t + 1] = n;
	e.reversed = !e.reversed;
}
var Ha = function(e, t) {
	var n = document.createElementNS("http://www.w3.org/2000/svg", "path"), r = [].slice.call(e.attributes), i = r.length, a;
	for (t = "," + t + ","; --i > -1;) a = r[i].nodeName.toLowerCase(), t.indexOf("," + a + ",") < 0 && n.setAttributeNS(null, a, r[i].nodeValue);
	return n;
}, Ua = {
	rect: "rx,ry,x,y,width,height",
	circle: "r,cx,cy",
	ellipse: "rx,ry,cx,cy",
	line: "x1,x2,y1,y2"
}, Wa = function(e, t) {
	for (var n = t ? t.split(",") : [], r = {}, i = n.length; --i > -1;) r[n[i]] = +e.getAttribute(n[i]) || 0;
	return r;
};
function Ga(e, t) {
	var n = e.tagName.toLowerCase(), r = .552284749831, i, a, o, s, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w, T;
	return n === "path" || !e.getBBox ? e : (l = Ha(e, "x,y,width,height,cx,cy,rx,ry,r,x1,x2,y1,y2,points"), T = Wa(e, Ua[n]), n === "rect" ? (s = T.rx, c = T.ry || s, a = T.x, o = T.y, p = T.width - s * 2, m = T.height - c * 2, s || c ? (h = a + s * (1 - r), g = a + s, _ = g + p, v = _ + s * r, y = _ + s, b = o + c * (1 - r), x = o + c, S = x + m, C = S + c * r, w = S + c, i = "M" + y + "," + x + " V" + S + " C" + [
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
	].join(",") + "z") : n === "line" ? i = "M" + T.x1 + "," + T.y1 + " L" + T.x2 + "," + T.y2 : (n === "polyline" || n === "polygon") && (f = (e.getAttribute("points") + "").match(ma) || [], a = f.shift(), o = f.shift(), i = "M" + a + "," + o + " L" + f.join(","), n === "polygon" && (i += "," + a + "," + o + "z")), l.setAttribute("d", io(l._gsRawPath = to(i))), t && e.parentNode && (e.parentNode.insertBefore(l, e), e.parentNode.removeChild(e)), l);
}
function Ka(e, t, n) {
	var r = e[t], i = e[t + 2], a = e[t + 4], o;
	return r += (i - r) * n, i += (a - i) * n, r += (i - r) * n, o = i + (a + (e[t + 6] - a) * n - i) * n - r, r = e[t + 1], i = e[t + 3], a = e[t + 5], r += (i - r) * n, i += (a - i) * n, r += (i - r) * n, K(Ca(i + (a + (e[t + 7] - a) * n - i) * n - r, o) * va);
}
function qa(e, t, n) {
	n = Da(n) ? 1 : Ma(n) || 0, t = Ma(t) || 0;
	var r = Math.max(0, ~~(xa(n - t) - 1e-8)), i = Ba(e);
	if (t > n && (t = 1 - t, n = 1 - n, Ia(i), i.totalLength = 0), t < 0 || n < 0) {
		var a = Math.abs(~~Math.min(t, n)) + 1;
		t += a, n += a;
	}
	i.totalLength || Ya(i);
	var o = n > 1, s = Za(i, t, Oa, !0), c = Za(i, n, ka), l = c.segment, u = s.segment, d = c.segIndex, f = s.segIndex, p = c.i, m = s.i, h = f === d, g = p === m && h, _, v, y, b, x, S, C, w;
	if (o || r) {
		for (_ = d < f || h && p < m || g && c.t < s.t, Pa(i, f, m, s.t) && (f++, _ || (d++, g ? (c.t = (c.t - s.t) / (1 - s.t), p = 0) : h && (p -= m))), Math.abs(1 - (n - t)) < 1e-5 ? d = f - 1 : !c.t && d ? d-- : Pa(i, d, p, c.t) && _ && f++, s.t === 1 && (f = (f + 1) % i.length), x = [], S = i.length, C = 1 + S * r, w = f, C += (S - f + d) % S, b = 0; b < C; b++) Ra(x, i[w++ % S]);
		i = x;
	} else if (y = c.t === 1 ? 6 : Xa(l, p, c.t), t !== n) for (v = Xa(u, m, g ? s.t / c.t : s.t), h && (y += v), l.splice(p + y + 2), (v || m) && u.splice(0, m + v), b = i.length; b--;) (b < f || b > d) && i.splice(b, 1);
	else l.angle = Ka(l, p + y, 0), p += y, s = l[p], c = l[p + 1], l.length = l.totalLength = 0, l.totalPoints = i.totalPoints = 8, l.push(s, c, s, c, s, c, s, c);
	return i.totalLength = 0, i;
}
function Ja(e, t, n) {
	t ||= 0, e.samples || (e.samples = [], e.lookup = []);
	var r = ~~e.resolution || 12, i = 1 / r, a = n ? t + n * 6 + 1 : e.length, o = e[t], s = e[t + 1], c = t ? t / 6 * r : 0, l = e.samples, u = e.lookup, d = (t ? e.minLength : wa) || wa, f = l[c + n * r - 1], p = t ? l[c - 1] : 0, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A;
	for (l.length = u.length = 0, h = t + 2; h < a; h += 6) {
		if (g = e[h + 4] - o, _ = e[h + 2] - o, v = e[h] - o, x = e[h + 5] - s, S = e[h + 3] - s, C = e[h + 1] - s, y = b = w = T = 0, xa(g) < .01 && xa(x) < .01 && xa(v) + xa(C) < .01) e.length > 8 && (e.splice(h, 6), h -= 6, a -= 6);
		else for (m = 1; m <= r; m++) D = i * m, E = 1 - D, y = b - (b = (D * D * g + 3 * E * (D * _ + E * v)) * D), w = T - (T = (D * D * x + 3 * E * (D * S + E * C)) * D), k = Sa(w * w + y * y), k < d && (d = k), p += k, l[c++] = p;
		o += g, s += x;
	}
	if (f) for (f -= p; c < l.length; c++) l[c] += f;
	if (l.length && d) {
		if (e.totalLength = A = l[l.length - 1] || 0, e.minLength = d, A / d < 9999) for (k = O = 0, m = 0; m < A; m += d) u[k++] = l[O] < m ? ++O : O;
	} else e.totalLength = l[0] = 0;
	return t ? p - l[t / 2 - 1] : p;
}
function Ya(e, t) {
	for (var n, r, i = n = r = 0; i < e.length; i++) e[i].resolution = ~~t || 12, n += Ja(e[i]), r += e[i].length;
	return e.totalPoints = r, e.totalLength = n, e;
}
function Xa(e, t, n) {
	if (n <= 0 || n >= 1) return 0;
	var r = e[t], i = e[t + 1], a = e[t + 2], o = e[t + 3], s = e[t + 4], c = e[t + 5], l = e[t + 6], u = e[t + 7], d = r + (a - r) * n, f = a + (s - a) * n, p = i + (o - i) * n, m = o + (c - o) * n, h = d + (f - d) * n, g = p + (m - p) * n, _ = s + (l - s) * n, v = c + (u - c) * n;
	return f += (_ - f) * n, m += (v - m) * n, e.splice(t + 2, 4, K(d), K(p), K(h), K(g), K(h + (f - h) * n), K(g + (m - g) * n), K(f), K(m), K(_), K(v)), e.samples && e.samples.splice(t / 6 * e.resolution | 0, 0, 0, 0, 0, 0, 0, 0), 6;
}
function Za(e, t, n, r) {
	n ||= {}, e.totalLength || Ya(e), (t < 0 || t > 1) && (t = ja(t));
	var i = 0, a = e[0], o, s, c, l, u, d, f;
	if (!t) f = d = i = 0, a = e[0];
	else if (t === 1) f = 1, i = e.length - 1, a = e[i], d = a.length - 8;
	else {
		if (e.length > 1) {
			for (c = e.totalLength * t, u = d = 0; (u += e[d++].totalLength) < c;) i = d;
			a = e[i], l = u - a.totalLength, t = (c - l) / (u - l) || 0;
		}
		o = a.samples, s = a.resolution, c = a.totalLength * t, d = a.lookup.length ? a.lookup[~~(c / a.minLength)] || 0 : Fa(o, c, t), l = d ? o[d - 1] : 0, u = o[d], u < c && (l = u, u = o[++d]), f = 1 / s * ((c - l) / (u - l) + d % s), d = ~~(d / s) * 6, r && f === 1 && (d + 6 < a.length ? (d += 6, f = 0) : i + 1 < e.length && (d = f = 0, a = e[++i]));
	}
	return n.t = f, n.i = d, n.path = e, n.segment = a, n.segIndex = i, n;
}
function Qa(e, t, n, r) {
	var i = e[0], a = r || {}, o, s, c, l, u, d, f, p, m;
	if ((t < 0 || t > 1) && (t = ja(t)), i.lookup || Ya(e), e.length > 1) {
		for (c = e.totalLength * t, u = d = 0; (u += e[d++].totalLength) < c;) i = e[d];
		l = u - i.totalLength, t = (c - l) / (u - l) || 0;
	}
	return o = i.samples, s = i.resolution, c = i.totalLength * t, d = i.lookup.length ? i.lookup[t < 1 ? ~~(c / i.minLength) : i.lookup.length - 1] || 0 : Fa(o, c, t), l = d ? o[d - 1] : 0, u = o[d], u < c && (l = u, u = o[++d]), f = 1 / s * ((c - l) / (u - l) + d % s) || 0, m = 1 - f, d = ~~(d / s) * 6, p = i[d], a.x = K((f * f * (i[d + 6] - p) + 3 * m * (f * (i[d + 4] - p) + m * (i[d + 2] - p))) * f + p), a.y = K((f * f * (i[d + 7] - (p = i[d + 1])) + 3 * m * (f * (i[d + 5] - p) + m * (i[d + 3] - p))) * f + p), n && (a.angle = i.totalLength ? Ka(i, d, f >= 1 ? 1 - 1e-9 : f || 1e-9) : i.angle || 0), a;
}
function $a(e, t, n, r, i, a, o) {
	for (var s = e.length, c, l, u, d, f; --s > -1;) for (c = e[s], l = c.length, u = 0; u < l; u += 2) d = c[u], f = c[u + 1], c[u] = d * t + f * r + a, c[u + 1] = d * n + f * i + o;
	return e._dirty = 1, e;
}
function eo(e, t, n, r, i, a, o, s, c) {
	if (e !== s || t !== c) {
		n = xa(n), r = xa(r);
		var l = i % 360 * _a, u = ba(l), d = ya(l), f = Math.PI, p = f * 2, m = (e - s) / 2, h = (t - c) / 2, g = u * m + d * h, _ = -d * m + u * h, v = g * g, y = _ * _, b = v / (n * n) + y / (r * r);
		b > 1 && (n = Sa(b) * n, r = Sa(b) * r);
		var x = n * n, S = r * r, C = (x * S - x * y - S * v) / (x * y + S * v);
		C < 0 && (C = 0);
		var w = (a === o ? -1 : 1) * Sa(C), T = w * (n * _ / r), E = w * -(r * g / n), D = (e + s) / 2, O = (t + c) / 2, k = D + (u * T - d * E), A = O + (d * T + u * E), j = (g - T) / n, M = (_ - E) / r, N = (-g - T) / n, P = (-_ - E) / r, F = j * j + M * M, ee = (M < 0 ? -1 : 1) * Math.acos(j / Sa(F)), te = (j * P - M * N < 0 ? -1 : 1) * Math.acos((j * N + M * P) / Sa(F * (N * N + P * P)));
		isNaN(te) && (te = f), !o && te > 0 ? te -= p : o && te < 0 && (te += p), ee %= p, te %= p;
		for (var ne = Math.ceil(xa(te) / (p / 4)), I = [], L = te / ne, re = 4 / 3 * ya(L / 2) / (1 + ba(L / 2)), ie = u * n, R = d * n, ae = d * -r, oe = u * r, se = 0; se < ne; se++) i = ee + se * L, g = ba(i), _ = ya(i), j = ba(i += L), M = ya(i), I.push(g - re * _, _ + re * g, j + re * M, M - re * j, j, M);
		for (se = 0; se < I.length; se += 2) g = I[se], _ = I[se + 1], I[se] = g * ie + _ * ae + k, I[se + 1] = g * R + _ * oe + A;
		return I[se - 2] = s, I[se - 1] = c, I;
	}
}
function to(e) {
	var t = (e + "").replace(ha, function(e) {
		var t = +e;
		return t < 1e-4 && t > -1e-4 ? 0 : t;
	}).match(pa) || [], n = [], r = 0, i = 0, a = 2 / 3, o = t.length, s = 0, c = "ERROR: malformed path: " + e, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w = function(e, t, n, r) {
		v = (n - e) / 3, y = (r - t) / 3, h.push(e + v, t + y, n - v, r - y, n, r);
	};
	if (!e || !isNaN(t[0]) || isNaN(t[1])) return console.log(c), n;
	for (l = 0; l < o; l++) if (x = p, isNaN(t[l]) ? (p = t[l].toUpperCase(), m = p !== t[l]) : l--, d = +t[l + 1], f = +t[l + 2], m && (d += r, f += i), l || (g = d, _ = f), p === "M") h && (h.length < 8 ? --n.length : s += h.length, Na(h)), r = g = d, i = _ = f, h = [d, f], n.push(h), l += 2, p = "L";
	else if (p === "C") h ||= [0, 0], m || (r = i = 0), h.push(d, f, r + t[l + 3] * 1, i + t[l + 4] * 1, r += t[l + 5] * 1, i += t[l + 6] * 1), l += 6;
	else if (p === "S") v = r, y = i, (x === "C" || x === "S") && (v += r - h[h.length - 4], y += i - h[h.length - 3]), m || (r = i = 0), h.push(v, y, d, f, r += t[l + 3] * 1, i += t[l + 4] * 1), l += 4;
	else if (p === "Q") v = r + (d - r) * a, y = i + (f - i) * a, m || (r = i = 0), r += t[l + 3] * 1, i += t[l + 4] * 1, h.push(v, y, r + (d - r) * a, i + (f - i) * a, r, i), l += 4;
	else if (p === "T") v = r - h[h.length - 4], y = i - h[h.length - 3], h.push(r + v, i + y, d + (r + v * 1.5 - d) * a, f + (i + y * 1.5 - f) * a, r = d, i = f), l += 2;
	else if (p === "H") w(r, i, r = d, i), l += 1;
	else if (p === "V") w(r, i, r, i = d + (m ? i - r : 0)), l += 1;
	else if (p === "L" || p === "Z") p === "Z" && (d = g, f = _, h.closed = !0), (p === "L" || xa(r - d) > .5 || xa(i - f) > .5) && (w(r, i, d, f), p === "L" && (l += 2)), r = d, i = f;
	else if (p === "A") {
		if (S = t[l + 4], C = t[l + 5], v = t[l + 6], y = t[l + 7], u = 7, S.length > 1 && (S.length < 3 ? (y = v, v = C, u--) : (y = C, v = S.substr(2), u -= 2), C = S.charAt(1), S = S.charAt(0)), b = eo(r, i, +t[l + 1], +t[l + 2], +t[l + 3], +S, +C, (m ? r : 0) + v * 1, (m ? i : 0) + y * 1), l += u, b) for (u = 0; u < b.length; u++) h.push(b[u]);
		r = h[h.length - 2], i = h[h.length - 1];
	} else console.log(c);
	return l = h.length, l < 6 ? (n.pop(), l = 0) : Na(h), n.totalPoints = s + l, n;
}
function no(e, t) {
	t === void 0 && (t = 1);
	for (var n = e[0], r = 0, i = [n, r], a = 2; a < e.length; a += 2) i.push(n, r, e[a], r = (e[a] - n) * t / 2, n = e[a], -r);
	return i;
}
function ro(e, t) {
	xa(e[0] - e[2]) < 1e-4 && xa(e[1] - e[3]) < 1e-4 && (e = e.slice(2));
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
	for (d && (e.push(a, o), a = r, o = i, r = e[n - 2], i = e[n - 1], e.unshift(r, i), n += 4, u = [0, 0].concat(u)), t = t || t === 0 ? +t : 1, m = 2; m < n; m += 2) f = r, p = i, r = a, i = o, a = +e[m + 2], o = +e[m + 3], (r !== a || i !== o) && (h = c, g = l, c = a - r, l = o - i, u[m] ? s.push(r - (r - f) / 4, i - (i - p) / 4, r, i, r + (a - r) / 4, i + (o - i) / 4) : (_ = Sa(h * h + g * g), v = Sa(c * c + l * l), y = Sa((c / v + h / _) ** 2 + (l / v + g / _) ** 2), b = (_ + v) * t * .25 / y, x = r - (r - f) * (_ ? b / _ : 0), S = r + (a - r) * (v ? b / v : 0), C = r - (x + ((S - x) * (_ * 3 / (_ + v) + .5) / 4 || 0)), w = i - (i - p) * (_ ? b / _ : 0), T = i + (o - i) * (v ? b / v : 0), E = i - (w + ((T - w) * (_ * 3 / (_ + v) + .5) / 4 || 0)), s.push(K(x + C), K(w + E), K(r), K(i), K(S + C), K(T + E))));
	return r !== a || i !== o || s.length < 4 ? s.push(K(a), K(o), K(a), K(o)) : s.length -= 2, s.length === 2 ? s.push(r, i, r, i, r, i) : d && (s.splice(0, 6), s.length -= 6), s.closed = d, s;
}
function io(e) {
	Ea(e[0]) && (e = [e]);
	for (var t = "", n = e.length, r, i = 0, a, o; i < n; i++) {
		for (o = e[i], t += "M" + K(o[0]) + "," + K(o[1]) + " C", r = o.length, a = 2; a < r; a++) t += K(o[a++]) + "," + K(o[a++]) + " " + K(o[a++]) + "," + K(o[a++]) + " " + K(o[a++]) + "," + K(o[a]) + " ";
		o.closed && (t += "z");
	}
	return t;
}
//#endregion
//#region node_modules/gsap/utils/matrix.js
var ao, oo, so, co, lo, uo, fo, po, mo = "transform", ho = mo + "Origin", go, _o = function(e) {
	var t = e.ownerDocument || e;
	for (!(mo in e.style) && ("msTransform" in e.style) && (mo = "msTransform", ho = mo + "Origin"); t.parentNode && (t = t.parentNode););
	if (oo = window, fo = new Ao(), t) {
		ao = t, so = t.documentElement, co = t.body, po = ao.createElementNS("http://www.w3.org/2000/svg", "g"), po.style.transform = "none";
		var n = t.createElement("div"), r = t.createElement("div"), i = t && (t.body || t.firstElementChild);
		i && i.appendChild && (i.appendChild(n), n.appendChild(r), n.style.position = "static", n.style.transform = "translate3d(0,0,1px)", go = r.offsetParent !== n, i.removeChild(n));
	}
	return t;
}, vo = function(e) {
	for (var t, n; e && e !== co;) n = e._gsap, n && n.uncache && n.get(e, "x"), n && !n.scaleX && !n.scaleY && n.renderTransform && (n.scaleX = n.scaleY = 1e-4, n.renderTransform(1, n), t ? t.push(n) : t = [n]), e = e.parentNode;
	return t;
}, yo = [], bo = [], xo = function() {
	return oo.pageYOffset || ao.scrollTop || so.scrollTop || co.scrollTop || 0;
}, So = function() {
	return oo.pageXOffset || ao.scrollLeft || so.scrollLeft || co.scrollLeft || 0;
}, Co = function(e) {
	return e.ownerSVGElement || ((e.tagName + "").toLowerCase() === "svg" ? e : null);
}, wo = function e(t) {
	if (oo.getComputedStyle(t).position === "fixed") return !0;
	if (t = t.parentNode, t && t.nodeType === 1) return e(t);
}, To = function e(t, n) {
	if (t.parentNode && (ao || _o(t))) {
		var r = Co(t), i = r ? r.getAttribute("xmlns") || "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml", a = r ? n ? "rect" : "g" : "div", o = n === 2 ? 100 : 0, s = n === 3 ? 100 : 0, c = {
			position: "absolute",
			display: "block",
			pointerEvents: "none",
			margin: "0",
			padding: "0"
		}, l = ao.createElementNS ? ao.createElementNS(i.replace(/^https/, "http"), a) : ao.createElement(a);
		return n && (r ? (uo ||= e(t), l.setAttribute("width", .01), l.setAttribute("height", .01), l.setAttribute("transform", "translate(" + o + "," + s + ")"), l.setAttribute("fill", "transparent"), uo.appendChild(l)) : (lo || (lo = e(t), Object.assign(lo.style, c)), Object.assign(l.style, c, {
			width: "0.1px",
			height: "0.1px",
			top: s + "px",
			left: o + "px"
		}), lo.appendChild(l))), l;
	}
	throw "Need document and parent.";
}, Eo = function(e) {
	for (var t = new Ao(), n = 0; n < e.numberOfItems; n++) t.multiply(e.getItem(n).matrix);
	return t;
}, Do = function(e) {
	var t = e.getCTM(), n;
	return t || (n = e.style[mo], e.style[mo] = "none", e.appendChild(po), t = po.getCTM(), e.removeChild(po), n ? e.style[mo] = n : e.style.removeProperty(mo.replace(/([A-Z])/g, "-$1").toLowerCase())), t || fo.clone();
}, Oo = function(e, t) {
	var n = Co(e), r = e === n, i = n ? yo : bo, a = e.parentNode, o = a && !n && a.shadowRoot && a.shadowRoot.appendChild ? a.shadowRoot : a, s, c, l, u, d, f;
	if (e === oo) return e;
	if (i.length || i.push(To(e, 1), To(e, 2), To(e, 3)), s = n ? uo : lo, n) r ? (l = Do(e), u = -l.e / l.a, d = -l.f / l.d, c = fo) : e.getBBox ? (l = e.getBBox(), c = e.transform ? e.transform.baseVal : {}, c = c.numberOfItems ? c.numberOfItems > 1 ? Eo(c) : c.getItem(0).matrix : fo, u = c.a * l.x + c.c * l.y, d = c.b * l.x + c.d * l.y) : (c = new Ao(), u = d = 0), t && e.tagName.toLowerCase() === "g" && (u = d = 0), (r || !e.getBoundingClientRect().width ? n : a).appendChild(s), s.setAttribute("transform", "matrix(" + c.a + "," + c.b + "," + c.c + "," + c.d + "," + (c.e + u) + "," + (c.f + d) + ")");
	else {
		if (u = d = 0, go) for (c = e.offsetParent, l = e; (l &&= l.parentNode) && l !== c && l.parentNode;) (oo.getComputedStyle(l)[mo] + "").length > 4 && (u = l.offsetLeft, d = l.offsetTop, l = 0);
		if (f = oo.getComputedStyle(e), f.position !== "absolute" && f.position !== "fixed") for (c = e.offsetParent; a && a !== c;) u += a.scrollLeft || 0, d += a.scrollTop || 0, a = a.parentNode;
		l = s.style, l.top = e.offsetTop - d + "px", l.left = e.offsetLeft - u + "px", l[mo] = f[mo], l[ho] = f[ho], l.position = f.position === "fixed" ? "fixed" : "absolute", o.appendChild(s);
	}
	return s;
}, ko = function(e, t, n, r, i, a, o) {
	return e.a = t, e.b = n, e.c = r, e.d = i, e.e = a, e.f = o, e;
}, Ao = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a) {
		e === void 0 && (e = 1), t === void 0 && (t = 0), n === void 0 && (n = 0), r === void 0 && (r = 1), i === void 0 && (i = 0), a === void 0 && (a = 0), ko(this, e, t, n, r, i, a);
	}
	var t = e.prototype;
	return t.inverse = function() {
		var e = this.a, t = this.b, n = this.c, r = this.d, i = this.e, a = this.f, o = e * r - t * n || 1e-10;
		return ko(this, r / o, -t / o, -n / o, e / o, (n * a - r * i) / o, -(e * a - t * i) / o);
	}, t.multiply = function(e) {
		var t = this.a, n = this.b, r = this.c, i = this.d, a = this.e, o = this.f, s = e.a, c = e.c, l = e.b, u = e.d, d = e.e, f = e.f;
		return ko(this, s * t + l * r, s * n + l * i, c * t + u * r, c * n + u * i, a + d * t + f * r, o + d * n + f * i);
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
function jo(e, t, n, r) {
	if (!e || !e.parentNode || (ao || _o(e)).documentElement === e) return new Ao();
	var i = vo(e), a = Co(e) ? yo : bo, o = Oo(e, n), s = a[0].getBoundingClientRect(), c = a[1].getBoundingClientRect(), l = a[2].getBoundingClientRect(), u = o.parentNode, d = !r && wo(e), f = new Ao((c.left - s.left) / 100, (c.top - s.top) / 100, (l.left - s.left) / 100, (l.top - s.top) / 100, s.left + (d ? 0 : So()), s.top + (d ? 0 : xo()));
	if (u.removeChild(o), i) for (s = i.length; s--;) c = i[s], c.scaleX = c.scaleY = 0, c.renderTransform(1, c);
	return t ? f.inverse() : f;
}
//#endregion
//#region node_modules/gsap/MotionPathPlugin.js
var Mo = "x,translateX,left,marginLeft,xPercent".split(","), No = "y,translateY,top,marginTop,yPercent".split(","), Po = Math.PI / 180, Fo, Io, q, J, Lo, Ro, zo = function() {
	return Fo || typeof window < "u" && (Fo = window.gsap) && Fo.registerPlugin && Fo;
}, Bo = function(e, t, n, r) {
	for (var i = t.length, a = r === 2 ? 0 : r, o = 0; o < i; o++) e[a] = parseFloat(t[o][n]), r === 2 && (e[a + 1] = 0), a += 2;
	return e;
}, Vo = function(e, t, n) {
	return parseFloat(e._gsap.get(e, t, n || "px")) || 0;
}, Ho = function(e) {
	for (var t = e[0], n = e[1], r = 2; r < e.length; r += 2) t = e[r] += t, n = e[r + 1] += n;
}, Uo = function(e, t, n, r, i, a, o, s, c) {
	return o.type === "cubic" ? t = [t] : (o.fromCurrent !== !1 && t.unshift(Vo(n, r, s), i ? Vo(n, i, c) : 0), o.relative && Ho(t), t = [(i ? ro : no)(t, o.curviness)]), t = a(Jo(t, n, o)), Yo(e, n, r, t, "x", s), i && Yo(e, n, i, t, "y", c), Ya(t, o.resolution || (o.curviness === 0 ? 20 : 12));
}, Wo = function(e) {
	return e;
}, Go = /[-+\.]*\d+\.?(?:e-|e\+)?\d*/g, Ko = function(e, t, n) {
	var r = jo(e), i = 0, a = 0, o;
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
}, qo = function(e, t, n, r) {
	var i = jo(e.parentNode, !0, !0), a = i.clone().multiply(jo(t)), o = Ko(e, n, i), s = Ko(t, r, i), c = s.x, l = s.y, u;
	return a.e = a.f = 0, r === "auto" && t.getTotalLength && t.tagName.toLowerCase() === "path" && (u = t.getAttribute("d").match(Go) || [], u = a.apply({
		x: +u[0],
		y: +u[1]
	}), c += u.x, l += u.y), u && (u = a.apply(t.getBBox()), c -= u.x, l -= u.y), a.e = c - o.x, a.f = l - o.y, a;
}, Jo = function(e, t, n) {
	var r = n.align, i = n.matrix, a = n.offsetX, o = n.offsetY, s = n.alignOrigin, c = e[0][0], l = e[0][1], u = Vo(t, "x"), d = Vo(t, "y"), f, p, m;
	return !e || !e.length ? za("M0,0L0,0") : (r && (r === "self" || (f = J(r)[0] || t) === t ? $a(e, 1, 0, 0, 1, u - c, d - l) : (s && s[2] !== !1 ? Fo.set(t, { transformOrigin: s[0] * 100 + "% " + s[1] * 100 + "%" }) : s = [Vo(t, "xPercent") / -100, Vo(t, "yPercent") / -100], p = qo(t, f, s, "auto"), m = p.apply({
		x: c,
		y: l
	}), $a(e, p.a, p.b, p.c, p.d, u + p.e - (m.x - p.e), d + p.f - (m.y - p.f)))), i ? $a(e, i.a, i.b, i.c, i.d, i.e, i.f) : (a || o) && $a(e, 1, 0, 0, 1, a || 0, o || 0), e);
}, Yo = function(e, t, n, r, i, a) {
	var o = t._gsap, s = o.harness, c = s && s.aliases && s.aliases[n], l = c && c.indexOf(",") < 0 ? c : n, u = e._pt = new Io(e._pt, t, l, 0, 0, Wo, 0, o.set(t, l, e));
	u.u = q(o.get(t, l, a)) || 0, u.path = r, u.pp = i, e._props.push(l);
}, Xo = function(e, t) {
	return function(n) {
		return e || t !== 1 ? qa(n, e, t) : n;
	};
}, Zo = {
	version: "3.15.0",
	name: "motionPath",
	register: function(e, t, n) {
		Fo = e, q = Fo.utils.getUnit, J = Fo.utils.toArray, Lo = Fo.core.getStyleSaver, Ro = Fo.core.reverting || function() {}, Io = n;
	},
	init: function(e, t, n) {
		if (!Fo) return console.warn("Please gsap.registerPlugin(MotionPathPlugin)"), !1;
		(typeof t != "object" || t.style || !t.path) && (t = { path: t });
		var r = [], i = t, a = i.path, o = i.autoRotate, s = i.unitX, c = i.unitY, l = i.x, u = i.y, d = a[0], f = Xo(t.start, "end" in t ? t.end : 1), p, m;
		if (this.rawPaths = r, this.target = e, this.tween = n, this.styles = Lo && Lo(e, "transform"), (this.rotate = o || o === 0) && (this.rOffset = parseFloat(o) || 0, this.radians = !!t.useRadians, this.rProp = t.rotation || "rotation", this.rSet = e._gsap.set(e, this.rProp, this), this.ru = q(e._gsap.get(e, this.rProp)) || 0), Array.isArray(a) && !("closed" in a) && typeof d != "number") {
			for (m in d) !l && ~Mo.indexOf(m) ? l = m : !u && ~No.indexOf(m) && (u = m);
			for (m in l && u ? r.push(Uo(this, Bo(Bo([], a, l, 0), a, u, 1), e, l, u, f, t, s || q(a[0][l]), c || q(a[0][u]))) : l = u = 0, d) m !== l && m !== u && r.push(Uo(this, Bo([], a, m, 2), e, m, 0, f, t, q(a[0][m])));
		} else p = f(Jo(za(t.path), e, t)), Ya(p, t.resolution), r.push(p), Yo(this, e, t.x || "x", p, "x", t.unitX || "px"), Yo(this, e, t.y || "y", p, "y", t.unitY || "px");
		n.vars.immediateRender && this.render(n.progress(), this);
	},
	render: function(e, t) {
		var n = t.rawPaths, r = n.length, i = t._pt;
		if (t.tween._time || !Ro()) {
			for (e > 1 ? e = 1 : e < 0 && (e = 0); r--;) Qa(n[r], e, !r && t.rotate, n[r]);
			for (; i;) i.set(i.t, i.p, i.path[i.pp] + i.u, i.d, e), i = i._next;
			t.rotate && t.rSet(t.target, t.rProp, n[0].angle * (t.radians ? Po : 1) + t.rOffset + t.ru, t, e);
		} else t.styles.revert();
	},
	getLength: function(e) {
		return Ya(za(e)).totalLength;
	},
	sliceRawPath: qa,
	getRawPath: za,
	pointsToSegment: ro,
	stringToRawPath: to,
	rawPathToString: io,
	transformRawPath: $a,
	getGlobalMatrix: jo,
	getPositionOnPath: Qa,
	cacheRawPathMeasurements: Ya,
	convertToPath: function(e, t) {
		return J(e).map(function(e) {
			return Ga(e, t !== !1);
		});
	},
	convertCoordinates: function(e, t, n) {
		var r = jo(t, !0, !0).multiply(jo(e));
		return n ? r.apply(n) : r;
	},
	getAlignMatrix: qo,
	getRelativePosition: function(e, t, n, r) {
		var i = qo(e, t, n, r);
		return {
			x: i.e,
			y: i.f
		};
	},
	arrayToRawPath: function(e, t) {
		t ||= {};
		var n = Bo(Bo([], e, t.x || "x", 0), e, t.y || "y", 1);
		return t.relative && Ho(n), [t.type === "cubic" ? n : ro(n, t.curviness)];
	}
};
zo() && Fo.registerPlugin(Zo);
//#endregion
//#region src/diagram/svg.ts
var Qo = {
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
}, $o = {
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
}, es = "#1d2826", ts = "#4f5d5a", ns = (e) => e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function rs(e, t = 5) {
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
function is(e) {
	return e.tone ? e.tone : e.kind === "external" ? "external" : e.kind === "store" ? "data" : e.kind === "person" ? "neutral" : "core";
}
function as(e, t, n = {}) {
	let r = n.pad ?? 16, i = t.width + r * 2, a = t.height + r * 2, o = Object.keys($o).map((e) => `<marker id="arr-${e}" viewBox="0 0 8 8" refX="7.2" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0.6 L7.4 4 L0 7.4 z" fill="${$o[e].stroke}"/></marker>`).join(""), s = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${i} ${a}" class="dg" data-diagram="${ns(e.id)}" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" role="img" aria-label="${ns(e.title)}">`, `<defs>${o}</defs><g transform="translate(${r} ${r})">`];
	if (e.kind === "c4") for (let n of e.groups ?? []) {
		let e = t.groups[n.id];
		e && s.push(`<g class="dg-group" data-group="${ns(n.id)}"><rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="12" fill="none" stroke="#c5ccc9" stroke-dasharray="6 5"/><text x="${e.x + 14}" y="${e.y + 22}" class="dg-group-label" fill="${ts}" font-size="13" font-weight="600">${ns(n.label)}</text></g>`);
	}
	else for (let n of e.participants) {
		let e = t.nodes[n.id];
		s.push(`<line class="dg-lifeline" data-life="${ns(n.id)}" x1="${e.x + e.w / 2}" y1="${e.y + e.h}" x2="${e.x + e.w / 2}" y2="${t.height}" stroke="#d3d9d6" stroke-dasharray="3 4"/>`);
	}
	let c = e.kind === "c4" ? e.edges : e.messages;
	for (let n of c) {
		let r = t.edges[n.id];
		if (!r) continue;
		let i = n.style ?? "solid", { stroke: a, dash: o } = $o[i];
		if (s.push(`<g class="dg-edge" data-edge="${ns(n.id)}" data-from="${ns(n.from)}" data-to="${ns(n.to)}"><path d="${rs(r.points)}" fill="none" stroke="${a}" stroke-width="1.6"${o ? ` stroke-dasharray="${o}"` : ""} marker-end="url(#arr-${i})"/>`), n.label) {
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
			s.push(`<text class="dg-edge-label" x="${t.x}" y="${t.y}" text-anchor="middle" font-size="12" fill="${a}" paint-order="stroke" stroke="#f4f5f2" stroke-width="5">${ns(n.label)}</text>`);
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
		let r = Qo[is(e)], i = e.kind === "system";
		s.push(`<g class="dg-node" data-node="${ns(e.id)}"><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${e.kind === "person" ? 22 : 6}" fill="${r.fill}" stroke="${i ? es : r.stroke}" stroke-width="${i ? 2 : 1.4}"/><text x="${n.x + n.w / 2}" y="${n.y + (e.sub ? n.h / 2 - 3 : n.h / 2 + 5)}" text-anchor="middle" font-size="14.5" font-weight="600" fill="${es}">${ns(e.label)}</text>` + (e.sub ? `<text x="${n.x + n.w / 2}" y="${n.y + n.h / 2 + 15}" text-anchor="middle" font-size="12" fill="${ts}">${ns(e.sub)}</text>` : "") + "</g>");
	}
	return s.push("</g></svg>"), s.join("");
}
//#endregion
//#region src/DiagramStage.tsx
Vi.registerPlugin(fa, Zo);
var os = 16, ss = .2, cs = .72, ls = .9, us = (e) => `${e.x.toFixed(1)} ${e.y.toFixed(1)} ${e.w.toFixed(1)} ${e.h.toFixed(1)}`;
function ds(e, t, n) {
	let r = t.width + 32, i = t.height + 32, a = n.w / n.h, o = Math.max(e.w + 120, (e.h + 100) * a);
	o = Math.min(o, n.w / cs), o = Math.max(o, n.w / ls);
	let s = o / a, c = e.x + e.w / 2 + os, l = e.y + e.h / 2 + os;
	return {
		x: o >= r ? (r - o) / 2 : Math.min(Math.max(0, c - o / 2), r - o),
		y: s >= i ? (i - s) / 2 : Math.min(Math.max(0, l - s / 2), i - s),
		w: o,
		h: s
	};
}
function fs(e) {
	let t = Math.min(...e.map((e) => e.x)), n = Math.min(...e.map((e) => e.y)), r = Math.max(...e.map((e) => e.x + e.w)), i = Math.max(...e.map((e) => e.y + e.h));
	return {
		x: t,
		y: n,
		w: r - t,
		h: i - n
	};
}
function ps(e, t) {
	let n = (e.kind === "c4" ? e.edges : e.messages).filter((e) => t.trace.includes(e.id));
	return /* @__PURE__ */ new Set([...t.focus, ...n.flatMap((e) => [e.from, e.to])]);
}
function ms(e, t, n) {
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
	let p = (o + c) / 2 + os, m = (s + l) / 2 + os, h = Math.min(Math.max(0, p - u / 2), i - u), g = Math.min(Math.max(0, m - d / 2), a - d);
	return `${h.toFixed(1)} ${g.toFixed(1)} ${u.toFixed(1)} ${d.toFixed(1)}`;
}
function hs({ diagram: e, layout: t, portraitLayout: n, epoch: r, shot: i, shotMs: a, offsetMs: o, scrubMs: s, playing: c, onSelect: l, selected: u, view: d }) {
	let f = (0, x.useRef)(null), p = (0, x.useRef)(null), [m, h] = (0, x.useState)(null);
	(0, x.useLayoutEffect)(() => {
		let e = f.current;
		if (!e) return;
		let t = () => {
			let t = e.getBoundingClientRect();
			t.width && t.height && h((e) => e && Math.abs(e.w - t.width) < 2 && Math.abs(e.h - t.height) < 2 ? e : {
				w: t.width,
				h: t.height
			});
		};
		t();
		let n = new ResizeObserver(t);
		return n.observe(e), () => n.disconnect();
	}, []);
	let g = m && n && m.h > m.w * .9 ? n : t, _ = (0, x.useMemo)(() => as(e, g, { pad: os }), [e, g]), v = d !== void 0, y = !v && !!m && Math.min(m.w / (g.width + 32), m.h / (g.height + 32)) < cs;
	return (0, x.useLayoutEffect)(() => {
		let t = f.current?.querySelector("svg");
		if (!t || !m) return;
		let n = ps(e, i), r = n.size > 0, s = t.querySelectorAll(".dg-node, .dg-edge, .dg-group, .dg-lifeline"), l = t.querySelectorAll(".dg-edge-label");
		t.querySelectorAll(".dg-pulse").forEach((e) => e.remove());
		{
			let e = Vi.timeline({ paused: !0 }), o = (e) => g.nodes[e], c = (e) => {
				let t = g.edges[e]?.points ?? [];
				return t.length ? fs(t.map((e) => ({
					x: e.x,
					y: e.y,
					w: 1,
					h: 1
				}))) : null;
			};
			if (v) t.setAttribute("preserveAspectRatio", "xMidYMid meet");
			else if (!y) e.to(t, {
				attr: { viewBox: ms(g, n, i.trace) },
				duration: 1.3,
				ease: "power2.inOut"
			}, 0);
			else {
				t.setAttribute("preserveAspectRatio", "xMidYMid meet");
				let r = i.trace.length ? c(i.trace[0]) : null, a = [...n].map(o).filter(Boolean), s = r ?? (a.length ? fs(a) : null), l = {
					x: 0,
					y: 0,
					w: g.width,
					h: g.height
				}, u = s ? ds(s, g, m) : ds(l, g, {
					w: m.w,
					h: m.h
				}), d = Math.max((g.width + 32) / m.w, (g.height + 32) / m.h), f = {
					x: (g.width + 32 - m.w * d) / 2,
					y: (g.height + 32 - m.h * d) / 2,
					w: m.w * d,
					h: m.h * d
				};
				e.to(t, {
					attr: { viewBox: us(s ? u : f) },
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
			}) : [], h = [...s].filter((e) => !f.includes(e));
			f.length && e.to(f, {
				opacity: ss,
				duration: .6,
				ease: "power1.out"
			}, 0), h.length && e.to(h, {
				opacity: 1,
				duration: .6,
				ease: "power1.out"
			}, 0);
			let _ = i.trace.length ? Math.max(1.1, (a / 1e3 - 1.2) / i.trace.length) : 0;
			i.trace.forEach((n, r) => {
				let i = t.querySelector(`.dg-edge[data-edge="${CSS.escape(n)}"]`), a = i?.querySelector("path");
				if (!i || !a) return;
				let o = .5 + r * _, s = Math.min(.9, _ * .7);
				if (y && r > 0) {
					let r = c(n);
					if (r) {
						let i = g.edges[n].points, a = i[0], c = i[i.length - 1], l = ds(r, g, m), u = l.w >= r.w + 60 && l.h >= r.h + 60, d = u ? l : ds({
							x: a.x - 40,
							y: a.y - 40,
							w: 80,
							h: 80
						}, g, m);
						e.to(t, {
							attr: { viewBox: us(d) },
							duration: Math.min(.7, _ * .35),
							ease: "power2.inOut"
						}, o - Math.min(.7, _ * .35)), u || e.to(t, {
							attr: { viewBox: us(ds({
								x: c.x - 40,
								y: c.y - 40,
								w: 80,
								h: 80
							}, g, m)) },
							duration: s,
							ease: "power1.inOut"
						}, o);
					}
				} else if (y && r === 0) {
					let r = g.edges[n]?.points ?? [], i = c(n);
					if (i && r.length) {
						let n = ds(i, g, m);
						if (!(n.w >= i.w + 60 && n.h >= i.h + 60)) {
							let n = r[0], i = r[r.length - 1];
							e.to(t, {
								attr: { viewBox: us(ds({
									x: n.x - 40,
									y: n.y - 40,
									w: 80,
									h: 80
								}, g, m)) },
								duration: .5,
								ease: "power2.inOut"
							}, Math.max(0, o - .5)), e.to(t, {
								attr: { viewBox: us(ds({
									x: i.x - 40,
									y: i.y - 40,
									w: 80,
									h: 80
								}, g, m)) },
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
				u.setAttribute("r", "4.5"), u.setAttribute("class", "dg-pulse"), u.setAttribute("fill", a.getAttribute("stroke") ?? $o.solid.stroke), u.setAttribute("opacity", "0"), i.appendChild(u), e.set(u, { opacity: 1 }, o).to(u, {
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
			}), e.set({}, {}, Math.max(a / 1e3, e.duration())), p.current = e;
		}
		return p.current?.time(Math.max(0, o) / 1e3), c && p.current?.play(), () => {
			p.current?.kill(), p.current = null;
		};
	}, [
		_,
		i,
		a,
		o,
		r,
		m,
		y,
		v
	]), (0, x.useLayoutEffect)(() => {
		d && f.current?.querySelector("svg")?.setAttribute("viewBox", d);
	}, [
		d,
		_,
		m
	]), (0, x.useLayoutEffect)(() => {
		p.current && (c ? p.current.play() : p.current.pause());
	}, [c]), (0, x.useLayoutEffect)(() => {
		s !== void 0 && p.current?.time(s / 1e3);
	}, [s]), (0, x.useLayoutEffect)(() => {
		let e = f.current?.querySelector("svg");
		e?.querySelectorAll(".dg-node.is-selected").forEach((e) => e.classList.remove("is-selected")), u && e?.querySelector(`.dg-node[data-node="${CSS.escape(u)}"]`)?.classList.add("is-selected");
	}, [u, _]), /* @__PURE__ */ (0, S.jsx)("div", {
		ref: f,
		className: "stage-svg",
		onClick: (e) => {
			let t = e.target.closest(".dg-node");
			t?.dataset.node && l(t.dataset.node);
		},
		dangerouslySetInnerHTML: { __html: _ }
	});
}
function gs(e) {
	let t = e.split(/\s+/).filter(Boolean).length;
	return Math.max(2600, t * 380);
}
function _s(e, t) {
	return `${e.id}-${t}`;
}
function vs(e, t, n) {
	return e.map((e) => (n[_s(e, t)]?.ms ?? gs(e[t])) + 600);
}
function ys(e) {
	let t = [], n = 0;
	for (let r of e) t.push(n), n += r;
	return t;
}
function bs(e, t) {
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
function xs(e, t) {
	return e.chapters.map((n) => {
		let r = e.shots.findIndex((e) => e.chapter === n.id);
		return r === -1 ? null : {
			id: n.id,
			title: n.title,
			start: t[r]
		};
	}).filter((e) => e !== null);
}
function Ss(e) {
	let t = e.match(/[^.!?]+[.!?]*/g)?.map((e) => e.trim()).filter(Boolean) ?? [e], n = [];
	for (let e of t) {
		let t = e.split(/\s+/);
		for (let e = 0; e < t.length; e += 14) n.push(t.slice(e, e + 14).join(" "));
	}
	return n;
}
function Cs(e, t) {
	let n = e.reduce((e, t) => e + t.split(/\s+/).length, 0), r = 0;
	for (let i of e) if (r += i.split(/\s+/).length, t * n < r) return i;
	return e[e.length - 1] ?? "";
}
function ws(e) {
	let t = Math.max(0, Math.floor(e / 1e3));
	return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function Ts(e, t) {
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
var Es = [
	1,
	1.25,
	1.5,
	2,
	.75
], Ds = "(max-width: 700px), (max-height: 500px) and (orientation: landscape)";
function Os() {
	let e = typeof window < "u", t = e && new URLSearchParams(location.search).get("watch") === "1", [n, r] = (0, x.useState)(() => e && (t || matchMedia(Ds).matches));
	return (0, x.useEffect)(() => {
		if (t || !e) return;
		let n = matchMedia(Ds);
		r(n.matches);
		let i = () => r(n.matches);
		return n.addEventListener("change", i), () => n.removeEventListener("change", i);
	}, [t, e]), n;
}
function ks(e) {
	let { w: t, chapters: n, time: r, total: i } = e, [a, o] = (0, x.useState)(null), s = (0, x.useRef)(null), c = Math.max(0, n.findLastIndex((e) => e.start <= r)), l = n[c], u = e.nav?.next, d = (t) => e.nav?.open(_(t)), f = r > 0 || e.playing || !!e.clip, p = !e.playing && !e.clip && r >= i - 2;
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
	}, { words: C, said: w } = Ts(Ss(e.text), e.spoken), T = l ? `${c + 1} · ${l.title}` : t.subtitle ?? "";
	return /* @__PURE__ */ (0, S.jsxs)("div", {
		className: `watch${e.clip ? " is-clip" : ""}`,
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
				}), e.clip ? null : /* @__PURE__ */ (0, S.jsxs)("button", {
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
			}) : !e.playing && !e.clip ? /* @__PURE__ */ (0, S.jsxs)("div", {
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
			}) : null : /* @__PURE__ */ (0, S.jsxs)("div", {
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
						ws(i)
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
					f && !p && !e.clip && l && v.has(l.id) && e.nav?.links.length ? /* @__PURE__ */ (0, S.jsx)("div", {
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
					e.clip ? null : /* @__PURE__ */ (0, S.jsxs)("div", {
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
									ws(r),
									" / ",
									ws(i)
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
								onClick: () => e.setSpeed(Es[(Es.indexOf(e.speed) + 1) % Es.length]),
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
							/* @__PURE__ */ (0, S.jsx)("small", { children: ws(t.start) })
						]
					}, t.id))] }) : /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [(e.nav?.groups ?? []).map((e) => /* @__PURE__ */ (0, S.jsxs)("section", { children: [/* @__PURE__ */ (0, S.jsx)("h2", { children: e.title }), e.items.map(({ topic: e, note: t }) => /* @__PURE__ */ (0, S.jsxs)("button", {
						onClick: () => {
							o(null), d(e);
						},
						children: [/* @__PURE__ */ (0, S.jsx)("img", {
							src: h(`/thumbs/${e.id}.svg`),
							alt: "",
							loading: "lazy"
						}), /* @__PURE__ */ (0, S.jsxs)("span", { children: [e.title, /* @__PURE__ */ (0, S.jsx)("small", { children: t ?? [e.meta?.category, ws(e.ms.engineer)].filter(Boolean).join(" · ") })] })]
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
var As = [
	.75,
	1,
	1.25,
	1.5,
	2
];
function js({ walkthrough: e, manifest: n, layouts: r, nav: i, autoplay: a = !1, startAt: o = 0, startChapter: s, onProgress: c, frame: l, view: u, initialDepth: d = "engineer" }) {
	let f = Os(), p = l !== void 0, [m, g] = (0, x.useState)(d), y = (0, x.useMemo)(() => vs(e.shots, m, n), [
		e.shots,
		m,
		n
	]), b = (0, x.useMemo)(() => ys(y), [y]), w = b[b.length - 1] + y[y.length - 1], T = (0, x.useMemo)(() => xs(e, b), [e, b]), [E, D] = (0, x.useState)(0), [O, k] = (0, x.useState)(a), A = p ? Math.max(0, Math.min(w - 1, l)) : E, j = !p && O, [M, N] = (0, x.useState)(1), [P, F] = (0, x.useState)(!0), [ee, te] = (0, x.useState)(null), [ne, I] = (0, x.useState)({
		index: 0,
		offset: 0,
		epoch: 0
	}), L = (0, x.useRef)(null), re = (0, x.useRef)(null), ie = (0, x.useRef)({
		time: 0,
		last: 0
	}), { index: R, offset: ae } = bs(A, y), oe = (0, x.useRef)(null);
	p && oe.current?.index !== R && (oe.current = {
		index: R,
		offset: oe.current ? 0 : ae
	});
	let se = p && oe.current ? {
		...oe.current,
		epoch: 0
	} : ne, ce = e.shots[R], le = ce.diagram ?? e.shots.slice(0, R).reverse().find((e) => e.diagram)?.diagram ?? e.diagrams[0].id, ue = e.diagrams.find((e) => e.id === le), de = n[_s(ce, m)], z = (0, x.useCallback)((e) => {
		let t = Math.max(0, Math.min(w - 1, e));
		ie.current.time = t, D(t);
		let n = bs(t, y);
		I((e) => ({
			index: n.index,
			offset: n.offset,
			epoch: e.epoch + 1
		}));
	}, [y, w]);
	(0, x.useEffect)(() => {
		let e = s ? T.find((e) => e.id === s) : void 0, t = e ? e.start + 1 : o > 5e3 && o < w - 5e3 ? o : 0;
		t && z(t);
	}, []);
	let B = (0, x.useRef)(0);
	(0, x.useEffect)(() => {
		c && (Math.abs(A - B.current) > 3e3 || !j) && (B.current = A, c(A, w));
	}, [
		A,
		j,
		w,
		c
	]), (0, x.useEffect)(() => {
		let e = L.current;
		if (!e) return;
		if (!de) {
			e.removeAttribute("src");
			return;
		}
		e.src.endsWith(de.file) || (e.src = h(de.file));
		let t = se.index === R ? se.offset : 0;
		t < de.ms && (e.currentTime = t / 1e3), e.playbackRate = M, j && t < de.ms && e.play().catch(() => void 0);
	}, [
		R,
		m,
		se.epoch,
		de?.file
	]), (0, x.useEffect)(() => {
		L.current && (L.current.playbackRate = M);
	}, [M]), (0, x.useEffect)(() => {
		let e = L.current;
		e && de && (j && ae < de.ms ? e.play().catch(() => void 0) : e.pause());
	}, [j]), (0, x.useEffect)(() => {
		if (!j) return;
		let t = 0;
		ie.current.last = performance.now();
		let r = (i) => {
			let a = i - ie.current.last;
			ie.current.last = i;
			let o = bs(ie.current.time, y), s = L.current, c = n[_s(e.shots[o.index], m)], l;
			l = s && c && s.src.endsWith(c.file) && !s.paused && !s.ended ? b[o.index] + s.currentTime * 1e3 : ie.current.time + a * M;
			let u = bs(l, y);
			u.index !== o.index && I((e) => ({
				index: u.index,
				offset: 0,
				epoch: e.epoch
			})), l >= w ? (ie.current.time = w, D(w - 1), k(!1)) : (ie.current.time = l, D(l), t = requestAnimationFrame(r));
		};
		return t = requestAnimationFrame(r), () => cancelAnimationFrame(t);
	}, [
		j,
		y,
		b,
		w,
		M,
		m,
		n,
		e.shots
	]);
	let fe = (t) => {
		if (t === m) return;
		let r = R;
		g(t);
		let i = ys(vs(e.shots, t, n));
		ie.current.time = i[r], D(i[r]), I((e) => ({
			index: r,
			offset: 0,
			epoch: e.epoch + 1
		}));
	}, pe = (0, x.useCallback)(() => {
		!j && A >= w - 2 && z(0), te(null), k((e) => !e);
	}, [
		j,
		A,
		w,
		z
	]);
	(0, x.useEffect)(() => {
		let t = (t) => {
			t.target.tagName !== "SELECT" && (t.key === " " ? (t.preventDefault(), pe()) : t.key === "ArrowRight" ? z(ie.current.time + 1e4) : t.key === "ArrowLeft" ? z(ie.current.time - 1e4) : t.key === "." ? z(b[Math.min(R + 1, e.shots.length - 1)]) : t.key === "," ? z(b[Math.max(R - 1, 0)]) : t.key === "c" && F((e) => !e));
		};
		return window.addEventListener("keydown", t), () => window.removeEventListener("keydown", t);
	}, [
		pe,
		z,
		b,
		R,
		e.shots.length
	]);
	let me = ce[m], he = de ? Math.min(1, ae / de.ms) : Math.min(1, ae / y[R]), ge = Cs(Ss(me), he), V = [...T].reverse().find((e) => e.start <= A);
	(0, x.useEffect)(() => {
		let e = re.current, t = e?.querySelector("button.on");
		e && t && e.scrollWidth > e.clientWidth && e.scrollTo({
			left: t.offsetLeft - e.clientWidth / 2 + t.clientWidth / 2,
			behavior: "smooth"
		});
	}, [V?.id]);
	let _e = ee ? e.shots.map((e, t) => ({
		s: e,
		i: t
	})).filter(({ s: e }) => e.focus.includes(ee)) : [], ve = ee && (ue.kind === "c4" ? ue.elements.find((e) => e.id === ee)?.label : ue.participants.find((e) => e.id === ee)?.label), ye = !ce.card && ue.kind === "c4" && ue.legend?.length ? /* @__PURE__ */ (0, S.jsx)("div", {
		className: "legend",
		"aria-label": "Legend",
		children: ue.legend.map((e) => /* @__PURE__ */ (0, S.jsxs)("span", {
			style: { color: $o[e.style].stroke },
			children: [/* @__PURE__ */ (0, S.jsx)("svg", {
				viewBox: "0 0 34 8",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, S.jsx)("line", {
					x1: "0",
					y1: "4",
					x2: "34",
					y2: "4",
					stroke: $o[e.style].stroke,
					strokeWidth: "2",
					strokeDasharray: $o[e.style].dash || void 0
				})
			}), e.label]
		}, e.label))
	}) : null, be = i && V && v.has(V.id) ? i.links : [], xe = ce.card ? /* @__PURE__ */ (0, S.jsx)(C, {
		card: ce.card,
		shotMs: y[R],
		offsetMs: p ? ae : se.index === R ? se.offset : 0,
		playing: j,
		epoch: se.epoch * 1e3 + R
	}) : /* @__PURE__ */ (0, S.jsx)(hs, {
		diagram: ue,
		layout: r[ue.id],
		portraitLayout: r[`${ue.id}${t}`],
		epoch: se.epoch,
		shot: ce,
		shotMs: y[R],
		offsetMs: se.index === R ? se.offset : 0,
		scrubMs: p ? ae : void 0,
		view: p ? u : void 0,
		playing: j,
		selected: ee,
		onSelect: (e) => {
			j || te((t) => t === e ? null : e);
		}
	}, ue.id), Se = !j && ee ? /* @__PURE__ */ (0, S.jsxs)("aside", {
		className: "explore",
		onClick: (e) => e.stopPropagation(),
		children: [/* @__PURE__ */ (0, S.jsx)("strong", { children: ve }), _e.length ? /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [/* @__PURE__ */ (0, S.jsx)("span", { children: "Explained in:" }), _e.map(({ s: e, i: t }) => /* @__PURE__ */ (0, S.jsxs)("button", {
			onClick: () => z(b[t]),
			children: [
				ws(b[t]),
				" · ",
				e[m].slice(0, 70),
				"…"
			]
		}, e.id))] }) : /* @__PURE__ */ (0, S.jsx)("span", { children: "Not the focus of any shot in this walkthrough." })]
	}) : null, Ce = p ? null : /* @__PURE__ */ (0, S.jsx)("audio", {
		ref: L,
		preload: "auto"
	});
	return f ? /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [/* @__PURE__ */ (0, S.jsx)(ks, {
		w: e,
		nav: i,
		stage: xe,
		depth: m,
		onDepth: fe,
		time: A,
		total: w,
		playing: j,
		toggle: pe,
		seek: z,
		chapters: T,
		text: me,
		spoken: he,
		captions: P,
		setCaptions: F,
		speed: M,
		setSpeed: N,
		explore: Se,
		clip: p
	}), Ce] }) : /* @__PURE__ */ (0, S.jsxs)("div", {
		className: `player${p ? " is-clip" : ""}`,
		children: [
			/* @__PURE__ */ (0, S.jsxs)("header", {
				className: "player-head",
				children: [/* @__PURE__ */ (0, S.jsxs)("div", { children: [/* @__PURE__ */ (0, S.jsx)("h1", { children: e.title }), /* @__PURE__ */ (0, S.jsxs)("p", { children: [
					V?.title,
					" · ",
					ce.card ? ce.card.heading : ue.title
				] })] }), /* @__PURE__ */ (0, S.jsx)("div", {
					className: "depth",
					role: "group",
					"aria-label": "Depth",
					children: ["executive", "engineer"].map((e) => /* @__PURE__ */ (0, S.jsx)("button", {
						className: e === m ? "on" : "",
						onClick: () => fe(e),
						children: e === "engineer" ? "Engineer" : "Executive"
					}, e))
				})]
			}),
			/* @__PURE__ */ (0, S.jsxs)("div", {
				className: "stage",
				onClick: () => j ? pe() : void 0,
				children: [
					xe,
					ye,
					P && ge ? /* @__PURE__ */ (0, S.jsx)("div", {
						className: "subtitle",
						children: ge
					}) : null,
					!j && !p ? /* @__PURE__ */ (0, S.jsx)("button", {
						className: "big-play",
						onClick: pe,
						"aria-label": A > 0 ? "Resume" : "Play",
						children: "▶"
					}) : null,
					Se,
					!j && !p && !ee && A > 0 && !ce.card ? /* @__PURE__ */ (0, S.jsx)("div", {
						className: "hint",
						children: "Paused · click any part of the diagram to explore it"
					}) : null
				]
			}),
			be.length && !p ? /* @__PURE__ */ (0, S.jsxs)("div", {
				className: "topic-chips",
				children: [/* @__PURE__ */ (0, S.jsx)("span", { children: V?.id === "patterns" ? "Watch the patterns" : "Watch next" }), be.map((e) => /* @__PURE__ */ (0, S.jsxs)("a", {
					href: _(e),
					onClick: (t) => {
						t.preventDefault(), i?.open(_(e));
					},
					children: [e.title, " ›"]
				}, e.id))]
			}) : null,
			p ? null : /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: [/* @__PURE__ */ (0, S.jsxs)("div", {
				className: "controls",
				children: [
					/* @__PURE__ */ (0, S.jsx)("button", {
						onClick: pe,
						"aria-label": j ? "Pause" : "Play",
						children: j ? "❚❚" : "▶"
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						onClick: () => z(b[Math.max(R - 1, 0)]),
						"aria-label": "Previous shot",
						children: "⏮"
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						className: "skip10",
						onClick: () => z(A - 1e4),
						"aria-label": "Back 10 seconds",
						children: "−10"
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						className: "skip10",
						onClick: () => z(A + 1e4),
						"aria-label": "Forward 10 seconds",
						children: "+10"
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						onClick: () => z(b[Math.min(R + 1, e.shots.length - 1)]),
						"aria-label": "Next shot",
						children: "⏭"
					}),
					/* @__PURE__ */ (0, S.jsxs)("div", {
						className: "scrub",
						children: [/* @__PURE__ */ (0, S.jsx)("input", {
							type: "range",
							min: 0,
							max: w,
							step: 100,
							value: A,
							onChange: (e) => z(Number(e.target.value)),
							"aria-label": "Position"
						}), T.map((e) => /* @__PURE__ */ (0, S.jsx)("button", {
							className: "mark",
							style: { left: `${e.start / w * 100}%` },
							title: e.title,
							onClick: () => z(e.start)
						}, e.id))]
					}),
					/* @__PURE__ */ (0, S.jsxs)("span", {
						className: "time",
						children: [
							ws(A),
							" / ",
							ws(w)
						]
					}),
					/* @__PURE__ */ (0, S.jsx)("select", {
						value: M,
						onChange: (e) => N(Number(e.target.value)),
						"aria-label": "Speed",
						children: As.map((e) => /* @__PURE__ */ (0, S.jsxs)("option", {
							value: e,
							children: [e, "×"]
						}, e))
					}),
					/* @__PURE__ */ (0, S.jsx)("button", {
						className: P ? "on" : "",
						onClick: () => F((e) => !e),
						"aria-label": "Subtitles",
						children: "CC"
					})
				]
			}), /* @__PURE__ */ (0, S.jsx)("nav", {
				className: "chapters",
				ref: re,
				children: T.map((e) => /* @__PURE__ */ (0, S.jsxs)("button", {
					className: V?.id === e.id ? "on" : "",
					onClick: () => z(e.start),
					children: [
						/* @__PURE__ */ (0, S.jsx)("span", { children: ws(e.start) }),
						" ",
						e.title
					]
				}, e.id))
			})] }),
			Ce
		]
	});
}
//#endregion
//#region src/lib/element.tsx
var Ms = async (e, t) => {
	try {
		let n = await fetch(e);
		return n.ok ? await n.json() : t;
	} catch {
		return t;
	}
}, Ns = class extends HTMLElement {
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
		let n = await Ms(e, null);
		if (!n) return;
		let r = this.getAttribute("layouts"), i = r ? await Ms(r, {}) : await (await import("./layout-Cr5qKKGn.js")).layoutWalkthrough(n), a = await Ms(this.getAttribute("manifest") ?? `${t}/audio/${n.id}/manifest.json`, {});
		this.root.render(/* @__PURE__ */ (0, S.jsx)(js, {
			walkthrough: n,
			layouts: i,
			manifest: a
		}, n.id));
	}
};
customElements.get("design-player") || customElements.define("design-player", Ns);
//#endregion
export { Ns as DesignPlayerElement };
