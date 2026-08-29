import { neon } from "@neondatabase/serverless";
import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { getUserFromToken, SESSION_COOKIE } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const { items, customer, offerCode } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
      return NextResponse.json({ error: "Missing customer details" }, { status: 400 });
    }

    // Recompute the total from the DB — never trust a client-supplied amount.
    const ids = [...new Set(items.map((item) => item.id))];
    const products = await sql`SELECT id, name, price, in_stock FROM products WHERE id = ANY(${ids})`;
    const priceById = new Map(products.map((p) => [p.id, p]));

    let amount = 0;
    const lineItems = [];
    for (const item of items) {
      const product = priceById.get(item.id);
      if (!product) {
        return NextResponse.json({ error: `Product ${item.id} not found` }, { status: 400 });
      }
      if (product.in_stock === false) {
        return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 });
      }
      const qty = Math.max(1, Number(item.qty) || 1);
      amount += product.price * qty;
      lineItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        size: item.selectedSize || null,
        qty,
      });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    // Re-validate the discount code server-side — never trust a client-supplied discount.
    let discount = 0;
    let appliedCode = null;
    if (offerCode) {
      const offerResult = await sql`
        SELECT * FROM offers
        WHERE UPPER(code) = UPPER(${offerCode})
          AND active = true
          AND (expires_at IS NULL OR expires_at > NOW())
      `;
      if (offerResult.length > 0) {
        const offerRow = offerResult[0];
        discount = offerRow.discount_percent
          ? Math.round((amount * offerRow.discount_percent) / 100)
          : Math.min(offerRow.discount_amount, amount);
        appliedCode = offerRow.code;
      }
    }

    const finalAmount = Math.max(amount - discount, 0);

    const razorpayOrder = await razorpay.orders.create({
      amount: finalAmount * 100, // paise
      currency: "INR",
      notes: { customer_email: customer.email },
    });

    const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;
    const loggedInUser = await getUserFromToken(sessionToken);

    const inserted = await sql`
      INSERT INTO orders (razorpay_order_id, customer_name, customer_email, customer_phone, shipping_address, items, amount, status, offer_code, discount_amount, user_id)
      VALUES (${razorpayOrder.id}, ${customer.name}, ${customer.email}, ${customer.phone}, ${customer.address}, ${JSON.stringify(lineItems)}, ${finalAmount}, 'created', ${appliedCode}, ${discount}, ${loggedInUser?.id || null})
      RETURNING id
    `;

    return NextResponse.json({
      id: razorpayOrder.id,
      dbOrderId: inserted[0].id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
