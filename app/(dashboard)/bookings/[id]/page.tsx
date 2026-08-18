import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Store, Building2, Wallet, Headset, Package, CheckCircle2, Clock, Truck, AlertCircle, Eye, Phone, Percent, ArrowRight, IndianRupee } from "lucide-react"
import Link from "next/link"

export default function BookingProfile({ params }: { params: { id: string } }) {
  const bookingId = params.id || "BK-9021"

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-24">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/bookings" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shrink-0 shadow-sm transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{bookingId}</h1>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold uppercase text-[10px] tracking-wider ml-2">Merchant Confirmed</Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 font-bold uppercase text-[10px] tracking-wider">Delivery: Dispatched</Badge>
            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 font-bold uppercase text-[10px] tracking-wider">Payment: Pending</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-medium">Booking Request created: Today 2:45 PM</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium hover:bg-amber-100 transition-colors shadow-sm">
            <AlertCircle className="h-3.5 w-3.5" /> Raise Dispute
          </button>
          <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-colors">
            Contact Merchant
          </button>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-2.5 bg-blue-50 rounded-xl"><User className="h-5 w-5 text-blue-600" /></div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Info</div>
            <Link href="/users/USR-8921" className="text-sm font-bold text-blue-600 hover:underline">Rahul M.</Link>
            <div className="text-xs font-medium text-slate-500">+91 98765 43210 · Mumbai</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-2.5 bg-indigo-50 rounded-xl"><Building2 className="h-5 w-5 text-indigo-600" /></div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Merchant</div>
            <Link href="/merchants/MER-4421" className="text-sm font-bold text-indigo-600 hover:underline">SneakerHead India</Link>
            <div className="text-xs font-medium text-slate-500">Premium Partner</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-2.5 bg-emerald-50 rounded-xl"><Store className="h-5 w-5 text-emerald-600" /></div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fulfilling Store</div>
            <Link href="/stores/STR-8812" className="text-sm font-bold text-emerald-600 hover:underline">Bandra West Outlet</Link>
            <div className="text-xs font-medium text-slate-500">Retail Outlet</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-2.5 bg-slate-100 rounded-xl"><Wallet className="h-5 w-5 text-slate-600" /></div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking Value (GMV)</div>
            <div className="text-lg font-black text-slate-900 leading-tight">₹12,999</div>
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Payment Pending</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="flex h-auto bg-slate-100/50 border border-slate-200 rounded-xl p-1 gap-1 mb-6">
          {["timeline", "items", "finance", "support"].map(tab => (
            <TabsTrigger key={tab} value={tab} className="capitalize rounded-lg text-sm font-semibold px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all">
              {tab === "items" ? "Products Requested" : tab === "finance" ? "Finance & Billing" : tab === "support" ? "Support History" : "Booking Timeline"}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* TIMELINE TAB */}
        <TabsContent value="timeline" className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              Booking Progress
            </h3>
            
            <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8 pb-4">
              {[
                { icon: Wallet, color: "bg-slate-200 text-slate-500", label: "Payment Received", detail: "Awaiting customer payment confirmation by merchant.", time: "Pending", done: false },
                { icon: Truck, color: "bg-blue-500 text-white", label: "Delivery In Progress", detail: "Merchant dispatched the requested products.", time: "Today 4:00 PM", done: true },
                { icon: Phone, color: "bg-emerald-500 text-white", label: "Merchant Contacted Customer", detail: "Merchant verified delivery details via phone.", time: "Today 3:15 PM", done: true },
                { icon: CheckCircle2, color: "bg-indigo-500 text-white", label: "Merchant Confirmed", detail: "Merchant accepted the booking. (Booking Fee triggered)", time: "Today 3:00 PM", done: true },
                { icon: Eye, color: "bg-indigo-400 text-white", label: "Merchant Viewed", detail: "Store manager opened the booking request.", time: "Today 2:50 PM", done: true },
                { icon: Package, color: "bg-slate-800 text-white", label: "User Created Booking", detail: "Customer submitted intent for 1 item.", time: "Today 2:45 PM", done: true },
              ].map((event, idx) => (
                <div key={event.label} className="pl-8 relative">
                  <div className={`w-8 h-8 ${event.color} rounded-full absolute -left-[17px] top-0 shadow-sm ring-4 ring-white flex items-center justify-center transition-transform hover:scale-110`}>
                    <event.icon className="h-4 w-4" />
                  </div>
                  <div className={`text-sm font-bold ${event.done ? 'text-slate-900' : 'text-slate-400'}`}>{event.label}</div>
                  <div className={`text-xs mt-1 ${event.done ? 'text-slate-600' : 'text-slate-400'}`}>{event.detail}</div>
                  <div className={`text-[10px] font-bold mt-1.5 tracking-wider uppercase ${event.done ? 'text-slate-400' : 'text-slate-300'}`}>{event.time}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ITEMS TAB */}
        <TabsContent value="items">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-500" />
              Products Requested
            </h3>
            <div className="divide-y divide-slate-100">
              <div className="flex items-center gap-5 py-4">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-3xl shrink-0 shadow-inner">👟</div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Nike Air Max 90</div>
                  <div className="text-sm font-medium text-slate-500 mt-1">PRD-0891 · Requested Qty: 1 · Size: UK 10</div>
                </div>
                <div className="text-lg font-black text-slate-900">₹12,999</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                <span className="font-semibold text-slate-600">Total Booking Value (GMV)</span>
                <span className="text-xl font-black text-slate-900">₹12,999</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* FINANCE TAB */}
        <TabsContent value="finance">
          <div className="space-y-6">
            <div className="bg-indigo-900 rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10">
                <Percent className="h-64 w-64 text-indigo-300" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <IndianRupee className="h-5 w-5 text-emerald-400" />
                    Booking Fee Deduction
                  </h3>
                  <p className="text-indigo-200 text-sm font-medium max-w-md">
                    SimulaFly charges a commission when the merchant confirms the booking request. This fee is automatically deducted from their prepaid wallet.
                  </p>
                </div>
                <div className="flex items-center gap-4 bg-indigo-950/50 p-4 rounded-xl border border-indigo-800/50 backdrop-blur-sm">
                  <div className="text-center px-4">
                    <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Fee Rule Applied</div>
                    <div className="text-lg font-black text-white">2% (Large Order)</div>
                  </div>
                  <div className="h-10 w-px bg-indigo-800/50"></div>
                  <div className="text-center px-4">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">SimulaFly Revenue</div>
                    <div className="text-2xl font-black text-emerald-400">₹260</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-indigo-500" />
                Merchant Wallet Impact
              </h3>
              
              <div className="flex items-center justify-center gap-6 py-4">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl w-48 text-center shadow-sm">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Before Confirmation</div>
                  <div className="text-xl font-bold text-slate-700">₹4,500</div>
                </div>
                
                <div className="flex flex-col items-center justify-center text-rose-500">
                  <span className="text-sm font-bold mb-1">- ₹260</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
                
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl w-48 text-center shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full"></div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">After Confirmation</div>
                  <div className="text-xl font-black text-emerald-700">₹4,240</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-500">Transaction ID: <span className="text-slate-900">TXN-BF-9021</span></span>
                <span className="font-medium text-slate-500">Deducted: Today 3:00 PM</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* SUPPORT TAB */}
        <TabsContent value="support">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
            <Headset className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <h3 className="font-bold text-slate-900 mb-1">No Active Disputes</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">There are no open support tickets or disputes associated with this booking request.</p>
            <button className="inline-flex h-9 items-center gap-2 px-6 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
              Create Support Ticket
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
