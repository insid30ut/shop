# The Psilocyber Underworld — Options & Suggestions

> Ideas, enhancements, and future possibilities for building out the store. Organized by priority and complexity.

---

## 🟢 Quick Wins (Low Effort, High Impact)

### 1. Product Image Storage
**What:** Create an InsForge storage bucket for product photos.
**Why:** Products currently show "No Image Provided" placeholders. Real images are the #1 conversion driver.
**How:** Single `create-bucket` MCP call → upload images via admin form → store URL in `products.image_url`.

### 2. Google Font (Inter)
**What:** Replace the default `Arial, Helvetica, sans-serif` with Inter via Google Fonts.
**Why:** Immediately elevates the design to feel modern and premium. Matches mycelialfunguy.com's clean aesthetic.
**How:** Add `<link>` in `layout.tsx` or use `next/font/google`, update `globals.css`.

### 3. Favicon & Meta
**What:** Add a proper favicon, Open Graph tags, and meta descriptions per page.
**Why:** Professional appearance in browser tabs and social sharing.
**How:** Add `favicon.ico` to `/public`, extend `metadata` exports in page files. 

### 4. Loading Skeletons
**What:** Add shimmer/skeleton placeholders while product data loads.
**Why:** Better perceived performance. The product grid currently shows nothing during load.
**How:** Create a `ProductCardSkeleton` component, use in `loading.tsx` files.

---

## 🟡 Core Features (Medium Effort, Essential)

### 5. Category & Subcategory Navigation
**Options:**
- **A) Dropdown menu in navbar** — Categories as a dropdown with subcategory sub-menus. Clean, space-efficient. ✅ **CHOSEN**
- **B) Sidebar filter on shop page** — Category list on left sidebar, products on right. Classic e-commerce pattern (like the reference screenshot).
- **C) Category cards on homepage** — Visual category tiles linking to `/shop/[category]`. Good for discovery.

### 6. Search Implementation
**Options:**
- **A) Client-side filter** — Fetch all products, filter in the browser. Simple but doesn't scale past ~100 products.
- **B) Server-side search via InsForge** — Use `.ilike()` or `.textSearch()` on product name/description. Scales well, paginated.
- **C) Dedicated search service** — Algolia, Meilisearch, etc. Overkill for current inventory size.
- **Recommendation:** Option B. Your product catalog is small enough that InsForge's built-in text search will work well, and it scales as you grow without extra infrastructure.

### 7. Product Sorting
**Options:**
- **Default sorting** (newest first)
- **Price: Low to High / High to Low**
- **Name: A-Z / Z-A**
- **Popularity** (requires tracking views or sales count — future enhancement)
- **Recommendation:** Start with Default, Price (both directions), and Name. Add popularity later when you have sales data.

### 8. Pagination Strategy
**Options:**
- **A) Numbered pages** — `1 2 3 4 →` (like the reference screenshot). Classic, predictable.
- **B) "Load More" button** — Appends to existing grid. Good for mobile, less jarring.
- **C) Infinite scroll** — Auto-loads on scroll. Engagement-maximizing but can feel disorienting.
- **Recommendation:** Option A (numbered pages) to match the reference screenshot. 9 products per page is a good default for a 3-column grid.

---

## 🔵 Checkout & Payments (Medium Effort, Revenue-Critical)

### 9. Stripe Integration Approach
**Options:**
- **A) Stripe Checkout (hosted)** — Redirect to Stripe's hosted payment page. Fastest to implement, PCI-compliant out of the box, handles address collection.
- **B) Stripe Elements (embedded)** — Embed payment form directly in your site. More control over UX but more code and PCI considerations.
- **C) Stripe Payment Links** — Pre-built payment links. Almost zero code but very limited customization.
- **Recommendation:** Option A (Stripe Checkout hosted). It handles payment collection, address verification, and is fully PCI-compliant. You can upgrade to embedded Elements later.

### 10. Post-Purchase Flow
**Suggestions:**
- **Order confirmation page** with order summary
- **Order confirmation email** (via Stripe's built-in receipts or a custom InsForge edge function)
- **Inventory auto-decrement** on successful payment (via Stripe webhook)
- **Order status tracking** in the customer dashboard (pending → paid → shipped → delivered)

### 11. Shipping Strategy
**Options:**
- **A) Flat rate** — Single fixed price for all orders ($5, $8, etc.)
- **B) Flat rate + free above threshold** — Flat rate applies below a configurable amount, free shipping above it. ✅ **CHOSEN**
- **C) Calculated shipping** — Based on weight/destination (requires Stripe Tax/Shipping API)

