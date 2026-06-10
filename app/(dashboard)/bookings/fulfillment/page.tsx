import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck, Package, Clock, CheckCircle2, AlertTriangle, MapPin } from "lucide-react"
import Link from "next/link"

const fulfillments = [
  { id: "FWB-10921", order: "ORD-9021", merchant: "SneakerHead India", carrier: "Delhivery", status: "In Transit", eta: "Tomorrow, 8 PM", delay: false },
  { id: "FWB-10910", order: "ORD-9010", merchant: "Royal Electronics", carrier: "BlueDart", status: "Out for Delivery", eta: "Today, 9 PM", delay: false },
  { id: "FWB-10892", order: "ORD-8992", merchant: "Furniture World", carrier: "XpressBees", status: "Delayed", eta: "Unknown", delay: true },
  { id: "FWB-10811", order: "ORD-8811", merchant: "Style Hub Trends", carrier: "Delhivery", status: "Delivered", eta: "Yesterday", delay: false },
]

export default function FulfillmentDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order Fulfillment</h1>
          <p className="text-sm text-slate-500 mt-1">Logistics tracking, carrier SLAs, and delivery exceptions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Shipments", val: "1,240", icon: Truck, color: "text-blue-700 bg-blue-50" },
          { label: "Avg Delivery Time", val: "2.4 Days", icon: Clock, color: "text-emerald-700 bg-emerald-50" },
          { label: "Delayed / Exceptions", val: "28", icon: AlertTriangle, color: "text-red-700 bg-red-50" },
          { label: "Delivered (Today)", val: "420", icon: CheckCircle2, color: "text-indigo-700 bg-indigo-50" },
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="font-semibold text-slate-900">Active Shipments Tracking</h3>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Waybill</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fulfillments.map(f => (
              <TableRow key={f.id} className={`hover:bg-slate-50 ${f.delay ? "bg-red-50/50" : ""}`}>
                <TableCell className="font-medium text-slate-900 text-sm">{f.id}</TableCell>
                <TableCell className="text-sm text-blue-600 hover:underline cursor-pointer">{f.order}</TableCell>
                <TableCell className="text-sm text-slate-600">{f.merchant}</TableCell>
                <TableCell className="text-sm font-medium">{f.carrier}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={f.delay ? "bg-red-100 text-red-800 border-red-200" : f.status === "Delivered" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-blue-100 text-blue-800 border-blue-200"}>{f.status}</Badge>
                </TableCell>
                <TableCell className={`text-sm ${f.delay ? "text-red-600 font-bold" : "text-slate-600"}`}>{f.eta}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/orders/${f.order}`} className="text-xs text-blue-600 hover:underline">View Order →</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
