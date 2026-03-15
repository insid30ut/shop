"use client";

import { useState } from "react";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { loadStripe } from "@stripe/stripe-js";

// Make sure to call `loadStripe` outside of a component’s render to avoid recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_dummy"
);

export function Cart() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, updateQuantity, totalPrice, totalItems } =
    useCartStore();

  const handleCheckout = async () => {
    try {
      // In a real app we'd call an API route here to create a Checkout Session securely via the Stripe Node SDK
      // For MVP we just alert
      alert("Checkout integration requires a backend Stripe Secret Key setup via InsForge edge functions which we will do next!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative group p-2 text-slate-300 hover:text-white transition-colors"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems() > 0 && (
          <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-lg border-2 border-slate-900">
            {totalItems()}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-slate-900 border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            Your Cart
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
              <ShoppingCart className="w-16 h-16 opacity-20 relative -left-1" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="w-20 h-20 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-emerald-300 font-medium">
                      {item.variantName}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-slate-950 rounded-lg border border-white/10 p-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-bold text-sm">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.variantId)}
                  className="p-2 self-start hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-slate-950/50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-300">Subtotal</span>
              <span className="text-2xl font-bold">
                ${(totalPrice() / 100).toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/40 transition-all active:scale-[0.98]"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
