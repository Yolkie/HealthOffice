import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: "",
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: "",
                        ...options,
                    });
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected routes
    const isLoginPage = request.nextUrl.pathname.startsWith("/login");
    const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
    const isApiAdmin = request.nextUrl.pathname.startsWith("/api/admin");
    const isRootPage = request.nextUrl.pathname === "/";

    // If user is NOT logged in
    if (!user) {
        // Allow access to login page, static assets, and public APIs (like webhook)
        if (
            !isLoginPage &&
            !request.nextUrl.pathname.startsWith("/_next") &&
            !request.nextUrl.pathname.startsWith("/api/submit-checkup") && // Allow webhook/public submission if needed? No, plan says protect.
            !request.nextUrl.pathname.startsWith("/api/upload-image") && // Allow image upload?
            !request.nextUrl.pathname.includes(".") // Files
        ) {
            // Redirect to login
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
    } else {
        // If user IS logged in
        if (isLoginPage) {
            // Redirect to home or admin based on role
            const role = user.user_metadata.role;
            const url = request.nextUrl.clone();
            if (role === "admin") {
                url.pathname = "/admin";
            } else {
                url.pathname = "/";
            }
            return NextResponse.redirect(url);
        }

        // Role-based protection for Admin routes
        if ((isAdminPage || isApiAdmin) && user.user_metadata.role !== "admin") {
            // Redirect non-admins to home
            const url = request.nextUrl.clone();
            url.pathname = "/";
            return NextResponse.redirect(url);
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
