import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// TODO: Backend Integration Point 10 & 12 - Admin Challenge Management
export async function GET(request: NextRequest) {
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

    // Mock challenges data for admin
    const mockChallenges = [
      {
        id: "1",
        title: "Array Manipulation Master",
        difficulty: "Easy" as const,
        points: 100,
        status: "active" as const,
        submissions: 15,
        completions: 8,
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        title: "Graph Traversal Challenge",
        difficulty: "Medium" as const,
        points: 200,
        status: "active" as const,
        submissions: 12,
        completions: 5,
        createdAt: "2024-01-14",
      },
      {
        id: "3",
        title: "Dynamic Programming Quest",
        difficulty: "Hard" as const,
        points: 300,
        status: "draft" as const,
        submissions: 0,
        completions: 0,
        createdAt: "2024-01-13",
      },
    ]

    return NextResponse.json(mockChallenges)
  } catch (error) {
    console.error("Failed to fetch admin challenges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const challengeData = await request.json()

    // TODO: Save challenge to database
    console.log("Creating challenge:", challengeData)

    return NextResponse.json({
      success: true,
      message: "Challenge created successfully",
      id: Math.random().toString(36).substr(2, 9),
    })
  } catch (error) {
    console.error("Failed to create challenge:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
