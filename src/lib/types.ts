/**
 * Shared type definitions for the Psilocyber Underworld store.
 * These types mirror the InsForge database schema.
 */

/** Product record from the `products` table. */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  is_active: boolean;
  category: string | null;
  subcategory: string | null;
  options: Record<string, unknown>[];
  created_at: string;
}

/** Product variant record from the `product_variants` table. */
export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price: number;
  inventory_count: number;
  stripe_price_id: string | null;
  attributes: Record<string, unknown>;
  created_at: string;
}

/** Order record from the `orders` table. */
export interface Order {
  id: string;
  user_id: string | null;
  stripe_session_id: string | null;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_details: ShippingDetails | null;
  created_at: string;
}

/** Order item record from the `order_items` table. */
export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string | null;
  quantity: number;
  price_at_time: number;
  created_at: string;
}

/** User profile record from the `profiles` table. */
export interface Profile {
  id: string;
  full_name: string | null;
  shipping_address: ShippingAddress | null;
  stripe_customer_id: string | null;
  created_at: string;
}

/** Shipping address stored as JSONB in profiles and orders. */
export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

/** Shipping details stored on an order. */
export interface ShippingDetails {
  address: ShippingAddress;
  name: string;
  email?: string;
}

/** Cart item used in the Zustand cart store. */
export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  stripePriceId?: string;
  imageUrl?: string;
}

/**
 * Order with nested relations (used by dashboard).
 * Matches the InsForge select with embedded joins.
 */
export interface OrderWithItems extends Order {
  order_items: Array<OrderItem & {
    product_variants: (Pick<ProductVariant, 'name'> & {
      products: Pick<Product, 'name' | 'image_url'>;
    }) | null;
  }>;
}
