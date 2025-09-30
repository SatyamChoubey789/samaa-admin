import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if accessing admin routes
  if (pathname.startsWith("/admin")) {
    // Check for auth cookie (you might need to adjust cookie name based on your backend)
    const authCookie = request.cookies.get("token") || request.cookies.get("jwt")

    if (!authCookie) {
      // Redirect to login if no auth cookie
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
