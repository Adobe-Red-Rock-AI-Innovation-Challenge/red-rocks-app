export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (typeof body?.credential !== "string" || typeof body?.nonce !== "string" || !clientId) {
    return Response.json({ error: "Invalid sign-in" }, { status: 400 });
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`,
  );
  const claims = await response.json().catch(() => null);

  // Google checks the signature and expiry; these checks tie the token to this app and this attempt.
  const valid =
    response.ok &&
    claims?.aud === clientId &&
    claims?.nonce === body.nonce &&
    claims?.email_verified === "true";
  if (!valid) return Response.json({ error: "Invalid sign-in" }, { status: 401 });

  return Response.json({
    name: claims.name ?? claims.email,
    email: claims.email,
    picture: claims.picture,
    provider: "google",
  });
}
