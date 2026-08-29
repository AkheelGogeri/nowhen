import { neon } from "@neondatabase/serverless";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { sendEmail, orderConfirmationEmail } from "@/lib/email";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await sql`
        UPDATE orders SET status = 'failed'
        WHERE razorpay_order_id = ${razorpay_order_id}
      `;
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const result = await sql`
      UPDATE orders
      SET status = 'paid', razorpay_payment_id = ${razorpay_payment_id}
      WHERE razorpay_order_id = ${razorpay_order_id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = result[0];
    const { subject, html } = orderConfirmationEmail(order);
    sendEmail({ to: order.customer_email, subject, html }).catch((err) =>
      console.error("Failed to send order confirmation email:", err)
    );

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
