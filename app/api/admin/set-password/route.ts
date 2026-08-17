import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/server";

const ADMIN_PASSWORD_RESET_SECRET = process.env.ADMIN_PASSWORD_RESET_SECRET;

export async function POST(request: Request) {
  try {
    const providedSecret = request.headers.get("x-admin-password-reset-secret");

    if (!ADMIN_PASSWORD_RESET_SECRET || providedSecret !== ADMIN_PASSWORD_RESET_SECRET) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);

    if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
      return NextResponse.json({ error: "This account is not permitted to receive a direct admin password reset." }, { status: 403 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: users, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();

    if (listUsersError) {
      throw new Error(listUsersError.message);
    }

    const targetUser = users.users.find((user) => user.email?.toLowerCase() === email);

    if (!targetUser) {
      return NextResponse.json({ error: "No matching admin user found." }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      email: targetUser.email ?? email,
      userId: data.user?.id ?? targetUser.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to update the admin password.",
      },
      { status: 500 },
    );
  }
}
