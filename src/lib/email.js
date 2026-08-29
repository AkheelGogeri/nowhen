import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "Nowhen <onboarding@resend.dev>";

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipped sending "${subject}" to ${to}`);
    return { skipped: true };
  }

  try {
    return await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    console.error("[email] Failed to send:", error);
    return { error };
  }
}

export function orderConfirmationEmail(order) {
  const items = order.items
    .map((item) => `<li>${item.qty}× ${item.name}${item.size ? ` (${item.size})` : ""} — ₹${item.price * item.qty}</li>`)
    .join("");

  return {
    subject: `Order #${order.id} confirmed — Nowhen`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Thanks for your order, ${order.customer_name}!</h2>
        <p>Order #${order.id} has been confirmed.</p>
        <ul>${items}</ul>
        <p><strong>Total: ₹${order.amount}</strong></p>
        <p>We'll email you again once it ships.</p>
      </div>
    `,
  };
}

export function orderStatusEmail(order, status) {
  const messages = {
    shipped: "Your order is on its way!",
    delivered: "Your order has been delivered.",
  };

  return {
    subject: `Order #${order.id} update — Nowhen`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>${messages[status] || `Order status: ${status}`}</h2>
        <p>Order #${order.id} — ₹${order.amount}</p>
      </div>
    `,
  };
}

export function passwordResetEmail(resetUrl) {
  return {
    subject: "Reset your Nowhen password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Reset your password</h2>
        <p>Click the link below to set a new password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  };
}
