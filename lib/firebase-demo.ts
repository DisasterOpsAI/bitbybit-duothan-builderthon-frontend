// Demo Firebase configuration for testing without real Firebase project
// This simulates Firebase auth for development/testing purposes

export const demoAuth = {
  currentUser: null,
  signInWithPopup: async (provider: any) => {
    // Simulate Google sign-in
    const mockUser = {
      uid: 'demo-user-123',
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: 'https://via.placeholder.com/150'
    }
    
    return {
      user: mockUser,
      credential: null
    }
  },
  signOut: async () => {
    console.log('Demo sign out')
  },
  onAuthStateChanged: (callback: any) => {
    // Simulate auth state change
    setTimeout(() => {
      callback(null) // No user initially
    }, 100)
    
    return () => {} // Unsubscribe function
  }
}

export const demoGoogleProvider = {
  providerId: 'google.com',
  setCustomParameters: (params: any) => {
    console.log('Demo Google provider params:', params)
  }
}

export const demoDb = {
  collection: (name: string) => ({
    add: async (data: any) => {
      console.log(`Demo Firestore add to ${name}:`, data)
      return { id: `demo-${Date.now()}` }
    },
    doc: (id: string) => ({
      get: async () => ({
        exists: true,
        data: () => ({ name: 'Demo Team', totalPoints: 0 })
      }),
      set: async (data: any) => {
        console.log(`Demo Firestore set ${name}/${id}:`, data)
      }
    }),
    where: (field: string, op: string, value: any) => ({
      get: async () => ({
        empty: true,
        docs: []
      })
    })
  })
}

// Use this for development when Firebase is not set up
export const isDemoMode = process.env.NODE_ENV === 'development' && 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo-api-key'

export function getFirebaseConfig() {
  if (isDemoMode) {
    return {
      auth: demoAuth,
      db: demoDb,
      googleProvider: demoGoogleProvider
    }
  }
  
  // Import real Firebase in production
  return import('./firebase')
}