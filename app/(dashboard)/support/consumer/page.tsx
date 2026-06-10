import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Headset, Clock, AlertTriangle, CheckCircle2, MessageSquare, ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"

const tickets = [
  { id: "TKT-9010", subject: "Cannot find my booking confirmation", user: "Rahul M.", queue: "Consumer", priority: "High", status: "Open", age: "4h" },
  { id: "TKT-9005", subject: "Store inventory not syncing", user: "SneakerHead India", queue: "Merchant", priority: "High", status: "In Progress", age: "6h" },
  { id: "TKT-8998", subject: "Invoice discrepancy for May", user: "Royal Electronics", queue: "Finance", priority: "Medium", status: "Open", age: "1d" },
  { id: "TKT-8990", subject: "AI image generation failing for room scan", user: "USR-9102", queue: "Technical", priority: "Critical", status: "Open", age: "2h" },
  { id: "TKT-8971", subject: "Refund not reflected in wallet", user: "Priya S.", queue: "Finance", priority: "High", status: "Open", age: "1.5d" },
  { id: "TKT-8810", subject: "Product not displaying in app", user: "Bandra West Outlet", queue: "Merchant", priority: "Medium", status: "Resolved", age: "3d" },
]

const priorityStyles: Record<string, string> = {
  Critical: "bg-red-200 text-red-900 border-red-300",
  High: "bg-red-100 text-red-800 border-red-200",
  Medium: "bg-amber-100 text-amber-800 border-amber-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
}
const statusStyles: Record<string, string> = {
  Open: "bg-blue-100 text-blue-800 border-blue-200",
  "In Progress": "bg-purple-100 text-purple-800 border-purple-200",
  Resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Closed: "bg-slate-100 text-slate-600 border-slate-200",
}
const queueStyles: Record<string, string> = {
  Consumer: "bg-blue-50 text-blue-700 border-blue-200",
  Merchant: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Finance: "bg-amber-50 text-amber-700 border-amber-200",
  Technical: "bg-purple-50 text-purple-700 border-purple-200",
}

export default function SupportCenter() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Unified Support Center</h1>
          <p className="text-sm text-slate-500 mt-1">All queues · Consumer, Merchant, Finance, Technical</p>
        </div>
        <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-colors">
          <MessageSquare className="h-4 w-4" /> Create Ticket
        </button>
      </div>

      {/* Queue KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open Tickets", val: "48", sub: "5 critical", icon: AlertTriangle, color: "text-red-700 bg-red-50" },
          { label: "In Progress", val: "22", sub: "Assigned to agents", icon: Clock, color: "text-purple-700 bg-purple-50" },
          { label: "Avg Resolution (h)", val: "4.2h", sub: "SLA: 8h", icon: TrendingUp, color: "text-emerald-700 bg-emerald-50" },
          { label: "Resolved Today", val: "31", sub: "+12 vs yesterday", icon: CheckCircle2, color: "text-blue-700 bg-blue-50" },
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

      {/* SLA Breach Alert */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
        <p className="text-sm text-red-700"><span className="font-semibold">SLA Breach:</span> Ticket TKT-8971 has been open for 1.5 days without assignment — above 8h SLA.</p>
        <Link href="/support/consumer/TKT-8971" className="ml-auto text-xs font-bold text-red-700 whitespace-nowrap flex items-center gap-1 hover:text-red-900">
          Assign Now <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="flex flex-wrap h-auto bg-white border border-slate-200 rounded-xl p-1 gap-0.5 mb-4">
          {[
            { val: "all", label: "All Tickets" },
            { val: "consumer", label: "Consumer" },
            { val: "merchant", label: "Merchant" },
            { val: "finance", label: "Finance" },
            { val: "technical", label: "Technical" },
          ].map(t => (
            <TabsTrigger key={t.val} value={t.val} className="text-sm rounded-lg px-3 py-1.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        {["all", "consumer", "merchant", "finance", "technical"].map(tabVal => (
          <TabsContent key={tabVal} value={tabVal}>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Raised By</TableHead>
                    <TableHead>Queue</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets
                    .filter(t => tabVal === "all" || t.queue.toLowerCase() === tabVal)
                    .map(ticket => (
                      <TableRow key={ticket.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-900 text-sm">{ticket.id}</TableCell>
                        <TableCell className="text-sm text-slate-800 max-w-[240px] truncate">{ticket.subject}</TableCell>
                        <TableCell className="text-sm text-slate-600">{ticket.user}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${queueStyles[ticket.queue]}`}>{ticket.queue}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${priorityStyles[ticket.priority]}`}>{ticket.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${statusStyles[ticket.status]}`}>{ticket.status}</Badge>
                        </TableCell>
                        <TableCell className={`text-sm ${parseFloat(ticket.age) > 8 ? "text-red-600 font-semibold" : "text-slate-500"}`}>{ticket.age} ago</TableCell>
                        <TableCell className="text-right">
                          <button className="text-xs text-blue-600 hover:underline">View →</button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
