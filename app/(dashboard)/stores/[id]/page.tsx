import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft, MapPin, Tag, ShoppingCart, Users, TrendingUp,
  BarChart3, FileText, Headset, ShieldAlert, Package,
  Eye, EyeOff, Star, AlertTriangle, Lock, CheckCircle2
} from "lucide-react"
import Link from "next/link"

export default function StoreProfile({ params }: { params: { id: string } }) {
  const storeId = params.id || "STR-8812"

  return (
    <div className="space-y-5">
      {/* Breadcrumb + Header */}
      <div className="flex items-start gap-4">
        <Link href="/stores" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Bandra West Outlet</h1>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">Active</Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Footwear</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{storeId} · Merchant: <Link href="/merchants/MER-4421" className="text-blue-600 hover:underline">SneakerHead India</Link></p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" className="gap-2 text-sm text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100">
            <Lock className="h-3.5 w-3.5" /> Freeze Store
          </Button>
          <Button className="gap-2 text-sm bg-slate-900 hover:bg-slate-800">
            <Eye className="h-3.5 w-3.5" /> Listing Control
          </Button>
        </div>
      </div>

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Products", value: "450", icon: Package, color: "text-slate-700" },
          { label: "Orders (7d)", value: "238", icon: ShoppingCart, color: "text-emerald-700" },
          { label: "Revenue (7d)", value: "₹1.2L", icon: TrendingUp, color: "text-emerald-700" },
          { label: "Customers", value: "1,840", icon: Users, color: "text-blue-700" },
          { label: "Conversion", value: "4.2%", icon: BarChart3, color: "text-indigo-700" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-3">
            <k.icon className={`h-5 w-5 ${k.color} shrink-0`} />
            <div>
              <div className="text-xs text-slate-500">{k.label}</div>
              <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Deep Tabs — PRD Pages 19–25 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap h-auto bg-white border border-slate-200 rounded-xl p-1 gap-0.5 mb-4">
          {["overview", "products", "orders", "customers", "offers", "analytics", "invoices", "support", "risk"].map(tab => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="capitalize rounded-lg text-xs px-3 py-1.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── OVERVIEW TAB ── */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-900">Store Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Store Name", val: "Bandra West Outlet" },
                  { label: "Category", val: "Footwear" },
                  { label: "City", val: "Mumbai, MH" },
                  { label: "Created", val: "14 Jan 2024" },
                  { label: "Business Hours", val: "10 AM – 9 PM (Mon–Sat)" },
                  { label: "Contact Person", val: "Amit Rajput" },
                  { label: "WhatsApp", val: "+91 98765 43210" },
                  { label: "Account Tier", val: "Enterprise" },
                ].map(f => (
                  <div key={f.label}>
                    <div className="text-xs text-slate-500">{f.label}</div>
                    <div className="font-medium text-slate-900">{f.val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-slate-900">Listing State</h3>
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-sm font-semibold text-emerald-800">Active & Discoverable</div>
                  <div className="text-xs text-emerald-600">Last changed: 2 Jan 2024</div>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <button className="w-full text-left text-xs text-slate-600 flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 border border-slate-100">
                  <EyeOff className="h-3.5 w-3.5 text-slate-400" /> Hide Store (Manual)
                </button>
                <button className="w-full text-left text-xs text-slate-600 flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 border border-slate-100">
                  <Star className="h-3.5 w-3.5 text-amber-400" /> Feature Store
                </button>
                <button className="w-full text-left text-xs text-red-600 flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 border border-red-100">
                  <AlertTriangle className="h-3.5 w-3.5" /> Restrict Store
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── PRODUCTS TAB ── */}
        <TabsContent value="products">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Store Catalog (450 products)</h3>
              <Link href="/products/new" className="inline-flex h-8 items-center gap-1.5 px-3 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800">
                <Package className="h-3.5 w-3.5" /> Add Product
              </Link>
            </div>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Views (7d)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: "PRD-0891", name: "Nike Air Max 90", cat: "Sneakers", price: "₹12,999", stock: 44, views: 1240, status: "Active" },
                  { id: "PRD-0892", name: "Adidas Ultraboost 22", cat: "Running", price: "₹15,499", stock: 12, views: 890, status: "Active" },
                  { id: "PRD-0910", name: "Puma RS-X", cat: "Casual", price: "₹8,999", stock: 0, views: 420, status: "Out of Stock" },
                  { id: "PRD-0932", name: "Jordan 1 Retro", cat: "Sneakers", price: "₹24,999", stock: 5, views: 3200, status: "Active" },
                ].map(p => (
                  <TableRow key={p.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="font-medium text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.id}</div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{p.cat}</TableCell>
                    <TableCell className="text-sm font-medium">{p.price}</TableCell>
                    <TableCell className={`text-sm font-medium ${p.stock === 0 ? "text-red-600" : p.stock < 10 ? "text-amber-600" : "text-slate-900"}`}>{p.stock}</TableCell>
                    <TableCell className="text-sm">{p.views.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={p.status === "Active" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-100 text-red-800 border-red-200"}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/products/${p.id}`} className="text-xs text-blue-600 hover:underline">Edit →</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── ORDERS TAB ── */}
        <TabsContent value="orders">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Store Orders</h3>
            </div>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: "ORD-9021", user: "Rahul M.", date: "Today 2:45 PM", val: "₹12,999", pay: "Paid", status: "Confirmed" },
                  { id: "ORD-8991", user: "Priya S.", date: "Today 11:12 AM", val: "₹24,999", pay: "Paid", status: "Completed" },
                  { id: "ORD-8812", user: "Aakash G.", date: "Yesterday", val: "₹8,999", pay: "Pending", status: "Pending" },
                  { id: "ORD-8720", user: "Sneha R.", date: "2 days ago", val: "₹15,499", pay: "Refunded", status: "Cancelled" },
                ].map(o => (
                  <TableRow key={o.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">{o.id}</TableCell>
                    <TableCell className="text-sm text-slate-700">{o.user}</TableCell>
                    <TableCell className="text-sm text-slate-500">{o.date}</TableCell>
                    <TableCell className="text-sm font-semibold">{o.val}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={o.pay === "Paid" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : o.pay === "Refunded" ? "bg-red-100 text-red-800 border-red-200" : "bg-amber-100 text-amber-800 border-amber-200"}>{o.pay}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={o.status === "Completed" ? "bg-blue-100 text-blue-800 border-blue-200" : o.status === "Confirmed" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : o.status === "Cancelled" ? "bg-red-100 text-red-800 border-red-200" : "bg-amber-100 text-amber-800 border-amber-200"}>{o.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/orders/${o.id}`} className="text-xs text-blue-600 hover:underline">View →</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── CUSTOMERS TAB ── */}
        <TabsContent value="customers">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Store Customers (1,840)</h3>
              <button className="inline-flex h-8 items-center gap-1.5 px-3 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50">
                Send Promotion
              </button>
            </div>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Purchases</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Rahul M.", id: "USR-8921", last: "2 hours ago", purchases: 4, spent: "₹64,000", type: "Organic" },
                  { name: "Aakash G.", id: "USR-9102", last: "Yesterday", purchases: 7, spent: "₹1,20,000", type: "Referral" },
                  { name: "Priya S.", id: "USR-9044", last: "3 days ago", purchases: 1, spent: "₹24,999", type: "Imported" },
                ].map(c => (
                  <TableRow key={c.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="font-medium text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.id}</div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{c.last}</TableCell>
                    <TableCell className="text-sm font-medium">{c.purchases}</TableCell>
                    <TableCell className="text-sm font-semibold text-emerald-700">{c.spent}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={c.type === "Referral" ? "bg-purple-100 text-purple-800 border-purple-200" : c.type === "Imported" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-slate-100 text-slate-700 border-slate-200"}>{c.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/users/${c.id}`} className="text-xs text-blue-600 hover:underline">View →</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── OFFERS TAB ── */}
        <TabsContent value="offers">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Store Offers & Coupons</h3>
              <div className="flex gap-2">
                <button className="inline-flex h-8 items-center gap-1.5 px-3 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50">+ Create Offer</button>
                <button className="inline-flex h-8 items-center gap-1.5 px-3 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50">+ Create Coupon</button>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { type: "Offer", name: "Flash Sale: 20% off all Sneakers", disc: "20%", target: "All Footwear", valid: "Ends: 15 Jun 2024", uses: 320, status: "Active" },
                { type: "Coupon", name: "SNEAK100 — ₹100 off ≥ ₹3,000", disc: "₹100", target: "All Products", valid: "Ends: 30 Jun 2024", uses: 88, status: "Active" },
                { type: "Offer", name: "Jordan Launch Day: ₹2000 off", disc: "₹2000", target: "Jordan Range", valid: "Expired: 10 May 2024", uses: 44, status: "Expired" },
              ].map(o => (
                <div key={o.name} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                  <Badge variant="outline" className={o.type === "Offer" ? "bg-indigo-100 text-indigo-800 border-indigo-200 shrink-0" : "bg-purple-100 text-purple-800 border-purple-200 shrink-0"}>{o.type}</Badge>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{o.name}</div>
                    <div className="text-xs text-slate-500">{o.target} · {o.valid} · {o.uses} uses</div>
                  </div>
                  <Badge variant="outline" className={o.status === "Active" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}>{o.status}</Badge>
                  <button className="text-xs text-blue-600 hover:underline shrink-0">Edit</button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── ANALYTICS TAB ── */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: "Revenue (30d)", val: "₹4.8L", trend: "+18%" },
              { label: "Total Orders (30d)", val: "1,020", trend: "+12%" },
              { label: "Conversion Rate", val: "4.2%", trend: "+0.4%" },
              { label: "Avg Order Value", val: "₹4,700", trend: "+8%" },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="text-xs text-slate-500">{k.label}</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{k.val}</div>
                <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />{k.trend} vs last month
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Revenue & Orders Trend (30 days)</h3>
            <div className="h-52 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm">
              <BarChart3 className="h-6 w-6 mr-2 text-slate-300" /> Chart component goes here
            </div>
          </div>
        </TabsContent>

        {/* ── INVOICES TAB ── */}
        <TabsContent value="invoices">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Store Invoices</h3>
            </div>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { inv: "INV-10041", date: "1 Jun 2024", type: "Monthly Charge", amt: "₹12,400", status: "Paid" },
                  { inv: "INV-09881", date: "1 May 2024", type: "Monthly Charge", amt: "₹9,800", status: "Paid" },
                  { inv: "INV-09720", date: "1 Apr 2024", type: "Refund", amt: "₹1,200", status: "Processed" },
                ].map(i => (
                  <TableRow key={i.inv} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">{i.inv}</TableCell>
                    <TableCell className="text-sm text-slate-600">{i.date}</TableCell>
                    <TableCell className="text-sm text-slate-600">{i.type}</TableCell>
                    <TableCell className="text-sm font-semibold">{i.amt}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">{i.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button className="text-xs text-blue-600 hover:underline">Download PDF</button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── SUPPORT TAB ── */}
        <TabsContent value="support">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Support Tickets — This Store</h3>
            <div className="space-y-3">
              {[
                { id: "TKT-8810", subject: "Product not displaying in app", user: "Rahul M.", status: "Open", priority: "High", age: "4h" },
                { id: "TKT-8720", subject: "Order cancellation request", user: "Priya S.", status: "In Progress", priority: "Medium", age: "1d" },
                { id: "TKT-8641", subject: "Invoice discrepancy for May", user: "Merchant", status: "Resolved", priority: "Low", age: "3d" },
              ].map(t => (
                <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{t.subject}</div>
                    <div className="text-xs text-slate-500">{t.id} · {t.user} · {t.age} ago</div>
                  </div>
                  <Badge variant="outline" className={t.priority === "High" ? "bg-red-100 text-red-800 border-red-200" : t.priority === "Medium" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-slate-100 text-slate-600 border-slate-200"}>{t.priority}</Badge>
                  <Badge variant="outline" className={t.status === "Open" ? "bg-blue-100 text-blue-800 border-blue-200" : t.status === "Resolved" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-purple-100 text-purple-800 border-purple-200"}>{t.status}</Badge>
                  <Link href={`/support/consumer/${t.id}`} className="text-xs text-blue-600 hover:underline shrink-0">View →</Link>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── RISK TAB ── */}
        <TabsContent value="risk">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-slate-900">Risk & Compliance Flags</h3>
            <div className="space-y-3">
              {[
                { icon: ShieldAlert, label: "High Refund Rate", detail: "3.2% refund rate this month (threshold: 5%)", severity: "amber" },
                { icon: Tag, label: "Product Image Missing", detail: "14 products have no images — may affect discovery", severity: "amber" },
                { icon: Users, label: "No Customer Activity", detail: "Zero new organic customers in the last 14 days", severity: "red" },
              ].map(r => {
                const sev = r.severity === "red" ? "bg-red-50 border-red-200 text-red-700" : "bg-amber-50 border-amber-200 text-amber-700"
                return (
                  <div key={r.label} className={`flex items-start gap-3 p-3.5 rounded-lg border ${sev}`}>
                    <r.icon className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold">{r.label}</div>
                      <div className="text-xs mt-0.5 opacity-80">{r.detail}</div>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-emerald-700">No policy violations on record</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
