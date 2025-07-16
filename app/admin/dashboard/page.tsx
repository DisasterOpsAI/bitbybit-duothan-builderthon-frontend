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
        return <Users className="w-4 h-4 text-blue-400" />
      case "submission":
        return <Code className="w-4 h-4 text-yellow-400" />
      case "completion":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen oasis-bg">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-white text-xl">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen oasis-bg">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-white text-xl">Failed to load dashboard</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen oasis-bg">
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/70">Monitor and manage the OASIS Protocol platform</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/admin/challenges/create">
              <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Challenge
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 bg-transparent">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-blue-400" />
                Registered Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalTeams}</div>
              <p className="text-xs text-white/60">Active participants</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center text-sm">
                <Code className="w-4 h-4 mr-2 text-green-400" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeChallenges}</div>
              <p className="text-xs text-white/60">Available to teams</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center text-sm">
                <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalSubmissions}</div>
              <p className="text-xs text-white/60">Code & buildathon</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center text-sm">
                <CheckCircle className="w-4 h-4 mr-2 text-purple-400" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.completedChallenges}</div>
              <p className="text-xs text-white/60">Fully solved</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/40 border-white/20">
            <TabsTrigger value="overview" className="text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-white">
              Recent Activity
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-white">
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-white/70">Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/admin/challenges">
                    <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <Code className="w-4 h-4 mr-2" />
                      Manage Challenges
                    </Button>
                  </Link>
                  <Link href="/admin/teams">
                    <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
                      <Users className="w-4 h-4 mr-2" />
                      View Teams
                    </Button>
                  </Link>
                  <Link href="/admin/submissions">
                    <Button className="w-full justify-start bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
                      <Trophy className="w-4 h-4 mr-2" />
                      Review Submissions
                    </Button>
                  </Link>
                  <Link href="/admin/analytics">
                    <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">System Status</CardTitle>
                  <CardDescription className="text-white/70">Platform health and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Database</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Judge0 API</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Authentication</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">File Storage</span>
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Warning
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-white/70">Latest platform events and team actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 bg-black/20 rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <div className="text-white">
                          <span className="font-semibold">{activity.teamName}</span>
                          {activity.type === "registration" && " registered for the challenge"}
                          {activity.type === "submission" && ` submitted solution for ${activity.challengeTitle}`}
                          {activity.type === "completion" && ` completed ${activity.challengeTitle}`}
                        </div>
                        <div className="text-white/60 text-sm flex items-center">
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
            <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Leaderboard Snapshot</CardTitle>
                <CardDescription className="text-white/70">Current top performing teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.leaderboardSnapshot.map((entry) => (
                    <div key={entry.teamName} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          #{entry.rank}
                        </div>
                        <span className="text-white font-semibold">{entry.teamName}</span>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
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
