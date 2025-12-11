import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: "", ...options });
                    },
                },
            }
        );

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get username from metadata or email
        const username = user.user_metadata.username || user.email?.split("@")[0];

        if (!username) {
            return NextResponse.json({ error: "User profile incomplete" }, { status: 400 });
        }

        const { data: submissions, error } = await supabase
            .from("Submission")
            .select("*, properties:PropertyReport(*)")
            .eq("reporterName", username)
            .order("submissionDate", { ascending: false });

        if (error) {
            console.error("Supabase error:", error);
            throw new Error("Failed to fetch submissions");
        }

        return NextResponse.json({ submissions });
    } catch (error: any) {
        console.error("My submissions error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to load submissions" },
            { status: 500 }
        );
    }
}
