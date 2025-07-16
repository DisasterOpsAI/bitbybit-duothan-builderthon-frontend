import { type NextRequest, NextResponse } from "next/server"

// TODO: Backend Integration Point 6 - Flag Submission
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const challengeId = params.id
    const { flag } = await request.json()

    // Mock flag validation
    const correctFlags: Record<string, string> = {
      "1": "6",
      "2": "42",
      "3": "100",
    }

    const correctFlag = correctFlags[challengeId]

    if (flag.trim() === correctFlag) {
      // TODO: Update team progress in database
      return NextResponse.json({
        success: true,
        message: "Flag accepted! Buildathon challenge unlocked.",
      })
    } else {
      return NextResponse.json({ error: "Invalid flag" }, { status: 400 })
    }
  } catch (error) {
    console.error("Flag submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
