import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

// IMPORTANT: In production (Vercel), set ADMIN_PASSWORD as an environment
// variable instead of relying on the fallback below. This code runs only on
// the server, so the value is never sent to the browser — but env vars are
// still the safer, rotatable way to store it.
const FALLBACK_PASSWORD = "R7!vQ2#Lm9@Xp4$Zn8^Kt1&Wc6*Hs3";

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const correctPassword = process.env.ADMIN_PASSWORD || FALLBACK_PASSWORD;

  if (!body.password || body.password !== correctPassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
