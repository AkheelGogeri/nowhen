import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const sql = neon(process.env.DATABASE_URL);

export const SESSION_COOKIE = "nowhen_session";
const SESSION_DAYS = 30;

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sql`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (${token}, ${userId}, ${expiresAt.toISOString()})
  `;
  return { token, expiresAt };
}

export async function deleteSession(token) {
  if (!token) return;
  await sql`DELETE FROM sessions WHERE token = ${token}`;
}

export async function getUserFromToken(token) {
  if (!token) return null;
  const result = await sql`
    SELECT users.id, users.name, users.email, users.phone, users.address
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token = ${token} AND sessions.expires_at > NOW()
  `;
  return result[0] || null;
}
