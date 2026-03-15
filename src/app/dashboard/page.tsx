import { auth } from "@insforge/nextjs/server";
import { createClient } from "@insforge/sdk";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Dashboard() {
  // 1. Get user session from server-side cookies
  const { token, user } = await auth();

  if (!user || !token) {
    redirect("/"); // Or redirect to sign-in page if defined
  }

  // 2. Initialize authenticated SDK
  const insforge = createClient({
    baseUrl:
      process.env.NEXT_PUBLIC_INSFORGE_BASE_URL ||
      "https://mtirgjf3.us-east.insforge.app",
    edgeFunctionToken: token, // Used for secure API or DB access as this user
  });

  // 3. Fetch user's orders (RLS protects this query automatically based on their token)
  const { data: orders, error } = await insforge.database
    .from("orders")
    .select("*, order_items(*, product_variants(name, products(name, image_url)))")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="flex items-center gap-6 mb-12">
        {user.profile?.avatar_url && (
          <img
            src={user.profile.avatar_url}
            alt="Avatar"
            className="w-16 h-16 rounded-full border-2 border-emerald-500"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.profile?.name || user.email}</h1>
          <p className="text-slate-400">Manage your orders and account settings.</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 bg-slate-950/50">
          <h2 className="text-xl font-semibold">Order History</h2>
        </div>
        
        <div className="p-6">
          {error ? (
            <div className="text-red-400 p-4 rounded-xl bg-red-900/20 border border-red-500/20">
              Error loading orders: {error.message}
            </div>
          ) : orders && orders.length > 0 ? (
             <div className="flex flex-col gap-6">
              {orders.map((order) => (
                <div key={order.id} className="p-6 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-4">
                  <div className="flex justify-between items-start border-b border-white/10 pb-4">
                    <div>
                      <span className="text-sm text-slate-400">Order #{order.id.split('-')[0]}</span>
                      <div className="mt-1 font-medium text-slate-200">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                        {order.status}
                      </span>
                      <div className="mt-2 font-bold text-lg text-emerald-300">
                        ${(order.total_amount / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Items list */}
                  <div className="flex flex-col gap-3">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-slate-300">
                          {item.quantity}x {item.product_variants?.products?.name} - {item.product_variants?.name}
                        </span>
                        <span>${(item.price_at_time * item.quantity / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p>You haven&apos;t placed any orders yet.</p>
              <Link href="/" className="inline-block mt-4 text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Browse our store
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
