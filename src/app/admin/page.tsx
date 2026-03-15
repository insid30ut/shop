import { insforge } from "@/lib/insforge";
import { Package, TrendingUp, ShoppingCart, DollarSign } from "lucide-react";
import StatCard from "@/components/admin/StatCard";

export default async function AdminDashboard() {
  const { data: products } = await insforge.database.from("products").select("id", { count: "exact" });
  const { data: orders } = await insforge.database.from("orders").select("total_amount", { count: "exact" });
  
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const orderCount = orders?.length || 0;
  const productCount = products?.length || 0;

  return (
    <div aria-label="Admin Dashboard" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-400 mt-2">Welcome back to your mycology store admin panel.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${(totalRevenue / 100).toFixed(2)}`} 
          icon={<DollarSign className="w-6 h-6 text-emerald-400" />} 
          trend="+12% this month"
          good
        />
        <StatCard 
          title="Total Orders" 
          value={orderCount.toString()} 
          icon={<ShoppingCart className="w-6 h-6 text-emerald-400" />} 
          trend="+5% this month"
          good
        />
        <StatCard 
          title="Active Products" 
          value={productCount.toString()} 
          icon={<Package className="w-6 h-6 text-emerald-400" />} 
          trend="0 changed"
        />
        <StatCard 
          title="Conversion Rate" 
          value="4.2%" 
          icon={<TrendingUp className="w-6 h-6 text-emerald-400" />} 
          trend="+0.6% this month"
          good
        />
      </div>
      
      {/* Recent Orders Overview could go here */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
        <div className="text-slate-400">
           Use the sidebar to navigate to Products or Orders interfaces. Setup detailed metrics here in a future PR.
        </div>
      </div>
    </div>
  );
}
