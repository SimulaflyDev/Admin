import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, Bot, Eye, Calendar, ArrowLeft, Mail, Phone, MapPin, Zap, FileText, ImageIcon, Sparkles, Activity } from "lucide-react"
import Link from "next/link"

export default function UserProfile({ params }: { params: { id: string } }) {
  const userId = params.id || "USR-8921"

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-24">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link href="/users" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 shadow-sm transition-colors shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rahul M.</h1>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 font-bold uppercase text-[10px] tracking-wider ml-2">High Intent Consumer</Badge>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-0.5">User ID: {userId} • Registered: 12 Oct 2023</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 shadow-sm transition-colors">
            Impersonate
          </button>
          <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors">
            Send Message
          </button>
        </div>
      </div>

      {/* Summary Profile Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 shadow-sm border-slate-200 rounded-2xl overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
          <CardContent className="pt-0 relative px-6 pb-6">
            <div className="flex flex-col items-center text-center -mt-12">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center p-1 shadow-md mb-3">
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-black text-indigo-600">
                  RM
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Rahul M.</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[10px] uppercase">Active Now</Badge>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><Mail className="h-4 w-4 text-slate-400" /></div>
                rahul.m@email.com
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><Phone className="h-4 w-4 text-slate-400" /></div>
                +91 98765 43210
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><MapPin className="h-4 w-4 text-slate-400" /></div>
                Bangalore, KA
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-purple-50"><Bot className="h-5 w-5 text-purple-600" /></div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Visualizations</div>
            </div>
            <div className="text-3xl font-black text-purple-700">42</div>
            <div className="text-xs font-semibold text-slate-500 mt-2">Rooms Generated</div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-50"><ShoppingCart className="h-5 w-5 text-amber-600" /></div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Saved Cart Intent</div>
            </div>
            <div className="text-3xl font-black text-amber-700">₹12.9K</div>
            <div className="text-xs font-semibold text-amber-600 mt-2 flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> 3 items active</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-indigo-50"><FileText className="h-5 w-5 text-indigo-600" /></div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Booking Requests</div>
            </div>
            <div className="text-3xl font-black text-indigo-700">14</div>
            <div className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> 11 Confirmed</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-blue-50"><Activity className="h-5 w-5 text-blue-600" /></div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Engagement Score</div>
            </div>
            <div className="text-3xl font-black text-blue-700">92/100</div>
            <div className="text-xs font-semibold text-slate-500 mt-2">Top 5% of users</div>
          </div>
        </div>
      </div>

      {/* Deep Profile Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="flex h-auto bg-slate-100/50 border border-slate-200 rounded-xl p-1 gap-1 mb-6 max-w-fit">
          {["activity", "bookings", "ai", "support"].map(tab => (
            <TabsTrigger key={tab} value={tab} className="capitalize rounded-lg text-sm font-semibold px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all">
              {tab === "activity" ? "Demand Funnel Activity" : tab === "bookings" ? "Bookings & Intent" : tab === "ai" ? "AI Generation Logs" : "Support Tickets"}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* ACTIVITY TIMELINE TAB */}
        <TabsContent value="activity">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Recent Demand-Generation Funnel
            </h3>
            
            <div className="relative border-l-2 border-indigo-100 ml-4 space-y-10 pb-4">
              <div className="pl-8 relative">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full absolute -left-[17px] -top-1 shadow-sm ring-4 ring-white flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Created Booking Request
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">Conversion</Badge>
                </div>
                <div className="text-xs font-medium text-slate-600 mt-1">Requested 1x "Nike Air Max 90" from SneakerHead India.</div>
                <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Today, 2:45 PM</div>
              </div>
              
              <div className="pl-8 relative">
                <div className="w-8 h-8 bg-amber-500 text-white rounded-full absolute -left-[17px] -top-1 shadow-sm ring-4 ring-white flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Added to Cart (High Intent)
                </div>
                <div className="text-xs font-medium text-slate-600 mt-1">Saved item to active cart. Cart Value increased to ₹12,999.</div>
                <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Today, 2:42 PM</div>
              </div>

              <div className="pl-8 relative">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full absolute -left-[17px] -top-1 shadow-sm ring-4 ring-white flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Used AI Generation (Try-on/Room)
                </div>
                <div className="text-xs font-medium text-slate-600 mt-1">Prompt: "Visualize these sneakers with my current outfit". Generated 3 image variations.</div>
                <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Today, 2:40 PM</div>
              </div>

              <div className="pl-8 relative">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full absolute -left-[17px] -top-1 shadow-sm ring-4 ring-white flex items-center justify-center">
                  <Eye className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Viewed Product Page
                </div>
                <div className="text-xs font-medium text-slate-600 mt-1">Browsed "Nike Air Max 90". Time on page: 4m 12s.</div>
                <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Today, 2:35 PM</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* BOOKINGS TAB */}
        <TabsContent value="bookings">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                Booking Requests
              </h3>
            </div>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Booking Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: "BK-9021", merchant: "SneakerHead India", date: "Today 2:45 PM", val: "₹12,999", status: "Confirmed", sc: "bg-blue-100 text-blue-800" },
                  { id: "BK-8891", merchant: "Urban Style", date: "Last Week", val: "₹4,500", status: "Closed", sc: "bg-emerald-100 text-emerald-800" },
                  { id: "BK-8842", merchant: "Royal Electronics", date: "Last Month", val: "₹89,999", status: "Closed", sc: "bg-emerald-100 text-emerald-800" },
                ].map(b => (
                  <TableRow key={b.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold text-slate-900">{b.id}</TableCell>
                    <TableCell className="font-medium text-slate-700">{b.merchant}</TableCell>
                    <TableCell className="text-xs font-medium text-slate-500">{b.date}</TableCell>
                    <TableCell className="font-bold text-indigo-700">{b.val}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${b.sc}`}>{b.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Link href={`/bookings/${b.id}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">View</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* AI LOGS TAB */}
        <TabsContent value="ai">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-500" />
              AI Generation Sessions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { prompt: "Visualize these sneakers with my current outfit", type: "Style Render", date: "Today, 2:40 PM" },
                { prompt: "Generate a modern living room setup with this sofa", type: "Room Intelligence", date: "3 Days Ago" },
                { prompt: "Show this jacket in cyberpunk neon lighting", type: "Style Render", date: "1 Week Ago" },
                { prompt: "Minimalist japandi bedroom with the oak bed frame", type: "Room Intelligence", date: "2 Weeks Ago" },
              ].map((log, i) => (
                <div key={i} className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex gap-4 hover:border-purple-200 transition-colors">
                  <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 text-[9px] uppercase font-bold tracking-widest">{log.type}</Badge>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{log.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">"{log.prompt}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="support">
          <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm text-center">
            <Sparkles className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <h3 className="font-bold text-slate-900 mb-1">No Active Tickets</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">This user has a healthy engagement history with zero support tickets raised.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
