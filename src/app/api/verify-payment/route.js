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

    const existing = await sql`SELECT * FROM orders WHERE razorpay_order_id = ${razorpay_order_id}`;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency guard: Razorpay's handler or a page reload could call this twice for
    // the same order. Only decrement stock and mark paid the first time.
    if (["paid", "shipped", "delivered"].includes(existing[0].status)) {
      return NextResponse.json({ success: true, order: existing[0] });
    }

    const result = await sql`
      UPDATE orders
      SET status = 'paid', razorpay_payment_id = ${razorpay_payment_id}
      WHERE razorpay_order_id = ${razorpay_order_id} AND status != 'paid'
      RETURNING *
    `;

    if (result.length === 0) {
      // Lost the race to a concurrent request — treat as already processed.
      const [current] = await sql`SELECT * FROM orders WHERE razorpay_order_id = ${razorpay_order_id}`;
      return NextResponse.json({ success: true, order: current });
    }

    const order = result[0];

    // Decrement stock for each purchased item now that payment is confirmed.
    for (const item of order.items) {
      const [product] = await sql`SELECT stock_by_size, stock_qty FROM products WHERE id = ${item.id}`;
      if (!product) continue;

      if (item.size) {
        const stockBySize = product.stock_by_size || {};
        const remaining = Math.max(0, Number(stockBySize[item.size] || 0) - item.qty);
        const updated = { ...stockBySize, [item.size]: remaining };
        const total = Object.values(updated).reduce((sum, n) => sum + (Number(n) || 0), 0);
        await sql`
          UPDATE products SET stock_by_size = ${JSON.stringify(updated)}, in_stock = ${total > 0}
          WHERE id = ${item.id}
        `;
      } else {
        const remaining = Math.max(0, Number(product.stock_qty || 0) - item.qty);
        await sql`
          UPDATE products SET stock_qty = ${remaining}, in_stock = ${remaining > 0}
          WHERE id = ${item.id}
        `;
      }
    }

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
