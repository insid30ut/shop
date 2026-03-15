# Storefront UI + Admin Dashboard Plan

A comprehensive plan to evolve the MycoStore from its current MVP state into a fully functional e-commerce storefront with admin capabilities. The reference design is [White Rabbit Mycology](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/docs/reference.png) — a dark-themed shop with product grid, category navigation, search, sorting, and pagination.

## Current State

**What exists today (13 files):**
- Home page with product grid (no pagination, no categories, no search)
- Product detail page with variant selection
- Shopping cart (slide-out sidebar with Zustand + localStorage persistence)
- User dashboard (order history, requires auth)
- InsForge auth (email/password + Google + GitHub OAuth)
- Stripe SDK loaded but checkout not wired up

**Database (5 tables, all with RLS + admin policies):**
- `products` — name, description, image_url, base_price, category, subcategory, options (jsonb), is_active
- `product_variants` — name, sku, price, inventory_count, stripe_price_id, attributes (jsonb)
- `orders` — user_id → profiles, stripe_session_id, status, total_amount, shipping_details (jsonb)
- `order_items` — order_id → orders, variant_id → product_variants, quantity, price_at_time
- `profiles` — full_name, shipping_address (jsonb), stripe_customer_id

**What's missing:**
- No product images (no storage bucket)
- No category/subcategory browsing
- No search, sorting, or pagination
- Checkout is a stub (`alert()`)
- No admin dashboard
- No product management UI
- Footer is minimal placeholder

---

## Decisions (Resolved)

