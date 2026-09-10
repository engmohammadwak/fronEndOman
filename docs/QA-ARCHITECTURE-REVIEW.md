# QA and architecture review — 2026-09-10

This follow-up reviews the current workspace rather than assuming earlier verification still applies. The application-directory inventory covers 159 files across js, server, scripts, css, pages, components, assets and tests. No empty files were found in those directories. Reference designs in All and previously documented planned screens remain intentionally retained. Dependencies and Git internals are not application source.

## Audit table

| Severity | Category | File Path | Defect Description | Planned Remediation |
|---|---|---|---|---|
| High | Session initialization | `js/admin/admin-pages.js` | An independent DOMContentLoaded renderer can check authorization before asynchronous session initialization completes on templates with data-admin-page. | Implemented: only AdminAuth initiates the initial render after successful verification. |
| High | State consistency | `js/admin/admin-auth.js` | A late session response can repopulate client session state after logout. Concurrent boots duplicate requests. | Implemented: operation revisions reject stale results and share current initialization. |
| Medium | Resilience | `js/admin/admin-auth.js` | No bounded session request, explicit loading state or retry control. | Implemented: 15-second timeout, accessible loading/error status, retry without discarding the cookie. |
| Medium | API validation | `js/admin/admin-auth.js` | Any successful JSON response can be accepted as a session. | Implemented: require ok:true and a nonempty string identity; malformed responses fail closed without redirecting as though credentials were rejected. |
| Medium | Regression coverage | `tests/admin-auth.test.cjs` | No checks for pending guards, request coalescing, stale post-logout results or malformed session responses. | Implemented: deterministic regression tests for these cases and retry recovery. |
| Medium | Modularity | `js/pages/product.js` | Approximately 49 KB of page orchestration remains in one module. Size alone does not prove a bug, but increases maintenance cost. | Open: separate rendering and interactions incrementally with behavior coverage; not renamed or split mechanically in this pass. |
| Critical | Production authorization | `js/auth-state.js`, `js/admin/store-state.js` | Customer authentication and business data are local browser demo mechanisms, not authoritative server access controls. | Open: server-backed customer sessions, role/ownership enforcement, transactional catalog/orders repository. |
| Critical | Checkout | `server/api.mjs` | Authoritative live pricing, stock reservation and checkout integration remain incomplete. | Existing 503 gate retained; complete and validate the server flow before enabling real payments. |

The production gaps documented in ENTERPRISE-AUDIT.md and ENTERPRISE-HANDOVER.md remain open. This review does not turn local demo data into trusted data by protecting only the dashboard login.

## Changes in this pass

Modified:

- `js/admin/admin-auth.js`: session response normalization, request timeout, lifecycle status, initialization deduplication, operation revisions and retry UI.
- `js/admin/admin-pages.js`: removed competing startup event handler; authorized initialization owns first render.
- `tests/admin-auth.test.cjs`: updated server response fixture and added concurrency/failure regressions.
- Report index links point to this review.

Created: `docs/QA-ARCHITECTURE-REVIEW.md`.

No source files moved or deleted in this pass. Existing workspace changes were preserved. No production credentials, data stores, deployments or Git history were changed.

## Verification

- `npm run verify`: build, syntax/local-reference checks and **112 passing tests**.
- Session regressions: duplicate boot shares a request; guard does not redirect while hydration is pending; late responses cannot undo logout; malformed session JSON does not authorize; retry restores a valid session.
- Existing tests cover customer refresh/new tabs/logout, server restart persistence, private-route rejection and cryptographic failure behavior.
- Automated checks do not establish that every possible bug is absent. There is no TypeScript compiler or configured lint pipeline in this JavaScript project; syntax and behavior checks must not be mislabeled as type checking.

Chrome verification also passed at 390 and 1440 pixels: core storefront routes, admin login/reload/navigation, temporary session-service failure with an on-page retry (without redirect), language switching and logout via the mobile menu. No page JavaScript exceptions or horizontal overflow occurred in these tested cases. External assets are not comprehensively certified.

## Handover checklist

- [x] Session initialization has loading/error/authenticated/anonymous states.
- [x] Successful F5 verification retains valid authentication; transient failure presents retry instead of clearing credentials.
- [x] Initial dashboard rendering waits for server verification.
- [x] Stale responses cannot undo a newer logout operation.
- [x] Build and 112 automated tests pass.
- [ ] Complete server-backed customer authentication and business data.
- [ ] Complete and validate production checkout/payment integration.
- [ ] Complete operational deployment, backups, account recovery and merchant-content approval.
- [ ] Enterprise production readiness: not certified while these requirements remain open.
