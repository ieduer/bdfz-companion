# bdfz-companion operations

Last verified: 2026-09-02 PDT
Owner: suen
Lifecycle: active native App
Data class: session-bearing App shell; site data remains owned by the embedded Web properties
Documentation status: source and release verification authority reviewed; physical-device behavior remains separately gated.

## Quick start

- Canonical local path: `/Users/ylsuen/CF/apps/bdfz-companion`
- Git authority: `ieduer/bdfz-companion`
- Canonical branch/baseline: `master` / `56a3cdc39838654a32e5d9ec5e4f90677364dc6c`
- Current public release: `v1.1.0`, Android `versionCode=2`; this transaction does not publish a new binary
- Current state: [PROJECT_STATE.md](../PROJECT_STATE.md)
- Workspace resource routing: [project resource index](../../reports/operations/project_resource_index.md)
- Documentation standard: [project operations standard](../../runbooks/project_operations_documentation_standard.md)
- Production mutation is forbidden until exact owner, target, version, signing/build inputs, verification, and rollback have fresh readback.

## Bounded APIS native-contract waiver

The 2026-08-25 APIS AQ.Ab rotation and resilience transaction grants a bounded source-grounded exemption for one surface only: **native direct APIS contract testing**. It is not a pass for physical-device WebView behavior, Session persistence, or navigation behavior.

Reproducible source evidence:

- this repository is Expo 57 / React Native and its application source is TypeScript/TSX;
- the guarded TS/TSX/JSON source set contains no `apis.bdfz.net`, standalone `APIS`, APIS request-header markers, or direct Gemini Developer API host;
- native remote calls target site services such as `my.bdfz.net`, while WebView destinations are BDFZ/RDFZ site domains whose APIS behavior is verified at the owning site;
- WebView implementations are `app/webview.tsx` and `app/(tabs)/community.tsx`; `services/urlPolicy.ts` is the navigation trust boundary.

Executable guard:

```bash
npm run check:apis-native-waiver
npm run test:apis-native-waiver
npm run verify
```

`config/apis-native-waiver.json` pins App `1.1.0` / Android `versionCode=2` and the reviewed `services/urlPolicy.ts` digest. `scripts/check-apis-native-waiver.mjs` scans the complete application TS/TSX/JSON source set and exits nonzero with `Companion 有界豁免前提已失效，必須執行註冊設備煙霧測試` when the prerequisite no longer holds. The existing Android release script calls `npm run verify` before build or publication, so the guard is part of the release check path rather than an unattached script.

The exemption automatically expires when any of the following occurs:

1. App source gains a direct APIS or Gemini Developer API call;
2. App version or Android versionCode changes;
3. `services/urlPolicy.ts` changes, including an AI-capable WebView allowlist expansion.

After expiry, update the waiver only after a registered-device smoke verifies WebView loading, Session persistence, and navigation. Do not regenerate the pinned digest merely to make the check green.

## Existing project documentation relationship

This `docs/OPERATIONS.md` is the single project-local operations entrypoint.
Existing detailed manuals remain authoritative annexes for their exact scope;
historical handovers and ledgers are evidence, not current state.

- No earlier operational handbook was detected.

## Project and runtime inventory

| Project ID | Runtime type | Resource | Domains |
| --- | --- | --- | --- |
| `review_required` | `review_required` | `review_required` | `review_required` |

Live Cloudflare matching is metadata-only and does not prove application health:

| Resource | Live type | Readback | Detail |
| --- | --- | --- | --- |
| `review_required` | unknown | review_required | no runtime resource was verified |

## Authority and dependencies

- Project names: bdfz-companion
- Catalog owner: review_required
- Data classes: review_required
- Identity modes: review_required
- User Center required: review_required
- Pulse measurement: review_required
- Runtime bindings: 0 names cataloged; names are intentionally omitted from this general handbook. Inspect the exact project config and live binding types under task-scoped authority.
- Shared User Center, APIS, nav, image, Pulse, App, clone-family, and VPS effects must be checked through workspace topic runbooks; this file does not weaken those gates.

## Resource location and restore

- Source authority: `/Users/ylsuen/CF/bdfz-companion`; Git/GitHub authority above.
- External/local build inputs, archived paths, receipts, retention, and hydrate commands not stated below are `review_required` and block deletion.

Catalog backup evidence:
- `review_required`

Catalog restore evidence:
- `review_required`

Before deleting any local resource, satisfy the workspace path-preserving archive, remote readback, isolated restore, receipt, handbook, and project-state gates.

## Preflight and AI ownership

1. Read `/Users/ylsuen/CF/AGENTS.md`, this file, `PROJECT_STATE.md`, and linked annexes.
2. Inspect `git -C "/Users/ylsuen/CF/bdfz-companion" status --short` when Git-backed.
3. Inspect recent `reports/agent_action_log.jsonl` ownership.
4. Resolve the exact source, Worker/Pages/VPS/App target, domains, bindings, data, and rollback live.
5. Append a scoped `start` row before the first mutation.
6. Preserve unrelated dirty work; never reset, clean, broad-checkout, or stash another task's changes.

## Build, test, and local verification entrypoints

Detected package entrypoints (presence is not proof they currently pass):

