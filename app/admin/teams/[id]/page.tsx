"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Mail, Calendar, Trophy, ArrowLeft } from "lucide-react"
import { AdminNavbar } from "@/components/admin-navbar"

interface TeamMember {
  name: string
  email: string
  role: string
}

interface Team {
  id: string
  name: string
  members: TeamMember[]
  createdAt: string
  totalPoints: number
  completedChallenges: number
  lastActivity: string
}

export default function TeamDetailsPage() {
  const [team, setTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/auth/admin-login")
      return
    }

    fetchTeamDetails()
  }, [teamId, router])

  const fetchTeamDetails = async () => {
    try {
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      if (response.ok) {
        const teamData = await response.json()
        setTeam(teamData)
      } else if (response.status === 401) {
        localStorage.removeItem("adminToken")
        router.push("/auth/admin-login")
      } else if (response.status === 404) {
        setError("Team not found")
      } else {
        setError("Failed to load team details")
      }
    } catch (error) {
      setError("Failed to load team details")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-foreground text-xl">Loading team details...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-foreground text-xl mb-4">{error}</div>
          <Button 
            onClick={() => router.push("/admin/teams")} 
            variant="outline"
            className="text-foreground border-border hover:bg-accent hover:text-accent-foreground bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </Button>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-foreground text-xl">Team not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/teams")}
              className="text-foreground border-border hover:bg-accent hover:text-accent-foreground bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{team.name}</h1>
              <p className="text-muted-foreground">Team Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {team.totalPoints} pts
            </Badge>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              {team.completedChallenges} solved
            </Badge>
          </div>
        </div>

        {/* Team Information */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Team Members */}
          <Card className="surface-elevated border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team Members ({team.members.length})
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                All registered team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <div className="text-foreground font-medium">{member.name}</div>
                        <div className="text-muted-foreground text-sm flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground border-border">
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Statistics */}
          <Card className="surface-elevated border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Team Statistics
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Performance and activity metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Points</span>
                  <span className="text-foreground font-semibold text-lg">{team.totalPoints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completed Challenges</span>
                  <span className="text-foreground font-semibold text-lg">{team.completedChallenges}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Team Size</span>
                  <span className="text-foreground font-semibold text-lg">{team.members.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Last Activity</span>
                  <span className="text-foreground font-semibold">{team.lastActivity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Registration Date</span>
                  <span className="text-foreground font-semibold">{formatDate(team.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}