# Project State

Last updated: 2026-09-02 PDT
Current source baseline: `ieduer/bdfz-companion` `master@56a3cdc39838654a32e5d9ec5e4f90677364dc6c`
Current public release: `v1.1.0`, Android `versionCode=2`
Current objective: preserve the App's WebView/session shell while keeping the User Center interaction release fail-closed until a registered-device authenticated recovery smoke is available
Completed work: exact Node 24.18.0 source verification passed typecheck, native APIS waiver fixtures and guard, URL policy, and update policy at `56a3cdc`; the guarded set still contains 53 source files and the public App remains `1.1.0` / Android `versionCode=2`
Pending work: connect an owned registered device and verify authenticated WebView load, session continuity, offline/reload/reconnect recovery, and navigation before any User Center interaction release or App release
Known residual risk: no device was connected during the 2026-09-02 audit, and Expo's current dependency check reports the repository is behind the package versions expected by Expo SDK 57.0.19; no dependency update was attempted
Next recommended task: reconcile Expo SDK 57 dependencies in a separate reviewed source transaction, then run `npm run verify` and the registered-device smoke with an explicit rollback anchor
Deployment status: existing `v1.1.0` binary unchanged; no App build, publish, dependency mutation, or production change was performed
Rollback anchor: no runtime rollback is required; this documentation-only branch can be reverted while `master@56a3cdc` and the existing `v1.1.0` binary remain unchanged
Operations authority: `/Users/ylsuen/CF/apps/bdfz-companion/docs/OPERATIONS.md`
Ownership status: suen; production/App release still requires the documented release gate

## 2026-08-26 frozen catalog parity

- The existing `ai_school_selection` WebView service is retired from source; the existing gk service remains.
- No native binary is released for this source-only parity change. Older installed binaries remain safe because `750.bdfz.net` redirects to gk.
