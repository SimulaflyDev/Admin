"use client"

import { useState, useMemo } from "react"
import { Cpu, Bot, TrendingUp, AlertTriangle, User, Building2, Image, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MetricCard } from "@/components/ui/metric-card"
import { KPIDef, TIME_RANGES, generateChartData, isAverage } from "@/lib/mock-data"

// ─── Data Dictionary ──────────────────────────────────────────────

const AI_METRICS: KPIDef[] = [
  { id: 'images_generated', title: 'Images Generated', color: 'indigo', trend: 'up', type: 'number' },
  { id: 'ai_sessions', title: 'AI Sessions', color: 'blue', trend: 'up', type: 'number' },
  { id: 'total_ai_cost', title: 'Total AI Cost', color: 'rose', trend: 'up', type: 'currency' },
  { id: 'cost_per_session', title: 'Cost / Session', color: 'amber', trend: 'down', type: 'currency' },
  { id: 'cost_per_booking', title: 'Cost / Booking', color: 'emerald', trend: 'down', type: 'currency' }
];

const KPI_ICONS: Record<string, any> = {
  images_generated: Image, ai_sessions: Bot, total_ai_cost: Cpu, cost_per_session: TrendingUp, cost_per_booking: Building2
}

const BASE_VALUES: Record<string, number> = {
  images_generated: 1200000, ai_sessions: 352100, total_ai_cost: 45200, cost_per_session: 12, cost_per_booking: 120
}

const isRateMetric = (id: string) => id === 'cost_per_session' || id === 'cost_per_booking';

const formatAiValue = (type: string, val: number, isRate = false) => {
  if (type === 'percentage') return `${val.toFixed(1)}%`;
  if (type === 'currency') {
    if (isRate) return `₹${val.toFixed(2)}`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(0)}`;
  }
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return `${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function AIAnalytics() {
  const [selectedMetric, setSelectedMetric] = useState(AI_METRICS[0].id)
  const [timeRange, setTimeRange] = useState("1 Month")
  
  const activeMetricMeta = AI_METRICS.find(m => m.id === selectedMetric)!
  
  const chartData = useMemo(() => {
    return generateChartData(activeMetricMeta, timeRange, BASE_VALUES[activeMetricMeta.id]);
  }, [activeMetricMeta, timeRange])
  
  const metricTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    AI_METRICS.forEach(m => {
      const data = generateChartData(m, timeRange, BASE_VALUES[m.id]);
      const sum = data.reduce((acc, curr) => acc + curr.value, 0);
      totals[m.id] = isRateMetric(m.id) || isAverage(m.type, m.id) ? sum / data.length : sum;
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
          <h1 className="text-2xl font-bold text-slate-900">AI & Data Usage</h1>
          <p className="text-sm text-slate-500 mt-1">SimulaFly's core differentiator. Track AI generation costs, usage, and conversion efficiency.</p>
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
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <AnimatePresence mode="wait">
          {AI_METRICS.map((m, idx) => {
            const displayVal = metricTotals[m.id];
            
            return (
              <motion.div
                key={`ai-metric-${m.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
              >
                <MetricCard 
                  title={m.title} 
                  value={formatAiValue(m.type, displayVal, isRateMetric(m.id))} 
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
                  tickFormatter={(val) => formatAiValue(activeMetricMeta.type, val, isRateMetric(activeMetricMeta.id))} 
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}
                  itemStyle={{ fontWeight: '600', color: '#4f46e5' }}
                  formatter={(val: any) => [formatAiValue(activeMetricMeta.type, val as number, isRateMetric(activeMetricMeta.id)), activeMetricMeta.title]}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorMain)" animationDuration={600} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Funnel ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><Bot className="h-5 w-5 text-indigo-600" /> AI Conversion Funnel</h3>
          <div className="space-y-5 flex-1 justify-center flex flex-col">
            {[
              { step: "Room Scan", val: "100%", count: "352.1K" },
              { step: "AI Analysis", val: "95%", count: "334.5K" },
              { step: "Products Suggested", val: "88%", count: "310.2K" },
              { step: "Products Saved", val: "24%", count: "84.5K" },
              { step: "Booking", val: "8%", count: "28.1K" },
            ].map((f, i) => (
              <div key={i} className="relative">
                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
                  <span>{f.step}</span>
                  <span>{f.count}</span>
                </div>
                <div className="h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-lg transition-all duration-1000" style={{ width: f.val }}></div>
                  <div className="absolute inset-0 flex items-center justify-end px-3 text-xs font-bold text-white drop-shadow-md">
                    {f.val}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Data Tables ── */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><User className="h-4 w-4 text-indigo-600" /> Top AI Users</h3>
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={`tu-${i}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-semibold text-sm text-slate-900">User_{i}99</div>
                <div className="text-sm font-bold text-indigo-600">{140 - (i * 10)} Sessions</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><Building2 className="h-4 w-4 text-indigo-600" /> Top AI Merchants</h3>
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={`tm-${i}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-semibold text-sm text-slate-900">Merchant_{i}X</div>
                <div className="text-sm font-bold text-indigo-600">{4500 - (i * 400)} Gens</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-rose-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-600" /> Failed Requests</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { err: "Timeout Exception", c: 412 },
              { err: "Image Too Dark", c: 184 },
              { err: "No Room Detected", c: 92 },
              { err: "API Rate Limit", c: 45 },
              { err: "Server Error 500", c: 12 },
            ].map((row, i) => (
              <div key={`err-${i}`} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                <div className="font-semibold text-sm text-slate-700 truncate mr-2">{row.err}</div>
                <div className="text-sm font-bold text-rose-600">{row.c}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </motion.div>
  )
}
