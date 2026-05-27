# Project Memory

Log of significant decisions about direction, format, content, approach, or strategy.

## 2026-05-27, Switched README Inertia example from Ziggy to Laravel Wayfinder
**What was decided:** Replace the `route('users.datatable')` Ziggy helper in the Inertia integration example with `datatable.url()` imported from `@/routes/users`, the Laravel Wayfinder generated helper.
**Why:** User requested replacing Ziggy with Wayfinder. Wayfinder generates fully-typed TypeScript route helpers, giving the example better type safety and matching the modern Laravel + Inertia + TS stack the package targets. `.url()` returns a plain string, which is what the `endpoint` option expects.
**What was rejected:** Using the bare `datatable()` call — it returns `{ url, method }`, not a string, so it wouldn't be assignable to `endpoint`. Also rejected importing from `@/actions/App/Http/Controllers/...` (controller-based form); the named-route form (`@/routes/users`) reads more naturally for a docs example and mirrors the prior `route('users.datatable')` shape.
