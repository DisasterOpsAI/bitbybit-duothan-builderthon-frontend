import { type NextRequest, NextResponse } from "next/server"

// TODO: Backend Integration Point 8 - Leaderboard Data
export async function GET(request: NextRequest) {
  try {
    // Mock leaderboard data
    const mockLeaderboard = [
      {
        rank: 1,
        teamName: "CodeMasters",
        totalPoints: 500,
        challengesCompleted: 3,
        lastSubmission: "2 hours ago",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        rank: 2,
        teamName: "AlgoWarriors",
        totalPoints: 450,
        challengesCompleted: 3,
        lastSubmission: "3 hours ago",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        rank: 3,
        teamName: "BugHunters",
        totalPoints: 300,
        challengesCompleted: 2,
        lastSubmission: "5 hours ago",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        rank: 4,
        teamName: "DevNinjas",
        totalPoints: 250,
        challengesCompleted: 2,
        lastSubmission: "6 hours ago",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        rank: 5,
        teamName: "TechTitans",
        totalPoints: 150,
        challengesCompleted: 1,
        lastSubmission: "8 hours ago",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ]

    return NextResponse.json(mockLeaderboard)
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
