import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-800 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="text-slate-400 font-medium animate-pulse">
        Loading...
      </p>
    </div>
  );
}
