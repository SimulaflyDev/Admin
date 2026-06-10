import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, MessageSquare, Send, User, Building2, AlertTriangle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function TicketProfile({ params }: { params: { id: string } }) {
  const ticket = {
    id: params.id,
    subject: "Refund not processed for returned item",
    status: "Open",
    priority: "High",
    sla: "Breach in 2h",
    created: "Today, 10:42 AM",
    customer: { name: "Rahul M.", id: "USR-8921", ltv: "₹42,500" },
    order: { id: "ORD-991", amount: "₹12,999", status: "Returned" },
    merchant: { name: "SneakerHead India", id: "MER-4421" },
  }

  const messages = [
    { sender: "Customer", time: "10:42 AM", text: "Hi, I returned my Nike Air Max yesterday via your pickup partner but the refund hasn't hit my wallet yet. The order says returned. Please help!" },
    { sender: "System", time: "10:45 AM", text: "Automated check: Return picked up by Delhivery (AWB: 129381203). Warehouse scanning pending.", isSystem: true },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-4 shrink-0">
        <Link href="/support/consumer" className="p-2 -ml-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{ticket.subject}</h1>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">{ticket.status}</Badge>
            <Badge className="bg-red-100 text-red-800 border-red-200">{ticket.priority}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">Ticket {ticket.id} • Created {ticket.created}</p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
            <Clock className="h-4 w-4" /> {ticket.sla}
          </div>
          <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800">
            <CheckCircle2 className="h-4 w-4" /> Resolve Ticket
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left: Chat Thread */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2 text-sm font-medium text-slate-700">
            <MessageSquare className="h-4 w-4 text-slate-400" /> Interaction History
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.isSystem ? 'justify-center' : ''}`}>
                {!msg.isSystem && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                )}
                <div className={`space-y-1 ${msg.isSystem ? 'text-center max-w-sm' : 'max-w-2xl'}`}>
                  {!msg.isSystem && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-slate-900">{msg.sender}</span>
                      <span className="text-xs text-slate-500">{msg.time}</span>
                    </div>
                  )}
                  <div className={`text-sm ${msg.isSystem ? 'text-slate-500 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg' : 'text-slate-700 bg-slate-50 border border-slate-100 p-3 rounded-tr-xl rounded-b-xl'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex items-end gap-2">
              <textarea 
                placeholder="Type your reply to the customer..." 
                className="flex-1 min-h-[80px] p-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
              <button className="h-10 w-10 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 bg-slate-50 px-2 py-1 rounded">Use Macro: "Refund Timeline"</button>
              <button className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 bg-slate-50 px-2 py-1 rounded">Request Merchant Input</button>
            </div>
          </div>
        </div>

        {/* Right: Context Panel */}
        <div className="w-80 space-y-4 shrink-0 overflow-y-auto pb-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm">Customer Context</h3>
            <div>
              <Link href={`/users/${ticket.customer.id}`} className="font-medium text-indigo-600 hover:underline text-sm">{ticket.customer.name}</Link>
              <div className="text-xs text-slate-500 mt-0.5">ID: {ticket.customer.id}</div>
            </div>
            <div className="flex items-center justify-between py-2 border-y border-slate-100">
              <span className="text-xs text-slate-500">90d LTV</span>
              <span className="text-sm font-semibold text-slate-900">{ticket.customer.ltv}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm">Entity Links</h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Related Order</div>
                <Link href={`/orders/${ticket.order.id}`} className="font-medium text-indigo-600 hover:underline text-sm">{ticket.order.id}</Link>
                <div className="flex justify-between mt-1 text-xs font-medium">
                  <span className="text-slate-900">{ticket.order.amount}</span>
                  <span className="text-amber-600">{ticket.order.status}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Fulfilling Merchant</div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <Link href={`/merchants/${ticket.merchant.id}`} className="font-medium text-indigo-600 hover:underline text-sm">{ticket.merchant.name}</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5 space-y-3 bg-red-50/50">
            <h3 className="font-semibold text-red-900 text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" /> Risk Flags</h3>
            <p className="text-xs text-red-800 leading-relaxed">
              Customer has opened 3 refund tickets in the last 30 days. Investigate merchant return policy compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
