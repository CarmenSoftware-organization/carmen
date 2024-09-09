import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

const publicRoutes = ["/", "/login", "/signup"];
const mainRoutes = [
  "/dashboard",
  "/procurement",
  "/store-operations",
  "/inventory-management",
  "/operational-planning",
  "/production",
  "/reporting-analytics",
  "/finance",
  "/system-administration",
  "/help-support"
];

export function middleware(request: Request) {
  const url = new URL(request.url);
  const cookieStore = cookies();
  const isLoggedIn = cookieStore.get('isLoggedIn')?.value === 'true';
  
  // if (!publicRoutes.includes(url.pathname) && !mainRoutes.some(route => url.pathname.startsWith(route))) {
  //   if (!isLoggedIn) {
  //     return NextResponse.redirect(new URL('/login', request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};