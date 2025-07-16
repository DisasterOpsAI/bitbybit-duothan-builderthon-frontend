import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import {
  adminChallengesCRUD,
  adminSubmissionsCRUD,
} from "@/lib/firestore-crud";
import { Challenge } from "@/lib/database-schema";
import { adminDb } from '@/lib/firebase-admin'

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const challengesData = await adminChallengesCRUD.getAll();

    const challenges = [];
    for (const challengeData of challengesData) {
      // Get submission stats
      const submissions = await adminSubmissionsCRUD.getByChallengeId(
        challengeData.id
      );

      const totalSubmissions = submissions.length;
      const completions = submissions.filter(
        (submission) =>
          submission.status === "accepted" && submission.type === "buildathon"
      ).length;

      challenges.push({
        id: challengeData.id,
        title: challengeData.title,
        difficulty: getDifficultyFromPoints(challengeData.points),
        points: challengeData.points,
        status: challengeData.isActive ? "active" : "draft",
        submissions: totalSubmissions,
        completions,
        // Fix: Handle both Firestore Timestamp and regular Date
        createdAt:
          challengeData.createdAt instanceof Date
            ? challengeData.createdAt.toISOString().split("T")[0]
            : challengeData.createdAt.toDate().toISOString().split("T")[0],
      });
    }

    return NextResponse.json(challenges);
  } catch (error) {
    console.error("Failed to fetch admin challenges:", error);

    // Better error handling
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      console.error("Error message:", error.message);
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
});

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const challengeData = await request.json();

    // Validate required fields
    if (
      !challengeData.title ||
      !challengeData.algorithmicProblem ||
      !challengeData.buildathonProblem ||
      !challengeData.flag
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new challenge
    const newChallenge: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'> = {
      title: challengeData.title,
      description: challengeData.description || "",
      points: challengeData.points || 100,
      order: challengeData.order || 0,
      isActive: challengeData.isActive || false,
      algorithmicProblem: challengeData.algorithmicProblem,
      buildathonProblem: challengeData.buildathonProblem,
      flag: challengeData.flag,
    };

    const challengeId = await adminChallengesCRUD.create(newChallenge);

    return NextResponse.json({
      success: true,
      message: "Challenge created successfully",
      id: challengeId,
    });
  } catch (error) {
    console.error("Failed to create challenge:", error);

    // Better error handling
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      console.error("Error message:", error.message);
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
});

function getDifficultyFromPoints(points: number): string {
  if (points <= 100) return "Easy";
  if (points <= 200) return "Medium";
  return "Hard";
}
