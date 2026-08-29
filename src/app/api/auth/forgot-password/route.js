import { neon } from "@neondatabase/serverless";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { sendEmail, passwordResetEmail } from "@/lib/email";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const users = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email})`;

    // Always return success, even if the account doesn't exist — don't leak which emails are registered.
    if (users.length > 0) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await sql`
        INSERT INTO password_resets (token, user_id, expires_at)
        VALUES (${token}, ${users[0].id}, ${expiresAt.toISOString()})
      `;

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;
      const { subject, html } = passwordResetEmail(resetUrl);
      await sendEmail({ to: email, subject, html });
    }

    return NextResponse.json({ success: true, message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
