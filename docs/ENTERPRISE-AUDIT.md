> تحديث 10 سبتمبر 2026: [نتائج المراجعة الأحدث وسجل ملفاتها](REVIEW-2026-09-10.md).

# Architecture and security audit — 2026-09-09

Scope: source directories, route map, templates, JavaScript, server code, configuration, dependencies, asset references and test scripts. `All/` is retained reference design material; generated dependencies and Git internals are excluded from refactoring. This is a source audit and targeted regression verification, not a guarantee of absence of every possible bug.

| Severity | Exact path | Finding | Final disposition |
|---|---|---|---|
| Critical | `js/admin/admin-auth.js`, `server/api.mjs` | Public default password and client-only authorization. | Removed defaults. Server-side credential verification; setup-generated scrypt hash; session tokens hashed at rest. |
| High | `server/admin-auth.mjs` | No persistent, revocable server login or guessing limit. | 30-day HttpOnly/SameSite cookie, persistent server session, logout revocation, bounded per-address attempt limiter. HTTPS Secure cookie configured by public URL. |
| Critical | `server/api.mjs` | Live checkout trusts browser totals/items. | Unsafe order/payment creation removed; 503 release gate. Real catalog, pricing, inventory and ownership validation still required. |
| High | `server/api.mjs` | Order lookup exposed customer information without authorization. | Requires server admin session. Customer order access needs an ownership-aware API before live checkout. |
| High | `server/api.mjs` | Webhook order matching used merchant metadata outside HMAC coverage. | Match signed provider order ID, amount and currency; do not downgrade a paid order. Live provider integration remains unverified. |
| High | `scripts/server.mjs` | Encoded paths, arbitrary dashboard suffixes, methods and cross-origin mutations needed stronger boundaries. | Explicit route map, decode once, realpath containment, hidden/private directory denial, JSON mutation restriction and Origin checks. HTTP tests cover legacy redirect and double encoding. |
| High | `server/db.mjs` | Corrupt persistent store silently became an empty store and could be overwritten. | Fail closed with 500; preserve corrupt data for recovery. Atomic file replacement and restrictive creation permissions. |
| High | `server/api.mjs` | Unlimited body buffering and malformed JSON fallback; arbitrary provider URL. | 1 MiB body limit, 400 malformed JSON, provider URL allowlist, OMR multiplier validation. |
| Critical | `js/pages/storefront-common.js`, `js/main.js` | Local dashboard values could override live API data. | Local enrichment confined to demo mode. |
| High | `js/admin/store-state.js` | Reinitialization repopulated an intentionally deleted catalog. | Seed only absent/invalid storage, preserve empty arrays. |
| High | `js/admin/store-state.js` | Duplicate cart lines bypassed stock checks; cancellation could restore repeatedly. | Aggregate and validate quantities before writes; idempotent preview order IDs; one-time restoration; reject reopening cancelled orders. Rollback on write failure is best effort; localStorage is not an ACID database. |
| High | `js/pages/checkout.js`, `js/pages/commerce-common.js` | Duplicate submission and inventory mutations after confirmation. | Submission lock, stable retry identity, preview commit operation and failed-cart preservation. |
| High | `js/auth-state.js`, `js/main.js` | Customer session and user cart state must survive reload and remain isolated. | Existing persistent session implementation verified: refresh/new tab/migration/logout/cross-tab state and malformed/blocked storage tests. Customer auth remains demo-only. |
| High | `pages/admin/app.html`, `pages/admin/index.html` | Runtime Tailwind dependency and script loading inconsistencies. | Local build CSS and explicit dependency order; all page scripts checked. |
| Medium | `js/admin/admin-pages.js` | Monolithic page controllers. | Split into `admin-products.js`, `admin-overview.js`, `admin-orders.js`, `admin-coupons.js`, `admin-content.js`, `admin-payments.js`, `admin-settings.js`; dispatcher retained. |
| Medium | `js/storefront-bridge.js` | Global translation monkey-patching. | Existing lifecycle events used; preview-only bridge. |
| Medium | `js/api.js`, `js/config.js` | Expected demo network failures obscured useful errors. | Explicit local demo read mode; live failures remain visible, not silently substituted. |
| Medium | `components/header.html` | External logo fails with ORB in Chrome. | Replaced with local `assets/images/brand-mark.svg`. Other external fonts/images still require network. |
| Medium | `ruun.py` | Legacy Laravel runner included destructive Git reset/force-push actions unrelated to this project. | Replaced with portable subprocess launcher for `npm run dev`; no shell expansion or Git mutation. |
| Medium | `js/components/cart.js`, `js/components/header.js`, `js/components/modal.js`, `js/components/footer.js`, `js/utils/storage.js`, `js/utils/validation.js`, `js/pages/products.js`, `js/pages/product-details.js`, `js/pages/login.js`, `js/pages/dashboard.js` | Comment-only scaffolding. | Deleted. |
| Medium | `css/components.css`, `css/dashboard.css`, `css/footer.css`, `css/forms.css`, `css/header.css`, `css/product-card.css`, `css/responsive.css` | Comment-only stylesheets added requests. | Deleted and references removed. |
| Medium | `js/utils/helpers.js`, `js/tailwind-config.js`, `package.json` | Unreferenced duplicate helper/config and unused direct autoprefixer dependency. | Removed; lockfile updated. npm reported 0 known vulnerabilities for the resolved dependency set. |
| Low | `README.md`, `WORKFLOW_GUIDE.md` | Outdated credentials, server and payment claims. | Rewritten around actual setup, routes and release gates. |

## Remaining release gates

| Severity | Exact path | Remaining requirement |
|---|---|---|
| Critical | `js/admin/store-state.js`, `js/auth-state.js` | Replace browser-local business data/customer authentication with an authorized server repository, customer sessions, role checks and transactions. Login protection does not make localStorage trustworthy. |
| Critical | `server/api.mjs`, `server/paymob.mjs` | Complete authoritative checkout, payment idempotency, stock reservations and provider sandbox/end-to-end validation. Live checkout deliberately unavailable. |
| High | `server/db.mjs`, `server/admin-auth.mjs` | File storage and process-local rate limiting are single-instance foundations. Production needs backups, database concurrency, account recovery/rotation, operational monitoring and distributed throttling if scaled. |
| High | `pages/`, `All/` | Planned templates/reference designs are not implemented product features. See `PAGE-STATUS.md`; not published by current route map. |
| Medium | `components/header.html`, `pages/storefront/`, `js/pages/storefront-demo-catalog.js` | Business claims, warranties, contacts, catalog imagery and external asset availability require final merchant approval/owned assets. |

No production secrets are included in this report. No deployment, database migration, Git reset or publication was performed.
