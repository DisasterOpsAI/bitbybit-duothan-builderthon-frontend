import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// TODO: Backend Integration Point 11 - Delete Challenge
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    try {
      jwt.verify(token, process.env.NEXTAUTH_SECRET || "demo_secret_key_change_in_production")
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const challengeId = params.id

    // TODO: Delete challenge from database
    console.log(`Deleting challenge: ${challengeId}`)

    return NextResponse.json({
      success: true,
      message: "Challenge deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete challenge:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