---

## 🟣 Admin Dashboard (Medium-High Effort)

### 12. Admin Layout Style
**Options:**
- **A) Sidebar navigation** — Persistent left sidebar with sections (Overview, Products, Orders, Inventory). Standard admin pattern.
- **B) Top tabbed navigation** — Horizontal tabs at the top. Simpler but less room for growth.
- **C) Collapsible sidebar** — Sidebar that can toggle between expanded and icon-only mode. Best of both worlds.
- **Recommendation:** Option A for now. Simple and effective. Upgrade to Option C if the admin grows complex.

### 13. Product Management
**Capabilities to build (in order):**
1. **View products** — Table with name, category, price, variant count, active status
2. **Create product** — Form with name, description, category, subcategory, base_price, image upload
3. **Add variants** — Sub-form on product page: name, SKU, price, inventory_count
4. **Edit product** — Same form, pre-filled
5. **Toggle active/inactive** — Quick toggle without full edit
6. **Delete product** — Soft (is_active = false) vs. hard delete. Soft delete recommended to preserve order history.

### 14. Order Management
**Capabilities:**
1. **Order list** — Sortable table: Order #, Customer, Date, Status, Total
2. **Order detail** — Full breakdown: items, customer info, shipping address
3. **Status updates** — Change status (pending → paid → shipped → delivered)
4. **Filters** — Filter by status, date range

### 15. Inventory Tracking
**Suggestions:**
- **Low stock alerts** — Highlight variants with `inventory_count < 5`
- **Inline editing** — Click a stock number to update it in-place
- **Stock history** (future) — Track changes over time
- **Restock notifications** (future) — Email/webhook when stock hits zero

---

## 🔴 Future Enhancements (Higher Effort, Nice-to-Have)

### 16. Customer Reviews
**What:** Let customers leave reviews on products they've purchased.
**How:** New `reviews` table (user_id, product_id, rating, comment). Display on product page.
**Complexity:** Medium. Requires moderation consideration.

### 17. Discount Codes / Coupons
**What:** Admin can create coupon codes for percentage or fixed-amount discounts.
**How:** New `coupons` table. Apply at checkout via Stripe Coupon API.
**Complexity:** Medium.

### 18. Email Notifications
**Options:**
- **Stripe receipts** — Built-in, zero effort
- **Transactional emails** — Via InsForge edge functions + email API (Resend, SendGrid)
- **Marketing emails** — Newsletter signup, product announcements (Mailchimp, ConvertKit)
- **Recommendation:** Start with Stripe receipts. Add transactional emails for order status updates later.

### 19. Analytics Dashboard
**What:** Track views, conversions, revenue trends over time.
**How:** Could use InsForge database to log events, or integrate Vercel Analytics / Plausible.
**Complexity:** Medium-High.

### 20. Multi-Image Product Gallery
**What:** Multiple images per product (carousel/gallery on detail page).
**How:** New `product_images` table or JSONB array on products. Image upload in admin.
**Complexity:** Medium.

### 21. Wishlist / Save for Later
**What:** Customers can save products to a wishlist.
**How:** New `wishlists` table (user_id, product_id). Heart icon on product cards.
**Complexity:** Low-Medium.

### 22. Related Products
**What:** "You might also like" section on product detail page.
**How:** Query same-category products, excluding current product.
**Complexity:** Low.

### 23. Stock Webhooks / Notifications
**What:** Get notified (email, Discord, Slack) when a product hits low stock or sells out.
**How:** InsForge edge function triggered by inventory change, sends webhook.
**Complexity:** Medium.

---

## Priority Roadmap Suggestion

| Priority | Items | Rationale |
|----------|-------|-----------|
| **Now** | #1 (Images), #2 (Font), #5 (Categories), #6 (Search), #7 (Sorting), #8 (Pagination) | Core shopping experience |
| **Next** | #9 (Stripe), #10 (Post-Purchase), #12 (Admin Layout), #13 (Product CRUD) | Revenue + management |
| **Then** | #14 (Orders), #15 (Inventory), #3 (Meta), #4 (Skeletons) | Operations + polish |
| **Later** | #16-23 (Reviews, Coupons, Analytics, etc.) | Growth features |
