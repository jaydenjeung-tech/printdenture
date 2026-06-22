import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isStaleAuthError(message: string | undefined) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes("refresh token not found") ||
    normalized.includes("invalid refresh token")
  );
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

async function getAccountStatus(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("account_status, role, is_admin")
    .eq("id", userId)
    .single();

  if (data?.role === "admin" || data?.is_admin) return "approved";
  return data?.account_status ?? "approved";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && isStaleAuthError(error.message)) {
    await supabase.auth.signOut();
  }

  const activeUser = error && isStaleAuthError(error.message) ? null : user;

  const protectedRoutes = ["/dashboard", "/order", "/admin", "/lab"];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !activeUser) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    const redirectResponse = NextResponse.redirect(loginUrl);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if (isProtected && activeUser) {
    const status = await getAccountStatus(supabase, activeUser.id);
    if (status === "pending" || status === "rejected") {
      const pendingUrl = new URL("/auth", request.url);
      pendingUrl.searchParams.set("status", status);
      await supabase.auth.signOut();
      const redirectResponse = NextResponse.redirect(pendingUrl);
      copyCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }
  }

  if (
    (pathname === "/login" || pathname === "/signup" || pathname.startsWith("/auth")) &&
    !pathname.startsWith("/auth/callback") &&
    activeUser
  ) {
    const next = request.nextUrl.searchParams.get("next");
    const destination =
      next?.startsWith("/") && !next.startsWith("//")
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
