import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { sendEmail, orderStatusEmail } from "@/lib/email";

const sql = neon(process.env.DATABASE_URL);

const VALID_STATUSES = ["created", "paid", "shipped", "delivered", "failed"];
const NOTIFY_STATUSES = ["shipped", "delivered"];

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await sql`
      UPDATE orders SET status = ${status} WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = result[0];
    if (NOTIFY_STATUSES.includes(status)) {
      const { subject, html } = orderStatusEmail(order, status);
      sendEmail({ to: order.customer_email, subject, html }).catch((err) =>
        console.error("Failed to send order status email:", err)
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
