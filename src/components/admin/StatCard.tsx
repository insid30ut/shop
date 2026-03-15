import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  good?: boolean;
}

export default function StatCard({ title, value, icon, trend, good }: StatCardProps) {
  return (
    <div aria-label="Stat Card" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-400 font-medium">{title}</h3>
        <div className="p-2 bg-slate-800/50 rounded-lg">{icon}</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-white">{value}</div>
        {trend && (
          <div className={`text-sm mt-2 font-medium ${good ? 'text-emerald-400' : 'text-slate-500'}`}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
