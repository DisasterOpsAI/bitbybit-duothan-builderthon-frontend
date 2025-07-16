import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// TODO: Backend Integration Point 9 - Create Challenge
export async function POST(request: NextRequest) {
  try {
    console.log("POST request received for creating challenge");

    // Verify admin token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Missing or invalid authorization header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log("Token extracted, verifying...");

    // Get the secret from environment
    const secret =
      process.env.NEXTAUTH_SECRET || "demo_secret_key_change_in_production";
    if (!secret) {
      console.error("NEXTAUTH_SECRET not found in environment");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    try {
      const decoded = jwt.verify(token, secret);
      console.log("Token verified successfully:", decoded);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("Request body parsed:", body);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    const {
      title,
      description,
      difficulty,
      category,
      points,
      testCases,
      initialCode,
      solution,
    } = body;

    if (!title || !description || !difficulty || !category || !points) {
      console.log("Missing required fields");
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: [
            "title",
            "description",
            "difficulty",
            "category",
            "points",
          ],
        },
        { status: 400 }
      );
    }

    // TODO: Save challenge to database
    console.log("Creating new challenge with data:", {
      title,
      description,
      difficulty,
      category,
      points,
      testCases: testCases?.length || 0,
      hasInitialCode: !!initialCode,
      hasSolution: !!solution,
    });

    // Simulate database save
    const newChallenge = {
      id: Date.now().toString(), // Replace with actual DB ID
      title,
      description,
      difficulty,
      category,
      points,
      testCases: testCases || [],
      initialCode: initialCode || "",
      solution: solution || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Replace with actual database insertion
    // const savedChallenge = await db.challenge.create({ data: newChallenge })

    return NextResponse.json({
      success: true,
      message: "Challenge created successfully",
      challenge: newChallenge,
    });
  } catch (error) {
    console.error("Failed to create challenge:", error);

    // More detailed error logging with proper type handling
    let errorMessage = "Unknown error occurred";

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      console.error("Unknown error type:", typeof error);
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development"
            ? errorMessage
            : "Something went wrong",
      },
      { status: 500 }
    );
  }
}

// TODO: Backend Integration Point 10 - Get All Challenges
export async function GET(request: NextRequest) {
  try {
    console.log("GET request received for challenges");

    // Verify admin token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Missing or invalid authorization header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const secret =
      process.env.NEXTAUTH_SECRET || "demo_secret_key_change_in_production";

    try {
      jwt.verify(token, secret);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // TODO: Fetch challenges from database
    console.log("Fetching all challenges");

    // Mock data for now
    const challenges = [
      {
        id: "1",
        title: "Two Sum",
        description: "Find two numbers that add up to target",
        difficulty: "Easy",
        category: "Array",
        points: 100,
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      challenges,
    });
  } catch (error) {
    console.error("Failed to fetch challenges:", error);

    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development"
            ? errorMessage
            : "Something went wrong",
      },
      { status: 500 }
    );
  }
}
