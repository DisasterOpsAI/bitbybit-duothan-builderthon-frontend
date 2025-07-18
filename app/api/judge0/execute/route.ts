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

    // Use a working Judge0 instance - Judge0 Extra CE
    const JUDGE0_URL = "https://judge0-extra-ce.p.rapidapi.com"
    const JUDGE0_KEY = "your-rapidapi-key-here" // This needs to be a valid key
    
    // If no API key, use local execution for JavaScript
    if (!JUDGE0_KEY || JUDGE0_KEY === "your-rapidapi-key-here") {
      if (language_id === 63) { // JavaScript
        const result = await executeJavaScriptLocally(source_code, stdin, expected_output)
        
        if (challenge_id) {
          try {
            const submission: Omit<Submission, 'id'> = {
              teamId,
              challengeId: challenge_id,
              type: 'algorithmic',
              content: source_code,
              language: 'JavaScript',
              status: result.is_correct ? 'accepted' : 'rejected',
              executionTime: result.time,
              memoryUsage: result.memory,
              output: result.stdout,
              error: result.stderr,
              submittedAt: new Date(),
              evaluatedAt: new Date()
            }
            
            await adminDb.collection('submissions').add(submission)
          } catch (dbError) {
            console.error("Database error:", dbError)
          }
        }
        
        return NextResponse.json(result)
      } else {
        // For non-JavaScript, return error
        return NextResponse.json({ 
          error: "Code execution service unavailable",
          message: "Please use JavaScript or configure a Judge0 API key",
          stdout: "",
          stderr: "Only JavaScript is supported without Judge0 API key",
          status: "Service Unavailable",
          time: 0,
          memory: 0,
          is_correct: false,
          status_id: 0,
          compilation_error: false,
          runtime_error: true
        }, { status: 503 })
      }
    }

    // Try Judge0 API
    try {
      const submitResponse = await fetch(`${JUDGE0_URL}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": JUDGE0_KEY,
          "X-RapidAPI-Host": "judge0-extra-ce.p.rapidapi.com"
        },
        body: JSON.stringify({
          source_code,
          language_id,
          stdin: stdin || "",
        }),
      })

      if (!submitResponse.ok) {
        throw new Error(`Judge0 submit failed: ${submitResponse.status}`)
      }

      const submitResult = await submitResponse.json()
      const submissionId = submitResult.token

      // Poll for result
      let attempts = 0
      const maxAttempts = 10
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const resultResponse = await fetch(`${JUDGE0_URL}/submissions/${submissionId}`, {
          headers: {
            "X-RapidAPI-Key": JUDGE0_KEY,
            "X-RapidAPI-Host": "judge0-extra-ce.p.rapidapi.com"
          }
        })
        
        if (!resultResponse.ok) {
          throw new Error(`Judge0 result failed: ${resultResponse.status}`)
        }
        
        const result = await resultResponse.json()
        
        if (result.status.id <= 2) {
          attempts++
          continue
        }
        
        // Execution completed
        const stdout = result.stdout || ""
        const stderr = result.stderr || ""
        const is_correct = expected_output ? stdout.trim() === expected_output.trim() : false
        
        // Store submission
        if (challenge_id) {
          try {
            const submission: Omit<Submission, 'id'> = {
              teamId,
              challengeId: challenge_id,
              type: 'algorithmic',
              content: source_code,
              language: getLanguageName(language_id),
              status: result.status.id === 3 ? (is_correct ? 'accepted' : 'rejected') : 'runtime_error',
              executionTime: result.time,
              memoryUsage: result.memory,
              output: stdout,
              error: stderr,
              submittedAt: new Date(),
              evaluatedAt: new Date()
            }
            
            await adminDb.collection('submissions').add(submission)
          } catch (dbError) {
            console.error("Database error:", dbError)
          }
        }
        
        return NextResponse.json({
          stdout,
          stderr,
          status: result.status.description,
          time: result.time,
          memory: result.memory,
          is_correct,
          status_id: result.status.id,
          compilation_error: result.status.id === 6,
          runtime_error: result.status.id > 6
        })
      }
      
      return NextResponse.json({ error: "Execution timeout" }, { status: 408 })
      
    } catch (error) {
      // If Judge0 fails, fall back to local execution for JavaScript
      if (language_id === 63) {
        const result = await executeJavaScriptLocally(source_code, stdin, expected_output)
        
        if (challenge_id) {
          try {
            const submission: Omit<Submission, 'id'> = {
              teamId,
              challengeId: challenge_id,
              type: 'algorithmic',
              content: source_code,
              language: 'JavaScript',
              status: result.is_correct ? 'accepted' : 'rejected',
              executionTime: result.time,
              memoryUsage: result.memory,
              output: result.stdout,
              error: result.stderr,
              submittedAt: new Date(),
              evaluatedAt: new Date()
            }
            
            await adminDb.collection('submissions').add(submission)
          } catch (dbError) {
            console.error("Database error:", dbError)
          }
        }
        
        return NextResponse.json(result)
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error("Judge0 execution error:", error)
    
    // Always fall back to local JavaScript execution
    if (language_id === 63) {
      const result = await executeJavaScriptLocally(source_code, stdin, expected_output)
      
      if (challenge_id) {
        try {
          const submission: Omit<Submission, 'id'> = {
            teamId,
            challengeId: challenge_id,
            type: 'algorithmic',
            content: source_code,
            language: 'JavaScript',
            status: result.is_correct ? 'accepted' : 'rejected',
            executionTime: result.time,
            memoryUsage: result.memory,
            output: result.stdout,
            error: result.stderr,
            submittedAt: new Date(),
            evaluatedAt: new Date()
          }
          
          await adminDb.collection('submissions').add(submission)
        } catch (dbError) {
          console.error("Database error:", dbError)
        }
      }
      
      return NextResponse.json(result)
    }
    
    // For other languages, return error
    return NextResponse.json(
      { 
        error: "Code execution failed",
        message: "Only JavaScript is currently supported",
        stdout: "",
        stderr: "Language not supported",
        status: "Not Supported",
        time: 0,
        memory: 0,
        is_correct: false,
        status_id: 0,
        compilation_error: false,
        runtime_error: true
      },
      { status: 400 }
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

async function executeJavaScriptLocally(source_code: string, stdin: string = "", expected_output: string = ""): Promise<any> {
  const startTime = Date.now()
  let stdout = ""
  let stderr = ""
  
  try {
    // Create console override
    const mockConsole = {
      log: (...args) => {
        stdout += args.join(' ') + '\n'
      },
      error: (...args) => {
        stderr += args.join(' ') + '\n'
      }
    }
    
    // Execute the code
    const func = new Function('console', 'input', source_code)
    func(mockConsole, stdin)
    
    const executionTime = Date.now() - startTime
    const is_correct = expected_output ? stdout.trim() === expected_output.trim() : false
    
    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      status: stderr ? "Runtime Error" : "Accepted",
      time: executionTime,
      memory: 0,
      is_correct,
      status_id: stderr ? 5 : 3,
      compilation_error: false,
      runtime_error: !!stderr
    }
  } catch (error) {
    const executionTime = Date.now() - startTime
    
    return {
      stdout: stdout,
      stderr: error.message || "Runtime error",
      status: "Runtime Error",
      time: executionTime,
      memory: 0,
      is_correct: false,
      status_id: 5,
      compilation_error: false,
      runtime_error: true
    }
  }
}
