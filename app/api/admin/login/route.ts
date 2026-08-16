import { NextResponse } from "next/server";
import { getSupabasePublicClient, setAdminSessionCookie } from "@/lib/auth/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required to sign in." }, { status: 400 });
    }

    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message ?? "Invalid admin credentials." }, { status: 401 });
    }

    const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);

    if (allowedEmails.length > 0 && !allowedEmails.includes(email.trim().toLowerCase())) {
      return NextResponse.json({ error: "This account does not have administrator access." }, { status: 403 });
    }

    await setAdminSessionCookie(email, data.session.access_token);

    return NextResponse.json({ success: true, email });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to sign in.",
      },
      { status: 500 },
    );
  }
}
