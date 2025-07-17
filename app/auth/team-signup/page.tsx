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
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Code className="w-8 h-8 text-foreground" />
            <span className="text-xl font-bold text-foreground">OASIS Protocol</span>
          </Link>
          <Link href="/auth/team-login">
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-foreground hover:text-background bg-transparent"
            >
              Already have a team? Sign In
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Form Your Team</h1>
            <p className="text-muted-foreground">Register your team to begin the challenge</p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team Registration
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your team name and sign in with Google to access challenges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-destructive bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-accent bg-accent/10">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <AlertDescription className="text-accent">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamName" className="text-foreground">
                    Team Name
                  </Label>
                  <Input
                    id="teamName"
                    type="text"
                    placeholder="Enter your team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="border-border"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                className="w-full accent-button"
                disabled={isLoading || !teamName.trim()}
              >
                {isLoading ? "Signing in..." : "Sign up with Google"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By signing in, you agree to participate in the OASIS restoration challenge
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
