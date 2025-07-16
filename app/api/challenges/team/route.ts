import { NextRequest, NextResponse } from "next/server"
import { adminChallengesCRUD } from "@/lib/firestore-crud"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const teamId = request.headers.get('x-team-id')
    
    if (!teamId) {
      return NextResponse.json({ error: "Team authentication required" }, { status: 401 })
    }

    console.log("Fetching active challenges for team:", teamId)

    // First, let's check ALL challenges to see what's in the database
    const allChallenges = await adminChallengesCRUD.getAll()
    console.log("All challenges in database:", allChallenges.length)
    allChallenges.forEach(c => console.log(`Challenge ${c.id}: ${c.title}, isActive: ${c.isActive}`))

    // Get all active challenges
    const challengesData = await adminChallengesCRUD.getActive()
    console.log("Found active challenges:", challengesData.length)

    const challenges = []
    
    for (const challengeData of challengesData) {
      console.log("Processing challenge:", challengeData.id, challengeData.title)
      
      // Check team progress for this challenge
      let status = "available"
      try {
        const progressQuery = await adminDb
          .collection('team_progress')
          .where('teamId', '==', teamId)
          .where('challengeId', '==', challengeData.id)
          .get()

        if (!progressQuery.empty) {
          const progress = progressQuery.docs[0].data()
          if (progress.buildathonCompleted) {
            status = "completed"
          } else if (progress.algorithmicCompleted) {
            status = "algorithmic_solved"
          }
        }
      } catch (progressError) {
        console.error("Error fetching team progress:", progressError)
        // Continue with default status
      }

      challenges.push({
        id: challengeData.id,
        title: challengeData.title,
        difficulty: getDifficultyFromPoints(challengeData.points),
        status,
        points: challengeData.points,
        timeLimit: `${challengeData.algorithmicProblem?.timeLimit || 2}s`
      })
    }

    console.log("Returning challenges:", challenges.length)
    return NextResponse.json(challenges)
  } catch (error) {
    console.error("Failed to fetch team challenges:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong' 
    }, { status: 500 })
  }
}

function getDifficultyFromPoints(points: number): string {
  if (points <= 100) return 'Easy'
  if (points <= 200) return 'Medium'
  return 'Hard'
}
