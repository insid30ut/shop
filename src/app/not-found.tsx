import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
        <Search className="w-10 h-10 text-slate-400" />
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4">
        404
      </h1>
      <h2 className="text-2xl font-bold text-slate-300 mb-4">
        Page Not Found
      </h2>
      <p className="text-lg text-slate-400 max-w-md mx-auto mb-10">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40 text-white font-semibold rounded-xl transition-all shadow-lg hover:-translate-y-0.5"
      >
        Return to Store
      </Link>
    </div>
  );
}
