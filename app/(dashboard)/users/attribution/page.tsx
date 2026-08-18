import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GitBranch, MapPin, Target, TrendingUp, Users, IndianRupee } from "lucide-react"

export default function UserAttribution() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Attribution</h1>
          <p className="text-sm text-slate-500 mt-1">First-touch and multi-touch acquisition tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tracked Users", val: "1,42,800", icon: Users, color: "text-blue-700 bg-blue-50" },
          { label: "Cost Per Acquisition", val: "₹142", icon: IndianRupee, color: "text-red-700 bg-red-50" },
          { label: "Highest LTV Source", val: "Merchant Referral", icon: TrendingUp, color: "text-emerald-700 bg-emerald-50" },
          { label: "Unattributed", val: "12%", icon: Target, color: "text-slate-700 bg-slate-50" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${k.color} shrink-0`}><k.icon className="h-5 w-5" /></div>
            <div>
              <div className="text-xs text-slate-500">{k.label}</div>
              <div className="text-xl font-bold text-slate-900">{k.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
        <h3 className="font-semibold text-slate-900">Acquisition Source Performance</h3>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Source / Channel</TableHead>
              <TableHead>Acquired Users (MTD)</TableHead>
              <TableHead>Avg CAC</TableHead>
              <TableHead>Conversion Rate</TableHead>
              <TableHead>Avg 90d LTV</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { source: "Organic Search / App Store", users: 12200, cac: "₹0", conv: "3.2%", ltv: "₹1,240" },
              { source: "Merchant Referrals", users: 8100, cac: "₹50 (Coupon)", conv: "14.1%", ltv: "₹3,400" },
              { source: "User Referrals", users: 5800, cac: "₹150 (Wallet + Coupon)", conv: "18.4%", ltv: "₹2,800" },
              { source: "WhatsApp Outreach (Reactivation)", users: 2300, cac: "₹12", conv: "8.2%", ltv: "₹1,840" },
              { source: "Performance Ads (Meta/Google)", users: 0, cac: "—", conv: "—", ltv: "—" },
            ].map(r => (
              <TableRow key={r.source} className="hover:bg-slate-50">
                <TableCell className="font-medium text-slate-900">{r.source}</TableCell>
                <TableCell>{r.users.toLocaleString()}</TableCell>
                <TableCell className="font-medium text-red-600">{r.cac}</TableCell>
                <TableCell className="font-bold text-emerald-700">{r.conv}</TableCell>
                <TableCell className="font-bold text-slate-900">{r.ltv}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
