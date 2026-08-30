import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

function totalStock(stockBySize, stockQty) {
  if (stockBySize && Object.keys(stockBySize).length > 0) {
    return Object.values(stockBySize).reduce((sum, n) => sum + Math.max(0, Number(n) || 0), 0);
  }
  return Math.max(0, Number(stockQty) || 0);
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { stock_by_size, stock_qty } = await req.json();

    // Clamp every count to a non-negative integer.
    let cleanBySize = null;
    if (stock_by_size && typeof stock_by_size === "object") {
      cleanBySize = {};
      for (const [size, qty] of Object.entries(stock_by_size)) {
        cleanBySize[size] = Math.max(0, Math.floor(Number(qty) || 0));
      }
    }
    const cleanQty = stock_qty != null ? Math.max(0, Math.floor(Number(stock_qty) || 0)) : null;

    const total = totalStock(cleanBySize, cleanQty);
    const inStock = total > 0;

    const result = cleanBySize
      ? await sql`
          UPDATE products
          SET stock_by_size = ${JSON.stringify(cleanBySize)}, in_stock = ${inStock}
          WHERE id = ${id}
          RETURNING *
        `
      : await sql`
          UPDATE products
          SET stock_qty = ${cleanQty}, in_stock = ${inStock}
          WHERE id = ${id}
          RETURNING *
        `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}
