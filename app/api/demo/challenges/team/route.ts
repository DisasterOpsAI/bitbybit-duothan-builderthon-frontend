import { NextRequest, NextResponse } from "next/server"
import { demoApi } from "@/lib/demo-data"

export async function GET(request: NextRequest) {
  try {
    // In demo mode, use a default team ID
    const teamId = request.headers.get('x-team-id') || 'team-1'
    
    const challenges = demoApi.getTeamChallenges(teamId)
    return NextResponse.json(challenges)
  } catch (error) {
    console.error("Failed to fetch demo team challenges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}