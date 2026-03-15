# The Psilocyber Underworld — Architecture Blueprint

> How this e-commerce store works and how it is built.

---

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER                            │
│                                                         │
│  Next.js App (React 19 + App Router)                    │
│  ├── Public Pages (SSR)     → Shop, Product, Home       │
│  ├── Auth'd Pages (SSR)     → Dashboard, Checkout       │
│  ├── Admin Pages (SSR)      → Admin Dashboard           │
│  └── Client Components      → Cart, Forms, Search       │
│                                                         │
│  State: Zustand (cart) · URL params (search/filter)     │
│  Styling: Tailwind CSS 3.4                              │
└───────────────┬─────────────────────────┬───────────────┘
                │                         │
        API Routes                  Direct SDK
    (server-side only)           (Server Components)
                │                         │
┌───────────────▼─────────────────────────▼───────────────┐
│                    INSFORGE (BaaS)                       │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────┐ │
│  │ Database │  │   Auth   │  │  Storage  │  │  Edge  │ │
│  │ Postgres │  │ Sessions │  │  Buckets  │  │  Func  │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └───┬────┘ │
│       │              │              │             │      │
│  RLS policies   OAuth/Email    product-images   (future) │
│  PostgREST API  JWT tokens     Public bucket             │
└─────────────────────────────────────────────────────────┘
                │
    ┌───────────▼───────────┐
    │       STRIPE          │
    │                       │
    │  Checkout Sessions    │
    │  Webhooks → orders    │
    │  Test mode keys       │
    └───────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | SSR, routing, API routes |
| **Language** | TypeScript (strict) | Type safety |
| **UI** | React 19 | Components |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS |
| **State** | Zustand + localStorage persist | Shopping cart |
| **Backend** | InsForge | Database, Auth, Storage |
| **Payments** | Stripe | Checkout sessions |
| **Icons** | Lucide React | UI icons |
| **Utils** | clsx + tailwind-merge | Class merging |

---

## Database Schema

Five tables in PostgreSQL, accessed via InsForge's PostgREST API. All tables have Row Level Security (RLS) enabled.

```
┌──────────────┐     ┌──────────────────┐
│   products   │────<│ product_variants │
├──────────────┤     ├──────────────────┤
│ id (uuid PK) │     │ id (uuid PK)     │
│ name         │     │ product_id (FK)  │
│ description  │     │ name             │
│ image_url    │     │ sku (unique)     │
│ base_price   │     │ price (cents)    │
│ is_active    │     │ inventory_count  │
│ category     │     │ stripe_price_id  │
│ subcategory  │     │ attributes (json)│
│ options (json)│    │ created_at       │
│ created_at   │     └──────────────────┘
└──────────────┘

┌──────────────┐     ┌──────────────────┐
│    orders    │────<│   order_items    │
├──────────────┤     ├──────────────────┤
│ id (uuid PK) │     │ id (uuid PK)     │
│ user_id (FK) │     │ order_id (FK)    │
│ stripe_sess  │     │ variant_id (FK)  │
│ status       │     │ quantity         │
│ total_amount │     │ price_at_time    │
│ shipping_det │     │ created_at       │
│ created_at   │     └──────────────────┘
└──────┬───────┘
       │
┌──────▼───────┐
│   profiles   │
├──────────────┤
│ id (uuid PK) │
│ full_name    │
│ shipping_addr│
│ stripe_cust  │
│ created_at   │
└──────────────┘
```

### Relationships
- `product_variants.product_id` → `products.id` (CASCADE delete)
- `order_items.order_id` → `orders.id` (CASCADE delete)
- `order_items.variant_id` → `product_variants.id` (SET NULL on delete)
- `orders.user_id` → `profiles.id` (SET NULL on delete)

### RLS Policies

