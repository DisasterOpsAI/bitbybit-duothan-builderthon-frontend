import { type NextRequest, NextResponse } from "next/server"

// TODO: Backend Integration Point 8 - Platform Stats
export async function GET(request: NextRequest) {
  try {
    // Mock platform stats
    const mockStats = {
      totalTeams: 15,
      activeChallenges: 3,
      totalSubmissions: 47,
    }

    return NextResponse.json(mockStats)
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
