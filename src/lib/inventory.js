import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Statuses where the sale is real and stock has already been taken out.
export const STOCK_DEDUCTED_STATUSES = ["paid", "shipped", "delivered"];

function applyDelta(product, item, sign) {
  const qty = Number(item.qty) || 0;
  if (item.size) {
    const bySize = { ...(product.stock_by_size || {}) };
    bySize[item.size] = Math.max(0, Number(bySize[item.size] || 0) + sign * qty);
    const total = Object.values(bySize).reduce((s, n) => s + (Number(n) || 0), 0);
    return { stock_by_size: bySize, in_stock: total > 0 };
  }
  const next = Math.max(0, Number(product.stock_qty || 0) + sign * qty);
  return { stock_qty: next, in_stock: next > 0 };
}

async function adjust(items, sign) {
  for (const item of items || []) {
    const [product] = await sql`SELECT stock_by_size, stock_qty FROM products WHERE id = ${item.id}`;
    if (!product) continue;
    const next = applyDelta(product, item, sign);
    if (item.size) {
      await sql`
        UPDATE products SET stock_by_size = ${JSON.stringify(next.stock_by_size)}, in_stock = ${next.in_stock}
        WHERE id = ${item.id}
      `;
    } else {
      await sql`
        UPDATE products SET stock_qty = ${next.stock_qty}, in_stock = ${next.in_stock}
        WHERE id = ${item.id}
      `;
    }
  }
}

// Take sold items out of stock. Never goes below 0, never blocks — a sale that
// already happened is a fact, even if the recorded stock was out of date.
export function deductStock(items) {
  return adjust(items, -1);
}

// Put items back (e.g. an order was deleted or entered by mistake).
export function restoreStock(items) {
  return adjust(items, +1);
}
