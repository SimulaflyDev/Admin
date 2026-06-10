import { ArrowUpRight, ArrowDownRight } from "lucide-react"

export function MetricCard({ 
  title, value, icon: Icon, trend, trendValue, color = "indigo", isActive, onClick
}: { 
  title: string; value: string; icon: any; trend?: "up" | "down" | "neutral"; trendValue?: string; color?: string; isActive: boolean; onClick: () => void;
}) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600", amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600", purple: "bg-purple-50 text-purple-600",
    slate: "bg-slate-100 text-slate-600", red: "bg-red-50 text-red-600"
  }

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 cursor-pointer transition-all ${
        isActive ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md transform -translate-y-0.5' : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
      } flex flex-col justify-between min-h-[140px]`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl transition-colors ${isActive ? 'bg-indigo-600 text-white' : colorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <span className={`text-sm font-semibold transition-colors ${isActive ? 'text-indigo-900' : 'text-slate-500'}`}>{title}</span>
        </div>
      </div>
      <div className="flex items-end justify-between mt-4">
        <span className="text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
        {trendValue && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
            trend === 'up' ? 'text-emerald-700 bg-emerald-50' : 
            trend === 'down' ? 'text-rose-700 bg-rose-50' : 'text-slate-600 bg-slate-100'
          }`}>
            {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
            {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  )
}
