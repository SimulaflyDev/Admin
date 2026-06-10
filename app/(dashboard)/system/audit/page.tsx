"use client"

import { FileCheck, AlertTriangle, Bug, Activity, Server, Download, Search, Filter } from "lucide-react"
import { useState } from "react"

export default function PlatformAuditLog() {
  const [activeFilter, setActiveFilter] = useState("all")

  const logs = [
    { id: "LOG-001", time: "Today, 14:22", type: "Crash", entity: "iOS App (v2.4.1)", msg: "NullPointerException in ProductDetailsScreen", level: "Critical", status: "Open" },
    { id: "LOG-002", time: "Today, 11:05", type: "Health", entity: "Payment Gateway API", msg: "Latency spike detected (> 2000ms)", level: "Warning", status: "Resolved" },
    { id: "LOG-003", time: "Yesterday, 18:40", type: "Bug", entity: "Merchant Panel (Stores)", msg: "Image upload fails for HEIC format", level: "Medium", status: "In Progress" },
    { id: "LOG-004", time: "Yesterday, 09:15", type: "System", entity: "Database Cluster", msg: "Automated nightly backup completed successfully", level: "Info", status: "Success" },
    { id: "LOG-005", time: "14/03/2026, 22:10", type: "Crash", entity: "Android App (v2.4.0)", msg: "OutOfMemoryError during 3D model render", level: "Critical", status: "Open" },
    { id: "LOG-006", time: "14/03/2026, 15:30", type: "Security", entity: "Auth Server", msg: "Multiple failed login attempts from IP 192.168.1.45", level: "Warning", status: "Resolved" },
  ]

  const filteredLogs = activeFilter === "all" ? logs : logs.filter(l => l.type.toLowerCase() === activeFilter.toLowerCase())

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 h-[calc(100vh-80px)] flex flex-col">
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-indigo-600" />
            Platform Audit Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">Monitor app health, system crashes, bugs, and overall platform stability.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
        
        {/* Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search logs..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64 bg-white" />
            </div>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 bg-white"><Filter className="h-4 w-4" /></button>
          </div>

          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            {["All", "Crash", "Bug", "Health", "System"].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter.toLowerCase())}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                  activeFilter === filter.toLowerCase() 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-white border-b border-slate-200 uppercase font-semibold sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4">Source Entity</th>
                <th className="px-6 py-4">Message / Description</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const isCritical = log.level === "Critical"
                const isWarning = log.level === "Warning" || log.level === "Medium"
                
                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-slate-500">{log.time}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{log.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {log.type === "Crash" && <AlertTriangle className="h-4 w-4 text-rose-500" />}
                        {log.type === "Bug" && <Bug className="h-4 w-4 text-amber-500" />}
                        {log.type === "Health" && <Activity className="h-4 w-4 text-blue-500" />}
                        {log.type === "System" && <Server className="h-4 w-4 text-slate-400" />}
                        {log.type === "Security" && <FileCheck className="h-4 w-4 text-purple-500" />}
                        <span className="font-semibold text-slate-700">{log.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-indigo-600">{log.entity}</td>
                    <td className="px-6 py-4 text-slate-700 max-w-md truncate" title={log.msg}>{log.msg}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                        isCritical ? 'bg-rose-50 border-rose-200 text-rose-700' :
                        isWarning ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                        log.status === "Open" ? 'bg-rose-50 border-rose-200 text-rose-700' :
                        log.status === "In Progress" ? 'bg-blue-50 border-blue-200 text-blue-700' :
                        'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  )
}
