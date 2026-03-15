import { insforge } from "@/lib/insforge";
import Link from "next/link";
import { Eye } from "lucide-react";

export default async function AdminOrdersPage() {
  const { data: orders, error } = await insforge.database
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="text-red-400">Failed to load orders: {error.message}</div>;
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'shipped': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'delivered': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Orders</h1>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {orders?.map((order) => {
                const customerName = (order.shipping_details as any)?.name || "Unknown Customer";
                return (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 font-medium text-white">{customerName}</td>
                    <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">${(order.total_amount / 100).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No orders have been placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
