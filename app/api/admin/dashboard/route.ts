import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// TODO: Backend Integration Point 9 - Admin Dashboard Stats
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    try {
      jwt.verify(token, process.env.NEXTAUTH_SECRET || "demo_secret_key_change_in_production")
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Mock admin dashboard data
    const mockDashboardStats = {
      totalTeams: 15,
      activeChallenges: 3,
      totalSubmissions: 47,
      completedChallenges: 12,
      recentActivity: [
        {
          id: "1",
          type: "registration",
          teamName: "NewTeam",
          timestamp: "5 minutes ago",
        },
        {
          id: "2",
          type: "submission",
          teamName: "CodeMasters",
          challengeTitle: "Array Challenge",
          timestamp: "15 minutes ago",
        },
        {
          id: "3",
          type: "completion",
          teamName: "AlgoWarriors",
          challengeTitle: "Graph Challenge",
          timestamp: "1 hour ago",
        },
      ],
      leaderboardSnapshot: [
        { rank: 1, teamName: "CodeMasters", points: 500 },
        { rank: 2, teamName: "AlgoWarriors", points: 450 },
        { rank: 3, teamName: "BugHunters", points: 300 },
      ],
    }

    return NextResponse.json(mockDashboardStats)
  } catch (error) {
    console.error("Failed to fetch admin dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
