/**
 * NextAuth Configuration
 *
 * Authentication configuration for the Carmen ERP application.
 * This is a placeholder configuration for development purposes.
 */

import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  // Placeholder configuration for development
  // In production, this should include proper providers, callbacks, etc.
  providers: [],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
}
