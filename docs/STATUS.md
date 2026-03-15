# Project Status Report: The Psilocyber Underworld

**Last Updated:** March 2026

This document serves as a snapshot of the current project state, recording what has been completed and what is pending next. Use this as a jumping-off point when resuming work on the project.

---

## 🎯 Current State Summary

We have successfully established the foundational database schema, authentication, and the complete **Admin Dashboard** allowing for full inventory and order management. The storefront exists as an MVP but needs advanced browsing features and a functional Stripe checkout.

### 🏗️ Tech Stack
- **Framework:** Next.js 15.5 (App Router)
- **Backend / Database:** InsForge (PostgreSQL, Auth, Storage)
- **Styling:** Tailwind CSS v3.4 
- **State Management:** Zustand (for Cart)
- **Payments:** Stripe (SDK installed, checkout pending)

---

## ✅ Completed Milestones

### 1. Database & Authentication
- Full database schema with Row Level Security (RLS) policies implemented: `products`, `product_variants`, `orders`, `order_items`, `profiles`.
- Authentication flow configured via `@insforge/nextjs` (Email/Password, Google, GitHub).
- Admin role checking established via backend tokens.

### 2. Admin Dashboard (Phase 3 of Plan)
- **Layout & Protection:** Admin routes (`/admin/*`) strictly protected. Users must be authenticated and authorized.
- **Overview (`/admin`):** High-level statistics (Total Revenue, Total Orders, Active products) and recent orders list.
- **Product Management (`/admin/products` & `/admin/products/new`):**
  - List all products with their active status.
  - Create new products with base pricing, categories, and automated default variants.
  - Integrated **InsForge Storage** (`product-images` bucket) for direct image uploads.
- **Order Management (`/admin/orders` & `/admin/orders/[id]`):**
  - Global list of all orders.
  - Granular order details view showing purchased items, quantities, and customer shipping details.
  - Client-side Order Status updater (Pending -> Paid -> Shipped -> Delivered -> Cancelled).

---

## 🚀 Next Steps (Where to Resume)

When returning to the project, the primary focuses should be shifting to **Phase 1 (Storefront UI)** and **Phase 2 (Checkout Flow)** from the master plan (`docs/PLAN-storefront-admin.md`):

### 1. Storefront Upgrades (Phase 1)
- **Global Layout:** Implement `Navbar.tsx` (with categories) and standard `Footer.tsx`.
- **Advanced Shopping (`/shop`):** 
  - Create the dedicated Shop route.
  - Add Pagination, Category filtering, and Sorting.
  - Add search functionality (`SearchBar.tsx`).
- **Product Cards:** Refine the presentation of products on the Home and Shop pages.

### 2. Stripe Checkout Integration (Phase 2)
- **API Endpoints:** Create `/api/checkout/route.ts` to generate Stripe Session IDs based on current cart contents.
- **Webhooks:** Create `/api/webhook/stripe/route.ts` to listen for `checkout.session.completed`, which will:
  - Create the `orders` and `order_items` records in the database.
  - Decrement inventory in `product_variants`.
  - Mark order status as `paid`.
- **UI Flow:** Wire the "Checkout" button in the slide-out Cart to redirect to Stripe, and build the Success/Cancel return pages.

### 3. Polish & Edge Cases
- Dynamic variant selection on the storefront product pages (currently using a default variant approach).
- Low inventory warnings on the admin dashboard.

---

## 💡 Notes for the AI Agent
When requested to "resume work" or "continue with the plan", reference this `STATUS.md` file alongside `docs/PLAN-storefront-admin.md` to pick up exactly where development left off.
