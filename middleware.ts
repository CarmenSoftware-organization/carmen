import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('auth-token') // In production, use a proper auth token

  // Get the pathname of the request (e.g. /, /dashboard, /about)
  const path = request.nextUrl.pathname

  // If the user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !path.startsWith('/signin')) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // If the user is authenticated and trying to access auth pages
  if (isAuthenticated && path.startsWith('/signin')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}