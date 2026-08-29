"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import AdminSkeleton from "../AdminSkeleton";

function Stars({ rating }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          fill={i < rating ? "#8B7A1E" : "none"}
          color={i < rating ? "#8B7A1E" : "#555"}
        />
      ))}
    </span>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(data);
    setLoading(false);
  }

  async function handleApprove(id, approved) {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved } : r)));
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
  }

  async function handleDelete(id) {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    fetchReviews();
  }

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  return (
    <main className="min-h-screen px-4 sm:px-8 py-12" style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC" }}>
      <div className="flex items-center justify-between mb-10 flex-wrap gap-3">
        <h1 className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-display)" }}>
          Reviews
        </h1>
        <Link href="/admin" className="text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-100">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="flex gap-2 mb-8">
        {["pending", "approved", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-xs tracking-[0.15em] uppercase px-4 py-2 rounded-full"
            style={{
              backgroundColor: filter === f ? "#8B1E24" : "transparent",
              border: `1px solid ${filter === f ? "#8B1E24" : "#333"}`,
              color: "#F5F2EC",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <AdminSkeleton rows={4} className="max-w-2xl" />
      ) : filtered.length === 0 ? (
        <p className="text-xs opacity-60">No {filter !== "all" ? filter : ""} reviews.</p>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
          {filtered.map((review) => (
            <div
              key={review.id}
              className="p-4 rounded flex flex-col gap-2"
              style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm">
                    {review.name} · <Stars rating={review.rating} />
                  </p>
                  <p className="text-xs opacity-50 mt-0.5">{review.product_name}</p>
                </div>
                <div className="flex gap-3">
                  {!review.approved && (
                    <button
                      onClick={() => handleApprove(review.id, true)}
                      className="text-xs tracking-[0.15em] uppercase"
                      style={{ color: "#3E8B4A" }}
                    >
                      Approve
                    </button>
                  )}
                  {review.approved && (
                    <button
                      onClick={() => handleApprove(review.id, false)}
                      className="text-xs tracking-[0.15em] uppercase opacity-60"
                    >
                      Unpublish
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-xs tracking-[0.15em] uppercase"
                    style={{ color: "#8B1E24" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {review.comment && <p className="text-xs opacity-80">{review.comment}</p>}
              <p className="text-[10px] opacity-30">{new Date(review.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
