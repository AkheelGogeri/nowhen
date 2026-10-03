import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { deductStock } from "@/lib/inventory";

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// Record a sale made in person (shop, college, event...). Price is whatever it was
// actually sold for, so it can differ from the listed price.
export async function POST(req) {
  try {
    const { product_id, size, qty, unit_price, customer_name, note, sold_on } = await req.json();

    const quantity = Math.floor(Number(qty));
    const price = Math.round(Number(unit_price));
    if (!product_id || !(quantity >= 1) || !(price >= 0)) {
      return NextResponse.json({ error: "Pick a product, a quantity, and a price" }, { status: 400 });
    }

    const [product] = await sql`SELECT id, name, sizes FROM products WHERE id = ${product_id}`;
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (product.sizes?.length > 0 && !size) {
      return NextResponse.json({ error: "Pick a size" }, { status: 400 });
    }

    const items = [
      { id: product.id, name: product.name, price, size: product.sizes?.length > 0 ? size : null, qty: quantity },
    ];
    const amount = price * quantity;

    let createdAt = new Date();
    if (sold_on) {
      const parsed = new Date(`${sold_on}T12:00:00`);
      if (!isNaN(parsed.getTime())) createdAt = parsed;
    }

    const inserted = await sql`
      INSERT INTO orders (customer_name, items, amount, status, source, note, created_at)
      VALUES (${customer_name?.trim() || "Offline sale"}, ${JSON.stringify(items)}, ${amount}, 'delivered', 'offline', ${note?.trim() || null}, ${createdAt.toISOString()})
      RETURNING *
    `;

    await deductStock(items);

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record sale" }, { status: 500 });
  }
}
