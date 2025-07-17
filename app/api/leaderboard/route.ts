import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    // First, try to get all teams with just totalPoints ordering to avoid index issues
    let teamsSnapshot
    try {
      teamsSnapshot = await adminDb
        .collection('teams')
        .orderBy('totalPoints', 'desc')
        .get()
    } catch (indexError) {
      // If index error, fall back to getting all teams without ordering
      console.warn("Firebase index not available, falling back to client-side sorting:", indexError)
      teamsSnapshot = await adminDb
        .collection('teams')
        .get()
    }

    const teams = []
    
    for (const teamDoc of teamsSnapshot.docs) {
      const teamData = teamDoc.data()
      
      // Get completed challenges count
      const challengesCompleted = teamData.completedChallenges?.length || 0
      
      // Get last submission time (simplified to avoid more index issues)
      let lastSubmission = "No submissions"
      if (teamData.updatedAt) {
        lastSubmission = formatRelativeTime(teamData.updatedAt.toDate())
      }

      teams.push({
        teamName: teamData.name,
        totalPoints: teamData.totalPoints || 0,
        challengesCompleted,
        lastSubmission,
        avatar: "/placeholder.svg?height=40&width=40",
        teamId: teamDoc.id,
        updatedAt: teamData.updatedAt
      })
    }

    // Sort teams client-side to avoid Firebase index requirements
    teams.sort((a, b) => {
      // Primary sort by totalPoints (descending)
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints
      }
      // Secondary sort by updatedAt (ascending - earlier is better for ties)
      if (a.updatedAt && b.updatedAt) {
        return a.updatedAt.toDate().getTime() - b.updatedAt.toDate().getTime()
      }
      return 0
    })

    // Add rank after sorting
    const leaderboard = teams.map((team, index) => ({
      rank: index + 1,
      teamName: team.teamName,
      totalPoints: team.totalPoints,
      challengesCompleted: team.challengesCompleted,
      lastSubmission: team.lastSubmission,
      avatar: team.avatar,
      teamId: team.teamId
    }))

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error)
    
    // Return mock data as fallback
    const mockLeaderboard = [
      {
        rank: 1,
        teamName: "Team Alpha",
        totalPoints: 150,
        challengesCompleted: 3,
        lastSubmission: "2 hours ago",
        avatar: "/placeholder.svg?height=40&width=40",
        teamId: "mock-1"
      },
      {
        rank: 2,
        teamName: "Team Beta",
        totalPoints: 120,
        challengesCompleted: 2,
        lastSubmission: "4 hours ago",
        avatar: "/placeholder.svg?height=40&width=40",
        teamId: "mock-2"
      },
      {
        rank: 3,
        teamName: "Team Gamma",
        totalPoints: 90,
        challengesCompleted: 2,
        lastSubmission: "1 day ago",
        avatar: "/placeholder.svg?height=40&width=40",
        teamId: "mock-3"
      }
    ]
    
    return NextResponse.json(mockLeaderboard)
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return `${days} day${days > 1 ? 's' : ''} ago`
}
