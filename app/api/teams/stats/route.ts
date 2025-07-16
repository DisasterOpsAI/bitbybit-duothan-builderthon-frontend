import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const teamId = request.headers.get('x-team-id')
    
    if (!teamId) {
      return NextResponse.json({ error: "Team authentication required" }, { status: 401 })
    }

    // Get team data
    const teamDoc = await adminDb.collection('teams').doc(teamId).get()
    
    if (!teamDoc.exists) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const teamData = teamDoc.data()
    
    // Get all teams for ranking
    const allTeamsSnapshot = await adminDb
      .collection('teams')
      .orderBy('totalPoints', 'desc')
      .get()

    let currentRank = 1
    let found = false
    
    for (const doc of allTeamsSnapshot.docs) {
      if (doc.id === teamId) {
        found = true
        break
      }
      currentRank++
    }

    const stats = {
      totalPoints: teamData?.totalPoints || 0,
      challengesCompleted: teamData?.completedChallenges?.length || 0,
      currentRank: found ? currentRank : 0,
      totalTeams: allTeamsSnapshot.size
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch team stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
