import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    username: string
    role: string
  }
}

export function verifyAdminToken(request: NextRequest): { isValid: boolean; user?: any } {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isValid: false }
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_secret_key_change_in_production')

    if (typeof decoded === 'object' && decoded.role === 'admin') {
      return { isValid: true, user: decoded }
    }

    return { isValid: false }
  } catch (error) {
    return { isValid: false }
  }
}

export function requireAdmin(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return async (request: NextRequest) => {
    const { isValid, user } = verifyAdminToken(request)
    
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = user

    return handler(authenticatedRequest)
  }
}