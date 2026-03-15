import { insforge } from "@/lib/insforge";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";
import { notFound } from "next/navigation";
import OrderStatusForm from "@/components/admin/OrderStatusForm";

export default async function AdminOrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { data: order, error } = await insforge.database
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("id", params.id)
    .single();

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
        <p className="text-slate-400">The order you&apos;re looking for does not exist.</p>
        <Link href="/admin/orders" className="mt-6 text-emerald-400 hover:text-emerald-300">
          Back to Orders
        </Link>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shipping = order.shipping_details as any;

  return (
    <div aria-label="Order Details Page" className="space-y-6 max-w-4xl mx-auto">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Order Details</h1>
            <p className="text-slate-400 font-mono mt-2">ID: {order.id}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Status</div>
            <span className="px-3 py-1 bg-slate-800 text-white rounded-full text-sm font-medium">
              {order.status}
            </span>
            <div className="text-sm text-slate-500 mt-2">
              {new Date(order.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-3 font-medium">
                <MapPin className="w-5 h-5 text-emerald-400" />
                Shipping Information
              </div>
              {shipping ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm space-y-1">
                  <p className="font-semibold text-white">{shipping.name}</p>
                  <p>{shipping.email}</p>
                  <p className="pt-2">{shipping.address?.line1}</p>
                  {shipping.address?.line2 && <p>{shipping.address?.line2}</p>}
                  <p>{shipping.address?.city}, {shipping.address?.state} {shipping.address?.postal_code}</p>
                  <p>{shipping.address?.country}</p>
                </div>
              ) : (
                <p className="text-slate-500">No shipping details provided.</p>
              )}
            </div>
            
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </div>

          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-3 font-medium">
              <Package className="w-5 h-5 text-emerald-400" />
              Order Items
            </div>
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="p-4 flex justify-between items-start text-sm">
                  <div>
                    <p className="font-medium text-white">{item.quantity}x Item Variant {item.variant_id?.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-300 font-medium">${((item.price_at_time * item.quantity) / 100).toFixed(2)}</p>
                    <p className="text-slate-500 text-xs">${(item.price_at_time / 100).toFixed(2)} each</p>
                  </div>
                </div>
              ))}
              
              <div className="p-4 bg-slate-900 border-t border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-300">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Total
                </div>
                <span className="font-bold text-xl text-emerald-400">
                  ${(order.total_amount / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
