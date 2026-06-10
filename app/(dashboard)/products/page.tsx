import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Package, AlertCircle, CheckCircle2, Box, Store, Bot, Filter, Plus } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import Link from "next/link"

const catalog = [
  { id: "CAT-0891", name: "Nike Air Max 90", cat: "Sneakers", basePrice: 12500, sellers: 3, totalStock: 44, aiAssets: true, status: "Active" },
  { id: "CAT-0892", name: "Adidas Ultraboost 22", cat: "Running", basePrice: 14999, sellers: 1, totalStock: 12, aiAssets: true, status: "Active" },
  { id: "CAT-0910", name: "Puma RS-X", cat: "Casual", basePrice: 8999, sellers: 2, totalStock: 0, aiAssets: false, status: "Out of Stock" },
  { id: "CAT-1010", name: "Samsung 65\" QLED TV", cat: "Electronics", basePrice: 88500, sellers: 5, totalStock: 18, aiAssets: true, status: "Active" },
  { id: "CAT-1020", name: "Apple iPhone 15 Pro", cat: "Phones", basePrice: 132000, sellers: 4, totalStock: 2, aiAssets: true, status: "Low Stock" },
]

const modQueue = [
  { id: "CAT-2001", name: "Vintage Sofa Set", merchantsCount: 2, issue: "Missing 3D asset", flag: "3D Review", age: "2d" },
  { id: "CAT-2012", name: "Oak Dining Table", merchantsCount: 1, issue: "Description inaccurate", flag: "Quality Flag", age: "5h" },
  { id: "CAT-2048", name: "Leather Recliner", merchantsCount: 3, issue: "Image resolution too low", flag: "Image Review", age: "1d" },
]

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Out of Stock": "bg-red-100 text-red-800 border-red-200",
  "Low Stock": "bg-amber-100 text-amber-800 border-amber-200",
  Hidden: "bg-slate-100 text-slate-600 border-slate-200",
}

export default function CatalogDirectory() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Master Catalog</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage global product entities mapped across all merchants</p>
        </div>
        <div className="flex gap-2">
          <Link href="/products/moderation" className="inline-flex h-9 items-center gap-2 px-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium hover:bg-amber-100 transition-colors shadow-sm">
            <AlertCircle className="h-4 w-4" /> Asset Moderation <span className="ml-1 bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">3</span>
          </Link>
          <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" /> Add Global Item
          </button>
        </div>
      </div>

      {/* Clean KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Catalog Items", val: "12,480", icon: Box },
          { label: "Active Products", val: "10,920", icon: CheckCircle2 },
          { label: "Out of Stock", val: "820", icon: AlertCircle },
          { label: "Pending 3D Assets", val: "440", icon: Bot },
          { label: "Moderation Queue", val: "3", icon: AlertCircle },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{k.label}</div>
              <div className="text-2xl font-black text-slate-900">{k.val}</div>
            </div>
            <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center shrink-0">
              <k.icon className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="catalog">
        <TabsList className="bg-slate-100/50 border border-slate-200 rounded-xl p-1 mb-6 h-auto max-w-fit flex gap-1">
          <TabsTrigger value="catalog" className="text-sm font-semibold rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all">
            Master Directory
          </TabsTrigger>
          <TabsTrigger value="moderation" className="text-sm font-semibold rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm transition-all flex items-center gap-2">
            Asset Moderation <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">3</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input placeholder="Search catalog name, ID, category…" className="pl-9 bg-slate-50 border-slate-200 text-sm" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px] text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="oos">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 w-full sm:w-auto">
                <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium bg-white shadow-sm hover:bg-slate-50 transition-colors">
                  <Filter className="h-4 w-4" /> Filters
                </button>
              </div>
            </div>
            
            {catalog.length === 0 ? (
              <EmptyState 
                icon={Box}
                title="No items found"
                description="There are currently no catalog items matching your criteria."
                actionLabel="Clear Filters"
                onAction={() => console.log("clear")}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Catalog Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Active Sellers</TableHead>
                      <TableHead>Aggregated Stock</TableHead>
                      <TableHead>AI Asset</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {catalog.map(p => (
                      <TableRow key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <TableCell>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">ID: {p.id}</div>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-600">{p.cat}</TableCell>
                        <TableCell className="text-sm font-bold text-slate-900">From ₹{p.basePrice.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                            <Store className="h-3.5 w-3.5 text-indigo-500" /> {p.sellers} Merchants
                          </div>
                        </TableCell>
                        <TableCell className={`text-sm font-bold ${p.totalStock === 0 ? "text-red-600" : p.totalStock < 10 ? "text-amber-600" : "text-emerald-600"}`}>
                          {p.totalStock} Units
                        </TableCell>
                        <TableCell>
                          {p.aiAssets ? (
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              <Bot className="h-3 w-3" /> Ready
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Missing
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${statusStyles[p.status]}`}>{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/products/${p.id}`} className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-bold hover:bg-indigo-100 text-indigo-600 bg-indigo-50 transition-colors">
                            Manage Offers
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="moderation">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Asset Moderation Queue
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Review global 3D models and image accuracy before AI generation unlocks.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {modQueue.length === 0 ? (
                <EmptyState 
                  icon={CheckCircle2}
                  title="Queue is empty"
                  description="All global assets have been reviewed. Great job!"
                />
              ) : (
                modQueue.map(p => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 hover:bg-slate-50 transition-colors">
                    <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <Box className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-xs font-medium text-slate-500 mt-1">{p.id} · Linked to {p.merchantsCount} Merchants · Flagged {p.age} ago</div>
                      <div className="text-xs font-semibold text-amber-700 mt-2 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />{p.issue}
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 shrink-0 font-bold uppercase text-[10px] tracking-wider">{p.flag}</Badge>
                    <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                      <button className="inline-flex flex-1 sm:flex-none h-8 items-center justify-center gap-1.5 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button className="inline-flex flex-1 sm:flex-none h-8 items-center justify-center gap-1.5 px-3 rounded-lg border border-red-200 text-red-700 bg-red-50 text-xs font-bold hover:bg-red-100 transition-colors">
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
