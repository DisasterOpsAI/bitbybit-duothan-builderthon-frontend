import { NextRequest, NextResponse } from "next/server"
import { adminChallengesCRUD } from "@/lib/firestore-crud"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const challengeId = params.id
    const teamId = request.headers.get('x-team-id') // We'll set this from the frontend

    console.log("Fetching challenge:", challengeId, "for team:", teamId)

    // Get challenge from Firebase
    const challengeData = await adminChallengesCRUD.getById(challengeId)
    
    if (!challengeData) {
      console.log("Challenge not found:", challengeId)
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }
    
    console.log("Challenge found:", challengeData.title, "isActive:", challengeData.isActive)
    
    if (!challengeData?.isActive) {
      console.log("Challenge is not active:", challengeId)
      return NextResponse.json({ error: "Challenge is not active" }, { status: 403 })
    }

    // Check team progress if teamId is provided
    let status = "available"
    if (teamId) {
      try {
        const progressQuery = await adminDb
          .collection('team_progress')
          .where('teamId', '==', teamId)
          .where('challengeId', '==', challengeId)
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
        console.error("Error checking team progress:", progressError)
        // Continue with default status
      }
    }

    // Format response to match frontend expectations
    const challenge = {
      id: challengeId,
      title: challengeData.title,
      difficulty: getDifficultyFromPoints(challengeData.points),
      points: challengeData.points,
      status,
      algorithmic: {
        description: challengeData.algorithmicProblem?.description || "",
        constraints: challengeData.algorithmicProblem?.constraints || "",
        examples: [{
          input: challengeData.algorithmicProblem?.sampleInput || "",
          output: challengeData.algorithmicProblem?.sampleOutput || "",
        }],
        timeLimit: `${challengeData.algorithmicProblem?.timeLimit || 2} seconds`,
        memoryLimit: `${challengeData.algorithmicProblem?.memoryLimit || 256} MB`,
      },
      buildathon: status !== "available" ? {
        description: challengeData.buildathonProblem?.description || "",
        requirements: challengeData.buildathonProblem?.requirements || [],
        deliverables: ["Complete source code on GitHub", "README with setup instructions"],
      } : undefined,
      flag: challengeData.flag,
    }

    return NextResponse.json(challenge)
  } catch (error) {
    console.error("Failed to fetch challenge:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
    }, { status: 500 })
  }
}

function getDifficultyFromPoints(points: number): string {
  if (points <= 100) return 'Easy'
  if (points <= 200) return 'Medium'
  return 'Hard'
}
