# Development workflow

1. Keep public URLs in `js/app-routes.js`; HTML filenames are internal implementation details.
2. Put page behavior in `js/pages/` or a scoped `js/admin/admin-*.js` controller. Keep shared storefront rendering in the existing common modules.
3. Use `css/tailwind.css` and `tailwind.config.cjs`; rebuild local generated CSS after template changes.
4. Keep demo state separate from server-authoritative data. Never accept browser prices, inventory, roles or payment status as authoritative.
5. Keep credentials in server configuration or the setup-generated credential file. Never put passwords or session tokens in public JavaScript.
6. Run `npm run verify`. For UI changes, test mobile/desktop and Arabic/English in a browser.
7. Consult `docs/ENTERPRISE-HANDOVER.md` for release gates. Do not label placeholders as implemented features.
