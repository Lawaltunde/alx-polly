import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Protect dashboard routes and settings
  const protectedMatchers = [/^\/polls(\/.*)?$/, /^\/settings(\/.*)?$/];
  const url = new URL(request.url);
  const isProtected = protectedMatchers.some((re) => re.test(url.pathname));
  if (!isProtected) return NextResponse.next();

  // Allow non-GET (e.g., Server Actions POST) to pass through so actions can handle auth
  // This avoids breaking the special Server Action fetch contract with redirects from middleware
  if (request.method !== 'GET') {
    return NextResponse.next();
  }

  // Create a response we can attach refreshed auth cookies to
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          try {
            response.cookies.set({ name, value, ...options });
          } catch {
            // ignore in middleware if setting fails
          }
        },
        remove: (name, options) => {
          try {
            response.cookies.set({ name, value: "", ...options, maxAge: 0 });
          } catch {
            // ignore in middleware if removing fails
          }
        },
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

  // Return the response so any refreshed cookies are forwarded
  return response;
}

export const config = {
  matcher: [
    "/polls",
    "/polls/:path*",
    "/settings",
    "/settings/:path*",
  ],
};