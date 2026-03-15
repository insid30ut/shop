"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import { insforge } from "@/lib/insforge";

export default function ProductForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    base_price: initialData ? initialData.base_price / 100 : 0,
    is_active: initialData ? initialData.is_active : true,
    image_url: initialData?.image_url || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      base_price: Math.round(formData.base_price * 100),
    };

    try {
      if (initialData?.id) {
        await insforge.database.from("products").update(payload).eq("id", initialData.id);
      } else {
        await insforge.database.from("products").insert([payload]);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-white tracking-tight">
        {initialData ? "Edit Product" : "Add New Product"}
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
          <input
            required
            type="text"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
          <textarea
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white h-32 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Base Price ($)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={formData.base_price}
            onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
          />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-5 h-5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-slate-300">Active (Visible in Store)</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Image</label>
          <ImageUpload 
            value={formData.image_url} 
            onChange={(url) => setFormData({ ...formData, image_url: url })} 
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-900/40 transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
}
