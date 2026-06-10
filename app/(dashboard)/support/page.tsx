"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, AlertTriangle, CheckCircle2, Clock, MessageSquare, AlertCircle, ShieldAlert, X, Send, MoreHorizontal, User, Store, Building2, FileText, ChevronRight, CornerDownRight } from "lucide-react"

type Ticket = {
  id: string
  category: "User" | "Merchant" | "Dispute"
  type: string
  status: "Open" | "Waiting on User" | "Waiting on Merchant" | "Resolved" | "Escalated"
  priority: "High" | "Medium" | "Low"
  assignee: string
  date: string
  summary: string
  city?: string
  user?: string
  merchant?: string
  store?: string
  bookingId?: string
  history: Array<{ sender: string, role: "agent" | "user" | "merchant" | "system", message: string, time: string }>
}

const mockTickets: Ticket[] = [
  {
    id: "TKT-9912", category: "User", type: "AI visualization issue", status: "Open", priority: "Medium", assignee: "Unassigned", date: "10 mins ago", summary: "AR try-on shows distorted room", city: "Mumbai", user: "Rahul M.",
    history: [
      { sender: "Rahul M.", role: "user", message: "Every time I try to visualize the sofa in my living room, the AR mode distorts the lighting and the app crashes.", time: "10 mins ago" }
    ]
  },
  {
    id: "TKT-9908", category: "Merchant", type: "KYC / verification pending", status: "Waiting on Merchant", priority: "High", assignee: "Nia R.", date: "1h ago", summary: "Store frozen pending GST upload", city: "Bangalore", merchant: "SneakerHead India", store: "Bandra West",
    history: [
      { sender: "System", role: "system", message: "Store suspended due to missing GST verification.", time: "2 days ago" },
      { sender: "Nia R.", role: "agent", message: "Hello, we need a clear copy of your GST certificate to unfreeze the store. Please upload it via the portal.", time: "1h ago" }
    ]
  },
  {
    id: "TKT-9890", category: "Dispute", type: "Booking dispute", status: "Escalated", priority: "High", assignee: "Priya S.", date: "3h ago", summary: "Merchant refused to honor booking price", user: "Aakash G.", merchant: "Royal Electronics", bookingId: "BK-8842",
    history: [
      { sender: "Aakash G.", role: "user", message: "I arrived at the store and they are asking for ₹2,000 more than the booking price!", time: "3h ago" },
      { sender: "Priya S.", role: "agent", message: "I've escalated this to the merchant dispute team immediately.", time: "2h ago" }
    ]
  },
  {
    id: "TKT-9885", category: "User", type: "Saved product not showing", status: "Resolved", priority: "Low", assignee: "System", date: "5h ago", summary: "Cart missing items after login", user: "Neha K.",
    history: [
      { sender: "System", role: "system", message: "Auto-resolved. Cache cleared for user session.", time: "5h ago" }
    ]
  },
  {
    id: "TKT-9870", category: "Merchant", type: "Booking not visible", status: "Open", priority: "Medium", assignee: "Unassigned", date: "1d ago", summary: "Cannot see BK-8891 in merchant panel", merchant: "Urban Style", store: "Powai Hub", bookingId: "BK-8891",
    history: [
      { sender: "Merchant Admin", role: "merchant", message: "A customer came with booking BK-8891 but it's not showing in our tablet POS.", time: "1d ago" }
    ]
  }
]

const cannedResponses = [
  "KYC Pending / Needs Document",
  "Booking Not Confirmed (To User)",
  "Store Visibility Issue (To Merchant)",
  "Wallet Credit Delay",
  "Redeem Code Invalid"
]

