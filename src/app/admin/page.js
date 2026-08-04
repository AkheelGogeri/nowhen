import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main
      className="min-h-screen px-8 py-12"
      style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC" }}
    >
      <h1
        className="text-2xl tracking-[0.2em] uppercase mb-10"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/products"
          className="p-6 rounded border hover:opacity-80 transition-opacity"
          style={{ borderColor: "#333" }}
        >
          <h2 className="text-sm tracking-[0.2em] uppercase mb-2">Products</h2>
          <p className="text-xs opacity-60">Add, edit, or remove products</p>
        </Link>

        <Link
          href="/admin/offers"
          className="p-6 rounded border hover:opacity-80 transition-opacity"
          style={{ borderColor: "#333" }}
        >
          <h2 className="text-sm tracking-[0.2em] uppercase mb-2">Offers</h2>
          <p className="text-xs opacity-60">Manage discount codes</p>
        </Link>

        <Link
          href="/admin/orders"
          className="p-6 rounded border hover:opacity-80 transition-opacity"
          style={{ borderColor: "#333" }}
        >
          <h2 className="text-sm tracking-[0.2em] uppercase mb-2">Orders</h2>
          <p className="text-xs opacity-60">View incoming orders</p>
        </Link>
      </div>
    </main>
  );
}