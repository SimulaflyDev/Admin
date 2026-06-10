"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Activity, Bell, Users, BarChart2, GitBranch,
  Store, TrendingUp, ShoppingBag, Package, CheckSquare,
  ClipboardList, AlertTriangle, Wallet, FileText, CreditCard,
  Tag, Ticket, Percent, Share2, DollarSign, Bot, Cpu, LineChart,
  BarChart3, Users2, Building2, Headset, Eye, Lock,
  Zap, FileCheck, Settings, ChevronDown, MousePointerClick, Building,
  LogOut, UserPlus, Repeat, UserCircle
} from "lucide-react"
import { useState, useMemo } from "react"

const macros = [
  { id: "core", label: "Core Ops", icon: LayoutDashboard },
  { id: "entities", label: "Entities", icon: Users },
  { id: "commerce", label: "Bookings", icon: ShoppingBag },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "system", label: "Management", icon: Building },
]

const allNavGroups = [
  // ── CORE OPS ──
  {
    macro: "core", label: "COMMAND CENTER",
    items: [
      { href: "/executive", label: "Executive Dashboard", icon: LayoutDashboard },
      { href: "/alerts", label: "Alert Center", icon: Bell },
    ]
  },
  // ── ENTITIES ──
  {
    macro: "entities", label: "DIRECTORIES",
    items: [
      { href: "/users", label: "User Directory", icon: Users },
      { href: "/merchants", label: "Merchant Directory", icon: Building2 },
      { href: "/stores", label: "Store Directory", icon: Store },
      { href: "/products", label: "Product Directory", icon: Package },
    ]
  },
  // ── BOOKINGS ──
  {
    macro: "commerce", label: "OPERATIONS",
    items: [
      { href: "/bookings", label: "Booking Operations", icon: ClipboardList },
    ]
  },
  // ── FINANCE ──
  {
    macro: "finance", label: "FINANCE (V1)",
    items: [
      { href: "/finance/dashboard", label: "Financial Dashboard", icon: LineChart },
      { href: "/finance/pricing-controls", label: "Pricing Controls", icon: Settings },
      { href: "/finance/wallets", label: "Merchant Wallets", icon: Wallet },
      { href: "/finance/redeem-codes", label: "Redeem Codes", icon: Tag },
      { href: "/finance/invoices", label: "Invoices", icon: FileText },
    ]
  },
  // ── ANALYTICS ──
  {
    macro: "analytics", label: "ANALYTICS",
    items: [
      { href: "/analytics/user", label: "User Activity", icon: Users },
      { href: "/analytics/merchant", label: "Merchant Activity", icon: Building2 },
      { href: "/analytics/wallet-referral", label: "Wallet & Referral", icon: Wallet },
      { href: "/analytics/ai-data", label: "AI & Data Usage", icon: Cpu },
    ]
  },
  // ── MANAGEMENT ──
  {
    macro: "system", label: "MANAGEMENT",
    items: [
      { href: "/support", label: "Support Center", icon: Headset },
      { href: "/system/audit", label: "Audit Log", icon: FileCheck },
      { href: "/settings", label: "Settings", icon: Settings },
    ]
  }
]

function NavGroup({ group, pathname }: { group: typeof allNavGroups[0], pathname: string }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border-b border-slate-800/60 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 mb-1 text-[11px] font-bold tracking-[0.15em] text-white uppercase hover:text-slate-200 transition-colors"
      >
        {group.label}
        <ChevronDown className={cn("h-3 w-3 transition-transform text-slate-400", open ? "rotate-0" : "-rotate-90")} />
      </button>
      {open && (
        <div className="space-y-1">
          {group.items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 py-3 text-[14.5px] transition-all duration-200",
                  isActive
                    ? "bg-[#f8f9fa] text-slate-900 font-semibold border-l-[4px] border-emerald-400 pl-[20px] shadow-sm"
                    : "text-slate-200 hover:bg-slate-800/60 hover:text-white font-medium pl-[24px] border-l-[4px] border-transparent"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-slate-900" : "text-slate-300")} strokeWidth={1.75} />
                <span className="tracking-wide">{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  // Determine active macro
  const activeMacro = useMemo(() => {
    for (const group of allNavGroups) {
      if (group.items.some(item => pathname === item.href || pathname.startsWith(item.href + "/"))) {
        return group.macro
      }
    }
    return "core"
  }, [pathname])

  const [selectedMacro, setSelectedMacro] = useState<string>(activeMacro)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Sync selected macro with route changes
  useMemo(() => {
    setSelectedMacro(activeMacro)
  }, [activeMacro])

  const visibleGroups = allNavGroups.filter(g => g.macro === selectedMacro)

  return (
    <div className="flex h-screen shrink-0">
      {/* Tier 1: Primary Rail */}
      <aside className="w-16 bg-[#0f172a] border-r border-slate-800 flex flex-col items-center py-4 z-20 shadow-xl">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-8 shadow-lg">
          S
        </div>
        <div className="flex-1 w-full space-y-4 px-2">
          {macros.map(m => {
            const isActive = selectedMacro === m.id
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMacro(m.id)}
                className={cn(
                  "w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                  isActive 
                    ? "bg-slate-800 text-white shadow-inner" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
                title={m.label}
              >
                <m.icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[9px] font-bold tracking-wider">{m.label.split(" ")[0]}</span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Tier 2: Secondary Menu */}
      <aside className="w-56 bg-slate-900 flex flex-col overflow-hidden z-10 border-r border-slate-800 shadow-md">
        <div className="px-4 py-6 border-b border-slate-800/60 shrink-0">
          <div className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            {macros.find(m => m.id === selectedMacro)?.icon && (() => {
              const Icon = macros.find(m => m.id === selectedMacro)!.icon
              return <Icon className="h-4 w-4 text-emerald-400" />
            })()}
            {macros.find(m => m.id === selectedMacro)?.label}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-0 scrollbar-thin scrollbar-thumb-slate-700">
          {visibleGroups.map((group) => (
            <NavGroup key={group.label} group={group} pathname={pathname} />
          ))}
        </nav>

        {/* User Footer */}
        <div className="px-3 py-4 border-t border-slate-800 bg-slate-900 shrink-0 relative">
          
          {userMenuOpen && (
            <div className="absolute bottom-[calc(100%-10px)] left-3 right-3 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-2">
              <div className="px-3 py-2 border-b border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Settings</p>
              </div>
              <div className="py-1">
                <Link href="/settings" className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors text-left">
                  <UserCircle className="h-4 w-4 text-slate-400" /> My Account
                </Link>
                <Link href="/role-selection" className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors text-left">
                  <UserPlus className="h-4 w-4 text-slate-400" /> Add Account
                </Link>
                <Link href="/role-selection" className="w-full px-3 py-2 flex items-center gap-3 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors text-left">
                  <Repeat className="h-4 w-4 text-slate-400" /> Switch Account
                </Link>
                <div className="my-1 border-t border-slate-700/50"></div>
                <Link href="/login" className="w-full px-3 py-2 flex items-center gap-3 text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left">
                  <LogOut className="h-4 w-4" /> Log Out
                </Link>
              </div>
            </div>
          )}

          <div 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`flex items-center justify-between gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors ${userMenuOpen ? 'bg-slate-800' : 'hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">N</div>
              <div>
                <div className="text-sm font-semibold text-slate-200 leading-tight">Nia R.</div>
                <div className="text-[11px] font-medium text-emerald-400 tracking-wide mt-0.5">ORG MANAGER</div>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </aside>
    </div>
  )
}
