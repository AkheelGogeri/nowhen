"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import AdminSkeleton from "../AdminSkeleton";

function StockInput({ value, onChange, onSave }) {
  const [local, setLocal] = useState(String(value ?? 0));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocal(String(value ?? 0));
  }, [value]);

  async function commit() {
    const num = Math.max(0, Math.floor(Number(local) || 0));
    setLocal(String(num));
    if (num === value) return;
    setSaving(true);
    await onSave(num);
    setSaving(false);
  }

  function step(delta) {
    const num = Math.max(0, Math.floor(Number(local) || 0) + delta);
    setLocal(String(num));
    onChange?.();
    setSaving(true);
    onSave(num).finally(() => setSaving(false));
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => step(-1)}
        className="w-7 h-7 flex items-center justify-center rounded flex-shrink-0"
        style={{ border: "1px solid #333", color: "#F5F2EC" }}
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          onChange?.();
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="w-14 text-center px-1 py-1.5 rounded text-sm outline-none"
        style={{
          backgroundColor: "#0D0D0D",
          border: `1px solid ${saving ? "#8B7A1E" : "#333"}`,
          color: "#F5F2EC",
        }}
      />
      <button
        type="button"
        onClick={() => step(1)}
        className="w-7 h-7 flex items-center justify-center rounded flex-shrink-0"
        style={{ border: "1px solid #333", color: "#F5F2EC" }}
      >
        +
      </button>
    </div>
  );
}

function ProductRow({ product, onUpdated }) {
  const image = (product.images && product.images[0]) || product.image;
  const hasSizes = product.sizes && product.sizes.length > 0;
  const stockBySize = product.stock_by_size || {};
  const total = hasSizes
    ? Object.values(stockBySize).reduce((s, n) => s + (Number(n) || 0), 0)
    : Number(product.stock_qty) || 0;

  async function saveSize(size, qty) {
    const updated = { ...stockBySize, [size]: qty };
    const res = await fetch(`/api/admin/inventory/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock_by_size: updated }),
    });
    const data = await res.json();
    if (res.ok) onUpdated(product.id, data);
  }

  async function saveQty(qty) {
    const res = await fetch(`/api/admin/inventory/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock_qty: qty }),
    });
    const data = await res.json();
    if (res.ok) onUpdated(product.id, data);
  }

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded"
      style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
    >
      <div className="flex items-center gap-3 sm:w-56 flex-shrink-0 min-w-0">
        {image && <img src={image} alt={product.name} className="w-12 h-12 object-cover rounded flex-shrink-0" />}
        <div className="min-w-0">
          <p className="text-sm truncate">{product.name}</p>
          <p className="text-xs" style={{ color: total === 0 ? "#8B1E24" : "#8A8478" }}>
            {total === 0 ? "Out of stock" : `${total} total`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 flex-1">
        {hasSizes
          ? product.sizes.map((size) => (
              <div key={size} className="flex flex-col items-center gap-1">
                <span className="text-[10px] tracking-wide uppercase opacity-50">{size}</span>
                <StockInput value={stockBySize[size] || 0} onSave={(qty) => saveSize(size, qty)} />
              </div>
            ))
          : (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] tracking-wide uppercase opacity-50">Qty</span>
                <StockInput value={product.stock_qty || 0} onSave={saveQty} />
              </div>
            )}
      </div>
    </div>
  );
}

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const editingRef = useRef(false);

  const fetchInventory = useCallback(async (silent = false) => {
    if (editingRef.current) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    const interval = setInterval(() => fetchInventory(true), 15000);
    return () => clearInterval(interval);
  }, [fetchInventory]);

  function handleUpdated(id, updatedProduct) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p)));
  }

  const filtered = query
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : products;

  const lowStockCount = products.filter((p) => {
    const total = p.stock_by_size && Object.keys(p.stock_by_size).length > 0
      ? Object.values(p.stock_by_size).reduce((s, n) => s + (Number(n) || 0), 0)
      : Number(p.stock_qty) || 0;
    return total > 0 && total <= 5;
  }).length;

  return (
    <main className="min-h-screen px-4 sm:px-8 py-12" style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC" }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-display)" }}>
          Inventory
        </h1>
        <Link href="/admin" className="text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-100">
          ← Back to Dashboard
        </Link>
      </div>

      <p className="text-xs opacity-50 mb-6">
        Changes save automatically as you type or tap +/−. This page refreshes itself every 15s, so it's safe to
        leave open on a second device while restocking.
        {lowStockCount > 0 && (
          <span style={{ color: "#8B7A1E" }}> {lowStockCount} product{lowStockCount !== 1 && "s"} running low.</span>
        )}
      </p>

      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => (editingRef.current = true)}
        onBlur={() => (editingRef.current = false)}
        className="w-full max-w-sm px-4 py-2.5 rounded outline-none text-sm mb-6"
        style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
      />

      {loading ? (
        <AdminSkeleton rows={5} className="max-w-3xl" />
      ) : filtered.length === 0 ? (
        <p className="text-xs opacity-60">No products found.</p>
      ) : (
        <div
          className="flex flex-col gap-3 max-w-3xl"
          onFocus={() => (editingRef.current = true)}
          onBlur={() => (editingRef.current = false)}
        >
          {filtered.map((product) => (
            <ProductRow key={product.id} product={product} onUpdated={handleUpdated} />
          ))}
        </div>
      )}
    </main>
  );
}
