import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const teamId = request.headers.get('x-team-id')
    
    if (!teamId) {
      return NextResponse.json({ error: "Team authentication required" }, { status: 401 })
    }

    // Get all active challenges
    const challengesSnapshot = await adminDb
      .collection('challenges')
      .where('isActive', '==', true)
      .orderBy('order')
      .get()

    const challenges = []
    
    for (const challengeDoc of challengesSnapshot.docs) {
      const challengeData = challengeDoc.data()
      
      // Check team progress for this challenge
      let status = "available"
      const progressQuery = await adminDb
        .collection('team_progress')
        .where('teamId', '==', teamId)
        .where('challengeId', '==', challengeDoc.id)
        .get()

      if (!progressQuery.empty) {
        const progress = progressQuery.docs[0].data()
        if (progress.buildathonCompleted) {
          status = "completed"
        } else if (progress.algorithmicCompleted) {
          status = "algorithmic_solved"
        }
      }

      challenges.push({
        id: challengeDoc.id,
        title: challengeData.title,
        difficulty: getDifficultyFromPoints(challengeData.points),
        status,
        points: challengeData.points,
        timeLimit: `${challengeData.algorithmicProblem.timeLimit}s`
      })
    }

    return NextResponse.json(challenges)
  } catch (error) {
    console.error("Failed to fetch team challenges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getDifficultyFromPoints(points: number): string {
  if (points <= 100) return 'Easy'
  if (points <= 200) return 'Medium'
  return 'Hard'
}