- `npm --prefix "/Users/ylsuen/CF/bdfz-companion" run test:update-policy`
- `npm --prefix "/Users/ylsuen/CF/bdfz-companion" run test:url-policy`
- `npm --prefix "/Users/ylsuen/CF/bdfz-companion" run typecheck`
- `npm --prefix "/Users/ylsuen/CF/bdfz-companion" run verify`

Run only commands supported by the current project toolchain and verify expected outputs in the project before using them as release evidence.

### 2026-09-02 User Center interaction release gate

At exact source `master@56a3cdc39838654a32e5d9ec5e4f90677364dc6c`, Node 24.18.0 verification established:

- TypeScript checking passed.
- Native APIS waiver fixtures and the fail-closed waiver guard passed across 53 source files; the reviewed App identity remains `1.1.0` / Android `versionCode=2`.
- URL-policy and update-policy tests passed.
- `expo install --check` did not pass: the repository has 15 package versions behind Expo SDK 57.0.19's expected versions. This is a source compatibility blocker, not authority to rewrite the dependency lockfile during an interaction audit.
- The connected-device inventory was empty. Therefore authenticated WebView/session and offline/reload/reconnect recovery remain unverified and block the synchronized User Center release.

No APK/iOS build, dependency update, App publication, authentication write, or production change was made. Reconcile dependencies and run a registered-device smoke as a separate reviewed transaction before treating the App gate as accepted.

## Health and business-path verification

Catalog health probes:
- `review_required`

Catalog contract checks:
- `review_required`

Also verify authentication boundaries, data read/write behavior, browser/device path, monitoring, clone-family and shared-hub regressions as applicable. HTTP 200 or a build alone is insufficient.

## Preview, deployment, and rollback

Catalog deploy commands (not authorization; fresh preflight remains mandatory):
- `review_required`

Rollback/failback authorities:
- `review_required`

For data-backed projects, immutable code rollback does not restore D1/KV/R2/DO/Queue state. Use backup/restore or backward-compatible forward-fix procedures verified for the exact resource.

## Monitoring, privacy, cost, and incidents

- Monitoring coverage: review_required
- Measurement: review_required
- Never record secret values, cookies, sessions, private keys, raw student content, or sensitive payloads.
- Verify current logs, errors, cost/usage, limits, owner, stop condition, and incident runbook before representing runtime health.

## Verification standard

1. Source of truth: local/Git/GitHub authority above, refreshed before mutation.
2. Health probe: catalog probes above plus expected response semantics.
3. Contract/business path: catalog checks plus auth/data/UI/device behavior.
4. Deploy and forbidden actions: catalog command above; no deploy from dirty, duplicate, reconstruction, archive, or unverified source.
5. Dependency regression: matrix fan-out, shared hubs, clone family, App/VPS as applicable.
6. Backup/restore: catalog evidence above; missing exact evidence is blocking for writes/deletion.
7. Rollback/failback: catalog authority above, refreshed live before release.
8. Last verified: 2026-09-02 source checks at `56a3cdc`; registered-device behavior remains blocked and is not inferred from source checks.

## Synchronized documentation and handoff

Any change to source authority, architecture, dependencies, runtime resources,
deployment, data, backup/restore, verification, monitoring, incidents, rollback,
or ownership must update this manual in the same task. Accepted version,
objective, blockers, deployment state, rollback anchor, and next action must
update `PROJECT_STATE.md` in the same task.

Every AI closeout must record changed files, generated artifacts, tests, live
version/deployment, rollback, dirty-tree state, unresolved follow-ups, and the
manual/state updates in `reports/agent_action_log.jsonl`. Chat is not a durable handoff.

## GitHub Actions allowance and release routing

Workspace authority: `/Users/ylsuen/CF/runbooks/github_actions_usage_and_workload_routing.md`.
The 2026-08-22 account audit is
`/Users/ylsuen/CF/reports/github_actions_usage_audit_2026-08-22.md`.

- The two default-branch workflows are explicit `workflow_dispatch` release
  publishers. Keep them manual-only; do not add push, pull-request, or schedule
  triggers for routine APK assembly.
- APK build/verification belongs on the owned Mac/device path. Actions may only
  assemble or publish an approved tagged release from verified staging/R2
  material; GitHub Release/R2 is the durable asset authority.
- When these workflows are next changed, add an explicit 15-minute job timeout
  and bounded network requests. No Actions artifact retention is needed.
- The repository is public, so standard hosted-runner minutes do not consume
  the private 2,000-minute allowance; this does not waive timeout, permission,
  exact-tag, checksum, rollback, or device-acceptance gates.
- No schedule is authorized. Any future schedule must declare owner, monthly
  minute envelope, timeouts, concurrency, disable path and last duration
  readback in this manual.
- Current incident reset: 2026-09-01 00:00 UTC (2026-08-31 17:00 PDT;
  2026-09-01 08:00 CST). Do not mass-replay blocked workflows after reset.

## 2026-08-26 750 retirement

The frozen service catalog removes the existing 750 WebView entry and adds no replacement because gk is already present. No APK/iOS release is authorized by this change. Verify TypeScript/catalog tests; older binaries are covered by the permanent host redirect.
