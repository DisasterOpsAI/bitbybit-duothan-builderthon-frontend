"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Save, AlertCircle, CheckCircle } from "lucide-react"
import { AdminNavbar } from "@/components/admin-navbar"
import { useRouter } from "next/navigation"
import { ApiClient } from "@/lib/api-client"

interface PlatformSettings {
  registrationEnabled: boolean
  submissionEnabled: boolean
  leaderboardPublic: boolean
  maintenanceMode: boolean
  platformTitle: string
  platformDescription: string
  judge0ApiUrl: string
  judge0ApiToken: string
  maxTeamSize: number
  submissionCooldown: number
  challengeTimeLimit: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    registrationEnabled: true,
    submissionEnabled: true,
    leaderboardPublic: true,
    maintenanceMode: false,
    platformTitle: "The OASIS Protocol",
    platformDescription: "A Ready Player One inspired coding challenge platform",
    judge0ApiUrl: "http://10.3.5.139:2358/",
    judge0ApiToken: "ZHVvdGhhbjUuMA==",
    maxTeamSize: 4,
    submissionCooldown: 30,
    challengeTimeLimit: 3600
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const router = useRouter()

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/auth/admin-login")
      return
    }

    fetchSettings()
  }, [router])

  const fetchSettings = async () => {
    try {
      const response = await ApiClient.makeAdminRequest('/api/admin/settings')
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      } else if (response.status === 401) {
        localStorage.removeItem("adminToken")
        router.push("/auth/admin-login")
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const response = await ApiClient.makeAdminRequest('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings })
      })
      
      if (response.ok) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen oasis-bg">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-white text-xl">Loading settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen oasis-bg">
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Platform Settings</h1>
            <p className="text-white/70">Configure platform behavior and features</p>
          </div>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        {/* Save Status */}
        {saveStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-300">Settings saved successfully!</span>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-300">Failed to save settings. Please try again.</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Platform Configuration */}
          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Platform Configuration
              </CardTitle>
              <CardDescription className="text-white/70">
                Basic platform settings and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-white">Platform Title</Label>
                <Input
                  value={settings.platformTitle}
                  onChange={(e) => handleInputChange('platformTitle', e.target.value)}
                  className="bg-black/40 border-white/20 text-white placeholder-white/50"
                  placeholder="Enter platform title"
                />
              </div>

              <div>
                <Label className="text-white">Platform Description</Label>
                <Textarea
                  value={settings.platformDescription}
                  onChange={(e) => handleInputChange('platformDescription', e.target.value)}
                  className="bg-black/40 border-white/20 text-white placeholder-white/50 h-20"
                  placeholder="Enter platform description"
                />
              </div>

              <div>
                <Label className="text-white">Maximum Team Size</Label>
                <Input
                  type="number"
                  value={settings.maxTeamSize}
                  onChange={(e) => handleInputChange('maxTeamSize', parseInt(e.target.value))}
                  className="bg-black/40 border-white/20 text-white placeholder-white/50"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <Label className="text-white">Submission Cooldown (seconds)</Label>
                <Input
                  type="number"
                  value={settings.submissionCooldown}
                  onChange={(e) => handleInputChange('submissionCooldown', parseInt(e.target.value))}
                  className="bg-black/40 border-white/20 text-white placeholder-white/50"
                  min="0"
                />
              </div>

              <div>
                <Label className="text-white">Challenge Time Limit (seconds)</Label>
                <Input
                  type="number"
                  value={settings.challengeTimeLimit}
                  onChange={(e) => handleInputChange('challengeTimeLimit', parseInt(e.target.value))}
                  className="bg-black/40 border-white/20 text-white placeholder-white/50"
                  min="60"
                />
              </div>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Feature Toggles</CardTitle>
              <CardDescription className="text-white/70">
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Team Registration</Label>
                  <p className="text-white/60 text-sm">Allow new teams to register</p>
                </div>
                <Switch
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => handleInputChange('registrationEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Challenge Submissions</Label>
                  <p className="text-white/60 text-sm">Allow teams to submit solutions</p>
                </div>
                <Switch
                  checked={settings.submissionEnabled}
                  onCheckedChange={(checked) => handleInputChange('submissionEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Public Leaderboard</Label>
                  <p className="text-white/60 text-sm">Make leaderboard visible to teams</p>
                </div>
                <Switch
                  checked={settings.leaderboardPublic}
                  onCheckedChange={(checked) => handleInputChange('leaderboardPublic', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Maintenance Mode</Label>
                  <p className="text-white/60 text-sm">Put platform in maintenance mode</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card className="bg-black/40 border-white/20 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">API Configuration</CardTitle>
              <CardDescription className="text-white/70">
                Configure external API endpoints and credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white">Judge0 API URL</Label>
                  <Input
                    value={settings.judge0ApiUrl}
                    disabled
                    className="bg-black/40 border-white/20 text-white/60 placeholder-white/50"
                    placeholder="Configured via environment variables"
                  />
                  <p className="text-white/60 text-xs mt-1">Set via JUDGE0_API_URL environment variable</p>
                </div>

                <div>
                  <Label className="text-white">Judge0 API Token</Label>
                  <Input
                    type="password"
                    value={settings.judge0ApiToken}
                    disabled
                    className="bg-black/40 border-white/20 text-white/60 placeholder-white/50"
                    placeholder="••••••••••••••••"
                  />
                  <p className="text-white/60 text-xs mt-1">Set via JUDGE0_API_TOKEN environment variable</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-yellow-300 font-semibold">Security Notice</span>
                </div>
                <p className="text-yellow-200 text-sm mt-1">
                  API credentials are stored securely and are not visible in the frontend. 
                  Changes to these settings require administrator privileges.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}