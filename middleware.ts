import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Make sure /dashboard is in your public routes if you have authentication
  const publicRoutes = ['/login', '/register', '/dashboard']
  
  // Your middleware logic here
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}