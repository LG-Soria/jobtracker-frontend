(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/apiClient.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Centralized HTTP client used across the app.
// Enforces cookies on every request and notifies a global handler on 401s.
__turbopack_context__.s([
    "API_URL",
    ()=>API_URL,
    "ApiError",
    ()=>ApiError,
    "apiFetch",
    ()=>apiFetch,
    "setUnauthorizedHandler",
    ()=>setUnauthorizedHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_URL = ("TURBOPACK compile-time value", "http://localhost:3000") || 'http://localhost:3000';
let unauthorizedHandler = null;
function setUnauthorizedHandler(handler) {
    unauthorizedHandler = handler;
}
class ApiError extends Error {
    status;
    data;
}
function buildUrl(path) {
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
}
function mergeHeaders(base, extra) {
    const headers = new Headers(base);
    if (extra) {
        new Headers(extra).forEach((value, key)=>{
            headers.set(key, value);
        });
    }
    return headers;
}
function parseBody(text) {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch  {
        return text;
    }
}
async function apiFetch(path, options = {}) {
    const { skipAuthHandling, headers, ...init } = options;
    const response = await fetch(buildUrl(path), {
        credentials: 'include',
        cache: 'no-store',
        headers: mergeHeaders({
            'Content-Type': 'application/json'
        }, headers),
        ...init
    });
    const rawBody = await response.text();
    const data = parseBody(rawBody);
    if (response.status === 401 && !skipAuthHandling && unauthorizedHandler) {
        await unauthorizedHandler();
    }
    if (!response.ok) {
        const message = typeof data === 'string' ? data : data?.message || 'Error en la solicitud';
        const error = new ApiError(message);
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/apiClient.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function useAuthContext() {
    _s();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return ctx;
}
_s(useAuthContext, "/dMy7t63NXD4eYACoT93CePwGrg=");
function AuthProvider({ children }) {
    _s1();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoadingSession, setIsLoadingSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const handleUnauthorized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[handleUnauthorized]": async ()=>{
            // Session expired or invalid: clear client state and bounce to login.
            setUser(null);
            setIsLoadingSession(false);
            const currentPath = ("TURBOPACK compile-time truthy", 1) ? `${window.location.pathname}${window.location.search}` : "TURBOPACK unreachable";
            if (!pathname.startsWith('/login')) {
                router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
            }
        }
    }["AuthProvider.useCallback[handleUnauthorized]"], [
        pathname,
        router
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setUnauthorizedHandler"])(handleUnauthorized);
            return ({
                "AuthProvider.useEffect": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setUnauthorizedHandler"])(null)
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], [
        handleUnauthorized
    ]);
    const fetchCurrentUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[fetchCurrentUser]": async ()=>{
            const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])('/auth/me');
            setUser(me);
        }
    }["AuthProvider.useCallback[fetchCurrentUser]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            let cancelled = false;
            async function bootstrap() {
                try {
                    await fetchCurrentUser();
                } catch (error) {
                    if (!cancelled) {
                        setUser(null);
                    }
                } finally{
                    if (!cancelled) {
                        setIsLoadingSession(false);
                    }
                }
            }
            void bootstrap();
            return ({
                "AuthProvider.useEffect": ()=>{
                    cancelled = true;
                }
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], [
        fetchCurrentUser
    ]);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[login]": async (email, password, redirectTo = '/dashboard')=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password
                })
            });
            await fetchCurrentUser();
            router.push(redirectTo);
        }
    }["AuthProvider.useCallback[login]"], [
        fetchCurrentUser,
        router
    ]);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[logout]": async ()=>{
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apiClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])('/auth/logout', {
                    method: 'POST'
                });
            } finally{
                setUser(null);
                router.push('/login');
            }
        }
    }["AuthProvider.useCallback[logout]"], [
        router
    ]);
    const refreshSession = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[refreshSession]": async ()=>{
            await fetchCurrentUser();
        }
    }["AuthProvider.useCallback[refreshSession]"], [
        fetchCurrentUser
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AuthProvider.useMemo[value]": ()=>({
                user,
                isAuthenticated: Boolean(user),
                isLoadingSession,
                login,
                logout,
                refreshSession
            })
    }["AuthProvider.useMemo[value]"], [
        isLoadingSession,
        login,
        logout,
        refreshSession,
        user
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/AuthContext.tsx",
        lineNumber: 127,
        columnNumber: 10
    }, this);
}
_s1(AuthProvider, "jm45N7k9L03753D7CBFVNVXCMl4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = AuthProvider;
function useAuth() {
    _s2();
    return useAuthContext();
}
_s2(useAuth, "BR1i9Fg1bIbwPO0SJiHlKOGIma4=", false, function() {
    return [
        useAuthContext
    ];
});
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_f66fb232._.js.map