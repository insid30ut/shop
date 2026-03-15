import { InsforgeMiddleware } from "@insforge/nextjs/middleware";

export default InsforgeMiddleware({
  baseUrl:
    process.env.NEXT_PUBLIC_INSFORGE_BASE_URL ||
    "https://mtirgjf3.us-east.insforge.app",
  publicRoutes: [
    "/",
    "/product(.*)",
    "/api/webhook/stripe", // Ignore webhook protection for auth
  ],
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
