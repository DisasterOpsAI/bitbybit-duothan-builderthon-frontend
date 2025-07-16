// API client utilities for making authenticated requests

export class ApiClient {
  private static getTeamId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('teamId')
  }

  private static getAdminToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('adminToken')
  }

  static async makeTeamRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const teamId = this.getTeamId()
    
    const headers = {
      'Content-Type': 'application/json',
      ...(teamId && { 'x-team-id': teamId }),
      ...options.headers,
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }

  static async makeAdminRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAdminToken()
    
    if (!token) {
      throw new Error('Admin authentication required')
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }

  // Team API methods
  static async fetchChallenge(challengeId: string) {
    return this.makeTeamRequest(`/api/challenges/${challengeId}`)
  }

  static async submitFlag(challengeId: string, flag: string) {
    return this.makeTeamRequest(`/api/challenges/${challengeId}/submit-flag`, {
      method: 'POST',
      body: JSON.stringify({ flag }),
    })
  }

  static async submitBuildathon(challengeId: string, githubLink: string) {
    return this.makeTeamRequest(`/api/challenges/${challengeId}/submit-buildathon`, {
      method: 'POST',
      body: JSON.stringify({ githubLink }),
    })
  }

  static async fetchLeaderboard() {
    return fetch('/api/leaderboard')
  }

  // Admin API methods
  static async fetchAdminDashboard() {
    return this.makeAdminRequest('/api/admin/dashboard')
  }

  static async fetchAdminChallenges() {
    return this.makeAdminRequest('/api/admin/challenges')
  }

  static async createChallenge(challengeData: any) {
    return this.makeAdminRequest('/api/admin/challenges', {
      method: 'POST',
      body: JSON.stringify(challengeData),
    })
  }

  static async fetchAdminNotifications(unreadOnly = false) {
    return this.makeAdminRequest(`/api/admin/notifications?unread=${unreadOnly}`)
  }

  static async markNotificationAsRead(notificationId: string) {
    return this.makeAdminRequest('/api/admin/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ notificationId, isRead: true }),
    })
  }

  static async reviewBuildathonSubmission(submissionId: string, action: 'accept' | 'reject', feedback?: string) {
    return this.makeAdminRequest('/api/admin/submissions/review', {
      method: 'POST',
      body: JSON.stringify({ submissionId, action, feedback }),
    })
  }
}