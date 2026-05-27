# Project Memory

Log of significant decisions about direction, format, content, approach, or strategy.

## 2026-05-27, Git tag convention — always prefix with `v`
**What was decided:** All release tags use the `v` prefix (e.g. `v0.1.0`, `v0.2.0`). The existing remote tag `0.1.0` was renamed to `v0.1.0` (same commit, `676caf4`) and the un-prefixed remote tag deleted. Future releases must follow this convention. `npm version` defaults to a `v` prefix (via `tag-version-prefix`), so the standard release workflow is already aligned — no extra config needed unless someone overrides it.
**Why:** User requested it explicitly for visual consistency on the GitHub tags page (the only existing tag, `0.1.0`, lacked the prefix while the rest of the ecosystem and `npm version` defaults use `v`).
**What was rejected:** Leaving the old `0.1.0` tag in place alongside `v0.1.0` — would cause duplicate refs to the same commit and defeat the consistency goal. Also rejected adding an explicit `tag-version-prefix=v` to `.npmrc` since npm already defaults to this; we don't add config that just restates a default.
**Follow-up known issues (not addressed yet):**
- Main has release commits `9375100 (0.2.0)` and `97682f4 (0.2.1)` with **no** tags on the remote.
- Local-only tags `v0.2.0` (→ `09216b8`) and `v0.2.1` (→ `059d3d8`) point at orphan commits (likely from `npm version` runs that were squash-merged via PR). They should either be retagged to the actual main release commits and pushed, or deleted.

## 2026-05-27, English-only language policy for the package
**What was decided:** All package content — source code (identifiers, string literals, UI copy, placeholders), comments, JSDoc, documentation (README, examples, Markdown), commit messages, PR titles/descriptions, and issue replies — must be written in English. Translated Indonesian strings to English across `src/hooks/useDataTable.ts`, `examples/inertia-users-index.tsx`, and `README.md`: `'Nama'` → `'Name'`, `"Cari nama atau email..."` → `"Search name or email..."`, `"Halaman {n} dari {m} · Total {x} baris"` → `"Page {n} of {m} · {x} rows total"`, `"Sebelumnya"` → `"Previous"`, `"Selanjutnya"` → `"Next"`, `"Memuat..."` → `"Loading..."`. The rule is published as a "Language policy" subsection in the README's Contributing section.
**Why:** User requested it. Consistency aids future maintainers; English is the lingua franca of the npm ecosystem and the package's target audience extends well beyond Indonesian speakers. Locale-specific copy belongs in the consumer app (e.g. translated `header` values passed into `useDataTable`), not in the library.
**What was rejected:** Leaving Indonesian sample strings as "flavor" — risks confusing non-Indonesian users and looks inconsistent next to English JSDoc. Also rejected a separate `CONTRIBUTING.md` for the language rule — inlining in README keeps it discoverable next to the rest of the contribution guidance. Did NOT touch the npm scope `manusiakemos` or the user handle, since those are brand identifiers, not natural-language content.

## 2026-05-27, Switched README Inertia example from Ziggy to Laravel Wayfinder
**What was decided:** Replace the `route('users.datatable')` Ziggy helper in the Inertia integration example with `datatable.url()` imported from `@/routes/users`, the Laravel Wayfinder generated helper.
**Why:** User requested replacing Ziggy with Wayfinder. Wayfinder generates fully-typed TypeScript route helpers, giving the example better type safety and matching the modern Laravel + Inertia + TS stack the package targets. `.url()` returns a plain string, which is what the `endpoint` option expects.
**What was rejected:** Using the bare `datatable()` call — it returns `{ url, method }`, not a string, so it wouldn't be assignable to `endpoint`. Also rejected importing from `@/actions/App/Http/Controllers/...` (controller-based form); the named-route form (`@/routes/users`) reads more naturally for a docs example and mirrors the prior `route('users.datatable')` shape.
