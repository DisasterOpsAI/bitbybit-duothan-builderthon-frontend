"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { AdminNavbar } from "@/components/admin-navbar";
import { useRouter, useParams } from "next/navigation";

interface Example {
  input: string;
  output: string;
}

interface ChallengeData {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  status: "draft" | "active";
  algorithmic: {
    description: string;
    constraints: string;
    examples: Example[];
    timeLimit: string;
    memoryLimit: string;
  };
  buildathon: {
    description: string;
    requirements: string[];
    deliverables: string[];
  };
  flag: string;
}

export default function EditChallengePage() {
  const params = useParams();
  const challengeId = params.id as string;
  const [challengeData, setChallengeData] = useState<ChallengeData>({
    title: "",
    difficulty: "Easy",
    points: 100,
    status: "draft",
    algorithmic: {
      description: "",
      constraints: "",
      examples: [{ input: "", output: "" }],
      timeLimit: "2 seconds",
      memoryLimit: "256 MB",
    },
    buildathon: {
      description: "",
      requirements: [""],
      deliverables: [""],
    },
    flag: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const router = useRouter();

  const tabs = ["basic", "algorithmic", "buildathon", "flag"];
  const tabNames = {
    basic: "Basic Info",
    algorithmic: "Algorithmic Problem",
    buildathon: "Buildathon Problem",
    flag: "Flag & Settings",
  };

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
          
          // Transform data to match form structure
          setChallengeData({
            title: data.title || "",
            difficulty: getDifficultyFromPoints(data.points) as "Easy" | "Medium" | "Hard",
            points: data.points || 100,
            status: data.isActive ? "active" : "draft",
            algorithmic: {
              description: data.algorithmicProblem?.description || "",
              constraints: data.algorithmicProblem?.constraints || "",
              examples: [
                {
                  input: data.algorithmicProblem?.sampleInput || "",
                  output: data.algorithmicProblem?.sampleOutput || "",
                }
              ],
              timeLimit: `${data.algorithmicProblem?.timeLimit || 2} seconds`,
              memoryLimit: `${data.algorithmicProblem?.memoryLimit || 256} MB`,
            },
            buildathon: {
              description: data.buildathonProblem?.description || "",
              requirements: data.buildathonProblem?.requirements || [""],
              deliverables: [""], // Not stored in current schema
            },
            flag: data.flag || "",
          });
        } else if (response.status === 401) {
          localStorage.removeItem("adminToken");
          router.push("/auth/admin-login");
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

  const nextTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const addExample = () => {
    setChallengeData((prev) => ({
      ...prev,
      algorithmic: {
        ...prev.algorithmic,
        examples: [...prev.algorithmic.examples, { input: "", output: "" }],
      },
    }));
  };

  const removeExample = (index: number) => {
    setChallengeData((prev) => ({
      ...prev,
      algorithmic: {
        ...prev.algorithmic,
        examples: prev.algorithmic.examples.filter((_, i) => i !== index),
      },
    }));
  };

  const updateExample = (
    index: number,
    field: "input" | "output",
    value: string
  ) => {
    setChallengeData((prev) => ({
      ...prev,
      algorithmic: {
        ...prev.algorithmic,
        examples: prev.algorithmic.examples.map((example, i) =>
          i === index ? { ...example, [field]: value } : example
        ),
      },
    }));
  };

  const addRequirement = () => {
    setChallengeData((prev) => ({
      ...prev,
      buildathon: {
        ...prev.buildathon,
        requirements: [...prev.buildathon.requirements, ""],
      },
    }));
  };

  const removeRequirement = (index: number) => {
    setChallengeData((prev) => ({
      ...prev,
      buildathon: {
        ...prev.buildathon,
        requirements: prev.buildathon.requirements.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setChallengeData((prev) => ({
      ...prev,
      buildathon: {
        ...prev.buildathon,
        requirements: prev.buildathon.requirements.map((req, i) =>
          i === index ? value : req
        ),
      },
    }));
  };

  const addDeliverable = () => {
    setChallengeData((prev) => ({
      ...prev,
      buildathon: {
        ...prev.buildathon,
        deliverables: [...prev.buildathon.deliverables, ""],
      },
    }));
  };

  const removeDeliverable = (index: number) => {
    setChallengeData((prev) => ({
      ...prev,
      buildathon: {
        ...prev.buildathon,
        deliverables: prev.buildathon.deliverables.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setChallengeData((prev) => ({
      ...prev,
      buildathon: {
        ...prev.buildathon,
        deliverables: prev.buildathon.deliverables.map((del, i) =>
          i === index ? value : del
        ),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!challengeData.title.trim()) {
      setError("Challenge title is required");
      return;
    }

    if (!challengeData.algorithmic.description.trim()) {
      setError("Algorithmic problem description is required");
      return;
    }

    if (!challengeData.buildathon.description.trim()) {
      setError("Buildathon problem description is required");
      return;
    }

    if (!challengeData.flag.trim()) {
      setError("Flag is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        title: challengeData.title,
        description: "",
        points: challengeData.points,
        order: 0,
        isActive: challengeData.status === "active",
        algorithmicProblem: {
          title: challengeData.title,
          description: challengeData.algorithmic.description,
          constraints: challengeData.algorithmic.constraints,
          inputFormat: "",
          outputFormat: "",
          sampleInput: challengeData.algorithmic.examples[0]?.input || "",
          sampleOutput: challengeData.algorithmic.examples[0]?.output || "",
          timeLimit: parseInt(challengeData.algorithmic.timeLimit) || 2,
          memoryLimit: parseInt(challengeData.algorithmic.memoryLimit) || 256,
        },
        buildathonProblem: {
          title: challengeData.title,
          description: challengeData.buildathon.description,
          requirements: challengeData.buildathon.requirements.filter((r) =>
            r.trim()
          ),
          submissionFormat: "github" as const,
          allowedTechnologies: [],
        },
        flag: challengeData.flag,
      };

      const response = await fetch(`/api/admin/challenges/${challengeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess("Challenge updated successfully!");
        setTimeout(() => {
          router.push("/admin/challenges");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update challenge");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Edit Challenge
          </h1>
          <p className="text-muted-foreground">
            Update your challenge with algorithmic and buildathon components
          </p>
        </div>

        {error && (
          <Alert className="border-red-500/50 bg-red-500/10 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500/50 bg-green-500/10 mb-6">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="surface-elevated border-border">
              <TabsTrigger value="basic" className="text-foreground">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="algorithmic" className="text-foreground">
                Algorithmic Problem
              </TabsTrigger>
              <TabsTrigger value="buildathon" className="text-foreground">
                Buildathon Problem
              </TabsTrigger>
              <TabsTrigger value="flag" className="text-foreground">
                Flag & Settings
              </TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-6">
              <Card className="surface-elevated border-border backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Challenge Information
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Basic details about your challenge
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-foreground">
                      Challenge Title
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Enter challenge title"
                      value={challengeData.title}
                      onChange={(e) =>
                        setChallengeData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="surface-elevated border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="difficulty" className="text-foreground">
                        Difficulty
                      </Label>
                      <Select
                        value={challengeData.difficulty}
                        onValueChange={(value: "Easy" | "Medium" | "Hard") =>
                          setChallengeData((prev) => ({
                            ...prev,
                            difficulty: value,
                          }))
                        }
                      >
                        <SelectTrigger className="surface-elevated border-border text-foreground">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent className="surface-elevated border-border">
                          <SelectItem value="Easy" className="text-foreground">
                            Easy
                          </SelectItem>
                          <SelectItem
                            value="Medium"
                            className="text-foreground"
                          >
                            Medium
                          </SelectItem>
                          <SelectItem value="Hard" className="text-foreground">
                            Hard
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="points" className="text-foreground">
                        Points
                      </Label>
                      <Input
                        id="points"
                        type="number"
                        min="1"
                        placeholder="100"
                        value={challengeData.points}
                        onChange={(e) =>
                          setChallengeData((prev) => ({
                            ...prev,
                            points: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="surface-elevated border-border text-foreground placeholder:text-muted-foreground"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="status" className="text-foreground">
                        Status
                      </Label>
                      <Select
                        value={challengeData.status}
                        onValueChange={(value: "draft" | "active") =>
                          setChallengeData((prev) => ({
                            ...prev,
                            status: value,
                          }))
                        }
                      >
                        <SelectTrigger className="surface-elevated border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="surface-elevated border-border">
                          <SelectItem value="draft" className="text-foreground">
                            Draft
                          </SelectItem>
                          <SelectItem
                            value="active"
                            className="text-foreground"
                          >
                            Active
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <div></div>
                    <Button
                      type="button"
                      onClick={nextTab}
                      className="accent-button"
                    >
                      Next: {tabNames.algorithmic}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Algorithmic Problem */}
            <TabsContent value="algorithmic" className="space-y-6">
              <Card className="surface-elevated border-border backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Algorithmic Problem
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Define the coding challenge portion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label
                      htmlFor="algo-description"
                      className="text-foreground"
                    >
                      Problem Description
                    </Label>
                    <textarea
                      id="algo-description"
                      placeholder="Describe the algorithmic problem..."
                      value={challengeData.algorithmic.description}
                      onChange={(e) =>
                        setChallengeData((prev) => ({
                          ...prev,
                          algorithmic: {
                            ...prev.algorithmic,
                            description: e.target.value,
                          },
                        }))
                      }
                      className="w-full min-h-32 surface-elevated border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground resize-y"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="constraints" className="text-foreground">
                      Constraints
                    </Label>
                    <textarea
                      id="constraints"
                      placeholder="Input constraints and limits..."
                      value={challengeData.algorithmic.constraints}
                      onChange={(e) =>
                        setChallengeData((prev) => ({
                          ...prev,
                          algorithmic: {
                            ...prev.algorithmic,
                            constraints: e.target.value,
                          },
                        }))
                      }
                      className="w-full min-h-24 surface-elevated border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground resize-y"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="time-limit" className="text-foreground">
                        Time Limit
                      </Label>
                      <Input
                        id="time-limit"
                        type="text"
                        placeholder="2 seconds"
                        value={challengeData.algorithmic.timeLimit}
                        onChange={(e) =>
                          setChallengeData((prev) => ({
                            ...prev,
                            algorithmic: {
                              ...prev.algorithmic,
                              timeLimit: e.target.value,
                            },
                          }))
                        }
                        className="surface-elevated border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="memory-limit" className="text-foreground">
                        Memory Limit
                      </Label>
                      <Input
                        id="memory-limit"
                        type="text"
                        placeholder="256 MB"
                        value={challengeData.algorithmic.memoryLimit}
                        onChange={(e) =>
                          setChallengeData((prev) => ({
                            ...prev,
                            algorithmic: {
                              ...prev.algorithmic,
                              memoryLimit: e.target.value,
                            },
                          }))
                        }
                        className="surface-elevated border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-foreground">Examples</Label>
                      <button
                        type="button"
                        onClick={addExample}
                        className="px-3 py-1 accent-button rounded text-sm hover:bg-blue-700"
                      >
                        Add Example
                      </button>
                    </div>

                    {challengeData.algorithmic.examples.map(
                      (example, index) => (
                        <div
                          key={index}
                          className="border border-border rounded p-4 mb-2"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-foreground font-medium">
                              Example {index + 1}
                            </span>
                            {challengeData.algorithmic.examples.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExample(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-foreground">Input</Label>
                              <textarea
                                placeholder="Example input..."
                                value={example.input}
                                onChange={(e) =>
                                  updateExample(index, "input", e.target.value)
                                }
                                className="w-full min-h-20 surface-elevated border border-border rounded px-3 py-2 text-foreground placeholder:text-muted-foreground resize-y"
                              />
                            </div>

                            <div>
                              <Label className="text-foreground">Output</Label>
                              <textarea
                                placeholder="Expected output..."
                                value={example.output}
                                onChange={(e) =>
                                  updateExample(index, "output", e.target.value)
                                }
                                className="w-full min-h-20 surface-elevated border border-border rounded px-3 py-2 text-foreground placeholder:text-muted-foreground resize-y"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      onClick={prevTab}
                      variant="outline"
                      className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                    >
                      Previous: {tabNames.basic}
                    </Button>
                    <Button
                      type="button"
                      onClick={nextTab}
                      className="accent-button"
                    >
                      Next: {tabNames.buildathon}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Buildathon Problem */}
            <TabsContent value="buildathon" className="space-y-6">
              <Card className="surface-elevated border-border backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Buildathon Problem
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Define the project building challenge
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label
                      htmlFor="build-description"
                      className="text-foreground"
                    >
                      Project Description
                    </Label>
                    <textarea
                      id="build-description"
                      placeholder="Describe the buildathon project..."
                      value={challengeData.buildathon.description}
                      onChange={(e) =>
                        setChallengeData((prev) => ({
                          ...prev,
                          buildathon: {
                            ...prev.buildathon,
                            description: e.target.value,
                          },
                        }))
                      }
                      className="w-full min-h-32 surface-elevated border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground resize-y"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-foreground">Requirements</Label>
                      <button
                        type="button"
                        onClick={addRequirement}
                        className="px-3 py-1 accent-button rounded text-sm hover:bg-blue-700"
                      >
                        Add Requirement
                      </button>
                    </div>

                    {challengeData.buildathon.requirements.map(
                      (requirement, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            placeholder="Enter requirement..."
                            value={requirement}
                            onChange={(e) =>
                              updateRequirement(index, e.target.value)
                            }
                            className="surface-elevated border-border text-foreground placeholder:text-muted-foreground"
                          />
                          {challengeData.buildathon.requirements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRequirement(index)}
                              className="px-3 py-2 text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-foreground">Deliverables</Label>
                      <button
                        type="button"
                        onClick={addDeliverable}
                        className="px-3 py-1 accent-button rounded text-sm hover:bg-blue-700"
                      >
                        Add Deliverable
                      </button>
                    </div>

                    {challengeData.buildathon.deliverables.map(
                      (deliverable, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            placeholder="Enter deliverable..."
                            value={deliverable}
                            onChange={(e) =>
                              updateDeliverable(index, e.target.value)
                            }
                            className="surface-elevated border-border text-foreground placeholder:text-muted-foreground"
                          />
                          {challengeData.buildathon.deliverables.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDeliverable(index)}
                              className="px-3 py-2 text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      onClick={prevTab}
                      variant="outline"
                      className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                    >
                      Previous: {tabNames.algorithmic}
                    </Button>
                    <Button
                      type="button"
                      onClick={nextTab}
                      className="accent-button"
                    >
                      Next: {tabNames.flag}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Flag & Settings */}
            <TabsContent value="flag" className="space-y-6">
              <Card className="surface-elevated border-border backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Flag & Final Settings
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Set the challenge flag and finalize settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="flag" className="text-foreground">
                      Challenge Flag
                    </Label>
                    <Input
                      id="flag"
                      type="text"
                      placeholder="flag{example_flag_here}"
                      value={challengeData.flag}
                      onChange={(e) =>
                        setChallengeData((prev) => ({
                          ...prev,
                          flag: e.target.value,
                        }))
                      }
                      className="surface-elevated border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => router.push("/admin/challenges")}
                      className="px-6 py-2 border border-border text-foreground rounded hover:bg-muted"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2 accent-button disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Updating..." : "Update Challenge"}
                    </button>
                  </div>

                  <div className="flex justify-between pt-4">
                    <div></div>
                    <Button
                      type="button"
                      onClick={prevTab}
                      className="accent-button"
                    >
                      Previous: {tabNames.buildathon}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  );
}