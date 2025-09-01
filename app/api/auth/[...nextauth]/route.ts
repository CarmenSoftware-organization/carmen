/**
 * NextAuth.js API Route Handler
 * 
 * Handles all authentication requests through NextAuth.js including
 * Keycloak OIDC authentication, session management, and callbacks.
 * 
 * @author Carmen ERP Team
 */

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/next-auth.config'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }