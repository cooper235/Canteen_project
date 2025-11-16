import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/orders/:path*",
    "/profile/:path*",
    "/manage/:path*",
    "/cart/:path*",
  ],
};