"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2, Flag, Users, Trophy } from "lucide-react";
import { AdminNavbar } from "@/components/admin-navbar";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  order: number;
  isActive: boolean;
  algorithmicProblem: {
    title: string;
    description: string;
    constraints: string;
    inputFormat: string;
    outputFormat: string;
    sampleInput: string;
    sampleOutput: string;
    timeLimit: number;
    memoryLimit: number;
  };
  buildathonProblem: {
    title: string;
    description: string;
    requirements: string[];
    submissionFormat: string;
    allowedTechnologies: string[];
  };
  flag: string;
  createdAt: any;
  updatedAt: any;
}

export default function ViewChallengePage() {
  const params = useParams();
  const challengeId = params.id as string;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await fetch(`/api/admin/challenges/${challengeId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setChallenge(data);
        } else if (response.status === 401) {
          localStorage.removeItem("adminToken");
          router.push("/auth/admin-login");
        } else if (response.status === 404) {
          setError("Challenge not found");
        } else {
          setError("Failed to load challenge");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenge();
  }, [challengeId, router]);

  const getDifficultyFromPoints = (points: number): string => {
    if (points <= 100) return "Easy";
    if (points <= 200) return "Medium";
    return "Hard";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Hard":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-500/20 text-green-300 border-green-500/30"
      : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  };

  const deleteChallenge = async () => {
    if (!confirm("Are you sure you want to delete this challenge? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/challenges/${challengeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (response.ok) {
        router.push("/admin/challenges");
      } else {
        setError("Failed to delete challenge");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-foreground text-xl">Loading challenge...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <Button
            onClick={() => router.push("/admin/challenges")}
            className="accent-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Button>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-muted-foreground text-xl">Challenge not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            onClick={() => router.push("/admin/challenges")}
            variant="outline"
            className="mb-4 text-foreground border-border hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Button>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {challenge.title}
              </h1>
              <div className="flex items-center gap-4">
                <Badge className={getDifficultyColor(getDifficultyFromPoints(challenge.points))}>
                  {getDifficultyFromPoints(challenge.points)}
                </Badge>
                <Badge className={getStatusColor(challenge.isActive)}>
                  {challenge.isActive ? "Active" : "Draft"}
                </Badge>
                <span className="text-muted-foreground">
                  {challenge.points} points
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link href={`/admin/challenges/${challengeId}/edit`}>
                <Button className="accent-button">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                onClick={deleteChallenge}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="surface-elevated border-border">
            <TabsTrigger value="overview" className="text-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="algorithmic" className="text-foreground">
              Algorithmic Problem
            </TabsTrigger>
            <TabsTrigger value="buildathon" className="text-foreground">
              Buildathon Problem
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-foreground">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="surface-elevated border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-lg flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {challenge.points}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getDifficultyFromPoints(challenge.points)} difficulty
                  </p>
                </CardContent>
              </Card>

              <Card className="surface-elevated border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-lg flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {challenge.isActive ? "Active" : "Draft"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {challenge.isActive ? "Visible to users" : "Hidden from users"}
                  </p>
                </CardContent>
              </Card>

              <Card className="surface-elevated border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-lg flex items-center">
                    <Flag className="w-5 h-5 mr-2" />
                    Flag
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-mono text-foreground bg-muted p-2 rounded">
                    {challenge.flag}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="surface-elevated border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Challenge Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Created</h3>
                  <p className="text-muted-foreground">
                    {challenge.createdAt instanceof Date
                      ? challenge.createdAt.toLocaleDateString()
                      : challenge.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Last Updated</h3>
                  <p className="text-muted-foreground">
                    {challenge.updatedAt instanceof Date
                      ? challenge.updatedAt.toLocaleDateString()
                      : challenge.updatedAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Algorithmic Problem Tab */}
          <TabsContent value="algorithmic" className="space-y-6">
            <Card className="surface-elevated border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Problem Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">
                    {challenge.algorithmicProblem.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-elevated border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Constraints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">
                    {challenge.algorithmicProblem.constraints || "No constraints specified"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="surface-elevated border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-semibold text-foreground">Time Limit: </span>
                    <span className="text-muted-foreground">
                      {challenge.algorithmicProblem.timeLimit} seconds
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Memory Limit: </span>
                    <span className="text-muted-foreground">
                      {challenge.algorithmicProblem.memoryLimit} MB
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="surface-elevated border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Sample Input/Output</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-semibold text-foreground">Input:</span>
                    <div className="font-mono text-sm text-foreground bg-muted p-2 rounded mt-1">
                      {challenge.algorithmicProblem.sampleInput || "No sample input"}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Output:</span>
                    <div className="font-mono text-sm text-foreground bg-muted p-2 rounded mt-1">
                      {challenge.algorithmicProblem.sampleOutput || "No sample output"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Buildathon Problem Tab */}
          <TabsContent value="buildathon" className="space-y-6">
            <Card className="surface-elevated border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">
                    {challenge.buildathonProblem.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-elevated border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {challenge.buildathonProblem.requirements.map((req, index) => (
                    <li key={index} className="text-foreground flex items-start">
                      <span className="text-accent mr-2">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="surface-elevated border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Submission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-semibold text-foreground">Submission Format: </span>
                  <span className="text-muted-foreground">
                    {challenge.buildathonProblem.submissionFormat}
                  </span>
                </div>
                {challenge.buildathonProblem.allowedTechnologies.length > 0 && (
                  <div>
                    <span className="font-semibold text-foreground">Allowed Technologies: </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {challenge.buildathonProblem.allowedTechnologies.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-foreground border-border">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="surface-elevated border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Challenge Settings</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure challenge parameters and visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Status</h3>
                    <Badge className={getStatusColor(challenge.isActive)}>
                      {challenge.isActive ? "Active" : "Draft"}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Points</h3>
                    <p className="text-muted-foreground">{challenge.points}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Order</h3>
                    <p className="text-muted-foreground">{challenge.order}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Flag</h3>
                    <div className="font-mono text-sm text-foreground bg-muted p-2 rounded">
                      {challenge.flag}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href={`/admin/challenges/${challengeId}/edit`}>
                    <Button className="accent-button">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Challenge
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}