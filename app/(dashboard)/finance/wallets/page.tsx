import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, RefreshCw, AlertTriangle, Building2, Download } from "lucide-react"
import Link from "next/link"

const transactions = [
  { id: "TXN-9821", date: "Today 2:44 PM", merchant: "SneakerHead India", type: "Order Credit", ref: "ORD-9021", amount: 11999, balance: "₹450", source: "System", direction: "credit" },
  { id: "TXN-9810", date: "Today 11:10 AM", merchant: "Royal Electronics", type: "Wallet Topup", ref: "TOPUP-4481", amount: 10000, balance: "₹12,400", source: "Merchant Action", direction: "credit" },
  { id: "TXN-9800", date: "Today 9:20 AM", merchant: "SneakerHead India", type: "Booking Fee", ref: "FEE-8920", amount: -10, balance: "₹24,451", source: "System", direction: "debit" },
  { id: "TXN-9780", date: "Yesterday", merchant: "Style Hub Trends", type: "Refund Deduction", ref: "ORD-8812", amount: -8999, balance: "₹0", source: "System", direction: "debit" },
  { id: "TXN-9760", date: "2 days ago", merchant: "Furniture World", type: "Manual Credit", ref: "Promo", amount: 1000, balance: "₹88,000", source: "Org Manager", direction: "credit" },
]

export default function WalletDashboard() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Wallet & Finance</h1>
          <p className="text-sm text-slate-500 mt-1">Platform-wide merchant wallet operations</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium bg-white shadow-sm hover:bg-slate-50">
            <Download className="h-4 w-4" /> Export Ledger
          </button>
          <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Reconcile
          </button>
        </div>
      </div>

      {/* Finance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Wallet Balance", val: "₹24.8L", sub: "Across all merchants", icon: Wallet, color: "text-emerald-700 bg-emerald-50" },
          { label: "Credits Today", val: "₹4.5L", sub: "+18 transactions", icon: ArrowDownLeft, color: "text-blue-700 bg-blue-50" },
          { label: "Debits Today", val: "₹1.2L", sub: "Fees + Refunds", icon: ArrowUpRight, color: "text-rose-700 bg-rose-50" },
          { label: "Merchants Low Balance", val: "14", sub: "Below ₹1K threshold", icon: AlertTriangle, color: "text-amber-700 bg-amber-50" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${k.color} shrink-0`}><k.icon className="h-6 w-6" /></div>
            <div>
              <div className="text-sm font-semibold text-slate-600">{k.label}</div>
              <div className="text-2xl font-bold text-slate-900">{k.val}</div>
              <div className="text-xs text-slate-400 mt-1">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="ledger">
        <TabsList className="bg-white border border-slate-200 rounded-xl p-1 mb-4 h-auto">
          {["ledger", "merchants", "thresholds"].map(t => (
            <TabsTrigger key={t} value={t} className="capitalize text-sm rounded-lg px-4 py-1.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white">{t === "thresholds" ? "Thresholds & Reconciliation" : t === "merchants" ? "Merchant Wallets" : "Transaction Ledger"}</TabsTrigger>
          ))}
        </TabsList>

        {/* LEDGER */}
        <TabsContent value="ledger">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">All Wallet Transactions</h3>
              <span className="text-xs text-slate-500">Showing latest 50</span>
            </div>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(t => (
                  <TableRow key={t.id} className="hover:bg-slate-50">
                    <TableCell className="text-sm text-slate-500">{t.date}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{t.merchant}</div>
                      <Badge variant="outline" className={`mt-1 ${t.direction === "credit" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-rose-100 text-rose-800 border-rose-200"}`}>{t.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-blue-600 hover:underline cursor-pointer">{t.ref}</TableCell>
                    <TableCell className="text-sm text-slate-600">{t.source}</TableCell>
                    <TableCell className={`font-bold text-sm ${t.direction === "credit" ? "text-emerald-700" : "text-rose-700"}`}>
                      {t.direction === "credit" ? "+" : ""}₹{Math.abs(t.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-slate-900">{t.balance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* MERCHANT WALLETS */}
        <TabsContent value="merchants">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Topup</TableHead>
                  <TableHead>Last Deduction</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "SneakerHead India", id: "MER-4421", balance: 450, status: "Low Balance Warning", topup: "5 days ago", deduction: "Today" },
                  { name: "Royal Electronics", id: "MER-4490", balance: 12400, status: "Healthy", topup: "Today", deduction: "Yesterday" },
                  { name: "Furniture World", id: "MER-4601", balance: 88000, status: "Healthy", topup: "2 days ago", deduction: "2 days ago" },
                  { name: "Style Hub Trends", id: "MER-4512", balance: 0, status: "Wallet Exhausted", topup: "Never", deduction: "Never" },
                ].map(m => (
                  <TableRow key={m.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="font-medium text-slate-900">{m.name}</div>
                      <div className="text-xs text-slate-500">{m.id}</div>
                    </TableCell>
                    <TableCell className={`font-bold ${m.balance < 1000 ? "text-red-600" : "text-emerald-700"}`}>₹{m.balance.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={m.status === "Healthy" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : m.status === "Wallet Exhausted" ? "bg-red-100 text-red-800 border-red-200 font-bold animate-pulse" : "bg-amber-100 text-amber-800 border-amber-200 font-semibold"}>{m.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{m.topup}</TableCell>
                    <TableCell className="text-sm text-slate-600">{m.deduction}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/merchants/${m.id}`} className="text-xs text-blue-600 hover:underline">View Merchant →</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* THRESHOLDS */}
        <TabsContent value="thresholds">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-900">Billing Thresholds</h3>
              {[
                { label: "Min Wallet Balance (Alert)", val: "₹500", status: "Active" },
                { label: "Min Wallet Balance (Store Freeze)", val: "₹0", status: "Active" },
                { label: "Max Topup per Transaction", val: "₹1,00,000", status: "Active" },
                { label: "Auto-Invoice Cycle", val: "Monthly (1st)", status: "Active" },
                { label: "Refund Window", val: "7 days", status: "Active" },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="text-sm text-slate-700">{r.label}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{r.val}</span>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">{r.status}</Badge>
                  </div>
                </div>
              ))}
              <button className="w-full inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 text-slate-700">Edit Thresholds</button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="font-semibold text-slate-900">Reconciliation Summary</h3>
              {[
                { label: "Platform Revenue (MTD)", val: "₹12.4L", trend: "up" },
                { label: "Merchant Credits Issued (MTD)", val: "₹98.2L", trend: "up" },
                { label: "Refunds Processed (MTD)", val: "₹4.1L", trend: "down" },
                { label: "Platform Fees Collected (MTD)", val: "₹14.2L", trend: "up" },
                { label: "Net Reconciliation Gap", val: "₹0.00", trend: "neutral" },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <div className="text-sm text-slate-700">{r.label}</div>
                  <div className={`text-sm font-bold flex items-center gap-1 ${r.trend === "up" ? "text-emerald-700" : r.trend === "down" ? "text-rose-700" : "text-slate-900"}`}>
                    {r.trend === "up" ? <TrendingUp className="h-3 w-3" /> : r.trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
                    {r.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
