"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Users, Trophy, Code, Calendar, Download } from "lucide-react"
import { AdminNavbar } from "@/components/admin-navbar"
import { useRouter } from "next/navigation"
import { ApiClient } from "@/lib/api-client"

interface AnalyticsData {
  totalTeams: number
  totalSubmissions: number
  averageScore: number
  completionRate: number
  challengeStats: Array<{
    challengeId: string
    title: string
    type: string
    totalSubmissions: number
    acceptedSubmissions: number
    averageAttempts: number
    difficulty: string
  }>
  teamPerformance: Array<{
    teamId: string
    name: string
    totalPoints: number
    completedChallenges: number
    averageScore: number
    rank: number
  }>
  submissionTrends: Array<{
    date: string
    algorithmicSubmissions: number
    buildathonSubmissions: number
    totalSubmissions: number
  }>
  languageDistribution: Array<{
    language: string
    count: number
    percentage: number
  }>
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/auth/admin-login")
      return
    }

    fetchAnalytics()
  }, [router, timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await ApiClient.makeAdminRequest(`/api/admin/analytics?timeRange=${timeRange}`)
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else if (response.status === 401) {
        localStorage.removeItem("adminToken")
        router.push("/auth/admin-login")
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = () => {
    if (!analytics) return
    
    const csvData = [
      ['Team Name', 'Total Points', 'Completed Challenges', 'Average Score', 'Rank'],
      ...analytics.teamPerformance.map(team => [
        team.name,
        team.totalPoints,
        team.completedChallenges,
        team.averageScore,
        team.rank
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oasis_analytics_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'hard': return 'bg-red-500/20 text-red-300 border-red-500/30'
      default: return 'bg-muted/20 text-muted-foreground border-border'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-foreground text-xl">Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-foreground text-xl">Failed to load analytics</div>
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
            <h1 className="text-4xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Platform performance and team insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48 surface-elevated border-border text-foreground">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent className="surface-elevated border-border">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={exportData}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="surface-elevated border-border backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-blue-400" />
                Active Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{analytics.totalTeams}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Registered teams
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-border backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{analytics.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">All challenge attempts</p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-border backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <BarChart3 className="w-4 h-4 mr-2 text-green-400" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{analytics.averageScore}%</div>
              <p className="text-xs text-muted-foreground">Platform average</p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-border backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <Code className="w-4 h-4 mr-2 text-purple-400" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{analytics.completionRate}%</div>
              <p className="text-xs text-muted-foreground">Success rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Challenge Performance */}
          <Card className="surface-elevated border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Challenge Performance</CardTitle>
              <CardDescription className="text-muted-foreground">Submission statistics by challenge</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.challengeStats.map((challenge) => (
                  <div key={challenge.challengeId} className="p-4 surface-elevated rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-foreground font-semibold">{challenge.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-muted-foreground border-border">
                            {challenge.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-foreground text-sm">
                          {challenge.acceptedSubmissions}/{challenge.totalSubmissions} accepted
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {Math.round((challenge.acceptedSubmissions / challenge.totalSubmissions) * 100)}% success rate
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Teams */}
          <Card className="surface-elevated border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Top Performing Teams</CardTitle>
              <CardDescription className="text-muted-foreground">Leaderboard and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.teamPerformance.slice(0, 10).map((team) => (
                  <div key={team.teamId} className="flex items-center justify-between p-3 surface-elevated rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-foreground font-bold text-sm">
                        #{team.rank}
                      </div>
                      <div>
                        <div className="text-foreground font-semibold">{team.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {team.completedChallenges} challenges completed
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-foreground font-bold">{team.totalPoints} pts</div>
                      <div className="text-muted-foreground text-sm">{team.averageScore}% avg</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Language Distribution */}
        <Card className="surface-elevated border-border backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Programming Language Distribution</CardTitle>
            <CardDescription className="text-muted-foreground">Most popular languages for algorithmic challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.languageDistribution.map((lang) => (
                <div key={lang.language} className="p-4 surface-elevated rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-foreground font-semibold">{lang.language}</span>
                    <span className="text-muted-foreground">{lang.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${lang.percentage}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground text-sm mt-1">{lang.count} submissions</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}