"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code, Users, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function TeamSignupPage() {
  const [teamName, setTeamName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleTeamRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) {
      setError("Team name is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/teams/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName: teamName.trim() }),
      })

      if (response.ok) {
        setSuccess("Team registered successfully! Please sign in with Google.")
        setTeamName("")
      } else {
        const data = await response.json()
        setError(data.error || "Registration failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!teamName.trim()) {
      setError("Please enter your team name first")
      return
    }

    setIsLoading(true)
    try {
      const userCredential = await signInWithGoogle()
      
      // Register team with Firebase after successful authentication
      const response = await fetch("/api/teams/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          teamName: teamName.trim(),
          email: userCredential.user?.email,
          authProvider: 'google',
          authId: userCredential.user?.uid
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("teamId", data.teamId)
        localStorage.setItem("teamName", teamName.trim())
        router.push("/dashboard")
      } else {
        const data = await response.json()
        setError(data.error || "Registration failed")
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
          <Link href="/auth/team-login">
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white bg-transparent"
            >
              Already have a team? Sign In
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Form Your Team</h1>
            <p className="text-gray-600">Register your team to begin the challenge</p>
          </div>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-black flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team Registration
              </CardTitle>
              <CardDescription className="text-gray-600">
                Choose a unique team name and authenticate to access challenges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleTeamRegistration} className="space-y-4">
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
                <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Register Team"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full border-gray-300 text-black hover:bg-gray-50 bg-transparent"
                disabled={isLoading || !teamName.trim()}
              >
                Continue with Google
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By registering, you agree to participate in the OASIS restoration challenge
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
