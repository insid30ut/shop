"use client";

import { useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { insforge } from "@/lib/insforge";

export default function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error } = await insforge.storage
        .from('images')
        .upload(filePath, file);

      if (error) throw error;

      const publicUrl = insforge.storage.from('images').getPublicUrl(filePath);
      onChange(publicUrl);
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-slate-700 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Product Upload" className="w-full h-auto object-cover aspect-video" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              type="button" 
              onClick={() => onChange("")} 
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-900 hover:bg-slate-800 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 text-slate-400 mb-3" />
            <p className="text-sm text-slate-400 font-medium">
              {uploading ? "Uploading..." : "Click to upload image"}
            </p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
}
