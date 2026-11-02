// Admin sessions as signed tokens: "<expiry ms>.<HMAC-SHA256 of expiry>".
// The cookie proves "the server issued this before <expiry>" without containing the
// password, and nobody can forge or extend one without the secret.
// Uses Web Crypto (globalThis.crypto.subtle) so it runs both in middleware (edge)
// and in normal API routes (Node).

export const ADMIN_COOKIE = "nowhen_admin";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Secret used to sign tokens. ADMIN_SESSION_SECRET can be set to a long random
// string; otherwise it is derived from ADMIN_PASSWORD, so changing the password
// also logs out every existing admin session.
async function getKey() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    toHex(await crypto.subtle.digest("SHA-256", encoder.encode(`nowhen-admin-session:${process.env.ADMIN_PASSWORD}`)));
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

async function sign(value) {
  const key = await getKey();
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

// Compares every character so the time taken doesn't leak how much of a guess was right.
export function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createAdminToken() {
  const expires = Date.now() + ADMIN_SESSION_SECONDS * 1000;
  return `${expires}.${await sign(String(expires))}`;
}

export async function isValidAdminToken(token) {
  if (!token || !process.env.ADMIN_PASSWORD) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < Date.now()) return false;
  return safeEqual(signature, await sign(expires));
}

export const adminCookieOptions = {
  httpOnly: true,
  // Browsers only send secure cookies over HTTPS. Off in dev so `npm run dev`
  // still works when opened from a phone over plain http on the LAN.
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};
