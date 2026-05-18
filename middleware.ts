import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isStaleAuthError(message: string | undefined) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes("refresh token not found")
    || normalized.includes("invalid refresh token");
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  if (
    host.includes("printcrown.com")
    && pathname !== "/coming-soon"
    && !pathname.startsWith("/_next")
    && !pathname.startsWith("/api")
    && !pathname.match(/\.(ico|png|jpg|svg|webp|woff2?)$/)
  ) {
    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error && isStaleAuthError(error.message)) {
    await supabase.auth.signOut();
  }

  const activeUser = error && isStaleAuthError(error.message) ? null : user;

  const protectedRoutes = ["/dashboard", "/order"];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !activeUser) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    const redirectResponse = NextResponse.redirect(loginUrl);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if (pathname.startsWith("/auth") && activeUser) {
    const next = request.nextUrl.searchParams.get("next");
    const destination = next?.startsWith("/") && !next.startsWith("//")
      ? new URL(next, request.url)
      : new URL("/dashboard", request.url);
    const redirectResponse = NextResponse.redirect(destination);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
