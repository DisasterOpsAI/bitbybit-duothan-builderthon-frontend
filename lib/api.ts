// API utility functions for easy integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

export class ApiClient {
  private baseUrl: string
  private adminToken: string | null = null

  constructor() {
    this.baseUrl = API_BASE_URL
    if (typeof window !== "undefined") {
      this.adminToken = localStorage.getItem("adminToken")
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    if (this.adminToken && endpoint.startsWith("/admin")) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.adminToken}`,
      }
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  // Team APIs
  async registerTeam(teamName: string) {
    return this.request("/teams/register", {
      method: "POST",
      body: JSON.stringify({ teamName }),
    })
  }

  async getTeamChallenges() {
    return this.request("/challenges/team")
  }

  async getTeamStats() {
    return this.request("/teams/stats")
  }

  // Challenge APIs
  async getChallenge(id: string) {
    return this.request(`/challenges/${id}`)
  }

  async submitFlag(challengeId: string, flag: string) {
    return this.request(`/challenges/${challengeId}/submit-flag`, {
      method: "POST",
      body: JSON.stringify({ flag }),
    })
  }

  async submitBuildathon(challengeId: string, githubLink: string) {
    return this.request(`/challenges/${challengeId}/submit-buildathon`, {
      method: "POST",
      body: JSON.stringify({ githubLink }),
    })
  }

  async executeCode(sourceCode: string, languageId: number, stdin = "") {
    return this.request("/judge0/execute", {
      method: "POST",
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
        stdin,
      }),
    })
  }

  // Leaderboard APIs
  async getLeaderboard() {
    return this.request("/leaderboard")
  }

  async getStats() {
    return this.request("/stats")
  }

  // Admin APIs
  async adminLogin(username: string, password: string) {
    const response = await this.request("/auth/admin", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })

    if (response.token) {
      this.adminToken = response.token
      if (typeof window !== "undefined") {
        localStorage.setItem("adminToken", response.token)
      }
    }

    return response
  }

  async getAdminDashboard() {
    return this.request("/admin/dashboard")
  }

  async getAdminChallenges() {
    return this.request("/admin/challenges")
  }

  async createChallenge(challengeData: any) {
    return this.request("/admin/challenges", {
      method: "POST",
      body: JSON.stringify(challengeData),
    })
  }

  async deleteChallenge(challengeId: string) {
    return this.request(`/admin/challenges/${challengeId}`, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient()
