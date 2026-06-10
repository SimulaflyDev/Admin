"use client"

import { useState, useMemo } from "react"
import { Users, UserPlus, Activity, Target, Download, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MetricCard } from "@/components/ui/metric-card"
import { KPIDef, TIME_RANGES, generateChartData, formatValue, isAverage } from "@/lib/mock-data"

// ─── Data Dictionary ──────────────────────────────────────────────

const USER_METRICS: KPIDef[] = [
  { id: 'total_users', title: 'Total Users', color: 'indigo', trend: 'up', type: 'number' },
  { id: 'dau', title: 'Daily Active (DAU)', color: 'blue', trend: 'up', type: 'number' },
  { id: 'new_users', title: 'New Users', color: 'emerald', trend: 'neutral', type: 'number' },
  { id: 'retention', title: 'Returning Rate', color: 'purple', trend: 'up', type: 'percentage' }
];

const KPI_ICONS: Record<string, any> = {
  total_users: Users, dau: Activity, new_users: UserPlus, retention: Target
}

const BASE_VALUES: Record<string, number> = {
  total_users: 352152, dau: 45200, new_users: 12400, retention: 85
}

export default function UserAnalytics() {
  const [selectedMetric, setSelectedMetric] = useState(USER_METRICS[0].id)
  const [timeRange, setTimeRange] = useState("1 Month")
  
  const activeMetricMeta = USER_METRICS.find(m => m.id === selectedMetric)!
  
  const chartData = useMemo(() => {
    return generateChartData(activeMetricMeta, timeRange, BASE_VALUES[activeMetricMeta.id]);
  }, [activeMetricMeta, timeRange])
  
  const metricTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    USER_METRICS.forEach(m => {
      const data = generateChartData(m, timeRange, BASE_VALUES[m.id]);
      const sum = data.reduce((acc, curr) => acc + curr.value, 0);
      totals[m.id] = isAverage(m.type, m.id) ? sum / data.length : sum;
    });
    return totals;
  }, [timeRange]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 space-y-6 max-w-[1600px] mx-auto pb-24">
      
      {/* ── Page Header & Global Actions ── */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Activity Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Understand consumer behavior, retention, and funnel drop-offs.</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button className="px-4 py-2 bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-colors w-36 flex justify-center items-center gap-2">
            <Download className="h-4 w-4" /> Export Data
          </button>
        </div>
      </motion.div>

      {/* ── Time Pivots ── */}
      <motion.div variants={item} className="flex flex-col xl:flex-row xl:items-center justify-end gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
        {/* Time Range Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 xl:pb-0 scrollbar-hide">
          {TIME_RANGES.map(tr => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === tr ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-white text-slate-500 border border-transparent hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Top Row: Macro Metrics ── */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="wait">
          {USER_METRICS.map((m, idx) => {
            const displayVal = metricTotals[m.id];
            
            return (
              <motion.div
                key={`user-metric-${m.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
              >
                <MetricCard 
                  title={m.title} 
                  value={formatValue(m.type, displayVal)} 
                  icon={KPI_ICONS[m.id]} 
                  trend={m.trend as any} 
                  trendValue={m.trend === 'up' ? '+12%' : m.trend === 'down' ? '-4%' : '0%'} 
                  color={m.color} 
                  isActive={selectedMetric === m.id}
                  onClick={() => setSelectedMetric(m.id)}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* ── Middle Row: Chart & Trending ── */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Dynamic Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col p-6 h-full relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{activeMetricMeta.title} Timeline</h3>
              <p className="text-sm text-slate-500">Data visualization for the last {timeRange.toLowerCase()}</p>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200"></div>
                {activeMetricMeta.title}
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} minTickGap={20} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dx={-10} 
                  tickFormatter={(val) => formatValue(activeMetricMeta.type, val)} 
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}
                  itemStyle={{ fontWeight: '600', color: '#4f46e5' }}
                  formatter={(val: any) => [formatValue(activeMetricMeta.type, val as number), activeMetricMeta.title]}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorMain)" animationDuration={600} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Funnel ── */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Conversion Funnel</h3>
            <button className="text-slate-400 hover:text-slate-600">...</button>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {[
              { step: "App Open", val: "100%", count: "45.2K" },
              { step: "Store Visit", val: "68%", count: "30.7K" },
              { step: "Product View", val: "42%", count: "18.9K" },
              { step: "Save Item", val: "15%", count: "6.7K" },
              { step: "Booking", val: "4.2%", count: "1.9K" },
            ].map((f, i) => (
              <div key={i} className="relative">
                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
                  <span>{f.step}</span>
                  <span>{f.count}</span>
                </div>
                <div className="h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-lg" style={{ width: f.val }}></div>
                  <div className="absolute inset-0 flex items-center justify-end px-3 text-xs font-bold text-white drop-shadow-md">
                    {f.val}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Data Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Top Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4">Sessions</th>
                <th className="px-6 py-4">Saves</th>
                <th className="px-6 py-4">Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((u) => (
                <tr key={u} className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">User_{u}8491</td>
                  <td className="px-6 py-4 text-slate-500">2 mins ago</td>
                  <td className="px-6 py-4 font-mono">1,402</td>
                  <td className="px-6 py-4 font-mono">45</td>
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">12</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