| Decision | Answer |
|----------|--------|
| **Store name** | **The Psilocyber Underworld** |
| **Admin role** | Use InsForge's native `is_project_admin` field on `auth.users`. Set this flag on the user's account after signup. Future admins added the same way. |
| **Product images** | Per-product only (stored in `products.image_url`). Single image per product. |
| **Stripe keys** | Test-mode keys for now. |
| **Color scheme** | Match [mycelialfunguy.com](https://mycelialfunguy.com) — deep dark (`#0a0a0b`), teal/cyan accents (`rgb(45,212,191)`), subtle purple glows, white headings, muted grey text. |
| **Category browsing** | Dropdown menu in the navbar. |
| **Shipping** | Flat-rate + free above threshold. Both configurable values. |

---

## Proposed Changes

### Phase 1: Storefront UI Components

The storefront needs navigation, browsing, and discovery features that match the reference screenshot's flow.

---

#### Infrastructure

##### Storage bucket for product images
- Use `insforge-cli` MCP tool: `create-bucket` → `product-images` (public)
- Product images uploaded via admin dashboard, URL stored in `products.image_url`

---

#### Layout & Navigation

##### [MODIFY] [layout.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/layout.tsx)
- Add main navigation links: **Shop**, **Cart**, **Dashboard** (auth'd), **Admin** (admin only)
- Add proper footer with branding, links (About, Terms, Privacy), copyright

##### [NEW] [Navbar.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/components/Navbar.tsx)
- Extract navigation into a reusable client component
- Category dropdown/links based on product categories fetched from DB
- Mobile hamburger menu
- Active link highlighting

##### [NEW] [Footer.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/components/Footer.tsx)
- Branded footer with store name, copyright year, links

---

#### Shop & Category Pages

##### [NEW] [shop/page.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/shop/page.tsx)
- Main shop page — shows all active products
- Search bar (query param `?q=`)
- Sort dropdown (Default, Price Low→High, Price High→Low, Newest)
- Pagination (9 products per page, `?page=N`)
- Result count ("Showing 1-9 of 32 results")
- Category filter sidebar or links

##### [NEW] [shop/[category]/page.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/shop/[category]/page.tsx)
- Category-filtered products
- Breadcrumb: Home / Shop / Category
- Same search/sort/pagination as shop page

##### [NEW] [shop/[category]/[subcategory]/page.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/shop/[category]/[subcategory]/page.tsx)
- Subcategory-filtered products
- Breadcrumb: Home / Shop / Category / Subcategory

##### [NEW] [Breadcrumbs.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/components/Breadcrumbs.tsx)
- Reusable breadcrumb component accepting path segments

##### [NEW] [SearchBar.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/components/SearchBar.tsx)
- Client component with debounced input
- Updates URL search params (`?q=term`)

##### [NEW] [SortDropdown.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/components/SortDropdown.tsx)
- Select element for sort order
- Updates URL search params (`?sort=price_asc`)

##### [NEW] [Pagination.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/components/Pagination.tsx)
- Page numbers with prev/next arrows (matching reference: `1 2 3 4 →`)
- Updates URL search params (`?page=2`)

##### [NEW] [ProductCard.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/components/ProductCard.tsx)
- Extracted/redesigned product card component
- Image, name, price, "Add to cart" button
- Hover effects, loading skeleton state

---

#### Home Page

##### [MODIFY] [page.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/page.tsx)
- Keep hero section (refined styling)
- Use new `ProductCard` component
- Add "Browse Categories" section
- Add "View All Products" CTA linking to `/shop`

---

### Phase 2: Checkout Flow

##### [NEW] [api/checkout/route.ts](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/api/checkout/route.ts)
- POST endpoint: receives cart items, creates Stripe Checkout Session
- Validates inventory availability before creating session
- Returns `sessionId` for client-side redirect

##### [NEW] [api/webhook/stripe/route.ts](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/api/webhook/stripe/route.ts)
- Stripe webhook handler for `checkout.session.completed`
- Creates order + order_items in database
- Decrements `product_variants.inventory_count`
- Sets order status to `paid`

##### [NEW] [checkout/success/page.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/checkout/success/page.tsx)
- Order confirmation page
- Display order summary from session ID

##### [NEW] [checkout/cancel/page.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/checkout/cancel/page.tsx)
- Cart preserved, "Return to cart" CTA

##### [MODIFY] [Cart.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/components/Cart.tsx)
- Replace `alert()` checkout stub with real Stripe redirect
- Add loading state during checkout

---

### Phase 3: Admin Dashboard

Admin pages live under `/admin` with a separate layout, sidebar nav, and admin-only access control.

##### Admin Access Setup
- Use InsForge's native `is_project_admin` flag on `auth.users` (already exists in the schema)
- After user registers, set `is_project_admin = true` on their account via `run-raw-sql`
- Admin pages check `is_project_admin` via the auth token server-side
- No additional RLS changes needed — `project_admin` policies already grant full CRUD on all tables

##### [NEW] [admin/layout.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/admin/layout.tsx)
- Admin layout wrapper with sidebar navigation
- Auth check + admin role verification (redirect if not admin)
- Sidebar links: Overview, Products, Orders, Inventory

##### [NEW] [admin/page.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/admin/page.tsx)
- Dashboard overview with stat cards:
  - Total revenue, Total orders, Active products, Low stock alerts
- Recent orders table (last 10)
- Quick actions (Add Product, View Orders)

##### [NEW] [admin/products/page.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/admin/products/page.tsx)
- Product list table: Name, Category, Base Price, Variants count, Status (Active/Inactive)
- Actions: Edit, Toggle Active, Delete
- "Add Product" button

##### [NEW] [admin/products/new/page.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/admin/products/new/page.tsx)
- Product creation form: name, description, category, subcategory, base_price, image upload
- Variant sub-form: add/remove variants (name, SKU, price, inventory_count)
- Image upload to `product-images` storage bucket

##### [NEW] [admin/products/[id]/edit/page.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/admin/products/[id]/edit/page.tsx)
- Edit existing product + its variants
- Same form as creation, pre-filled

##### [NEW] [admin/orders/page.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/admin/orders/page.tsx)
- Orders table: Order ID, Customer, Date, Status, Total
- Status filter (All, Pending, Paid, Shipped, Delivered)
- Click to view order details

##### [NEW] [admin/orders/[id]/page.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/admin/orders/[id]/page.tsx)
- Order detail view: items, customer info, shipping address
- Status update dropdown (Pending → Paid → Shipped → Delivered)

##### [NEW] [admin/inventory/page.tsx](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/admin/inventory/page.tsx)
- Inventory tracker: Variant name, SKU, Current stock, Product name
- Highlight low stock (< 5 units) in red/amber
- Inline stock quantity editing

##### Admin Components (new files under `src/components/admin/`):
- **[NEW] AdminSidebar.tsx** — sidebar navigation
- **[NEW] StatCard.tsx** — reusable stat card (icon, label, value)
- **[NEW] DataTable.tsx** — reusable sortable table
- **[NEW] ProductForm.tsx** — product creation/edit form
- **[NEW] ImageUpload.tsx** — file upload with preview, uploads to InsForge storage
- **[NEW] StatusBadge.tsx** — colored badge for order/product status

---

### Phase 4: Design System & Polish

##### [MODIFY] [globals.css](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/app/globals.css)
- Add CSS custom properties for accent color, muted text, card backgrounds
- Add Google Font import (Inter or similar)
- Utility classes for common patterns

##### [MODIFY] [tailwind.config.ts](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/tailwind.config.ts)
- Extend color palette with brand accent color
- Add custom font family
- Add animation utilities for micro-interactions

##### [MODIFY] [middleware.ts](file:///c:/Users/kevin/DEVELOPMENT/Projects/shop/src/middleware.ts)
- Add `/shop(.*)`, `/checkout(.*)` to public routes
- Keep `/admin(.*)` and `/dashboard(.*)` as protected routes

---

## File Summary

| Phase | New Files | Modified Files |
|-------|-----------|----------------|
| Phase 1 — Storefront | 10 | 2 |
| Phase 2 — Checkout | 4 | 1 |
| Phase 3 — Admin | 14 | 0 |
| Phase 4 — Polish | 0 | 3 |
| **Total** | **28** | **6** |

---

## Verification Plan

### Build Verification
- Run `npm run build` after each phase to confirm no TypeScript or build errors
- Run `npm run lint` after each phase

### Browser Testing (Per Phase)

#### Phase 1 — Storefront UI
1. Navigate to `/shop` — verify product grid renders with 9 items per page
2. Click pagination numbers — page changes, URL updates
3. Use search bar — type a product name, results filter
4. Change sort dropdown — products reorder
5. Click a category link — `/shop/[category]` loads filtered products
6. Verify breadcrumbs show correct path
7. Verify mobile responsiveness (resize browser to 375px width)

#### Phase 2 — Checkout
1. Add items to cart, click "Checkout"
2. Verify Stripe Checkout page loads (test mode)
3. Complete payment with test card (`4242 4242 4242 4242`)
4. Verify redirect to `/checkout/success`
5. Check database: new order + order_items created
6. Verify inventory decremented in `product_variants`

#### Phase 3 — Admin Dashboard
1. Log in as admin user → navigate to `/admin`
2. Verify stat cards show correct data
3. Create a new product with image upload → verify it appears in shop
4. Edit a product → verify changes persist
5. View orders list → click into order detail
6. Update order status → verify status persists
7. Check inventory page → verify stock levels match variants table
8. Log in as non-admin → verify `/admin` redirects away

### Manual Verification (User)
- **Stripe end-to-end**: After checkout integration, the user should make a test purchase and verify the full flow from cart → Stripe → order in dashboard
- **Admin UX**: User should test product creation/editing and provide feedback on the admin form flow
- **Mobile experience**: User should test the storefront on a real mobile device

---

## Implementation Order

1. **Phase 4 (Polish)** — Start here to establish the design system *before* building new components
2. **Phase 1 (Storefront)** — Build all customer-facing UI
3. **Phase 2 (Checkout)** — Wire up the payment flow
4. **Phase 3 (Admin)** — Build the admin dashboard last (depends on storage bucket + working product CRUD)

> Each phase will be implemented incrementally with build verification between steps.
