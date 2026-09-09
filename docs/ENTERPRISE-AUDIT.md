# Phase 1 — Architecture and code audit

Scope: application source, reference designs, scripts, tests, configuration, asset inventory and documentation. Generated dependencies and Git internals are not application code and are not refactored. Working changes predating this audit are retained.

| Severity | Exact repository path | Finding | Required disposition |
|---|---|---|---|
| Critical | `js/admin/admin-auth.js` | Public hardcoded admin credential and client-only authorization cannot protect an actual admin API. | Explicit preview-only entry; refuse live admin until server auth exists. |
| Critical | `js/pages/storefront-common.js` | Local dashboard enrichment can override API products in live mode. | Limit local overrides to preview mode. |
| High | `js/admin/store-state.js` | Reinitialization reseeds an intentionally empty catalog. | Seed only missing storage. |
| High | `js/admin/store-state.js` | Per-line inventory checks permit duplicate product lines to oversell with partial writes. | Aggregate, validate all lines, then write once. |
| High | `js/admin/store-state.js` | Cancel/reactivate/cancel can repeatedly restore inventory. | Track deductions/restoration and validate state transitions. |
| High | `js/pages/checkout.js` | Local inventory errors can occur after order confirmation without being checked. | Check inventory outcome and keep preview operations idempotent. |
| High | `pages/admin/*.html` | Admin pages depend on CDN Tailwind and legacy config; 10 baseline script-order failures. | Use the existing local CSS pipeline. |
| High | `js/admin/store-state.js` | Module initialization writes storage without handling storage denial. | Guard initialization and report a visible recoverable error. |
| Medium | `js/admin/admin-auth.js` | Tab-only admin session conflicts with persistent sign-in requirement. | Persist preview session; migration and explicit logout tombstone. |
| Medium | `js/storefront-bridge.js` | Monkey-patches global translation function and applies updates multiple times. | Use existing lifecycle events. |
| Medium | `js/api.js` | API config does not define deterministic preview read behavior; static preview issues failed network requests. | Explicit API-read switch in demo; live requests retain errors. |
| Medium | `js/components/*.js`, `js/utils/storage.js`, `js/utils/validation.js`, `js/pages/products.js`, `js/pages/product-details.js`, `js/pages/login.js`, `js/pages/dashboard.js` | Comment-only scaffolding is presented as implemented modules. | Delete proven no-op files and references. |
| Medium | `css/components.css`, `css/dashboard.css`, `css/footer.css`, `css/forms.css`, `css/header.css`, `css/product-card.css`, `css/responsive.css` | Comment-only stylesheets add requests without behavior. | Remove references and files. |
| Medium | `js/utils/helpers.js` | Unreferenced duplicate toast implementation. | Remove after reference verification. |
| Medium | `package.json` | Direct autoprefixer dependency is unused by the pipeline. | Remove from manifest and lockfile. |
| Medium | `js/admin/admin-pages.js` | Multiple page controllers in one large file. | Split by page responsibility preserving explicit load order. |
| Low | `js/main.js`, `js/pages/*.js` | Routine logs and expected demo fallback warnings clutter preview console. | Remove routine logs; show actionable errors in UI. |
| Low | `docs/REPAIR-REPORT.md`, `README.md` | Earlier report excludes new local admin scope. | Update handover with current verification and limitations. |
| Critical release gate | `docs/API-CONTRACT.md` | No server authentication, payment provider, authoritative pricing/stock or API integration test environment. | Not certifiable as a production commerce platform. |
| High release gate | `tests/page-loading.test.cjs` | VM script checks do not verify layout or browser interaction. | Browser QA remains required; report honestly. |

No deployed credentials are intentionally displayed in this report. The public admin credential was a preview mechanism, not a legitimate production secret. Reference designs and planned screens are retained as documented source material rather than guessed dead code.
