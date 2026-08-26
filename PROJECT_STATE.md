# Project State

Last updated: 2026-08-25 PDT
Current source baseline: `ieduer/bdfz-companion` `master@b99b807e999df26a21193bdf285d712801ff6432`
Current public release: `v1.1.0`, Android `versionCode=2`
Current objective: preserve the App's WebView/session shell while preventing an unreviewed native APIS dependency from invalidating the 2026-08-25 bounded waiver
Completed work: source inspection proved zero native direct `apis.bdfz.net`/`APIS` callers; an executable fail-closed guard now covers direct APIS markers, App version changes, and `services/urlPolicy.ts` changes through the existing `npm run verify` and Android release gate
Pending work: a registered-device smoke remains required when the bounded waiver expires; no App binary is being released in this transaction
Known residual risk: the waiver does not verify physical-device WebView behavior, Session persistence, or navigation behavior
Next recommended task: run `npm run verify`; if the guard reports that the waiver prerequisite is invalid, run the registered-device smoke before any App release
Deployment status: existing `v1.1.0` binary unchanged; this transaction changes source verification only
Rollback anchor: revert the bounded-waiver guard commit; the existing `v1.1.0` binary is unaffected
Operations authority: `/Users/ylsuen/CF/apps/bdfz-companion/docs/OPERATIONS.md`
Ownership status: suen; production/App release still requires the documented release gate

## 2026-08-26 frozen catalog parity

- The existing `ai_school_selection` WebView service is retired from source; the existing gk service remains.
- No native binary is released for this source-only parity change. Older installed binaries remain safe because `750.bdfz.net` redirects to gk.
