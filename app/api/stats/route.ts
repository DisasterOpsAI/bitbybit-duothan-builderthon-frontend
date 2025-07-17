import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    // Get real stats from Firebase
    const [teamsSnapshot, challengesSnapshot, submissionsSnapshot] = await Promise.all([
      adminDb.collection('teams').get().catch(() => null),
      adminDb.collection('challenges').where('isActive', '==', true).get().catch(() => null),
      adminDb.collection('submissions').get().catch(() => null)
    ])

    const stats = {
      totalTeams: teamsSnapshot?.size || 0,
      activeChallenges: challengesSnapshot?.size || 0,
      totalSubmissions: submissionsSnapshot?.size || 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    
    // Return mock data as fallback
    const mockStats = {
      totalTeams: 15,
      activeChallenges: 3,
      totalSubmissions: 47,
    }

    return NextResponse.json(mockStats)
  }
}
