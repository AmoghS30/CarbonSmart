import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Public paths that don't require authentication
        const publicPaths = [
          '/',
          '/auth/signin',
          '/auth/signup',
          '/auth/company-signup',
          '/auth/forgot-password',
        ]

        // Check if the current path is public
        if (publicPaths.includes(path)) {
          return true
        }

        // All other paths require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/activities/:path*',
    '/marketplace/:path*',
    '/api/user/:path*',
  ],
}