| Table | Public (anonymous) | Authenticated User | Admin |
|-------|-------------------|-------------------|-------|
| `products` | SELECT where `is_active = true` | Same | Full CRUD |
| `product_variants` | SELECT all | Same | Full CRUD |
| `orders` | — | SELECT own orders | Full CRUD |
| `order_items` | — | SELECT own items | Full CRUD |
| `profiles` | — | SELECT/UPDATE own | Full CRUD |

### Price Convention
All prices are stored in **cents** (integer). Display conversion: `(price / 100).toFixed(2)`.

---

## Authentication

**Provider:** InsForge Auth (built on top of their auth service)

**Methods:**
- Email + Password (with email verification via code)
- Google OAuth
- GitHub OAuth

**How it works in Next.js:**
1. `@insforge/nextjs` provides `<SignedIn>`, `<SignedOut>`, `<SignInButton>`, `<SignUpButton>`, `<UserButton>` components
2. `InsforgeMiddleware` in `middleware.ts` protects routes — only paths listed in `publicRoutes` are accessible without auth
3. Server-side: `auth()` from `@insforge/nextjs/server` returns `{ token, user }`
4. API routes: `createAuthRouteHandlers()` handles auth callback endpoints at `/api/auth`

**Public routes:** `/`, `/product(.*)`, `/shop(.*)`, `/checkout(.*)`, `/api/webhook/stripe`
**Protected routes:** `/dashboard(.*)`, `/admin(.*)`

---

## Admin Access

**Strategy:** InsForge's native `is_project_admin` flag on `auth.users`.

- InsForge's auth system has a built-in `is_project_admin` boolean on the `auth.users` table
- Admin pages (`/admin/*`) check this flag server-side via `auth()` before rendering
- The `project_admin` RLS role on all tables automatically grants full CRUD to admin users
- No env vars needed — the flag lives in the database

**Adding new admins:** Set `is_project_admin = true` on a user's `auth.users` row via SQL.

---

## Shipping

**Strategy:** Flat-rate + free above threshold (configurable).

- **Flat rate** applies to orders below the threshold
- **Free shipping** kicks in when order total exceeds the threshold
- Both values are configurable via environment variables:
  - `SHIPPING_FLAT_RATE` (in cents, e.g., `599` = $5.99)
  - `FREE_SHIPPING_THRESHOLD` (in cents, e.g., `5000` = $50.00)
- Shipping is calculated server-side in the checkout API route and passed to Stripe

---

## Shopping Cart

**State management:** Zustand with `persist` middleware (localStorage)

**Cart store** (`src/store/cart.ts`):
- `items[]` — array of `CartItem` (variantId, productId, name, variantName, price, quantity, stripePriceId, imageUrl)
- `addItem()` — adds or increments quantity
- `removeItem()` — removes by variantId
- `updateQuantity()` — set quantity, auto-removes at 0
- `clearCart()` — empties cart
- `totalItems()` / `totalPrice()` — computed values

**Persistence:** Cart survives page refresh via `localStorage` key `myco-cart-storage`.

---

## Checkout Flow (Planned)

