import { withAuth } from "next-auth/middleware"

export default withAuth(
  function proxy(req) {
    // Add any additional proxy logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*']
}