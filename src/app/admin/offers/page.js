"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AdminSkeleton from "../AdminSkeleton";

function OfferModal({ onClose, onSaved }) {
  const [code, setCode] = useState("");
  const [type, setType] = useState("percent");
  const [value, setValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!code || !value) {
      setError("Code and discount value are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discount_percent: type === "percent" ? Number(value) : null,
          discount_amount: type === "amount" ? Number(value) : null,
          expires_at: expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save offer");
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
        className="w-full max-w-sm p-6 rounded flex flex-col gap-4"
        style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm tracking-[0.2em] uppercase" style={{ color: "#F5F2EC" }}>
            New Offer
          </h2>
          <button type="button" onClick={onClose} className="text-lg leading-none" style={{ color: "#F5F2EC" }}>
            ✕
          </button>
        </div>

        <input
          type="text"
          placeholder="Code (e.g. WELCOME10)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC", border: "1px solid #333" }}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("percent")}
            className="flex-1 py-2 text-xs uppercase tracking-wide rounded"
            style={{
              backgroundColor: type === "percent" ? "#8B1E24" : "#0D0D0D",
              color: "#F5F2EC",
              border: "1px solid #333",
            }}
          >
            % Off
          </button>
          <button
            type="button"
            onClick={() => setType("amount")}
            className="flex-1 py-2 text-xs uppercase tracking-wide rounded"
            style={{
              backgroundColor: type === "amount" ? "#8B1E24" : "#0D0D0D",
              color: "#F5F2EC",
              border: "1px solid #333",
            }}
          >
            ₹ Off
          </button>
        </div>

        <input
          type="number"
          placeholder={type === "percent" ? "Percent (e.g. 10)" : "Amount in ₹ (e.g. 100)"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC", border: "1px solid #333" }}
        />

        <div>
          <label className="text-xs opacity-50 block mb-2">Expires (optional)</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-4 py-3 rounded outline-none text-sm"
            style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC", border: "1px solid #333" }}
          />
        </div>

        {error && (
          <p className="text-xs" style={{ color: "#8B1E24" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="py-3 text-xs tracking-[0.25em] uppercase font-semibold rounded"
          style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
        >
          {saving ? "Saving..." : "Add Offer"}
        </button>
      </form>
    </div>
  );
}

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    setLoading(true);
    const res = await fetch("/api/admin/offers");
    const data = await res.json();
    setOffers(data);
    setLoading(false);
  }

  async function toggleActive(offer) {
    setOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, active: !o.active } : o)));
    await fetch(`/api/admin/offers/${offer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !offer.active }),
    });
  }

  async function handleDelete(id) {
    if (!confirm("Delete this offer?")) return;
    await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
    fetchOffers();
  }

  return (
    <main className="min-h-screen px-4 sm:px-8 py-12" style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC" }}>
      <div className="flex items-center justify-between mb-10 flex-wrap gap-3">
        <h1 className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-display)" }}>
          Offers
        </h1>
        <Link href="/admin" className="text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-100">
          ← Back to Dashboard
        </Link>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="mb-10 px-6 py-3 text-xs tracking-[0.25em] uppercase font-semibold rounded"
        style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
      >
        + Add Offer
      </button>

      {loading ? (
        <AdminSkeleton rows={3} />
      ) : offers.length === 0 ? (
        <p className="text-xs opacity-60">No offers yet.</p>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="flex items-center justify-between gap-4 p-4 rounded flex-wrap"
              style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
            >
              <div>
                <p className="text-sm tracking-wide">{offer.code}</p>
                <p className="text-xs opacity-60 mt-1">
                  {offer.discount_percent ? `${offer.discount_percent}% off` : `₹${offer.discount_amount} off`}
                  {offer.expires_at && ` · expires ${new Date(offer.expires_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleActive(offer)}
                  className="text-xs tracking-[0.15em] uppercase px-3 py-1.5 rounded"
                  style={{
                    border: `1px solid ${offer.active ? "#3E8B4A" : "#333"}`,
                    color: offer.active ? "#3E8B4A" : "#8A8478",
                  }}
                >
                  {offer.active ? "Active" : "Disabled"}
                </button>
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="text-xs tracking-[0.15em] uppercase"
                  style={{ color: "#8B1E24" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && <OfferModal onClose={() => setModalOpen(false)} onSaved={fetchOffers} />}
    </main>
  );
}