```
Cart → Click "Checkout"
  → POST /api/checkout (server-side)
    → Validate inventory
    → Create Stripe Checkout Session
    → Return sessionId
  → Redirect to Stripe Checkout
    → Customer pays
    → Stripe redirects to /checkout/success or /checkout/cancel

Stripe → POST /api/webhook/stripe
  → Verify webhook signature
  → Create order + order_items in database
  → Decrement inventory_count on variants
  → Set order.status = 'paid'
```

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (header, footer, providers)
│   ├── page.tsx                # Home page (hero + featured products)
│   ├── globals.css             # CSS variables + Tailwind directives
│   ├── providers.tsx           # InsforgeProvider wrapper
│   │
│   ├── shop/                   # [PLANNED] Shop browsing pages
│   │   ├── page.tsx            #   All products with search/sort/paginate
│   │   ├── [category]/
│   │   │   ├── page.tsx        #   Category-filtered products
│   │   │   └── [subcategory]/
│   │   │       └── page.tsx    #   Subcategory-filtered products
│   │
│   ├── product/
│   │   └── [id]/page.tsx       # Product detail + variant selection
│   │
│   ├── checkout/               # [PLANNED] Post-checkout pages
│   │   ├── success/page.tsx
│   │   └── cancel/page.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx            # Customer order history
│   │
│   ├── admin/                  # [PLANNED] Admin dashboard
│   │   ├── layout.tsx          #   Sidebar layout + auth check
│   │   ├── page.tsx            #   Overview stats
│   │   ├── products/
│   │   │   ├── page.tsx        #   Product list
│   │   │   ├── new/page.tsx    #   Create product form
│   │   │   └── [id]/edit/
│   │   │       └── page.tsx    #   Edit product form
│   │   ├── orders/
│   │   │   ├── page.tsx        #   Order list
│   │   │   └── [id]/page.tsx   #   Order detail
│   │   └── inventory/
│   │       └── page.tsx        #   Inventory tracker
│   │
│   └── api/
│       ├── auth/route.ts       # InsForge auth handlers
│       ├── checkout/route.ts   # [PLANNED] Stripe session creation
│       └── webhook/
│           └── stripe/route.ts # [PLANNED] Stripe webhook
│
├── components/
│   ├── Cart.tsx                # Slide-out cart sidebar
│   ├── AddToCartButton.tsx     # Add-to-cart with feedback
│   ├── ProductOptions.tsx      # Variant selection radio group
│   │
│   ├── Navbar.tsx              # [PLANNED] Navigation bar
│   ├── Footer.tsx              # [PLANNED] Footer
│   ├── Breadcrumbs.tsx         # [PLANNED] Path breadcrumbs
│   ├── SearchBar.tsx           # [PLANNED] Search input
│   ├── SortDropdown.tsx        # [PLANNED] Sort selector
│   ├── Pagination.tsx          # [PLANNED] Page navigation
│   ├── ProductCard.tsx         # [PLANNED] Product grid card
│   │
│   └── admin/                  # [PLANNED] Admin components
│       ├── AdminSidebar.tsx
│       ├── StatCard.tsx
│       ├── DataTable.tsx
│       ├── ProductForm.tsx
│       ├── ImageUpload.tsx
│       └── StatusBadge.tsx
│
├── lib/
│   └── insforge.ts             # InsForge SDK client instance
│
├── store/
│   └── cart.ts                 # Zustand cart store
│
└── middleware.ts               # Route protection middleware
```

---

## Design System

### Color Palette (matching mycelialfunguy.com)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a0b` | Page background |
| `--bg-card` | `#111114` | Card/panel backgrounds |
| `--bg-elevated` | `#1a1a1f` | Hover states, elevated surfaces |
| `--accent` | `rgb(45, 212, 191)` | Primary accent (teal/cyan) |
| `--accent-glow` | `rgba(45, 212, 191, 0.4)` | Glow effects |
| `--secondary` | `rgba(168, 85, 247, 0.5)` | Purple secondary glow |
| `--text-primary` | `#ffffff` | Headings |
| `--text-body` | `#a1a1aa` | Body text (zinc-400) |
| `--text-muted` | `#71717a` | Muted/label text (zinc-500) |
| `--border` | `rgba(255, 255, 255, 0.1)` | Borders |
| `--success` | `#34d399` | In stock, success |
| `--danger` | `#f87171` | Out of stock, errors |

### Typography
- **Font:** Inter (Google Fonts) — clean, modern sans-serif
- **Headings:** Bold/Extrabold, white
- **Body:** Regular weight, muted grey
- **Code/SKU:** Monospace

### Component Patterns
- **Cards:** Dark background, rounded-xl/2xl, subtle border, hover glow
- **Buttons:** Rounded-xl, teal primary, scale-on-click feedback
- **Inputs:** Dark background, border on focus, rounded-lg
- **Badges:** Rounded-full, semi-transparent colored background
