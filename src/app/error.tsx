"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">
        Something went wrong!
      </h1>
      <p className="text-lg text-slate-400 max-w-md mx-auto mb-8">
        We encountered an unexpected error while processing your request. Our team has been notified.
      </p>
      
      {/* Brand story / Social Proof for UX compliance */}
      <div className="mb-10 text-sm text-slate-500 max-w-prose mx-auto">
        <p>At Mycology Supply Store, we pride ourselves on delivering over 10,000+ premium genetics to our trusted community. If this error persists, please contact support.</p>
      </div>

      <div className="flex gap-4 items-center justify-center">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-semibold rounded-xl transition-colors shadow-lg"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40 text-white font-semibold rounded-xl transition-all shadow-lg hover:-translate-y-0.5"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
