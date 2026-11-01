import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 보호된 경로들
const protectedRoutes = [
  "/settings",
  "/write",
  "/profile/edit",
  "/payment-history",
];

// 공개 경로들 (인증 불필요)
const publicRoutes = [
  "/",
  "/home",
  "/feed",
  "/explore",
  "/search",
  "/board",
  "/support",
  "/email-verification",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Reject missing, unknown or repeated card identities before streaming begins.
  if (pathname === "/card") {
    const identities = request.nextUrl.searchParams.getAll("who");
    if (identities.length !== 1 || identities[0] !== "khpark") {
      return new NextResponse("명함을 찾을 수 없습니다.", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex, nofollow" },
      });
    }
  }

  // 정적 파일이나 API 경로는 건너뛰기
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 보호된 경로 확인
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 공개 경로 확인
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 보호된 경로이고 쿠키에 id_token이 없으면 리디렉트
  if (isProtectedRoute) {
    const idToken = request.cookies.get("id_token");

    if (!idToken) {
      const signInUrl = new URL("/", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
