import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Headset, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function RoleSelectionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Select Your Role</h1>
          <p className="text-slate-500">Your account has multiple access contexts. Please select one to proceed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Org Manager */}
          <Link href="/executive">
            <Card className="cursor-pointer transition-all hover:border-blue-600 hover:bg-blue-50/50 border-blue-600 bg-blue-50/30">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Org Manager</h3>
                  <p className="text-sm text-slate-500 mt-1">Full access to company operations</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Customer Support */}
          <Link href="/executive">
            <Card className="cursor-pointer transition-all hover:border-slate-400 hover:bg-slate-100/50 border-slate-200">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-full">
                  <Headset className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Customer Support</h3>
                  <p className="text-sm text-slate-500 mt-1">Manage users and tickets</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Operations */}
          <Link href="/executive">
            <Card className="cursor-pointer transition-all hover:border-slate-400 hover:bg-slate-100/50 border-slate-200">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-full">
                  <Settings className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Operations</h3>
                  <p className="text-sm text-slate-500 mt-1">Manage catalog and merchants</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Analytics */}
          <Link href="/executive">
            <Card className="cursor-pointer transition-all hover:border-slate-400 hover:bg-slate-100/50 border-slate-200">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-full">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Analytics</h3>
                  <p className="text-sm text-slate-500 mt-1">View reports and funnels</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Link 
          href="/executive" 
          className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-8 py-2 text-sm font-medium text-white hover:bg-slate-800 w-full"
        >
          Continue to Workspace
        </Link>
      </div>
    </div>
  )
}
