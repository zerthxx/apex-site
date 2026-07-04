# E-Commerce Template

Read `.claude/templates/_foundations.md` first — this file only covers what's specific to a storefront: catalog, cart, checkout, orders, and inventory.

## Recommended architecture

- Public catalog/storefront is unauthenticated (per foundations' `(marketing)` group); cart can be session-based (cookie/local state) until checkout, where it's tied to a customer record.
- Checkout is Stripe Checkout (or Elements, if a fully custom flow is required) — don't hand-roll card handling; PCI scope stays with Stripe.
- Order state machine: `cart` → `pending_payment` → `paid` → `fulfilled`/`shipped` → `completed`/`refunded`/`canceled`. Model this as an explicit enum with defined transitions, mirroring the CRM template's lifecycle approach.
- Inventory decrements must be atomic with order placement (a single transaction/RPC), not a separate step that can drift out of sync under concurrent orders.

## Folder structure

```
src/app/
├── (marketing)/
│   ├── tuotteet/ (or products/)   catalog listing + category filters
│   ├── tuote/[slug]/               product detail page
│   ├── ostoskori/ (cart)           cart review
│   └── kassa/ (checkout)           checkout — collects shipping, hands off to Stripe
├── (dashboard)/
│   ├── tilaukset/ (orders)         customer order history
│   └── admin/tuotteet/             staff: product/inventory management
│   └── admin/tilaukset/            staff: order management, fulfillment status
├── api/
│   ├── cart/                       cart mutations (if server-persisted rather than pure client state)
│   ├── checkout/                   create Stripe Checkout session
│   └── webhooks/stripe/            payment confirmation, refund events
```

## Tech stack additions

- Stripe Checkout (one-time payments) + webhooks for `checkout.session.completed`, `charge.refunded`.
- Image handling for product photos: Next.js `<Image>` with a real CDN/storage backend (Supabase Storage) — never unoptimized `<img>` for a catalog with more than a handful of products.

## Database design

Core tables:
- `products` — name, description, price (store as integer cents, never float), images, category, active/archived flag.
- `product_variants` (if sizes/colors exist) — price/stock can differ per variant; don't bolt variants onto the `products` row as loose columns.
- `inventory` — stock count per product/variant; decremented atomically on order placement (use a Postgres function/RPC, not a read-then-write from application code, to avoid race conditions under concurrent checkout).
- `orders` — customer (nullable if guest checkout is allowed), status enum, totals (subtotal/tax/shipping/total, all integer cents), Stripe payment intent/session ID.
- `order_items` — line items, snapshotting product name/price at time of purchase (never join back to `products` for historical order display — prices change).
- `addresses` — shipping/billing, tied to customer or order.

RLS: customers read only their own `orders`/`order_items`/`addresses`; staff (`isStaff`) reads/writes all. Products/inventory are staff-write, public-read (for active/non-archived rows only). Use `/database`.

## Authentication

Per foundations. Decide explicitly whether guest checkout is supported (order not tied to a customer account) — if so, `orders.customer_id` must be nullable and guest orders need an alternate lookup (order ID + email) rather than relying on RLS session scoping alone.

## API structure

- `POST /api/checkout` — validate cart contents and current prices/stock server-side (never trust client-submitted prices), create a Stripe Checkout session.
- `POST /api/webhooks/stripe` — on `checkout.session.completed`: verify signature, create the `orders`/`order_items` rows, decrement inventory atomically, send confirmation email; must be idempotent (Stripe redelivers events).
- `PATCH /api/admin/orders/[id]` — staff-only fulfillment status updates.

Design with `/api`; the checkout + webhook pair is the highest-risk part of this archetype — pair with `/security`.

## UI components

- Catalog grid with filtering/sorting, product detail with variant selection and stock-aware "add to cart" (disable/hide when out of stock).
- Cart drawer/page with quantity edit, remove, running total.
- Checkout form (shipping info) handing off to Stripe-hosted payment.
- Order confirmation and order-history views with per-order status.
- Staff inventory/product management with low-stock indicators.
- Empty states: empty cart, out-of-stock product, no orders yet.

## Security checklist

Per foundations, plus:
- [ ] Server re-validates price and stock at checkout time — never trust a price or quantity value submitted from the client.
- [ ] Stripe webhook signature verified; webhook handler is idempotent (safe against duplicate delivery).
- [ ] Inventory decrement is atomic (DB-level), not a check-then-write race in application code.
- [ ] Customers can only read their own orders/addresses (RLS or explicit server check); staff-only routes verify `isStaff`.
- [ ] Run `/security` before shipping checkout or webhook changes.

## Performance checklist

Per foundations, plus:
- [ ] Product catalog images are optimized (Next.js `<Image>`, real storage/CDN) and paginated/lazy-loaded for large catalogs.
- [ ] Catalog queries are indexed for the actual filter/sort columns used (category, price range, availability).
- [ ] Order history and admin order list are paginated, not fetched in full as order volume grows.
- [ ] Run `/performance` before launch and again if catalog size grows an order of magnitude.

## Deployment checklist

Run `/deploy`, plus confirm:
- [ ] Stripe webhook endpoint registered for the deployed URL in both test and live mode.
- [ ] Tax/shipping calculation (if applicable) is configured correctly for the live environment, not left at test defaults.
- [ ] Inventory migration/RLS applied to the live database before the storefront goes public.

## Development phases

1. **Catalog**: products/variants/inventory schema, public catalog + detail pages. → `/database`, `/frontend`
2. **Cart & checkout**: cart state, Stripe Checkout integration, order/order_items schema. → `/feature` (checkout is the critical path — plan-gate this)
3. **Fulfillment**: order confirmation, staff order management, status transitions, shipping notifications.
4. **Post-purchase**: order history, refunds/cancellations, customer support tooling.
5. **Hardening**: `/security` (checkout + webhook idempotency are the top risks), `/performance` (catalog + image handling), `/deploy`.

## Best practices

- Store all money as integer cents (or the smallest currency unit) — never floats.
- Snapshot product name/price into `order_items` at purchase time; historical orders must never change because a product's current price changed.
- Inventory changes are atomic DB operations, not read-modify-write in application code.
- Treat the Stripe webhook as the single source of truth for "did payment actually succeed" — never mark an order paid purely from a client-side redirect.
