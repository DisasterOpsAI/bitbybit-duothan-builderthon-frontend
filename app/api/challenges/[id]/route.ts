import { type NextRequest, NextResponse } from "next/server"

// TODO: Backend Integration Point 4 - Fetch Challenge Details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const challengeId = params.id

    // Mock challenge data
    const mockChallenge = {
      id: challengeId,
      title: "Array Manipulation Master",
      difficulty: "Easy" as const,
      points: 100,
      status: "available" as const,
      algorithmic: {
        description: `
          <p>Given an array of integers, find the maximum sum of any contiguous subarray.</p>
          <p>This is a classic problem that can be solved using Kadane's algorithm.</p>
          <p><strong>Example:</strong> For array [-2, 1, -3, 4, -1, 2, 1, -5, 4], the maximum sum is 6 (subarray [4, -1, 2, 1]).</p>
        `,
        constraints: `
          <ul>
            <li>1 ≤ array length ≤ 10^5</li>
            <li>-10^4 ≤ array[i] ≤ 10^4</li>
            <li>Array contains at least one element</li>
          </ul>
        `,
        examples: [
          {
            input: "[-2, 1, -3, 4, -1, 2, 1, -5, 4]",
            output: "6",
          },
          {
            input: "[1, 2, 3, 4, 5]",
            output: "15",
          },
        ],
        timeLimit: "2 seconds",
        memoryLimit: "256 MB",
      },
      buildathon: {
        description: `
          <p>Create a web application that visualizes the maximum subarray problem and its solution.</p>
          <p>Your application should allow users to input an array and see the algorithm in action.</p>
        `,
        requirements: [
          "Interactive array input interface",
          "Step-by-step algorithm visualization",
          "Responsive design that works on mobile and desktop",
          "Clean, modern UI with smooth animations",
          "Proper error handling for invalid inputs",
        ],
        deliverables: [
          "Complete source code on GitHub",
          "Live demo deployment link",
          "README with setup instructions",
          "Brief explanation of your approach",
        ],
      },
      flag: "6",
    }

    return NextResponse.json(mockChallenge)
  } catch (error) {
    console.error("Failed to fetch challenge:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
