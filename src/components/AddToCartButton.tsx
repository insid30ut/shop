"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";

interface AddToCartProps {
  product: {
    id: string;
    name: string;
    image_url?: string;
  };
  variant: {
    id: string;
    name: string;
    price: number;
    stripe_price_id?: string;
    inventory_count: number;
  };
}

export function AddToCartButton({ product, variant }: AddToCartProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  const disabled = variant.inventory_count <= 0;

  const handleAdd = () => {
    if (disabled) return;
    
    addItem({
      variantId: variant.id,
      productId: product.id,
      name: product.name,
      variantName: variant.name,
      price: variant.price,
      quantity: 1,
      stripePriceId: variant.stripe_price_id,
      imageUrl: product.image_url,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={disabled}
      className={`w-full py-4 px-8 font-bold text-white rounded-xl shadow-lg transition-all active:scale-[0.98] ${
        disabled
          ? "bg-slate-700 opacity-50 cursor-not-allowed shadow-none"
          : isAdded
          ? "bg-emerald-600 shadow-emerald-900/40"
          : "bg-purple-600 hover:bg-purple-500 shadow-purple-900/40"
      }`}
    >
      {disabled ? "Out of Stock" : isAdded ? "Added to Cart!" : "Add to Cart"}
    </button>
  );
}
