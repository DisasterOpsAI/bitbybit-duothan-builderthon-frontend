import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { Submission } from "@/lib/database-schema"

export async function POST(request: NextRequest) {
  try {
    const { source_code, language_id, stdin, expected_output, challenge_id } = await request.json()
    const teamId = request.headers.get('x-team-id')

    if (!teamId) {
      return NextResponse.json({ error: "Team authentication required" }, { status: 401 })
    }

    if (!source_code || !language_id) {
      return NextResponse.json({ error: "Source code and language are required" }, { status: 400 })
    }

    const JUDGE0_API_URL = "http://10.3.5.139:2358"
    const JUDGE0_TOKEN = "ZHVvdGhhbjUuMA=="

    // Submit code to Judge0
    const submitResponse = await fetch(`${JUDGE0_API_URL}/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": JUDGE0_TOKEN,
      },
      body: JSON.stringify({
        source_code,
        language_id,
        stdin: stdin || "",
      }),
    })

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text()
      console.error("Judge0 submission failed:", errorText)
      return NextResponse.json({ error: "Failed to submit code for execution" }, { status: 500 })
    }

    const submitResult = await submitResponse.json()
    const submissionId = submitResult.token

    // Poll for result
    let attempts = 0
    const maxAttempts = 15 // Increased timeout for complex algorithms

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second

      const resultResponse = await fetch(`${JUDGE0_API_URL}/submissions/${submissionId}`, {
        headers: {
          "X-RapidAPI-Key": JUDGE0_TOKEN,
        },
      })

      if (!resultResponse.ok) {
        console.error("Failed to get result from Judge0")
        return NextResponse.json({ error: "Failed to get execution result" }, { status: 500 })
      }

      const result = await resultResponse.json()

      if (result.status.id <= 2) {
        // Still processing (In Queue = 1, Processing = 2)
        attempts++
        continue
      }

      // Execution completed
      const stdout = result.stdout || ""
      const stderr = result.stderr || ""
      const status = result.status.description
      const time = result.time
      const memory = result.memory

      // Check if output matches expected flag
      const is_correct = expected_output
        ? stdout.trim() === expected_output.trim()
        : false

      // Store submission record regardless of result
      if (challenge_id) {
        const submission: Omit<Submission, 'id'> = {
          teamId,
          challengeId: challenge_id,
          type: 'algorithmic',
          content: source_code,
          language: getLanguageName(language_id),
          status: result.status.id === 3 ? (is_correct ? 'accepted' : 'rejected') : 
                  result.status.id === 6 ? 'compilation_error' : 'runtime_error',
          executionTime: time,
          memoryUsage: memory,
          output: stdout,
          error: stderr,
          submittedAt: new Date(),
          evaluatedAt: new Date()
        }

        await adminDb.collection('submissions').add(submission)
      }

      return NextResponse.json({
        stdout,
        stderr,
        status,
        time,
        memory,
        is_correct,
        status_id: result.status.id,
        compilation_error: result.status.id === 6,
        runtime_error: result.status.id > 6,
      })
    }

    return NextResponse.json({ error: "Execution timeout" }, { status: 408 })
  } catch (error) {
    console.error("Judge0 execution error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}

function getLanguageName(languageId: number): string {
  const languageMap: { [key: number]: string } = {
    50: 'C',
    54: 'C++',
    62: 'Java',
    63: 'JavaScript',
    71: 'Python',
    // Add more mappings as needed
  }
  return languageMap[languageId] || 'Unknown'
}
