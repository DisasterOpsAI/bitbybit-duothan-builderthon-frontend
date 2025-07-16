"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code, LogIn, AlertCircle, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"

export default function TeamLoginTestPage() {
  const [email, setEmail] = useState("test@oasis.com")
  const [password, setPassword] = useState("testpassword123")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Dynamic import to avoid SSR issues
      const { auth } = await import("@/lib/firebase")
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Verify team exists
      const response = await fetch("/api/teams/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email,
          authId: userCredential.user.uid
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("teamId", data.team.id)
        localStorage.setItem("teamName", data.team.name)
        router.push("/dashboard")
      } else {
        const data = await response.json()
        setError(data.error || "Team verification failed")
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Code className="w-8 h-8 text-black" />
            <span className="text-xl font-bold text-black">OASIS Protocol</span>
          </Link>
          <Link href="/auth/team-login">
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white bg-transparent"
            >
              Google Login
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Test Login</h1>
            <p className="text-gray-600">Email/Password authentication for testing</p>
          </div>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-black flex items-center justify-center">
                <Mail className="w-5 h-5 mr-2" />
                Test Authentication
              </CardTitle>
              <CardDescription className="text-gray-600 text-center">
                Use the pre-created test account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>Test Account:</strong><br />
                  Email: test@oasis.com<br />
                  Password: testpassword123
                </AlertDescription>
              </Alert>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-black">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-300"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-black">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-300"
                    disabled={isLoading}
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  This is a temporary test login. Once Google Sign-In is enabled in Firebase Console, use the regular login page.
                </p>
                <p className="text-sm text-gray-600">
                  <Link href="/auth/team-login" className="text-black hover:underline">
                    Back to Google Login
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}