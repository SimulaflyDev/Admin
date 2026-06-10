import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Download, Filter, Users as UsersIcon, Bot, ShoppingCart, Activity, FileText, Zap } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import Link from "next/link"

const users = [
  { id: "USR-8921", name: "Rahul M.", email: "rahul.m@email.com", phone: "+91 98765 43210", status: "Active", registered: "12 Oct 2023", bookings: 14, aiSessions: 42, cartValue: 12999, engagement: "High Intent" },
  { id: "USR-9102", name: "Aakash G.", email: "aakash.g@mail.com", phone: "+91 99887 76655", status: "Active", registered: "20 Dec 2023", bookings: 35, aiSessions: 120, cartValue: 45000, engagement: "Power User" },
  { id: "USR-9044", name: "Priya S.", email: "priya.s@example.com", phone: "+91 91234 56789", status: "Dormant", registered: "05 Nov 2023", bookings: 2, aiSessions: 3, cartValue: 0, engagement: "Low Intent" },
]

export default function UserDirectory() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Directory</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage platform consumers and monitor demand-generation activity</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium bg-white shadow-sm hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Consumers", val: "142.5K", icon: UsersIcon, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Active (30d)", val: "89.2K", icon: Activity, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "AI Visualizations", val: "345K", icon: Bot, color: "text-purple-700", bg: "bg-purple-50" },
          { label: "Booking Requests", val: "42.1K", icon: FileText, color: "text-indigo-700", bg: "bg-indigo-50" },
          { label: "Active Cart Intent", val: "₹1.4Cr", icon: ShoppingCart, color: "text-amber-700", bg: "bg-amber-50" },
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              type="search" 
              placeholder="Search name, phone, email..." 
              className="pl-9 bg-slate-50 border-slate-200 text-sm"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium bg-white shadow-sm hover:bg-slate-50 transition-colors">
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div>
        </div>
        
        {users.length === 0 ? (
          <EmptyState 
            icon={UsersIcon}
            title="No users found"
            description="There are currently no users registered on the platform matching your criteria."
            actionLabel="Clear Filters"
            onAction={() => console.log("clear")}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>User & Contact</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead>Demand Gen</TableHead>
                  <TableHead>Saved Cart Value</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <TableCell>
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-xs font-medium text-slate-500">{user.email}</div>
                      <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">ID: {user.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-bold tracking-wider uppercase ${user.status === "Active" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>{user.status}</Badge>
                      <div className="text-xs text-slate-400 mt-1">Joined: {user.registered}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm font-medium">
                        <div className="flex items-center gap-1.5 text-slate-700"><Bot className="h-3.5 w-3.5 text-purple-500" /> {user.aiSessions} AI Gen</div>
                        <div className="flex items-center gap-1.5 text-slate-700"><FileText className="h-3.5 w-3.5 text-indigo-500" /> {user.bookings} Bookings</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-amber-700">₹{user.cartValue.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${user.engagement === 'High Intent' ? 'bg-blue-100 text-blue-700' : user.engagement === 'Power User' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                        <Zap className="h-3 w-3" /> {user.engagement}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/users/${user.id}`} className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-bold hover:bg-indigo-100 text-indigo-600 bg-indigo-50 transition-colors">
                        View Profile
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
