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

// Record a sale made in person. The item is described freely (it may be a custom
// tee that isn't on the website). If product_id is given, that website product's
// stock is reduced; otherwise stock is left alone.
export async function POST(req) {
  try {
    const { description, product_id, size, qty, unit_price, customer_name, note, sold_on } = await req.json();

    const quantity = Math.floor(Number(qty));
    const price = Math.round(Number(unit_price));
    const name = String(description || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Describe what was sold" }, { status: 400 });
    }
    if (!(quantity >= 1) || !(price >= 0)) {
      return NextResponse.json({ error: "Enter a quantity and the price it sold for" }, { status: 400 });
    }

    let productId = null;
    let cleanSize = String(size || "").trim() || null;

    if (product_id) {
      const [product] = await sql`SELECT id, sizes FROM products WHERE id = ${product_id}`;
      if (!product) {
        return NextResponse.json({ error: "That website product no longer exists" }, { status: 404 });
      }
      if (product.sizes?.length > 0 && !product.sizes.includes(cleanSize)) {
        return NextResponse.json({ error: "Pick one of that product's sizes" }, { status: 400 });
      }
      productId = product.id;
    }

    const items = [{ id: productId, name, price, size: cleanSize, qty: quantity }];
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

    if (productId) await deductStock(items);

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record sale" }, { status: 500 });
  }
}
