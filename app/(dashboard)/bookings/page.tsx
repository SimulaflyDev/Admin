import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Clock, TrendingUp, CheckCircle2, AlertCircle, Truck, ShoppingCart, Activity, Banknote, MapPin, XCircle, FileText } from "lucide-react"
import Link from "next/link"

const bookings = [
  { id: "BK-9021", user: "Rahul M.", merchant: "SneakerHead India", store: "Bandra West Outlet", date: "Today 2:45 PM", value: 12999, merchantStatus: "Confirmed", deliveryStatus: "Dispatched", paymentStatus: "Received" },
  { id: "BK-9010", user: "Aakash G.", merchant: "Royal Electronics", store: "Royal Electronics HQ", date: "Today 11:12 AM", value: 89999, merchantStatus: "Closed", deliveryStatus: "Delivered", paymentStatus: "Received" },
  { id: "BK-8991", user: "Priya S.", merchant: "SneakerHead India", store: "Bandra West Outlet", date: "Today 9:40 AM", value: 24999, merchantStatus: "Awaiting Review", deliveryStatus: "Pending", paymentStatus: "Unknown" },
  { id: "BK-8812", user: "Sneha R.", merchant: "SneakerHead India", store: "Bandra West Outlet", date: "Yesterday", value: 8999, merchantStatus: "Declined", deliveryStatus: "Pending", paymentStatus: "Refunded" },
  { id: "BK-8720", user: "Mohit K.", merchant: "Royal Electronics", store: "Royal Electronics HQ", date: "2 days ago", value: 134900, merchantStatus: "Closed", deliveryStatus: "Delivered", paymentStatus: "Received" },
]

const merchantStatusStyles: Record<string, string> = {
  "Created": "bg-slate-100 text-slate-800 border-slate-200",
  "Awaiting Review": "bg-amber-100 text-amber-800 border-amber-200",
  "Confirmed": "bg-blue-100 text-blue-800 border-blue-200",
  "Declined": "bg-red-100 text-red-800 border-red-200",
  "In Progress": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Closed": "bg-emerald-100 text-emerald-800 border-emerald-200",
}

const deliveryStatusStyles: Record<string, string> = {
  "Pending": "bg-slate-100 text-slate-800 border-slate-200",
  "Dispatched": "bg-blue-100 text-blue-800 border-blue-200",
  "Delivered": "bg-emerald-100 text-emerald-800 border-emerald-200",
}

const paymentStatusStyles: Record<string, string> = {
  "Unknown": "bg-slate-100 text-slate-500 border-slate-200",
  "Pending": "bg-amber-100 text-amber-800 border-amber-200",
  "Received": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Failed": "bg-red-100 text-red-800 border-red-200",
  "Refunded": "bg-slate-200 text-slate-700 border-slate-300",
}

export default function BookingDashboard() {
  const totalBookingValue = bookings.reduce((sum, o) => sum + o.value, 0)
  const totalRequests = bookings.length
  const confirmed = bookings.filter(o => o.merchantStatus === "Confirmed" || o.merchantStatus === "Closed").length
  const declined = bookings.filter(o => o.merchantStatus === "Declined").length
  const pendingReview = bookings.filter(o => o.merchantStatus === "Awaiting Review").length
  const completedDeliveries = bookings.filter(o => o.deliveryStatus === "Delivered").length

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Booking Operations</h1>
          <p className="text-sm text-slate-500 mt-1">Manage demand generation and booking funnels across the network</p>
        </div>
        <div className="flex gap-2">
          <Link href="/bookings/disputes" className="inline-flex h-9 items-center gap-2 px-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium hover:bg-amber-100">
            <AlertCircle className="h-4 w-4" /> Disputes <span className="ml-1 bg-amber-200 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full">2</span>
          </Link>
          <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium bg-white shadow-sm hover:bg-slate-50">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: "Total Requests", val: totalRequests.toString(), icon: FileText, color: "text-slate-900", bg: "bg-slate-100" },
          { label: "Confirmed", val: confirmed.toString(), icon: CheckCircle2, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Declined", val: declined.toString(), icon: XCircle, color: "text-red-700", bg: "bg-red-50" },
          { label: "Pending Review", val: pendingReview.toString(), icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Deliveries Done", val: completedDeliveries.toString(), icon: Truck, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Booking Value", val: `₹${(totalBookingValue / 1000).toFixed(1)}K`, icon: Banknote, color: "text-indigo-700", bg: "bg-indigo-50" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${k.bg}`}>
                <k.icon className={`h-4 w-4 ${k.color}`} />
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase">{k.label}</div>
            </div>
            <div className={`text-2xl font-black ${k.color}`}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Secondary Performance KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Confirmation Rate", val: "76%", trend: "+2%" },
          { label: "Decline Rate", val: "11%", trend: "-1%" },
          { label: "Avg. Response Time", val: "4.2 Hrs", trend: "-30m" },
          { label: "Delivery Completion", val: "81%", trend: "+5%" },
          { label: "Payment Confirmed", val: "92%", trend: "+1%" },
        ].map(k => (
          <div key={k.label} className="bg-slate-50 rounded-xl border border-slate-100 p-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{k.label}</div>
            <div className="flex items-end gap-2 mt-1">
              <div className="text-xl font-bold text-slate-900">{k.val}</div>
              <div className={`text-xs font-bold mb-0.5 ${k.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{k.trend}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search booking ID, customer…" className="pl-9 bg-slate-50 border-slate-200 text-sm" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px] text-sm"><SelectValue placeholder="Merchant Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="awaiting">Awaiting Review</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px] text-sm"><SelectValue placeholder="Payment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Store / Merchant</TableHead>
                <TableHead>Booking Value</TableHead>
                <TableHead>Merchant Status</TableHead>
                <TableHead>Delivery Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map(booking => (
                <TableRow key={booking.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <TableCell>
                    <div className="font-semibold text-slate-900">{booking.id}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{booking.date}</div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-700">{booking.user}</TableCell>
                  <TableCell>
                    <div className="text-sm font-semibold text-slate-800">{booking.store}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{booking.merchant}</div>
                  </TableCell>
                  <TableCell className="text-sm font-bold text-indigo-700">₹{booking.value.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[11px] font-bold ${merchantStatusStyles[booking.merchantStatus]}`}>{booking.merchantStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[11px] font-bold ${deliveryStatusStyles[booking.deliveryStatus]}`}>{booking.deliveryStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[11px] font-bold ${paymentStatusStyles[booking.paymentStatus]}`}>{booking.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/bookings/${booking.id}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors">View Profile</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
