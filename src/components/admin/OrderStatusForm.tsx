"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge";
import { useRouter } from "next/navigation";

export default function OrderStatusForm({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await insforge.database.from("orders").update({ status }).eq("id", orderId);
      router.refresh();
      alert("Order status updated!");
    } catch (error) {
      alert("Failed to update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl mt-6">
      <span className="text-sm font-medium text-slate-300">Update Status:</span>
      <select 
        value={status} 
        onChange={(e) => setStatus(e.target.value)}
        className="bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
      >
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button 
        onClick={handleUpdate} 
        disabled={loading || status === currentStatus}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm ml-auto"
      >
        {loading ? "Updating..." : "Save"}
      </button>
    </div>
  );
}
