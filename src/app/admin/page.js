import Link from "next/link";
import { neon } from "@neondatabase/serverless";
import { Package, Tag, ShoppingBag, Image as ImageIcon, Mail, Star, Boxes, Megaphone } from "lucide-react";

const sql = neon(process.env.DATABASE_URL);
const PAID_STATUSES = ["paid", "shipped", "delivered"];

const STATUS_COLORS = {
  created: "#8A8478",
  paid: "#3E8B4A",
  shipped: "#3E6B8B",
  delivered: "#8B7A1E",
  failed: "#8B1E24",
};

async function getAnalytics() {
  const [summary] = await sql`
    SELECT COALESCE(SUM(amount), 0)::int AS revenue, COUNT(*)::int AS paid_orders
    FROM orders WHERE status = ANY(${PAID_STATUSES})
  `;
  const [pending] = await sql`SELECT COUNT(*)::int AS pending_orders FROM orders WHERE status = 'created'`;
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
    FROM orders ORDER BY created_at DESC LIMIT 5
  `;
  const [productCounts] = await sql`
    SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE in_stock = false)::int AS out_of_stock
    FROM products
  `;

  return {
    revenue: summary.revenue,
    paidOrders: summary.paid_orders,
    pendingOrders: pending.pending_orders,
    bestSellers,
    recentOrders,
    totalProducts: productCounts.total,
    outOfStock: productCounts.out_of_stock,
  };
}

function StatCard({ label, value, accent }) {
  return (
    <div className="p-5 rounded" style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}>
      <p className="text-[10px] tracking-[0.2em] uppercase opacity-50 mb-2">{label}</p>
      <p className="text-2xl font-semibold" style={{ color: accent || "#F5F2EC", fontFamily: "var(--font-display)" }}>
        {value}
      </p>
    </div>
  );
}

const NAV_TILES = [
  { href: "/admin/products", label: "Products", desc: "Add, edit, or remove products", Icon: Package },
  { href: "/admin/inventory", label: "Inventory", desc: "Track and update stock levels", Icon: Boxes },
  { href: "/admin/orders", label: "Orders", desc: "View incoming orders", Icon: ShoppingBag },
  { href: "/admin/offers", label: "Offers", desc: "Manage discount codes", Icon: Tag },
  { href: "/admin/settings", label: "Homepage", desc: "Edit hero images, banners, and text", Icon: ImageIcon },
  { href: "/admin/subscribers", label: "Subscribers", desc: "View newsletter signups", Icon: Mail },
  { href: "/admin/reviews", label: "Reviews", desc: "Moderate customer reviews", Icon: Star },
];

export default async function AdminDashboard() {
  const stats = await getAnalytics();

  return (
    <main className="min-h-screen px-4 sm:px-8 py-12" style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC" }}>
      <h1
        className="text-2xl tracking-[0.2em] uppercase mb-8"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Admin Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue" value={`₹${stats.revenue.toLocaleString("en-IN")}`} accent="#8B1E24" />
        <StatCard label="Paid Orders" value={stats.paidOrders} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} accent={stats.pendingOrders > 0 ? "#8B7A1E" : undefined} />
        <StatCard label="Out of Stock" value={`${stats.outOfStock} / ${stats.totalProducts}`} accent={stats.outOfStock > 0 ? "#8B1E24" : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
        {/* Best sellers */}
        <div className="p-5 rounded" style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}>
          <p className="text-xs tracking-[0.2em] uppercase opacity-70 mb-4">Best Sellers</p>
          {stats.bestSellers.length === 0 ? (
            <p className="text-xs opacity-50">No paid orders yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {stats.bestSellers.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="opacity-80 truncate pr-3">{item.name}</span>
                  <span className="flex-shrink-0" style={{ color: "#8B1E24" }}>
                    {item.total_qty} sold
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="p-5 rounded" style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs tracking-[0.2em] uppercase opacity-70">Recent Orders</p>
            <Link href="/admin/orders" className="text-[10px] tracking-[0.15em] uppercase opacity-50 hover:opacity-100">
              View all →
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-xs opacity-50">No orders yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between text-xs">
                  <span className="opacity-80 truncate pr-3">
                    #{order.id} · {order.customer_name}
                  </span>
                  <span className="flex items-center gap-2 flex-shrink-0">
                    <span>₹{order.amount}</span>
                    <span
                      className="text-[9px] tracking-wide uppercase px-1.5 py-0.5 rounded"
                      style={{ border: `1px solid ${STATUS_COLORS[order.status] || "#333"}`, color: STATUS_COLORS[order.status] || "#F5F2EC" }}
                    >
                      {order.status}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nav tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {NAV_TILES.map(({ href, label, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="p-6 rounded border transition-all duration-200 hover:border-[#8B1E24] hover:-translate-y-0.5"
            style={{ borderColor: "#333" }}
          >
            <Icon size={18} className="mb-3 opacity-70" />
            <h2 className="text-sm tracking-[0.2em] uppercase mb-2">{label}</h2>
            <p className="text-xs opacity-60">{desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
