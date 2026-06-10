"use client"

import { useState, useEffect } from "react"
import { Search, Command, Users, Building2, Store, Package, FileText, Ticket, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

type SearchResult = {
  id: string
  title: string
  subtitle: string
  type: string
  icon: any
  href: string
}

const mockResults: SearchResult[] = [
  { id: "1", title: "Rahul M.", subtitle: "USR-8921 · Active", type: "User", icon: Users, href: "/users/USR-8921" },
  { id: "2", title: "SneakerHead India", subtitle: "MER-4421 · Enterprise", type: "Merchant", icon: Building2, href: "/merchants/MER-4421" },
  { id: "3", title: "Bandra West Outlet", subtitle: "STR-8812 · Healthy", type: "Store", icon: Store, href: "/stores/STR-8812" },
  { id: "4", title: "Nike Air Max 90", subtitle: "PRD-0891 · Active", type: "Product", icon: Package, href: "/products/PRD-0891" },
  { id: "5", title: "INV-2024-001", subtitle: "SneakerHead India · Platform Fee", type: "Invoice", icon: FileText, href: "/finance/invoices/INV-2024-001" },
  { id: "6", title: "WELCOME50", subtitle: "Platform Coupon · 1.2k Uses", type: "Coupon", icon: Ticket, href: "/offers" },
  { id: "7", title: "Customer Dispute #442", subtitle: "Order ORD-991", type: "Ticket", icon: AlertTriangle, href: "/support/consumer/TCK-442" },
]

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const filteredResults = query === "" 
    ? [] 
    : mockResults.filter(r => 
        r.title.toLowerCase().includes(query.toLowerCase()) || 
        r.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        r.type.toLowerCase().includes(query.toLowerCase())
      )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#E5E0D8] bg-white text-sm text-slate-400 hover:border-slate-300 transition-colors shadow-sm"
      >
        <Search className="h-4 w-4" />
        <span>Search users, merchants, orders, stores…</span>
        <div className="ml-auto flex items-center gap-0.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono border border-slate-200">
          <Command className="h-3 w-3" />K
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white border border-[#E5E0D8] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search across all entities..."
                className="flex-1 text-base outline-none text-slate-900 placeholder:text-slate-400 bg-transparent"
              />
              <kbd className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-1 rounded font-mono">ESC</kbd>
            </div>

            <div className="overflow-y-auto p-2 flex-1">
              {query === "" ? (
                <>
                  <p className="text-xs text-slate-400 px-3 py-2 font-semibold uppercase tracking-wider">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-1 mb-4">
                    {["Create New Store", "Onboard Merchant", "Generate Invoice", "Issue Global Coupon"].map((action) => (
                      <button key={action} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-left transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                        {action}
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-slate-400 px-3 py-2 font-semibold uppercase tracking-wider">Search Filters</p>
                  <div className="flex flex-wrap gap-2 px-3 pb-4">
                    {["/user", "/store", "/merchant", "/order", "/invoice", "/ticket"].map((f) => (
                      <button 
                        key={f}
                        onClick={() => setQuery(f + " ")}
                        className="px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-sm text-xs font-mono text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {filteredResults.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 px-3 py-2 font-semibold uppercase tracking-wider">Results</p>
                      {filteredResults.map(r => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setOpen(false)
                            router.push(r.href)
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                        >
                          <div className="p-2 rounded-md bg-white border border-slate-100 text-slate-500 group-hover:shadow-sm shrink-0">
                            <r.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 truncate">{r.title}</div>
                            <div className="text-xs text-slate-500 truncate mt-0.5">{r.subtitle}</div>
                          </div>
                          <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded shrink-0 shadow-sm">
                            {r.type}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-900 font-medium">No results found.</p>
                      <p className="text-slate-500 text-sm mt-1">We couldn't find anything matching "{query}"</p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="bg-[#FDFBF7] border-t border-slate-100 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><kbd className="font-mono bg-white border border-slate-200 px-1 rounded shadow-sm">↑</kbd><kbd className="font-mono bg-white border border-slate-200 px-1 rounded shadow-sm">↓</kbd> to navigate</span>
                <span className="flex items-center gap-1"><kbd className="font-mono bg-white border border-slate-200 px-1 rounded shadow-sm">↵</kbd> to select</span>
              </div>
              <div>SimulaFly Search Engine</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
