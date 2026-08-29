"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AdminSkeleton from "../AdminSkeleton";

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscribers() {
      const res = await fetch("/api/admin/subscribers");
      const data = await res.json();
      setSubscribers(data);
      setLoading(false);
    }
    fetchSubscribers();
  }, []);

  function copyAll() {
    navigator.clipboard.writeText(subscribers.map((s) => s.email).join(", "));
  }

  return (
    <main className="min-h-screen px-4 sm:px-8 py-12" style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC" }}>
      <div className="flex items-center justify-between mb-10 flex-wrap gap-3">
        <h1 className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-display)" }}>
          Subscribers
        </h1>
        <Link href="/admin" className="text-xs tracking-[0.2em] uppercase opacity-60 hover:opacity-100">
          ← Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <AdminSkeleton rows={4} className="max-w-md" />
      ) : subscribers.length === 0 ? (
        <p className="text-xs opacity-60">No subscribers yet.</p>
      ) : (
        <>
          <p className="text-xs opacity-50 mb-4">{subscribers.length} subscriber{subscribers.length !== 1 && "s"}</p>
          <button
            onClick={copyAll}
            className="mb-6 px-5 py-2.5 text-xs tracking-[0.2em] uppercase"
            style={{ border: "1px solid #F5F2EC" }}
          >
            Copy All Emails
          </button>
          <div className="flex flex-col gap-2 max-w-md">
            {subscribers.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-4 py-2.5 rounded text-sm"
                style={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
              >
                <span>{s.email}</span>
                <span className="text-xs opacity-40">{new Date(s.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
