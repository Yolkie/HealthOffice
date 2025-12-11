import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// Helper to check if current user is admin
async function checkAdmin() {
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

    if (!user || user.user_metadata.role !== "admin") {
        return false;
    }
    return true;
}

export async function GET() {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) {
            throw error;
        }

        // Map users to a friendly format
        const formattedUsers = users.map((u) => ({
            id: u.id,
            email: u.email,
            username: u.user_metadata.username || u.email?.split("@")[0],
            role: u.user_metadata.role || "reporter",
            branch: u.user_metadata.branch || "Not Assigned",
            createdAt: u.created_at,
        }));

        return NextResponse.json({ users: formattedUsers });
    } catch (error: any) {
        console.error("List users error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to list users" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { username, password, role, branch } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        const email = `${username}@healthoffice.local`;

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                username,
                role: role || "reporter",
                branch: branch || "Not Assigned",
            },
        });

        if (error) {
            throw error;
        }

        return NextResponse.json({ user: data.user });
    } catch (error: any) {
        console.error("Create user error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create user" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("id");

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete user error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete user" },
            { status: 500 }
        );
    }
}
