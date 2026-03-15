import { createClient } from "@insforge/sdk";
import { Metadata } from "next";

// Initialize a server-side client for Data Fetching in Server Components
const insforge = createClient({
  baseUrl:
    process.env.NEXT_PUBLIC_INSFORGE_BASE_URL ||
    "https://mtirgjf3.us-east.insforge.app",
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "dummy",
});

export const metadata: Metadata = {
  title: "Home",
  description: "Discover premium mushroom spore prints, swabs, and top-tier cultivation supplies.",
};

export default async function Home() {
  // Fetch active products from InsForge database
  const { data: products, error } = await insforge.database
    .from("products")
    .select("*")
    .eq("is_active", true);

  if (error) {
    return (
      <div className="flex justify-center mt-20 text-red-400">
        <p>Error loading shop items: {error.message}</p>
      </div>
    );
  }

  return (
    <main aria-label="Home Page" className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 flex flex-col gap-10">
      <section className="py-20 text-center flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 rounded-3xl border border-white/5">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          Uncompromising Quality
        </h2>
        <p className="text-xl text-slate-400 max-w-2xl px-4">
          Discover premium mushroom spore prints, swabs, and top-tier cultivation supplies.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <a 
                href={`/product/${product.id}`} 
                key={product.id}
                className="group p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300 flex flex-col gap-4"
              >
                <div className="aspect-square w-full rounded-xl bg-slate-800 overflow-hidden relative">
                  {/* Handle missing images gracefully for the MVP */}
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-slate-600">
                      No Image Provided
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold truncate text-slate-200 group-hover:text-white transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                    {product.description || "Premium mycology item."}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="font-medium text-emerald-300">
                    From ${(product.base_price / 100).toFixed(2)}
                  </span>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded-full group-hover:bg-emerald-500/20 transition-colors text-white/70">
                    View Options
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10 text-slate-400">
            <p className="text-xl">Store is currently being stalked.</p>
            <p className="text-sm mt-2">Check back soon for new inventory.</p>
          </div>
        )}
      </section>
    </main>
  );
}
