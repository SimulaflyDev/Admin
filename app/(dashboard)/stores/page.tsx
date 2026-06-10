import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Plus, TrendingUp, TrendingDown, Minus, Store } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import Link from "next/link"

const stores = [
  { id: "STR-8812", name: "Bandra West Outlet", merchant: "SneakerHead India", city: "Mumbai", category: "Footwear", products: 450, orders24h: 34, status: "Active", health: "healthy" },
  { id: "STR-8899", name: "Andheri Digital", merchant: "SneakerHead India", city: "Mumbai", category: "Footwear", products: 120, orders24h: 12, status: "Active", health: "growing" },
  { id: "STR-9010", name: "Royal Electronics HQ", merchant: "Royal Electronics", city: "Delhi", category: "Electronics", products: 880, orders24h: 61, status: "Active", health: "healthy" },
  { id: "STR-9041", name: "Style Hub Powai", merchant: "Style Hub Trends", city: "Mumbai", category: "Fashion", products: 0, orders24h: 0, status: "Onboarding", health: "none" },
  { id: "STR-9102", name: "Furniture World Koramangala", merchant: "Furniture World", city: "Bangalore", category: "Furniture", products: 210, orders24h: 1, status: "At Risk", health: "risk" },
  { id: "STR-9120", name: "BrandMart Flagship", merchant: "BrandMart Online", city: "Hyderabad", category: "Multi-Brand", products: 640, orders24h: 0, status: "Frozen", health: "frozen" },
]

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Onboarding: "bg-blue-100 text-blue-800 border-blue-200",
  "At Risk": "bg-amber-100 text-amber-800 border-amber-200",
  Frozen: "bg-red-100 text-red-800 border-red-200",
  Delisted: "bg-slate-100 text-slate-700 border-slate-200",
}

const healthIcon: Record<string, React.ReactNode> = {
  healthy: <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />,
  growing: <TrendingUp className="h-3.5 w-3.5 text-blue-600" />,
  risk: <TrendingDown className="h-3.5 w-3.5 text-amber-600" />,
  frozen: <TrendingDown className="h-3.5 w-3.5 text-red-600" />,
  none: <Minus className="h-3.5 w-3.5 text-slate-400" />,
}

export default function StoreDirectory() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Store Directory</h1>
          <p className="text-sm text-slate-500 mt-1">All storefronts across all merchants — {stores.length} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-sm">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Link href="/stores/new" className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" /> Add Store
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Stores", val: "270", color: "text-slate-900", icon: <Store className="h-4 w-4 text-indigo-500" /> },
          { label: "Active", val: "198", color: "text-emerald-700", icon: <TrendingUp className="h-4 w-4 text-emerald-500" /> },
          { label: "At Risk", val: "21", color: "text-amber-700", icon: <TrendingDown className="h-4 w-4 text-amber-500" /> },
          { label: "Frozen", val: "7", color: "text-red-700", icon: <TrendingDown className="h-4 w-4 text-red-500" /> },
          { label: "Onboarding", val: "44", color: "text-blue-700", icon: <Plus className="h-4 w-4 text-blue-500" /> },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-slate-600">{k.label}</div>
              <div className="p-2 bg-slate-50 rounded-lg">{k.icon}</div>
            </div>
            <div className={`text-3xl font-bold ${k.color}`}>{k.val}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search store name, ID, merchant…" className="pl-9" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="atrisk">At Risk</SelectItem>
              <SelectItem value="frozen">Frozen</SelectItem>
              <SelectItem value="onboarding">Onboarding</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="City" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              <SelectItem value="mumbai">Mumbai</SelectItem>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="bangalore">Bangalore</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="footwear">Footwear</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {stores.length === 0 ? (
          <EmptyState 
            icon={Store}
            title="No stores found"
            description="There are currently no stores matching your criteria."
            actionLabel="Clear Filters"
            onAction={() => console.log("clear")}
          />
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>City / Category</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Orders (24h)</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map(store => (
              <TableRow key={store.id} className="hover:bg-slate-50 cursor-pointer">
                <TableCell>
                  <div className="font-medium text-slate-900">{store.name}</div>
                  <div className="text-xs text-slate-500">{store.id}</div>
                </TableCell>
                <TableCell className="text-sm text-slate-700">{store.merchant}</TableCell>
                <TableCell>
                  <div className="text-sm text-slate-700">{store.city}</div>
                  <div className="text-xs text-slate-500">{store.category}</div>
                </TableCell>
                <TableCell className="text-sm font-medium">{store.products}</TableCell>
                <TableCell className="text-sm font-medium">{store.orders24h}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {healthIcon[store.health]}
                    <span className="text-xs text-slate-600 capitalize">{store.health === "none" ? "—" : store.health}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${statusStyles[store.status]}`}>{store.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/stores/${store.id}`} className="inline-flex h-7 items-center px-2.5 rounded text-xs font-medium hover:bg-slate-100 text-slate-700">
                    Manage →
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </div>
    </div>
  )
}
