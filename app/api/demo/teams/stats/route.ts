import { NextRequest, NextResponse } from "next/server"
import { demoApi } from "@/lib/demo-data"

export async function GET(request: NextRequest) {
  try {
    // In demo mode, use a default team ID
    const teamId = request.headers.get('x-team-id') || 'team-1'
    
    const stats = demoApi.getTeamStats(teamId)
    if (!stats) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch demo team stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}