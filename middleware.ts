import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // No need to rewrite since pages exist in app/(main)
  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}