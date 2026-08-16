import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { getIkhokhaConfig } from "@/lib/payments/ikhokha";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Development-only diagnostic endpoint is not available in production." }, { status: 404 });
  }

  const { baseUrl, applicationId, applicationSecret, externalEntityId, returnUrl } = getIkhokhaConfig();
  const webhookUrl = `${returnUrl.replace(/\/$/, "")}/api/payments/ikhokha/webhook`;

  return NextResponse.json({
    mode: "development-only",
    configured: {
      baseUrl: Boolean(baseUrl),
      applicationId: Boolean(applicationId),
      applicationSecret: Boolean(applicationSecret),
      externalEntityId: Boolean(externalEntityId),
      webhookUrl: Boolean(webhookUrl),
    },
    values: {
      baseUrl: baseUrl || null,
      applicationId: applicationId || null,
      externalEntityId: externalEntityId || null,
      webhookUrl,
      returnUrl: returnUrl || null,
      signingAlgorithm: "HMAC-SHA256(path + rawRequestBody, AppSecret)",
      requiredHeaders: ["IK-APPID", "IK-SIGN"],
    },
    note: "This endpoint is intentionally development-only and does not change payment behavior or expose the App Secret.",
  });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Development-only diagnostic endpoint is not available in production." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const path = typeof body?.path === "string" ? body.path : "/api/payments/ikhokha/webhook";
    const rawBody = typeof body?.rawBody === "string" ? body.rawBody : JSON.stringify(body?.payload ?? {});
    const { applicationId, applicationSecret } = getIkhokhaConfig();

    if (!applicationSecret || !applicationId) {
      return NextResponse.json(
        {
          error: "iKhokha credentials are not configured in this environment.",
          configured: {
            applicationId: Boolean(applicationId),
            applicationSecret: Boolean(applicationSecret),
          },
        },
        { status: 503 },
      );
    }

    const signature = createHmac("sha256", applicationSecret).update(`${path}${rawBody}`).digest("hex");

    return NextResponse.json({
      path,
      rawBody,
      signature,
      headers: {
        "IK-APPID": applicationId,
        "IK-SIGN": signature,
      },
      note: "Use this only for local development testing. The App Secret remains server-side and is not exposed in the app code or browser client.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to compute a dev signature.",
      },
      { status: 500 },
    );
  }
}
