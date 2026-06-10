import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 bg-slate-900 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl">
            S
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">SimulaFly Admin OS</CardTitle>
          <CardDescription>Enter your credentials to access the command center</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email / Phone
            </label>
            <Input type="text" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <Link href="#" className="text-sm text-blue-600 hover:text-blue-500">
                Forgot password?
              </Link>
            </div>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              OTP Code (Optional)
            </label>
            <Input type="text" placeholder="123456" />
          </div>
        </CardContent>
        <CardFooter>
          <Link 
            href="/role-selection" 
            className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 w-full"
          >
            Sign in to workspace
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
