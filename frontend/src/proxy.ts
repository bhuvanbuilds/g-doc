import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

// Refreshes the Supabase session and gates app pages behind sign-in.
export async function proxy(request: NextRequest) {
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isPublic = pathname === "/" || pathname === "/login";
  if (!user && !isPublic) {
    const to = new URL("/login", request.url);
    to.searchParams.set("next", pathname);
    return NextResponse.redirect(to);
  }
  if (user && pathname === "/login") return NextResponse.redirect(new URL("/home", request.url));
  return response;
}

export const config = {
  matcher: ["/", "/login", "/home/:path*", "/dashboard/:path*", "/investigate/:path*"],
};
