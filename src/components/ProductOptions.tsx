"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";

interface ProductOptionProps {
  product: {
    id: string;
    name: string;
    image_url?: string;
    base_price: number;
    category?: string;
    description?: string;
  };
  variants: Array<{
    id: string;
    name: string;
    price: number;
    inventory_count: number;
    stripe_price_id?: string;
  }>;
}

export function ProductOptions({ product, variants }: ProductOptionProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants.length > 0 ? variants[0].id : ""
  );

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-slate-200">
        Select Option
      </h3>
      <div className="flex flex-col gap-3">
        {variants && variants.length > 0 ? (
          variants.map((variant) => (
            <label
              key={variant.id}
              className={`relative flex items-start p-4 cursor-pointer rounded-xl border transition-all ${
                selectedVariantId === variant.id
                  ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500"
                  : "border-white/20 hover:border-purple-500/50 hover:bg-white/5"
              } gap-4 group`}
            >
              <div className="flex items-center h-6">
                <input
                  name="variant"
                  type="radio"
                  className="w-5 h-5 accent-purple-600 bg-slate-800 border-white/20"
                  value={variant.id}
                  checked={selectedVariantId === variant.id}
                  onChange={() => setSelectedVariantId(variant.id)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {variant.name}
                </span>
                <span className="block text-sm mt-1">
                  {variant.inventory_count > 0 ? (
                    <span className="text-emerald-400">
                      {variant.inventory_count} in stock
                    </span>
                  ) : (
                    <span className="text-red-400">Out of Stock</span>
                  )}
                </span>
              </div>
              <div className="ml-4 flex-shrink-0 flex items-center h-full">
                <span className="font-bold text-lg text-purple-300">
                  $
                  {(
                    (variant.price > 0 ? variant.price : product.base_price) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
            </label>
          ))
        ) : (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-slate-400">
            <span className="block text-sm font-medium text-slate-200">
              Standard Edition
            </span>
            <span className="mt-2 text-xl font-bold text-purple-300">
              ${(product.base_price / 100).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-8">
        {selectedVariant ? (
          <AddToCartButton product={product} variant={selectedVariant} />
        ) : (
          <button
            disabled
            className="w-full py-4 px-8 bg-slate-700 text-white font-bold rounded-xl opacity-50 cursor-not-allowed"
          >
            Select an Option
          </button>
        )}
      </div>
    </div>
  );
}
