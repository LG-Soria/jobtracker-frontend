module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/types/jobApplication.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Specification: Types for job applications shared in the frontend.
// Defines JobStatus and JobApplication aligned with backend API payloads.
__turbopack_context__.s([
    "JobStatus",
    ()=>JobStatus
]);
var JobStatus = /*#__PURE__*/ function(JobStatus) {
    JobStatus["ENVIADA"] = "enviada";
    JobStatus["EN_PROCESO"] = "en proceso";
    JobStatus["ENTREVISTA"] = "entrevista";
    JobStatus["RECHAZADA"] = "rechazada";
    JobStatus["SIN_RESPUESTA"] = "sin respuesta";
    return JobStatus;
}({});
}),
"[project]/src/utils/dateOnly.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Helpers to treat date-only strings ("YYYY-MM-DD") as midnight UTC consistently
__turbopack_context__.s([
    "dateKeyUTC",
    ()=>dateKeyUTC,
    "formatDateOnlyUTC",
    ()=>formatDateOnlyUTC,
    "parseDateOnlyUTC",
    ()=>parseDateOnlyUTC
]);
const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;
function parseDateOnlyUTC(value) {
    if (!value) throw new Error('Fecha invalida');
    const match = DATE_REGEX.exec(value);
    if (!match) throw new Error(`Fecha invalida: "${value}"`);
    const [, y, m, d] = match;
    return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
}
function formatDateOnlyUTC(value, locale = 'es-ES') {
    const date = parseDateOnlyUTC(value);
    return date.toLocaleDateString(locale, {
        timeZone: 'UTC'
    });
}
function dateKeyUTC(value) {
    const date = parseDateOnlyUTC(value);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
}),
"[project]/src/components/job-applications/ListadoPostulaciones.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ListadoPostulaciones",
    ()=>ListadoPostulaciones
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// Specification: Table listing job applications with basic filters and actions.
// Renders list grouped by fecha seleccionada, with status change, delete action, and friendly states.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/jobApplication.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$dateOnly$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/dateOnly.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const statusOptions = [
    'all',
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].ENVIADA,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].EN_PROCESO,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].ENTREVISTA,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].RECHAZADA,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].SIN_RESPUESTA
];
const dateRangeOptions = [
    {
        value: 'all',
        label: 'Todas'
    },
    {
        value: '7d',
        label: 'Ultimos 7 dias'
    },
    {
        value: '30d',
        label: 'Ultimos 30 dias'
    }
];
const formatStatusLabel = (status)=>status.charAt(0).toUpperCase() + status.slice(1);
function ListadoPostulaciones({ applications, loading = false, error = null, filters, onChangeStatus, onDelete, onRetry, success = null }) {
    const sorted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...applications
        ].sort((a, b)=>{
            const createdDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (createdDiff !== 0) return createdDiff;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$dateOnly$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDateOnlyUTC"])(b.applicationDate).getTime() - (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$dateOnly$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDateOnlyUTC"])(a.applicationDate).getTime();
        }), [
        applications
    ]);
    const uniqueDates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const dateSet = new Set();
        sorted.forEach((app)=>dateSet.add((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$dateOnly$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dateKeyUTC"])(app.applicationDate)));
        return Array.from(dateSet).sort((a, b)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$dateOnly$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDateOnlyUTC"])(b).getTime() - (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$dateOnly$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDateOnlyUTC"])(a).getTime());
    }, [
        sorted
    ]);
    const [selectedDate, setSelectedDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(uniqueDates[0] ?? null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!uniqueDates.length) {
            setSelectedDate(null);
            return;
        }
        if (!selectedDate || !uniqueDates.includes(selectedDate)) {
            setSelectedDate(uniqueDates[0]);
        }
    }, [
        uniqueDates,
        selectedDate
    ]);
    const appsForSelectedDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!selectedDate) return [];
        return sorted.filter((app)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$dateOnly$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dateKeyUTC"])(app.applicationDate) === selectedDate);
    }, [
        selectedDate,
        sorted
    ]);
    const handleStatusChange = async (id, status)=>{
        await onChangeStatus(id, status);
    };
    const handleDelete = async (id)=>{
        await onDelete(id);
    };
    const handlePrevDate = ()=>{
        if (!selectedDate) return;
        const idx = uniqueDates.indexOf(selectedDate);
        if (idx === -1 || idx === uniqueDates.length - 1) return;
        setSelectedDate(uniqueDates[idx + 1]);
    };
    const handleNextDate = ()=>{
        if (!selectedDate) return;
        const idx = uniqueDates.indexOf(selectedDate);
        if (idx <= 0) return;
        setSelectedDate(uniqueDates[idx - 1]);
    };
    const isPrevDisabled = !selectedDate || uniqueDates.indexOf(selectedDate) === uniqueDates.length - 1;
    const isNextDisabled = !selectedDate || uniqueDates.indexOf(selectedDate) <= 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-slate-900",
                                        children: "Postulaciones en curso"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                        lineNumber: 123,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-slate-600",
                                        children: "Seguimiento de tus oportunidades y proximos pasos"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                        lineNumber: 124,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                lineNumber: 122,
                                columnNumber: 11
                            }, this),
                            selectedDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "rounded-md border border-slate-200 px-2 py-1 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50",
                                        onClick: handlePrevDate,
                                        disabled: isPrevDisabled || loading,
                                        type: "button",
                                        "aria-label": "Ver fecha anterior",
                                        children: "←"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                        lineNumber: 128,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold",
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$dateOnly$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDateOnlyUTC"])(selectedDate)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                        lineNumber: 137,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "rounded-md border border-slate-200 px-2 py-1 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50",
                                        onClick: handleNextDate,
                                        disabled: isNextDisabled || loading,
                                        type: "button",
                                        "aria-label": "Ver fecha siguiente",
                                        children: "→"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                        lineNumber: 138,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                lineNumber: 127,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none",
                                value: filters.status,
                                onChange: (e)=>filters.setStatus(e.target.value),
                                children: statusOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: opt,
                                        children: opt === 'all' ? 'Todos los estados' : formatStatusLabel(opt)
                                    }, opt, false, {
                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                        lineNumber: 157,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                lineNumber: 151,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "rounded-lg border border-slate-200 px-3 pr-8 py-2 text-sm focus:border-slate-400 focus:outline-none",
                                value: filters.dateRange,
                                onChange: (e)=>filters.setDateRange(e.target.value),
                                children: dateRangeOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: opt.value,
                                        children: opt.label
                                    }, opt.value, false, {
                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                        lineNumber: 168,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                lineNumber: 162,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                        lineNumber: 150,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 text-sm text-slate-600",
                children: "Cargando tus postulaciones..."
            }, void 0, false, {
                fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                lineNumber: 177,
                columnNumber: 9
            }, this) : error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                        lineNumber: 180,
                        columnNumber: 11
                    }, this),
                    onRetry ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "mt-2 rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white",
                        onClick: onRetry,
                        children: "Reintentar"
                    }, void 0, false, {
                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                        lineNumber: 182,
                        columnNumber: 13
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                lineNumber: 179,
                columnNumber: 9
            }, this) : sorted.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-600",
                children: "No hay postulaciones aun. Registra la primera y empecemos a medir tu avance."
            }, void 0, false, {
                fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                lineNumber: 191,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 overflow-x-auto",
                children: [
                    success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700",
                        children: success
                    }, void 0, false, {
                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                        lineNumber: 197,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        className: "min-w-full text-left text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "border-b border-slate-200 text-xs uppercase text-slate-500",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-3 py-2",
                                            children: "Empresa"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                            lineNumber: 204,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-3 py-2",
                                            children: "Puesto"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                            lineNumber: 205,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-3 py-2",
                                            children: "Estado"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                            lineNumber: 206,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-3 py-2",
                                            children: "Fuente"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                            lineNumber: 207,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-3 py-2 text-right",
                                            children: "Acciones"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                            lineNumber: 208,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "w-12 px-3 py-2"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                            lineNumber: 209,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                    lineNumber: 203,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                lineNumber: 202,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: selectedDate ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                colSpan: 6,
                                                className: "bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$dateOnly$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDateOnlyUTC"])(selectedDate)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                lineNumber: 216,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                            lineNumber: 215,
                                            columnNumber: 19
                                        }, this),
                                        appsForSelectedDate.map((app)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "border-b border-slate-100 text-slate-800",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-3 py-2",
                                                        children: app.company
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                        lineNumber: 225,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-3 py-2",
                                                        children: app.position
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                        lineNumber: 226,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-3 py-2",
                                                        children: app.status
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                        lineNumber: 227,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-3 py-2",
                                                        children: app.source
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                        lineNumber: 228,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-3 py-2 text-right",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            className: "rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-slate-400 focus:outline-none",
                                                            value: app.status,
                                                            onChange: (e)=>handleStatusChange(app.id, e.target.value),
                                                            disabled: loading,
                                                            children: Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"]).map((status)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: status,
                                                                    children: formatStatusLabel(status)
                                                                }, status, false, {
                                                                    fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                                    lineNumber: 237,
                                                                    columnNumber: 29
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                            lineNumber: 230,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                        lineNumber: 229,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-3 py-2 text-center",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60",
                                                            onClick: ()=>handleDelete(app.id),
                                                            disabled: loading,
                                                            type: "button",
                                                            "aria-label": "Eliminar postulacion",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                xmlns: "http://www.w3.org/2000/svg",
                                                                className: "h-4 w-4",
                                                                viewBox: "0 0 24 24",
                                                                fill: "none",
                                                                stroke: "currentColor",
                                                                strokeWidth: "2",
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round",
                                                                "aria-hidden": "true",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        d: "M3 6h18"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                                        lineNumber: 262,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        d: "M8 6V4h8v2"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                                        lineNumber: 263,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        d: "M10 11v6"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                                        lineNumber: 264,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        d: "M14 11v6"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                                        lineNumber: 265,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        d: "M5 6l1 14h12l1-14"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                                        lineNumber: 266,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                                lineNumber: 251,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                            lineNumber: 244,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                        lineNumber: 243,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, app.id, true, {
                                                fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                                lineNumber: 224,
                                                columnNumber: 21
                                            }, this))
                                    ]
                                }, void 0, true) : null
                            }, void 0, false, {
                                fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                                lineNumber: 212,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                        lineNumber: 201,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
                lineNumber: 195,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/job-applications/ListadoPostulaciones.tsx",
        lineNumber: 119,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/job-applications/MetricCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Specification: Presentational card for a single metric value.
// Renders a title, main value, and optional hint text with Tailwind styling.
__turbopack_context__.s([
    "MetricCard",
    ()=>MetricCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function MetricCard({ title, value, hint }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-medium text-slate-600",
                children: title
            }, void 0, false, {
                fileName: "[project]/src/components/job-applications/MetricCard.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 text-3xl font-semibold text-slate-900",
                children: value
            }, void 0, false, {
                fileName: "[project]/src/components/job-applications/MetricCard.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            hint ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1 text-sm text-slate-500",
                children: hint
            }, void 0, false, {
                fileName: "[project]/src/components/job-applications/MetricCard.tsx",
                lineNumber: 15,
                columnNumber: 15
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/job-applications/MetricCard.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/job-applications/MetricsSection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Specification: Metrics section aggregating MetricCard components.
// Computes key metrics from job applications and renders them in a responsive grid.
__turbopack_context__.s([
    "MetricsSection",
    ()=>MetricsSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/jobApplication.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$dateOnly$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/dateOnly.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$job$2d$applications$2f$MetricCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/job-applications/MetricCard.tsx [app-ssr] (ecmascript)");
;
;
;
;
function MetricsSection({ applications }) {
    const total = applications.length;
    const nowMs = Date.now();
    const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;
    const last7Days = applications.filter((app)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$dateOnly$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDateOnlyUTC"])(app.applicationDate).getTime() >= sevenDaysAgoMs).length;
    const statusCounts = applications.reduce((acc, app)=>{
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].ENVIADA]: 0,
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].EN_PROCESO]: 0,
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].ENTREVISTA]: 0,
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].RECHAZADA]: 0,
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].SIN_RESPUESTA]: 0
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$job$2d$applications$2f$MetricCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MetricCard"], {
                title: "Total postulaciones",
                value: total,
                hint: "Todo tu esfuerzo acumulado"
            }, void 0, false, {
                fileName: "[project]/src/components/job-applications/MetricsSection.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$job$2d$applications$2f$MetricCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MetricCard"], {
                title: "Últimos 7 días",
                value: last7Days,
                hint: "Actividad reciente que suma"
            }, void 0, false, {
                fileName: "[project]/src/components/job-applications/MetricsSection.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$job$2d$applications$2f$MetricCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MetricCard"], {
                title: "Enviadas",
                value: statusCounts[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].ENVIADA],
                hint: "Pendientes de respuesta"
            }, void 0, false, {
                fileName: "[project]/src/components/job-applications/MetricsSection.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$job$2d$applications$2f$MetricCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MetricCard"], {
                title: "En proceso",
                value: statusCounts[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].EN_PROCESO],
                hint: "Seguimiento activo"
            }, void 0, false, {
                fileName: "[project]/src/components/job-applications/MetricsSection.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$job$2d$applications$2f$MetricCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MetricCard"], {
                title: "Entrevista",
                value: statusCounts[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].ENTREVISTA],
                hint: "Agendar y preparar"
            }, void 0, false, {
                fileName: "[project]/src/components/job-applications/MetricsSection.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$job$2d$applications$2f$MetricCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MetricCard"], {
                title: "Rechazadas",
                value: statusCounts[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].RECHAZADA],
                hint: "Aprendizajes recientes"
            }, void 0, false, {
                fileName: "[project]/src/components/job-applications/MetricsSection.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$job$2d$applications$2f$MetricCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MetricCard"], {
                title: "Sin respuesta",
                value: statusCounts[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$jobApplication$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JobStatus"].SIN_RESPUESTA],
                hint: "Considerar follow-up"
            }, void 0, false, {
                fileName: "[project]/src/components/job-applications/MetricsSection.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/job-applications/MetricsSection.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/services/jobApplicationsApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Specification: HTTP client for job applications API.
// Provides typed helpers to call the backend endpoints with basic error handling.
__turbopack_context__.s([
    "createJobApplication",
    ()=>createJobApplication,
    "deleteJobApplication",
    ()=>deleteJobApplication,
    "getJobApplications",
    ()=>getJobApplications,
    "updateJobApplicationStatus",
    ()=>updateJobApplicationStatus
]);
const API_URL = ("TURBOPACK compile-time value", "http://localhost:3000") || 'http://localhost:3000';
async function handleResponse(response) {
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Error en la solicitud');
    }
    return response.json();
}
async function getJobApplications(filters) {
    const url = new URL('/job-applications', API_URL);
    if (filters?.status) url.searchParams.set('status', filters.status);
    if (filters?.fromDate) url.searchParams.set('fromDate', filters.fromDate);
    if (filters?.toDate) url.searchParams.set('toDate', filters.toDate);
    const res = await fetch(url.toString(), {
        cache: 'no-store'
    });
    return handleResponse(res);
}
async function createJobApplication(payload) {
    const res = await fetch(`${API_URL}/job-applications`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return handleResponse(res);
}
async function updateJobApplicationStatus(id, status) {
    const res = await fetch(`${API_URL}/job-applications/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status
        })
    });
    return handleResponse(res);
}
async function deleteJobApplication(id) {
    const res = await fetch(`${API_URL}/job-applications/${id}`, {
        method: 'DELETE'
    });
    return handleResponse(res);
}
}),
"[project]/src/hooks/useJobApplications.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Specification: Hook to manage job applications data lifecycle.
// Manages loading/error states, exposes CRUD helpers, and applies simple frontend filters.
__turbopack_context__.s([
    "useJobApplications",
    ()=>useJobApplications
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$jobApplicationsApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/jobApplicationsApi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$dateOnly$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/dateOnly.ts [app-ssr] (ecmascript)");
;
;
;
function useJobApplications() {
    const [applications, setApplications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    const [dateRange, setDateRange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    const [positionOptions, setPositionOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [sourceOptions, setSourceOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const refreshOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((items)=>{
        const toOptions = (values)=>{
            const counts = new Map();
            values.forEach((value)=>{
                const trimmed = value.trim();
                if (!trimmed) return;
                const key = trimmed.toLowerCase();
                const prev = counts.get(key);
                counts.set(key, {
                    value: prev?.value ?? trimmed,
                    count: (prev?.count ?? 0) + 1
                });
            });
            return Array.from(counts.values()).sort((a, b)=>b.count - a.count || a.value.localeCompare(b.value)).map((item)=>item.value);
        };
        setPositionOptions(toOptions(items.map((app)=>app.position)));
        setSourceOptions(toOptions(items.map((app)=>app.source)));
    }, []);
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$jobApplicationsApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getJobApplications"])();
            setApplications(data);
            refreshOptions(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No pudimos cargar tus postulaciones. Probá de nuevo.';
            setError(message);
        } finally{
            setLoading(false);
        }
    }, [
        refreshOptions
    ]);
    const create = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (payload)=>{
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$jobApplicationsApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createJobApplication"])(payload);
            setSuccess('Postulación registrada. ¡Seguimos midiendo tu progreso!');
            await load();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No pudimos guardar la postulación. Intentá otra vez.';
            setError(message);
            throw err;
        } finally{
            setLoading(false);
        }
    }, [
        load
    ]);
    const updateStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (id, status)=>{
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$jobApplicationsApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateJobApplicationStatus"])(id, status);
            setSuccess('Estado actualizado. Progreso al día.');
            await load();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No pudimos actualizar el estado. Reintenta en unos segundos.';
            setError(message);
            throw err;
        } finally{
            setLoading(false);
        }
    }, [
        load
    ]);
    const removeApplication = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (id)=>{
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$jobApplicationsApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteJobApplication"])(id);
            setSuccess('Postulacion eliminada.');
            await load();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No pudimos eliminar la postulacion. Intenta de nuevo.';
            setError(message);
            throw err;
        } finally{
            setLoading(false);
        }
    }, [
        load
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        load();
    }, [
        load
    ]);
    const filteredApplications = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const nowMs = Date.now();
        const dateThresholdMs = (()=>{
            if (dateRange === '7d') {
                return nowMs - 7 * 24 * 60 * 60 * 1000;
            }
            if (dateRange === '30d') {
                return nowMs - 30 * 24 * 60 * 60 * 1000;
            }
            return null;
        })();
        return applications.filter((app)=>{
            const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
            const matchesDate = dateThresholdMs === null || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$dateOnly$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDateOnlyUTC"])(app.applicationDate).getTime() >= dateThresholdMs;
            return matchesStatus && matchesDate;
        });
    }, [
        applications,
        statusFilter,
        dateRange
    ]);
    return {
        applications: filteredApplications,
        rawApplications: applications,
        loading,
        error,
        reload: load,
        create,
        updateStatus,
        remove: removeApplication,
        success,
        suggestionOptions: {
            positions: positionOptions,
            sources: sourceOptions
        },
        filters: {
            status: statusFilter,
            setStatus: setStatusFilter,
            dateRange,
            setDateRange
        }
    };
}
}),
"[project]/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Page
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '../components/job-applications/FormularioPostulacion'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$job$2d$applications$2f$ListadoPostulaciones$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/job-applications/ListadoPostulaciones.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$job$2d$applications$2f$MetricsSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/job-applications/MetricsSection.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useJobApplications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useJobApplications.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function Page() {
    const { applications, rawApplications, loading, error, create, updateStatus, remove, filters, reload, success, suggestionOptions } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useJobApplications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useJobApplications"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-gradient-to-b from-slate-100 to-white",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-6xl space-y-6 px-4 py-10",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "space-y-3 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs font-semibold uppercase tracking-wide text-slate-500",
                            children: "Progreso en tu busqueda"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 30,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-3xl font-bold text-slate-900",
                            children: "Dashboard de postulaciones"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 33,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-slate-600",
                            children: "Registra tus aplicaciones, monitorea avances y celebra cada paso adelante. Aqui ves tu esfuerzo transformado en progreso concreto."
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 34,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 29,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$job$2d$applications$2f$MetricsSection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MetricsSection"], {
                    applications: rawApplications
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 40,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormularioPostulacion, {
                    onSubmit: create,
                    loading: loading,
                    error: error,
                    success: success,
                    suggestions: suggestionOptions
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$job$2d$applications$2f$ListadoPostulaciones$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ListadoPostulaciones"], {
                    applications: applications,
                    loading: loading,
                    error: error,
                    filters: filters,
                    onChangeStatus: updateStatus,
                    onDelete: remove,
                    onRetry: reload,
                    success: success
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 28,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__536f5dca._.js.map