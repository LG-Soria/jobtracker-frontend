(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__f2b15f93._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
const AUTH_COOKIE = 'auth_token';
const PUBLIC_PATHS = [
    '/',
    '/login'
];
const PROTECTED_PREFIXES = [
    '/dashboard',
    '/applications'
];
function isPublicPath(pathname) {
    return PUBLIC_PATHS.some((path)=>pathname === path || pathname.startsWith(`${path}/`));
}
function isProtectedPath(pathname) {
    if (isPublicPath(pathname)) return false;
    if (PROTECTED_PREFIXES.some((path)=>pathname === path || pathname.startsWith(`${path}/`))) {
        return true;
    }
    // Treat any other app route (non-asset, non-API) as private by default.
    return true;
}
function middleware(req) {
    const { pathname, search } = req.nextUrl;
    const hasAuthCookie = Boolean(req.cookies.get(AUTH_COOKIE));
    if (isPublicPath(pathname)) {
        if (hasAuthCookie && pathname.startsWith('/login')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/dashboard', req.url));
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    if (isProtectedPath(pathname) && !hasAuthCookie) {
        const loginUrl = new URL('/login', req.url);
        const redirectTarget = `${pathname}${search}`;
        if (redirectTarget !== '/') {
            loginUrl.searchParams.set('redirectTo', redirectTarget);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    // Skip assets and API routes; run only on relevant app paths.
    matcher: [
        '/((?!api|_next/static|_next/image|_next/data|favicon.ico|static|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|css|js|map)$).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__f2b15f93._.js.map