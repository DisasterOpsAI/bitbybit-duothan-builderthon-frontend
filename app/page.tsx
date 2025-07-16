import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Shield, Trophy, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Code className="w-8 h-8 text-black" />
            <span className="text-xl font-bold text-black">OASIS Protocol</span>
          </Link>
          <div className="flex space-x-4">
            <Link href="/auth/team-login">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Team Login
              </Button>
            </Link>
            <Link href="/auth/admin-login">
              <Button className="bg-black text-white hover:bg-gray-800">Admin Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-black mb-6 leading-tight">
            The OASIS Has Gone
            <span className="block">DARK</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            In 2045, an anonymous force has encrypted the Master Key. Only the most skilled coders can decode the layers
            of security and unlock the final Builder Challenge to restore the OASIS to its former glory.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/team-signup">
              <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-3">
                <Users className="w-5 h-5 mr-2" />
                Form Your Team
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button
                size="lg"
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white px-8 py-3 bg-transparent"
              >
                <Trophy className="w-5 h-5 mr-2" />
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-gray-200">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Code className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-black">Algorithmic Challenges</CardTitle>
              <CardDescription className="text-gray-600">
                Solve complex coding problems to unlock the next phase
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-700">
              <ul className="space-y-2">
                <li>• Multi-language code editor</li>
                <li>• Real-time code execution</li>
                <li>• Judge0 API integration</li>
                <li>• Flag-based progression</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-black">Buildathon Projects</CardTitle>
              <CardDescription className="text-gray-600">
                Create innovative solutions to restore the OASIS
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-700">
              <ul className="space-y-2">
                <li>• GitHub integration</li>
                <li>• Project submissions</li>
                <li>• Team collaboration</li>
                <li>• Progressive unlocking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-black">Secure Platform</CardTitle>
              <CardDescription className="text-gray-600">Enterprise-grade security and team management</CardDescription>
            </CardHeader>
            <CardContent className="text-gray-700">
              <ul className="space-y-2">
                <li>• Firebase authentication</li>
                <li>• Role-based access</li>
                <li>• Admin dashboard</li>
                <li>• Real-time monitoring</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2045 OASIS Protocol. The future is in your code.</p>
        </div>
      </footer>
    </div>
  )
}
