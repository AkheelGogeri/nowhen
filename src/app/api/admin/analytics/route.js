import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

const PAID_STATUSES = ["paid", "shipped", "delivered"];

export async function GET() {
  try {
    const [summary] = await sql`
      SELECT
        COALESCE(SUM(amount), 0)::int AS revenue,
        COUNT(*)::int AS paid_orders
      FROM orders
      WHERE status = ANY(${PAID_STATUSES})
    `;

    const [pending] = await sql`
      SELECT COUNT(*)::int AS pending_orders FROM orders WHERE status = 'created'
    `;

    const bestSellers = await sql`
      SELECT item->>'name' AS name, SUM((item->>'qty')::int)::int AS total_qty
      FROM orders, jsonb_array_elements(items) AS item
      WHERE status = ANY(${PAID_STATUSES})
      GROUP BY item->>'name'
      ORDER BY total_qty DESC
      LIMIT 5
    `;

    const recentOrders = await sql`
      SELECT id, customer_name, amount, status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `;

    const [productCounts] = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE in_stock = false)::int AS out_of_stock
      FROM products
    `;

    return NextResponse.json({
      revenue: summary.revenue,
      paidOrders: summary.paid_orders,
      pendingOrders: pending.pending_orders,
      bestSellers,
      recentOrders,
      totalProducts: productCounts.total,
      outOfStock: productCounts.out_of_stock,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
