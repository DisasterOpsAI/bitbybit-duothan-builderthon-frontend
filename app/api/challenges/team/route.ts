import { type NextRequest, NextResponse } from "next/server"

// TODO: Backend Integration Point 3 - Fetch Team Challenges
export async function GET(request: NextRequest) {
  try {
    // Mock challenges data
    const mockChallenges = [
      {
        id: "1",
        title: "Array Manipulation Master",
        difficulty: "Easy" as const,
        status: "available" as const,
        points: 100,
        timeLimit: "30 minutes",
      },
      {
        id: "2",
        title: "Graph Traversal Challenge",
        difficulty: "Medium" as const,
        status: "locked" as const,
        points: 200,
        timeLimit: "45 minutes",
      },
      {
        id: "3",
        title: "Dynamic Programming Quest",
        difficulty: "Hard" as const,
        status: "locked" as const,
        points: 300,
        timeLimit: "60 minutes",
      },
    ]

    return NextResponse.json(mockChallenges)
  } catch (error) {
    console.error("Failed to fetch team challenges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
