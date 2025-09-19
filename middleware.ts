import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Protect dashboard routes and settings
  const protectedMatchers = [/^\/polls(\/.*)?$/, /^\/settings(\/.*)?$/];
  const url = new URL(request.url);
  const isProtected = protectedMatchers.some((re) => re.test(url.pathname));
  if (!isProtected) return NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", url.pathname + (url.search || ""));
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/polls",
    "/polls/:path*",
    "/settings",
    "/settings/:path*",
  ],
};