# Dashboard integration contract

Configuration: `js/config.js`. The repository defaults to `mode: 'demo'`.

- Demo mode: GET requests may fall back to sample data after an error. Successful empty lists remain empty. Checkout is local simulation only; it never POSTs an order.
- Live mode: failed reads display an error and do not substitute samples. Live login is intentionally unavailable pending a server authentication integration. Online card/installment payment is unavailable pending a payment provider integration.
- `apiBase` resolves relative to the application root, including subdirectory hosting.
- Transport in `js/api.js` applies one timeout and no automatic write retries.

## Read endpoints

`GET products?type=new`, `GET products?type=refurbished`, `GET catalog/products`, `GET offers`, `GET brands`, `GET customer-service/faq`.

Existing page list adapters expect `{ "data": [...] }`. Product detail expects `{ "product": {...} }`, `{ "data": {...} }` or a product object from `GET products/:id`.

Product fields: `id`, `name_ar`, `name_en`, `price` (finite nonnegative), `stock` (nonnegative integer), `variant_id`, `storage_gb`, `listing_type`, `condition_ar`, `condition_en`, `image_url`. Optional detail fields: `variants`, `storage_options`, `colors`, `gallery`, `specs`, `inspection`, `reviews_list`, `accessories`.

Real records are not enriched with sample profiles or fabricated capacities/reviews. Real variants must include their actual prices. Backend must define variant IDs and stock per variant before real sales.

## Order creation

`POST orders`, JSON, header `Idempotency-Key: <stable client UUID>`.

Return `{ "order": { "orderId": "server-id", "total": 123.45, "status": "received" } }`.

The backend must enforce idempotency, derive prices/discounts/tax/shipping from its own catalog, validate stock and quantities, authorize customer data and return payment state. Client totals and user IDs are NOT authoritative. Authentication, CSRF/session integration, payment redirects/webhooks and server order history are not implemented by this frontend.

The same pending request identifier is retained locally for retries of an unchanged checkout. Confirmed orders are cached locally; failed writes preserve the cart and do not become demo orders.

## Support configuration

Set a verified `adminWhatsApp` international number without `+` in config. Default is empty, so no real support destination is assumed.
