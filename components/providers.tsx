"use client"

import type React from "react"
import { AuthProvider } from "@/lib/auth-context"
import { useEffect, useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black text-xl">Loading...</div>
      </div>
    )
  }

  return <AuthProvider>{children}</AuthProvider>
}
