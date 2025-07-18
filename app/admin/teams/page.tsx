"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Mail, Calendar, Trophy, Search, ExternalLink } from "lucide-react"
import { AdminNavbar } from "@/components/admin-navbar"
import { useRouter } from "next/navigation"
import { ApiClient } from "@/lib/api-client"

interface Team {
  id: string
  name: string
  members: Array<{
    name: string
    email: string
    role: string
  }>
  createdAt: string
  totalPoints: number
  completedChallenges: number
  lastActivity: string
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/auth/admin-login")
      return
    }

    fetchTeams()
  }, [router])

  useEffect(() => {
    // Filter teams based on search query
    const filtered = teams.filter(team =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.members.some(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    setFilteredTeams(filtered)
  }, [teams, searchQuery])

  const fetchTeams = async () => {
    try {
      const response = await ApiClient.makeAdminRequest('/api/admin/teams')
      
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams)
      } else if (response.status === 401) {
        localStorage.removeItem("adminToken")
        router.push("/auth/admin-login")
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-foreground text-xl">Loading teams...</div>
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
            <h1 className="text-4xl font-bold text-foreground mb-2">Team Management</h1>
            <p className="text-muted-foreground">View and manage registered teams</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder-muted-foreground w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="surface-elevated border-border backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-blue-400" />
                Total Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{teams.length}</div>
              <p className="text-xs text-muted-foreground">Registered teams</p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-border backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                Active Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {teams.filter(team => team.totalPoints > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">With submissions</p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-border backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center text-sm">
                <Mail className="w-4 h-4 mr-2 text-green-400" />
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {teams.reduce((sum, team) => sum + team.members.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total participants</p>
            </CardContent>
          </Card>
        </div>

        {/* Teams List */}
        <div className="space-y-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="surface-elevated border-border backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-foreground text-xl">{team.name}</CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">
                      {team.members.length} member{team.members.length > 1 ? 's' : ''}
                    </CardDescription>
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
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Team Members */}
                  <div>
                    <h3 className="text-foreground font-semibold mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Team Members
                    </h3>
                    <div className="space-y-2">
                      {team.members.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                          <div>
                            <div className="text-foreground font-medium">{member.name}</div>
                            <div className="text-muted-foreground text-sm">{member.email}</div>
                          </div>
                          <Badge variant="outline" className="text-muted-foreground border-border">
                            {member.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team Info */}
                  <div>
                    <h3 className="text-foreground font-semibold mb-3 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Team Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Registered</span>
                        <span className="text-foreground">{formatDate(team.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Points</span>
                        <span className="text-foreground">{team.totalPoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completed Challenges</span>
                        <span className="text-foreground">{team.completedChallenges}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Activity</span>
                        <span className="text-foreground">{team.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    className="text-foreground border-border hover:bg-accent hover:text-accent-foreground bg-transparent"
                    onClick={() => router.push(`/admin/teams/${team.id}`)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <Card className="surface-elevated border-border backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-foreground text-xl mb-2">No teams found</div>
              <div className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search query' : 'No teams have registered yet'}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}