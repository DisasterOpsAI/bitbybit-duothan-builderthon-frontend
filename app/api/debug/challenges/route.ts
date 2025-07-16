import { NextRequest, NextResponse } from "next/server"
import { adminChallengesCRUD } from "@/lib/firestore-crud"

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG CHALLENGES ENDPOINT ===")
    
    // Get all challenges
    const allChallenges = await adminChallengesCRUD.getAll()
    console.log("All challenges:", allChallenges.length)
    
    // Get active challenges
    const activeChallenges = await adminChallengesCRUD.getActive()
    console.log("Active challenges:", activeChallenges.length)
    
    const debug = {
      allChallenges: allChallenges.map(c => ({
        id: c.id,
        title: c.title,
        isActive: c.isActive,
        points: c.points
      })),
      activeChallenges: activeChallenges.map(c => ({
        id: c.id,
        title: c.title,
        isActive: c.isActive,
        points: c.points
      }))
    }
    
    return NextResponse.json(debug)
  } catch (error) {
    console.error("Debug challenges error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}