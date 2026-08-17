import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * DEVELOPMENT ONLY: Creates a test admin user.
 * Should be removed before production deployment.
 */
export async function POST(request: Request) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "This endpoint is only available in development." }, { status: 403 });
    }

    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "admin@example.com";
    const password = typeof body?.password === "string" ? body.password : "TestPassword123!";

    const adminClient = getSupabaseAdminClient();

    // Create or get user in auth.users
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      // User might already exist, try to get them
      const { data: existingUsers, error: listError } = await adminClient.auth.admin.listUsers();
      
      let userId: string | undefined;
      if (!listError && existingUsers?.users) {
        const foundUser = existingUsers.users.find(u => u.email === email);
        if (foundUser) {
          userId = foundUser.id;
        }
      }

      if (!userId) {
        return NextResponse.json(
          { error: authError.message || "Failed to create auth user." },
          { status: 400 },
        );
      }

      // Add to admin_users if not already there
      const { data: existingAdmin } = await adminClient
        .from("admin_users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (!existingAdmin) {
        await adminClient.from("admin_users").insert({
          user_id: userId,
          email,
          is_active: true,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Admin user already existed",
        email,
      });
    }

    // Add user to admin_users table
    const { error: adminInsertError } = await adminClient
      .from("admin_users")
      .insert({
        user_id: authUser.user.id,
        email,
        is_active: true,
      });

    if (adminInsertError) {
      return NextResponse.json(
        { error: adminInsertError.message || "Failed to create admin record." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      email,
      password,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to setup admin.",
      },
      { status: 500 },
    );
  }
}
