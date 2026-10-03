import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { sendEmail, orderStatusEmail } from "@/lib/email";
import { deductStock, restoreStock, STOCK_DEDUCTED_STATUSES } from "@/lib/inventory";

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

    const [before] = await sql`SELECT status FROM orders WHERE id = ${id}`;
    if (!before) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const result = await sql`
      UPDATE orders SET status = ${status} WHERE id = ${id} RETURNING *
    `;
    const order = result[0];

    // Marking an unpaid order as paid by hand (e.g. you saw the payment in Razorpay)
    // is the moment the stock should come out, same as an automatic payment would.
    const wasDeducted = STOCK_DEDUCTED_STATUSES.includes(before.status);
    const isDeducted = STOCK_DEDUCTED_STATUSES.includes(status);
    if (!wasDeducted && isDeducted) {
      await deductStock(order.items);
    }

    if (NOTIFY_STATUSES.includes(status) && order.customer_email && order.source !== "offline") {
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

// ?restock=true puts the items back into stock (only if they had been taken out).
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const restock = new URL(req.url).searchParams.get("restock") === "true";

    const [order] = await sql`SELECT * FROM orders WHERE id = ${id}`;
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await sql`DELETE FROM orders WHERE id = ${id}`;

    if (restock && STOCK_DEDUCTED_STATUSES.includes(order.status)) {
      await restoreStock(order.items);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