export default function SupportHub() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replyText, setReplyText] = useState("")

  const filteredTickets = mockTickets.filter(t => {
    if (activeTab === "user") return t.category === "User"
    if (activeTab === "merchant") return t.category === "Merchant"
    if (activeTab === "disputes") return t.category === "Dispute"
    return true // overview shows all
  })

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-[1600px] mx-auto overflow-hidden">
      {/* LEFT PANE: Ticket List */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${selectedTicket ? 'max-w-[60%]' : 'max-w-full'}`}>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support Hub</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Unified triage for Users, Merchants, and Disputes</p>
            </div>
          </div>

          {/* Shared KPI Header */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "Open Tickets", val: "142", icon: MessageSquare, color: "text-blue-600" },
              { label: "SLA Breaches", val: "12", icon: ShieldAlert, color: "text-red-600" },
              { label: "High Priority", val: "34", icon: AlertTriangle, color: "text-amber-600" },
              { label: "Wait on User", val: "58", icon: Clock, color: "text-slate-600" },
              { label: "Wait on Merch", val: "19", icon: Clock, color: "text-slate-600" },
              { label: "Resolved Today", val: "420", icon: CheckCircle2, color: "text-emerald-600" },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{k.label}</div>
                  <div className={`text-2xl font-black ${k.color}`}>{k.val}</div>
                </div>
                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center shrink-0">
                  <k.icon className={`h-4 w-4 ${k.color}`} />
                </div>
              </div>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex h-auto bg-slate-100/50 border border-slate-200 rounded-xl p-1 gap-1 flex-wrap max-w-fit">
              {[
                { id: "overview", label: "Overview" },
                { id: "user", label: "User Support" },
                { id: "merchant", label: "Merchant Support" },
                { id: "disputes", label: "Booking Disputes" },
                { id: "sla", label: "SLA Tracker" },
                { id: "audit", label: "Audit Log" }
              ].map(tab => (
                <TabsTrigger key={tab.id} value={tab.id} className="rounded-lg text-sm font-semibold px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Filters */}
          {activeTab !== "sla" && activeTab !== "audit" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-slate-50/50">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search ticket ID, user, merchant..." className="pl-9 bg-white border-slate-200 text-sm h-10" />
                </div>
                <Select defaultValue="all"><SelectTrigger className="w-[140px] h-10 text-sm font-medium"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="open">Open</SelectItem><SelectItem value="resolved">Resolved</SelectItem></SelectContent></Select>
                <Select defaultValue="all"><SelectTrigger className="w-[140px] h-10 text-sm font-medium"><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent><SelectItem value="all">All Priority</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select>
                <button className="inline-flex h-10 items-center gap-2 px-4 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium bg-white shadow-sm hover:bg-slate-50">
                  <Filter className="h-4 w-4" /> Filters
                </button>
              </div>

              {/* Ticket Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-600">Ticket</TableHead>
                      <TableHead className="font-semibold text-slate-600">Context</TableHead>
                      <TableHead className="font-semibold text-slate-600">Status & Priority</TableHead>
                      <TableHead className="font-semibold text-slate-600 text-right">Assignee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map(ticket => (
                      <TableRow 
                        key={ticket.id} 
                        onClick={() => setSelectedTicket(ticket)}
                        className={`cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? "bg-indigo-50/50 hover:bg-indigo-50/80" : "hover:bg-slate-50"}`}
                      >
                        <TableCell>
                          <div className="font-bold text-slate-900 text-sm">{ticket.summary}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{ticket.id}</span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-medium text-slate-600">{ticket.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            {ticket.user && <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-indigo-500" /> {ticket.user}</div>}
                            {ticket.merchant && <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-emerald-500" /> {ticket.merchant}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5 items-start">
                            <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-700 border-blue-200' : ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ticket.status === 'Escalated' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>{ticket.status}</Badge>
                            {ticket.priority === 'High' && <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 uppercase"><AlertCircle className="h-3.5 w-3.5" /> High Priority</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm font-bold text-slate-900">{ticket.assignee}</div>
                          <div className="text-xs font-medium text-slate-500 mt-0.5">{ticket.date}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {activeTab === "sla" && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">SLA Dashboard UI Goes Here</div>
          )}
          {activeTab === "audit" && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">Audit Log List Goes Here</div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: Ticket Detail */}
      {selectedTicket && (
        <div className="w-[40%] h-full border-l border-slate-200 bg-white flex flex-col shadow-2xl animate-in slide-in-from-right-8 duration-300 z-10 shrink-0">
          {/* Panel Header */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{selectedTicket.id}</span>
                <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${selectedTicket.status === 'Open' ? 'bg-blue-100 text-blue-700' : selectedTicket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : selectedTicket.status === 'Escalated' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{selectedTicket.status}</Badge>
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{selectedTicket.summary}</h2>
              <div className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-2">
                Type: <span className="font-semibold text-slate-700">{selectedTicket.type}</span>
                <span>•</span> Opened {selectedTicket.date}
              </div>
            </div>
            <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Linked Entities Bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-3">
            {selectedTicket.user && (
              <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold text-slate-700 transition-colors">
                <User className="h-4 w-4 text-indigo-500" /> {selectedTicket.user}
              </button>
            )}
            {selectedTicket.merchant && (
              <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold text-slate-700 transition-colors">
                <Building2 className="h-4 w-4 text-emerald-500" /> {selectedTicket.merchant}
              </button>
            )}
            {selectedTicket.bookingId && (
              <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-bold text-indigo-700 transition-colors border border-indigo-200">
                <FileText className="h-4 w-4" /> {selectedTicket.bookingId}
              </button>
            )}
          </div>

          {/* Chat / History Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {selectedTicket.history.map((msg, idx) => (
              <div key={idx} className={`flex flex-col max-w-[85%] ${msg.role === 'agent' ? 'ml-auto items-end' : msg.role === 'system' ? 'mx-auto items-center' : 'items-start'}`}>
                {msg.role === 'system' ? (
                  <div className="bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" /> {msg.message}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1.5 mx-1">
                      <span className="text-xs font-bold text-slate-500">{msg.sender}</span>
                      <span className="text-[10px] font-medium text-slate-400">{msg.time}</span>
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'agent' ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                      {msg.message}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Action Area (Bottom) */}
          <div className="p-6 border-t border-slate-200 bg-white">
            {/* Quick Actions */}
            <div className="flex gap-2 mb-4">
              <Select onValueChange={(v: string) => setReplyText(v)}>
                <SelectTrigger className="h-9 text-sm font-medium flex-1"><SelectValue placeholder="Insert Canned Response..." /></SelectTrigger>
                <SelectContent>
                  {cannedResponses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <button className="inline-flex h-9 items-center gap-1.5 px-4 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 shadow-sm">
                <CornerDownRight className="h-4 w-4" /> Reassign
              </button>
              <button className="inline-flex h-9 items-center gap-1.5 px-4 rounded-lg border border-red-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 shadow-sm">
                <ShieldAlert className="h-4 w-4" /> Escalate
              </button>
            </div>

            <div className="relative border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all shadow-sm">
              <textarea 
                rows={4} 
                className="w-full text-sm p-4 outline-none resize-none placeholder:text-slate-400 bg-slate-50/50 leading-relaxed"
                placeholder="Type your reply here... (Use @ to mention staff)"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex items-center justify-between p-3 bg-white border-t border-slate-100">
                <button className="text-sm font-bold text-amber-600 px-3 py-1.5 hover:bg-amber-50 rounded-md transition-colors">
                  Add Internal Note
                </button>
                <div className="flex items-center gap-2">
                  <button className="inline-flex h-9 items-center gap-2 px-4 rounded-md bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition-colors border border-emerald-200">
                    <CheckCircle2 className="h-4 w-4" /> Mark Resolved
                  </button>
                  <button className="inline-flex h-9 items-center gap-2 px-6 rounded-md bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                    <Send className="h-4 w-4" /> Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
