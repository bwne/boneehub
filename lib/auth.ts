export const SESSION_COOKIE_NAME = "admin_session";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  // Set SESSION_SECRET in your Vercel project's environment variables for production.
  return process.env.SESSION_SECRET || "dev-secret-change-me";
}

async function hmac(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Buffer.from(sig).toString("hex");
}

export async function createSessionToken(): Promise<string> {
  const secret = getSecret();
  const payload = `admin:${Date.now()}`;
  const sig = await hmac(payload, secret);
  const payloadB64 = Buffer.from(payload).toString("base64url");
  return `${payloadB64}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;

  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString();
  } catch {
    return false;
  }

  const secret = getSecret();
  const expected = await hmac(payload, secret);
  if (expected !== sig) return false;

  const ts = Number(payload.split(":")[1]);
  if (!Number.isFinite(ts)) return false;

  return Date.now() - ts < THIRTY_DAYS_MS;
}
