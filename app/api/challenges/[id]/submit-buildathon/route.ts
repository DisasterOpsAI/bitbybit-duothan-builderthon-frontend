import { type NextRequest, NextResponse } from "next/server"

// TODO: Backend Integration Point 7 - Buildathon Submission
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const challengeId = params.id
    const { githubLink } = await request.json()

    if (!githubLink || !githubLink.includes("github.com")) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 })
    }

    // TODO: Validate GitHub repository and save submission
    console.log(`Buildathon submission for challenge ${challengeId}: ${githubLink}`)

    return NextResponse.json({
      success: true,
      message: "Buildathon submission successful! Challenge completed.",
    })
  } catch (error) {
    console.error("Buildathon submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
