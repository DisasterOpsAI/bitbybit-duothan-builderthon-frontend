"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code, LogIn, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function TeamLoginPage() {
  const [teamName, setTeamName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    if (!teamName.trim()) {
      setError("Please enter your team name")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const userCredential = await signInWithGoogle()
      
      // Verify team exists and user is authorized
      const response = await fetch("/api/teams/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          teamName: teamName.trim(),
          authId: userCredential.user?.uid
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
        setIsLoading(false)
      }
    } catch (err) {
      setError("Authentication failed. Please try again.")
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
          <Link href="/auth/team-signup">
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white bg-transparent"
            >
              New Team? Join Here
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Team Login</h1>
            <p className="text-gray-600">Access your team's challenge portal</p>
          </div>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-black flex items-center justify-center">
                <LogIn className="w-5 h-5 mr-2" />
                Team Authentication
              </CardTitle>
              <CardDescription className="text-gray-600 text-center">
                Enter your team name and authenticate to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="teamName" className="text-black">
                  Team Name
                </Label>
                <Input
                  id="teamName"
                  type="text"
                  placeholder="Enter your team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="border-gray-300"
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={handleGoogleSignIn}
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={isLoading || !teamName.trim()}
              >
                {isLoading ? "Authenticating..." : "Continue with Google"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have a team yet?{" "}
                  <Link href="/auth/team-signup" className="text-black hover:underline">
                    Join here
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
