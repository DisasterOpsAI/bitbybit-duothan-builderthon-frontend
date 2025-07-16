import { NextRequest, NextResponse } from "next/server"
import { demoApi } from "@/lib/demo-data"

export async function GET(request: NextRequest) {
  try {
    const leaderboard = demoApi.getLeaderboard()
    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error("Failed to fetch demo leaderboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}