import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { adminDb } from "@/lib/firebase-admin"
import { Challenge } from "@/lib/database-schema"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const challengesSnapshot = await adminDb.collection('challenges').orderBy('createdAt', 'desc').get()
    
    const challenges = []
    for (const doc of challengesSnapshot.docs) {
      const challengeData = doc.data()
      
      // Get submission stats
      const submissionsSnapshot = await adminDb
        .collection('submissions')
        .where('challengeId', '==', doc.id)
        .get()
      
      const totalSubmissions = submissionsSnapshot.size
      const completions = submissionsSnapshot.docs.filter(doc => 
        doc.data().status === 'accepted' && doc.data().type === 'buildathon'
      ).length

      challenges.push({
        id: doc.id,
        title: challengeData.title,
        difficulty: getDifficultyFromPoints(challengeData.points),
        points: challengeData.points,
        status: challengeData.isActive ? 'active' : 'draft',
        submissions: totalSubmissions,
        completions,
        createdAt: challengeData.createdAt.toDate().toISOString().split('T')[0]
      })
    }

    return NextResponse.json(challenges)
  } catch (error) {
    console.error("Failed to fetch admin challenges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const challengeData = await request.json()

    // Validate required fields
    if (!challengeData.title || !challengeData.algorithmicProblem || !challengeData.buildathonProblem || !challengeData.flag) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new challenge
    const newChallenge: Omit<Challenge, 'id'> = {
      title: challengeData.title,
      description: challengeData.description || '',
      points: challengeData.points || 100,
      order: challengeData.order || 0,
      isActive: challengeData.isActive || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      algorithmicProblem: challengeData.algorithmicProblem,
      buildathonProblem: challengeData.buildathonProblem,
      flag: challengeData.flag
    }

    const docRef = await adminDb.collection('challenges').add(newChallenge)

    return NextResponse.json({
      success: true,
      message: "Challenge created successfully",
      id: docRef.id,
    })
  } catch (error) {
    console.error("Failed to create challenge:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

function getDifficultyFromPoints(points: number): string {
  if (points <= 100) return 'Easy'
  if (points <= 200) return 'Medium'
  return 'Hard'
}
