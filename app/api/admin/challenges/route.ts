import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { adminDb } from '@/lib/firebase-admin'

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const challengesSnapshot = await adminDb.collection('challenges').get();
    const challenges = [];
    
    challengesSnapshot.forEach((doc) => {
      const data = doc.data();
      challenges.push({
        id: doc.id,
        title: data.title || 'Unknown Challenge',
        difficulty: getDifficultyFromPoints(data.points || 100),
        points: data.points || 100,
        status: data.isActive ? "active" : "draft",
        submissions: 0,
        completions: 0,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      });
    });

    return NextResponse.json(challenges);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
});

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const challengeData = await request.json();

    // Validate required fields
    if (!challengeData.title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new challenge
    const newChallenge = {
      title: challengeData.title,
      description: challengeData.description || "",
      points: challengeData.points || 100,
      order: challengeData.order || 0,
      isActive: challengeData.isActive || false,
      algorithmicProblem: challengeData.algorithmicProblem || "",
      buildathonProblem: challengeData.buildathonProblem || "",
      flag: challengeData.flag || "",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await adminDb.collection('challenges').add(newChallenge);

    return NextResponse.json({
      success: true,
      message: "Challenge created successfully",
      id: docRef.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

function getDifficultyFromPoints(points: number): string {
  if (points <= 100) return "Easy";
  if (points <= 200) return "Medium";
  return "Hard";
}
