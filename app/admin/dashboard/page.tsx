"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Code, Trophy, Activity, Plus, Settings, BarChart3, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { AdminNavbar } from "@/components/admin-navbar"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DashboardStats {
  totalTeams: number
  activeChallenges: number
  totalSubmissions: number
  completedChallenges: number
  recentActivity: Array<{
    id: string
    type: "registration" | "submission" | "completion"
    teamName: string
    challengeTitle?: string
    timestamp: string
  }>
  leaderboardSnapshot: Array<{
    rank: number
    teamName: string
    points: number
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/auth/admin-login")
      return
    }

    fetchDashboardStats()
  }, [router])

  const fetchDashboardStats = async () => {
    try {
      // TODO: Backend Integration Point 9
      // Fetch admin dashboard statistics
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else if (response.status === 401) {
        localStorage.removeItem("adminToken")
        router.push("/auth/admin-login")
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "registration":
        return <Users className="w-4 h-4 text-foreground" />
      case "submission":
        return <Code className="w-4 h-4 text-foreground" />
      case "completion":
        return <CheckCircle className="w-4 h-4 text-foreground" />
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-foreground text-xl">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-foreground text-xl">Failed to load dashboard</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage the OASIS Protocol platform</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/admin/challenges/create">
              <Button className="accent-button">
                <Plus className="w-4 h-4 mr-2" />
                New Challenge
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="text-foreground border-border hover:bg-accent hover:text-accent-foreground bg-transparent">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="surface-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-foreground" />
                Registered Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalTeams}</div>
              <p className="text-xs text-muted-foreground">Active participants</p>
            </CardContent>
          </Card>

          <Card className="surface-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <Code className="w-4 h-4 mr-2 text-foreground" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.activeChallenges}</div>
              <p className="text-xs text-muted-foreground">Available to teams</p>
            </CardContent>
          </Card>

          <Card className="surface-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <Trophy className="w-4 h-4 mr-2 text-foreground" />
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">Code & buildathon</p>
            </CardContent>
          </Card>

          <Card className="surface-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <CheckCircle className="w-4 h-4 mr-2 text-foreground" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.completedChallenges}</div>
              <p className="text-xs text-muted-foreground">Fully solved</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary border-border">
            <TabsTrigger value="overview" className="text-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-foreground">
              Recent Activity
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-foreground">
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                  <CardDescription className="text-muted-foreground">Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/admin/challenges">
                    <Button variant="outline" className="w-full justify-start bg-transparent text-foreground border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-sm">
                      <Code className="w-4 h-4 mr-2" />
                      Manage Challenges
                    </Button>
                  </Link>
                  <Link href="/admin/teams">
                    <Button variant="outline" className="w-full justify-start bg-transparent text-foreground border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-sm">
                      <Users className="w-4 h-4 mr-2" />
                      View Teams
                    </Button>
                  </Link>
                  <Link href="/admin/submissions">
                    <Button variant="outline" className="w-full justify-start bg-transparent text-foreground border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-sm">
                      <Trophy className="w-4 h-4 mr-2" />
                      Review Submissions
                    </Button>
                  </Link>
                  <Link href="/admin/analytics">
                    <Button variant="outline" className="w-full justify-start bg-transparent text-foreground border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle className="text-foreground">System Status</CardTitle>
                  <CardDescription className="text-muted-foreground">Platform health and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Database</span>
                    <Badge className="bg-accent text-accent-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Judge0 API</span>
                    <Badge className="bg-accent text-accent-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Authentication</span>
                    <Badge className="bg-accent text-accent-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">File Storage</span>
                    <Badge className="bg-destructive text-destructive-foreground">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Warning
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="surface-elevated">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground">Latest platform events and team actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 bg-secondary rounded-lg border border-border">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <div className="text-foreground">
                          <span className="font-semibold">{activity.teamName}</span>
                          {activity.type === "registration" && " registered for the challenge"}
                          {activity.type === "submission" && ` submitted solution for ${activity.challengeTitle}`}
                          {activity.type === "completion" && ` completed ${activity.challengeTitle}`}
                        </div>
                        <div className="text-muted-foreground text-sm flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card className="surface-elevated">
              <CardHeader>
                <CardTitle className="text-foreground">Leaderboard Snapshot</CardTitle>
                <CardDescription className="text-muted-foreground">Current top performing teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.leaderboardSnapshot.map((entry) => (
                    <div key={entry.teamName} className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-sm">
                          #{entry.rank}
                        </div>
                        <span className="text-foreground font-semibold">{entry.teamName}</span>
                      </div>
                      <Badge className="bg-muted text-muted-foreground">
                        {entry.points} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}