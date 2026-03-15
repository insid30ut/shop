import { createClient } from "@insforge/sdk";
import { notFound } from "next/navigation";
import { ProductOptions } from "@/components/ProductOptions";

// Initialize a server-side client
const insforge = createClient({
  baseUrl:
    process.env.NEXT_PUBLIC_INSFORGE_BASE_URL ||
    "https://mtirgjf3.us-east.insforge.app",
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "dummy",
});

export default async function ProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  // Fetch the product
  const { data: product, error: productError } = await insforge.database
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (productError || !product) {
    notFound();
  }

  // Fetch variants for this product
  const { data: variants, error: variantsError } = await insforge.database
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("price", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 flex flex-col md:flex-row gap-12">
      <div className="w-full md:w-1/2 flex justify-center items-start">
        <div className="aspect-square w-full max-w-md rounded-2xl bg-slate-800 border border-white/10 overflow-hidden relative shadow-2xl">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-slate-500 bg-gradient-to-br from-slate-900 to-slate-800">
              Image Coming Soon
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col gap-6 pt-4">
        <div>
          <span className="text-emerald-400 font-medium tracking-wider text-sm uppercase mb-2 block">
            {product.category || "Genetics"}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            {product.name}
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            {product.description ||
              "Top-tier mycology specimen, harvested under strict sterile conditions."}
          </p>
        </div>

        <div className="h-px w-full bg-white/10 my-4"></div>

        <div className="mt-8">
          <ProductOptions product={product as any} variants={variants || []} />
        </div>
      </div>
    </div>
  );
}
