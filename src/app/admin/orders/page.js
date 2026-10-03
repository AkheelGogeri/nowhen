"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AdminSkeleton from "../AdminSkeleton";

const STATUS_OPTIONS = ["created", "paid", "shipped", "delivered", "failed"];
const SOLD_STATUSES = ["paid", "shipped", "delivered"];

const STATUS_COLORS = {
  created: "#8A8478",
  paid: "#3E8B4A",
  shipped: "#3E6B8B",
  delivered: "#8B7A1E",
  failed: "#8B1E24",
};

const inputStyle = { backgroundColor: "#0D0D0D", color: "#F5F2EC", border: "1px solid #333" };

function stockFor(product, size) {
  if (!product) return null;
  if (product.sizes && product.sizes.length > 0) return Number(product.stock_by_size?.[size] ?? 0);
  return Number(product.stock_qty ?? 0);
}

function OfflineSaleModal({ onClose, onSaved }) {
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");
  const [soldOn, setSoldOn] = useState(new Date().toISOString().slice(0, 10));

  // Optional: link the sale to a website product so its stock goes down.
  const [linked, setLinked] = useState(false);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!linked || products.length > 0) return;
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setProducts(data))
      .catch(() => setError("Couldn't load your website products"));
  }, [linked, products.length]);

  const product = linked ? products.find((p) => String(p.id) === String(productId)) : null;
  const sizeChoices = product?.sizes?.length > 0 ? product.sizes : ["S", "M", "L", "XL", "XXL"];
  const total = (Number(price) || 0) * (Number(qty) || 0);

  function pickProduct(id) {
    setProductId(id);
    setSize("");
    const p = products.find((x) => String(x.id) === String(id));
    if (p) {
      setDescription((prev) => prev || p.name);
      setPrice((prev) => prev || String(p.price));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!description.trim()) return setError("Type what was sold.");
    if (linked && !product) return setError("Pick the website product, or untick the stock option.");
    if (product?.sizes?.length > 0 && !size) return setError("Pick a size for the website product.");
    if (!(Number(qty) >= 1)) return setError("Quantity must be at least 1.");
    if (price === "" || Number(price) < 0) return setError("Enter the price it was sold for.");

    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          product_id: product ? product.id : null,
          size,
          qty: Number(qty),
          unit_price: Number(price),
          customer_name: customerName,
          note,
          sold_on: soldOn,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        autoComplete="off"
        className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded flex flex-col gap-4"
        style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm tracking-[0.2em] uppercase">Add offline sale</h2>
          <button type="button" onClick={onClose} className="text-lg leading-none">
            ✕
          </button>
        </div>

        <div>
          <label className="text-xs tracking-[0.15em] uppercase opacity-70 block mb-2">What was sold</label>
          <input
            type="text"
            autoFocus
            autoComplete="off"
            placeholder="e.g. Custom black tee, dragon print"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded outline-none text-sm"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="text-xs tracking-[0.15em] uppercase opacity-70 block mb-2">Size</label>
          <div className="flex gap-2 flex-wrap items-center">
            {sizeChoices.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className="px-4 py-2 text-xs rounded"
                style={{
                  backgroundColor: size === s ? "#8B1E24" : "#0D0D0D",
                  border: "1px solid #333",
                }}
              >
                {s}
                {product && <span className="opacity-50 ml-1.5">({stockFor(product, s)})</span>}
              </button>
            ))}
            {!product && (
              <input
                type="text"
                autoComplete="off"
                placeholder="or type"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-24 px-3 py-2 rounded outline-none text-xs"
                style={inputStyle}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs tracking-[0.15em] uppercase opacity-70 block mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full px-4 py-3 rounded outline-none text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs tracking-[0.15em] uppercase opacity-70 block mb-2">Sold for (₹ each)</label>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 rounded outline-none text-sm"
              style={inputStyle}
            />
          </div>
        </div>

        <input
          type="text"
          autoComplete="off"
          placeholder="Customer name (optional)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={inputStyle}
        />
        <input
          type="text"
          autoComplete="off"
          placeholder="Note, e.g. college fest, friend (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={inputStyle}
        />
        <div>
          <label className="text-xs tracking-[0.15em] uppercase opacity-70 block mb-2">Date sold</label>
          <input
            type="date"
            value={soldOn}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setSoldOn(e.target.value)}
            onClick={(e) => {
              try {
                e.currentTarget.showPicker?.();
              } catch {
                // some browsers only allow the picker from the icon — fine
              }
            }}
            className="w-full px-4 py-3 rounded outline-none text-sm cursor-pointer"
            // colorScheme dark makes the browser draw a light calendar icon
            style={{ ...inputStyle, colorScheme: "dark" }}
          />
        </div>

        <div className="pt-1" style={{ borderTop: "1px solid #2a2a2a" }}>
          <label className="flex items-start gap-3 cursor-pointer select-none mt-4">
            <input
              type="checkbox"
              checked={linked}
              onChange={(e) => {
                setLinked(e.target.checked);
                setProductId("");
                setSize("");
              }}
              className="w-4 h-4 mt-0.5"
            />
            <span className="text-xs opacity-80 leading-relaxed">
              This is one of my website t-shirts — take it out of website stock
              <span className="block opacity-50">Leave unticked for custom or one-off tees.</span>
            </span>
          </label>

          {linked && (
            <select
              value={productId}
              onChange={(e) => pickProduct(e.target.value)}
              className="w-full mt-3 px-4 py-3 rounded outline-none text-sm"
              style={inputStyle}
            >
              <option value="">Which website t-shirt?</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="opacity-60">Total</span>
          <span className="font-semibold" style={{ color: "#8B1E24" }}>
            ₹{total}
          </span>
        </div>

        {error && (
          <p className="text-xs" style={{ color: "#8B1E24" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="py-3 text-xs tracking-[0.25em] uppercase font-semibold rounded disabled:opacity-60"
          style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
        >
          {saving ? "Saving..." : "Record sale"}
        </button>
      </form>
    </div>
  );
}

function DeleteModal({ order, onClose, onConfirm }) {
  const stockWasTaken = SOLD_STATUSES.includes(order.status);
  const [restock, setRestock] = useState(order.source === "offline");
  const [deleting, setDeleting] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm p-6 rounded flex flex-col gap-4"
        style={{ backgroundColor: "#1A1A1A", border: "1px solid #8B1E24" }}
      >
        <h2 className="text-sm tracking-[0.2em] uppercase" style={{ color: "#8B1E24" }}>
          Delete order #{order.id}?
        </h2>
        <p className="text-xs opacity-80 leading-relaxed">
          This permanently removes the order ({order.customer_name}, ₹{order.amount}). It can&apos;t be undone.
          {order.source !== "offline" && SOLD_STATUSES.includes(order.status) && (
            <span style={{ color: "#8B7A1E" }}>
              {" "}
              This is a paid online order — make sure it was refunded or entered by mistake.
            </span>
          )}
        </p>

        {stockWasTaken && (
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={restock}
              onChange={(e) => setRestock(e.target.checked)}
              className="w-4 h-4 mt-0.5"
            />
            <span className="text-xs opacity-80">Put the items back into stock</span>
          </label>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs tracking-[0.2em] uppercase rounded"
            style={{ border: "1px solid #333" }}
          >
            Cancel
          </button>
          <button
            disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              await onConfirm(order.id, stockWasTaken && restock);
            }}
            className="flex-1 py-2.5 text-xs tracking-[0.2em] uppercase font-semibold rounded disabled:opacity-60"
            style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
          >
            {deleting ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onStatusChange, onDelete }) {
  const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]");
  const offline = order.source === "offline";
  const contact = [order.customer_email, order.customer_phone].filter(Boolean).join(" · ");

  return (
    <div className="p-4 md:p-5 rounded flex flex-col gap-4" style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-sm flex items-center gap-2 flex-wrap">
            #{order.id} · {order.customer_name}
            <span
              className="text-[9px] tracking-wide uppercase px-1.5 py-0.5 rounded"
              style={{
                border: `1px solid ${offline ? "#8B7A1E" : "#3E6B8B"}`,
                color: offline ? "#8B7A1E" : "#3E6B8B",
              }}
            >
              {offline ? "Offline" : "Online"}
            </span>
          </p>
          {contact && <p className="text-xs opacity-50 mt-0.5">{contact}</p>}
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

      {order.note && <p className="text-xs opacity-60 italic">{order.note}</p>}
      {order.shipping_address && <p className="text-xs opacity-50 leading-relaxed">{order.shipping_address}</p>}

      <div className="flex items-center justify-between">
        <p className="text-[10px] opacity-30">{new Date(order.created_at).toLocaleString()}</p>
        <button
          onClick={() => onDelete(order)}
          className="text-[10px] tracking-[0.15em] uppercase opacity-60 hover:opacity-100"
          style={{ color: "#8B1E24" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [saleOpen, setSaleOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, status) {
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) setOrders(previous);
  }

  async function handleDelete(id, restock) {
    await fetch(`/api/admin/orders/${id}?restock=${restock}`, { method: "DELETE" });
    setToDelete(null);
    fetchOrders();
  }

  const visible = orders.filter((o) => filter === "all" || (o.source || "online") === filter);
  const sold = visible.filter((o) => SOLD_STATUSES.includes(o.status));
  const soldTotal = sold.reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <main className="min-h-screen px-4 sm:px-8 py-12" style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC" }}>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-display)" }}>
          Orders
        </h1>
        <Link href="/admin" className="text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-100">
          ← Back to Dashboard
        </Link>
      </div>

      <button
        onClick={() => setSaleOpen(true)}
        className="mb-6 px-6 py-3 text-xs tracking-[0.25em] uppercase font-semibold rounded"
        style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
      >
        + Add offline sale
      </button>

      <div className="flex gap-2 mb-3">
        {[
          ["all", "All"],
          ["online", "Online"],
          ["offline", "Offline"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className="text-xs tracking-[0.15em] uppercase px-4 py-2 rounded-full"
            style={{
              backgroundColor: filter === value ? "#8B1E24" : "transparent",
              border: `1px solid ${filter === value ? "#8B1E24" : "#333"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {!loading && (
        <p className="text-xs opacity-50 mb-6">
          {sold.length} completed sale{sold.length !== 1 && "s"} · ₹{soldTotal.toLocaleString("en-IN")}
          <span className="opacity-60"> (paid, shipped or delivered)</span>
        </p>
      )}

      {loading ? (
        <AdminSkeleton rows={4} className="max-w-3xl" />
      ) : visible.length === 0 ? (
        <p className="text-xs opacity-60">No orders here yet.</p>
      ) : (
        <div className="flex flex-col gap-4 max-w-3xl">
          {visible.map((order) => (
            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} onDelete={setToDelete} />
          ))}
        </div>
      )}

      {saleOpen && <OfflineSaleModal onClose={() => setSaleOpen(false)} onSaved={fetchOrders} />}
      {toDelete && <DeleteModal order={toDelete} onClose={() => setToDelete(null)} onConfirm={handleDelete} />}
    </main>
  );
}
