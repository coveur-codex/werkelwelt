import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/admin", "/parent", "/kind", "/plus-werkstatt"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) return NextResponse.next();
  const session = request.cookies.get("ww_session")?.value;
  if (!session) return NextResponse.redirect(new URL("/login", request.url));
  const [role] = session.split(":");
  if (pathname.startsWith("/admin") && role !== "admin") return NextResponse.redirect(new URL("/parent", request.url));
  if ((pathname.startsWith("/parent") || pathname.startsWith("/kind") || pathname.startsWith("/plus-werkstatt")) && role !== "parent") return NextResponse.redirect(new URL("/admin", request.url));
  return NextResponse.next();
}
