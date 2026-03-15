import { insforge } from "@/lib/insforge";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function AdminProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const isNew = params.id === "new";
  
  let product = null;

  if (!isNew) {
    const { data, error } = await insforge.database
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single();
      
    if (error || !data) {
      return notFound();
    }
    
    product = data;
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>
      
      <ProductForm initialData={product} />
    </div>
  );
}
