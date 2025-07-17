"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Trophy, Users, Clock, Lock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { TeamNavbar } from "@/components/team-navbar"
import { useRouter } from "next/navigation"

interface Challenge {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  status: "locked" | "available" | "algorithmic_solved" | "completed"
  points: number
  timeLimit?: string
}

export default function TeamDashboard() {
  const { user, loading } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [teamStats, setTeamStats] = useState({
    totalPoints: 0,
    challengesCompleted: 0,
    currentRank: 0,
    totalTeams: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/team-login")
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, loading, router])

  const fetchDashboardData = async () => {
    try {
      const { ApiClient } = await import('@/lib/api-client')
      
      // Fetch challenges first
      const challengesRes = await ApiClient.makeTeamRequest("/api/challenges/team")
      
      if (challengesRes.ok) {
        const challengesData = await challengesRes.json()
        console.log("Fetched challenges:", challengesData)
        setChallenges(challengesData)
      } else {
        console.error("Failed to fetch challenges:", challengesRes.status)
        const errorData = await challengesRes.json()
        console.error("Challenges error:", errorData)
      }

      // Try to fetch stats, but don't fail if it doesn't work
      try {
        const statsRes = await ApiClient.makeTeamRequest("/api/teams/stats")
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setTeamStats(statsData)
        }
      } catch (statsError) {
        console.error("Failed to fetch team stats:", statsError)
        // Use default stats if API fails
        setTeamStats({
          totalPoints: 0,
          challengesCompleted: 0,
          currentRank: 0,
          totalTeams: 0,
        })
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "locked":
        return <Lock className="w-4 h-4 text-muted-foreground" />
      case "available":
        return <AlertCircle className="w-4 h-4 text-foreground" />
      case "algorithmic_solved":
        return <Code className="w-4 h-4 text-foreground" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-foreground" />
      default:
        return <Lock className="w-4 h-4 text-muted-foreground" />
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading dashboard...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-border p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">Please authenticate to access the team dashboard</p>
            <Link href="/auth/team-login">
              <Button className="accent-button">Go to Login</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TeamNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome back, {user?.displayName || localStorage.getItem("teamName") || "Team"}
            </h1>
            <p className="text-muted-foreground">Continue your mission to restore the OASIS</p>
          </div>
          <Button 
            onClick={fetchDashboardData}
            className="accent-button"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <Trophy className="w-4 h-4 mr-2" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{teamStats.totalPoints}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{teamStats.challengesCompleted}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <Users className="w-4 h-4 mr-2" />
                Team Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                #{teamStats.currentRank} / {teamStats.totalTeams}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(teamStats.challengesCompleted / challenges.length) * 100} className="w-full" />
              <div className="text-xs text-muted-foreground mt-1">
                {teamStats.challengesCompleted} of {challenges.length} challenges
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenges Section */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="bg-background border-border">
            <TabsTrigger value="available" className="text-foreground">
              Available Challenges
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-foreground">
              Completed
            </TabsTrigger>
            <TabsTrigger value="all" className="text-foreground">
              All Challenges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="mb-4 p-4 bg-background rounded">
              <p className="text-sm text-muted-foreground">
                Debug: Found {challenges.length} total challenges, {challenges.filter(c => c.status === "available" || c.status === "algorithmic_solved").length} available
              </p>
            </div>
            <div className="grid gap-4">
              {challenges
                .filter((c) => c.status === "available" || c.status === "algorithmic_solved")
                .map((challenge) => (
                  <Card key={challenge.id} className="border-border">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-foreground flex items-center">
                            {getStatusIcon(challenge.status)}
                            <span className="ml-2">{challenge.title}</span>
                          </CardTitle>
                          <CardDescription className="text-muted-foreground mt-1">
                            {challenge.status === "available" && "Solve the algorithmic challenge to unlock buildathon"}
                            {challenge.status === "algorithmic_solved" &&
                              "Algorithmic solved! Complete the buildathon challenge"}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="border-border text-foreground">
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline" className="border-border text-foreground">
                            {challenge.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-muted-foreground">
                          <span className="font-semibold text-foreground">{challenge.points}</span> points
                          {challenge.timeLimit && (
                            <span className="ml-4">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {challenge.timeLimit}
                            </span>
                          )}
                        </div>
                        <Link href={`/challenges/${challenge.id}`}>
                          <Button className="accent-button">
                            {challenge.status === "available" ? "Start Challenge" : "Continue"}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid gap-4">
              {challenges
                .filter((c) => c.status === "completed")
                .map((challenge) => (
                  <Card key={challenge.id} className="border-border">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-foreground flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            {challenge.title}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground mt-1">
                            Challenge completed successfully
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="border-green-300 text-green-700">
                          Completed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-muted-foreground">
                          <span className="font-semibold text-green-700">{challenge.points}</span> points earned
                        </div>
                        <Link href={`/challenges/${challenge.id}`}>
                          <Button
                            variant="outline"
                            className="border-border text-foreground hover:bg-background bg-transparent"
                          >
                            View Solution
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="border-border">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-foreground flex items-center">
                          {getStatusIcon(challenge.status)}
                          <span className="ml-2">{challenge.title}</span>
                        </CardTitle>
                        <CardDescription className="text-muted-foreground mt-1">
                          {challenge.status === "locked" && "Complete previous challenges to unlock"}
                          {challenge.status === "available" && "Ready to start"}
                          {challenge.status === "algorithmic_solved" && "Algorithmic phase completed"}
                          {challenge.status === "completed" && "Fully completed"}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant="outline" className="border-border text-foreground">
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant="outline" className="border-border text-foreground">
                          {challenge.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-muted-foreground">
                        <span className="font-semibold text-foreground">{challenge.points}</span> points
                      </div>
                      {challenge.status !== "locked" && (
                        <Link href={`/challenges/${challenge.id}`}>
                          <Button
                            className="accent-button"
                          >
                            {challenge.status === "completed" ? "View" : "Open"}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
