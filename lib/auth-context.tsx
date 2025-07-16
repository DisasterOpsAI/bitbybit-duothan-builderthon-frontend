"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<any>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Dynamically import Firebase to avoid SSR issues
    const initAuth = async () => {
      try {
        const { auth } = await import("./firebase")
        const { onAuthStateChanged } = await import("firebase/auth")
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user)
          setLoading(false)
        })
        return unsubscribe
      } catch (error) {
        console.error("Error initializing auth:", error)
        setLoading(false)
      }
    }

    let unsubscribe: (() => void) | undefined

    initAuth().then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      const { auth, googleProvider } = await import("./firebase")
      const { signInWithPopup } = await import("firebase/auth")
      const result = await signInWithPopup(auth, googleProvider)
      return result
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const { auth } = await import("./firebase")
      const { signOut } = await import("firebase/auth")
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
