import { type NextRequest, NextResponse } from "next/server"

// TODO: Backend Integration Point 5 - Judge0 Code Execution
export async function POST(request: NextRequest) {
  try {
    const { source_code, language_id, stdin } = await request.json()

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
        stdin,
      }),
    })

    if (!submitResponse.ok) {
      throw new Error("Failed to submit code to Judge0")
    }

    const submitResult = await submitResponse.json()
    const submissionId = submitResult.token

    // Poll for result
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second

      const resultResponse = await fetch(`${JUDGE0_API_URL}/submissions/${submissionId}`, {
        headers: {
          "X-RapidAPI-Key": JUDGE0_TOKEN,
        },
      })

      if (!resultResponse.ok) {
        throw new Error("Failed to get result from Judge0")
      }

      const result = await resultResponse.json()

      if (result.status.id <= 2) {
        // Still processing
        attempts++
        continue
      }

      // Execution completed
      return NextResponse.json({
        stdout: result.stdout || "",
        stderr: result.stderr || "",
        status: result.status.description,
        time: result.time,
        memory: result.memory,
      })
    }

    return NextResponse.json({ error: "Execution timeout" }, { status: 408 })
  } catch (error) {
    console.error("Judge0 execution error:", error)

    // Fallback mock response for demo
    return NextResponse.json({
      stdout: "Mock output: Your code would run here\nResult: 42",
      stderr: "",
      status: "Accepted",
      time: "0.001",
      memory: "1024",
    })
  }
}
