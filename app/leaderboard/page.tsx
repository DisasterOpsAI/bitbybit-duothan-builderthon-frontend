"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Users, Clock, Code } from "lucide-react"
import { TeamNavbar } from "@/components/team-navbar"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface LeaderboardEntry {
  rank: number
  teamName: string
  totalPoints: number
  challengesCompleted: number
  lastSubmission: string
  avatar?: string
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeChallenges: 0,
    totalSubmissions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      // TODO: Backend Integration Point 8
      // Fetch leaderboard data
      const [leaderboardRes, statsRes] = await Promise.all([fetch("/api/leaderboard"), fetch("/api/stats")])

      if (leaderboardRes.ok && statsRes.ok) {
        const leaderboardData = await leaderboardRes.json()
        const statsData = await statsRes.json()
        setLeaderboard(leaderboardData)
        setStats(statsData)
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-400" />
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-white font-bold">#{rank}</div>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/20 border-yellow-500/30"
      case 2:
        return "bg-gray-500/20 border-gray-500/30"
      case 3:
        return "bg-orange-500/20 border-orange-500/30"
      default:
        return "bg-black/40 border-white/20"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen oasis-bg">
        <TeamNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-white text-xl">Loading leaderboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen oasis-bg">
      <TeamNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8"></div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-blue-400" />
                Total Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalTeams}</div>
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
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
              Team Rankings
            </CardTitle>
            <CardDescription className="text-white/70">
              Real-time rankings based on points and completion time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((entry) => (
                <Card key={entry.teamName} className={`${getRankColor(entry.rank)} backdrop-blur-sm`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black/20">
                          {getRankIcon(entry.rank)}
                        </div>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={entry.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                              {entry.teamName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-white font-semibold text-lg">{entry.teamName}</h3>
                            <div className="flex items-center space-x-4 text-sm text-white/70">
                              <span className="flex items-center">
                                <Trophy className="w-3 h-3 mr-1 text-yellow-400" />
                                {entry.totalPoints} points
                              </span>
                              <span className="flex items-center">
                                <Code className="w-3 h-3 mr-1 text-green-400" />
                                {entry.challengesCompleted} completed
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1 text-blue-400" />
                                {entry.lastSubmission}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            entry.rank === 1
                              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                              : entry.rank === 2
                                ? "bg-gray-500/20 text-gray-300 border-gray-500/30"
                                : entry.rank === 3
                                  ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                                  : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          }
                        >
                          Rank #{entry.rank}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Teams Yet</h3>
                <p className="text-white/70 mb-6">Be the first team to register and start the challenge!</p>
                <Link href="/auth/team-signup">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    Register Your Team
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
