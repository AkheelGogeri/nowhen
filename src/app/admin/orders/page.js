"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AdminSkeleton from "../AdminSkeleton";

const STATUS_OPTIONS = ["created", "paid", "shipped", "delivered", "failed"];

const STATUS_COLORS = {
  created: "#8A8478",
  paid: "#3E8B4A",
  shipped: "#3E6B8B",
  delivered: "#8B7A1E",
  failed: "#8B1E24",
};

function OrderCard({ order, onStatusChange }) {
  const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]");

  return (
    <div className="p-4 md:p-5 rounded flex flex-col gap-4" style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-sm">
            #{order.id} · {order.customer_name}
          </p>
          <p className="text-xs opacity-50 mt-0.5">
            {order.customer_email} · {order.customer_phone}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: "#8B1E24" }}>
            ₹{order.amount}
          </span>
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className="text-xs px-3 py-2 rounded outline-none uppercase tracking-wide"
            style={{
              backgroundColor: "#0D0D0D",
              border: `1px solid ${STATUS_COLORS[order.status] || "#333"}`,
              color: STATUS_COLORS[order.status] || "#F5F2EC",
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-xs opacity-70 flex flex-col gap-1">
        {items.map((item, i) => (
          <p key={i}>
            {item.qty}× {item.name} {item.size ? `(${item.size})` : ""} — ₹{item.price * item.qty}
          </p>
        ))}
        {order.offer_code && (
          <p style={{ color: "#3E8B4A" }}>
            Code {order.offer_code} applied — ₹{order.discount_amount} off
          </p>
        )}
      </div>

      {order.shipping_address && (
        <p className="text-xs opacity-50 leading-relaxed">{order.shipping_address}</p>
      )}

      <p className="text-[10px] opacity-30">{new Date(order.created_at).toLocaleString()}</p>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  }

  async function handleStatusChange(id, status) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <main className="min-h-screen px-4 sm:px-8 py-12" style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC" }}>
      <div className="flex items-center justify-between mb-10 flex-wrap gap-3">
        <h1 className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-display)" }}>
          Orders
        </h1>
        <Link href="/admin" className="text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-100">
          ← Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <AdminSkeleton rows={4} className="max-w-3xl" />
      ) : orders.length === 0 ? (
        <p className="text-xs opacity-60">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-4 max-w-3xl">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </main>
  );
}
