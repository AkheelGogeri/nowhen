"use client";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState("");

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!email) return;
    setSubError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    } catch (err) {
      setSubError(err.message);
    }
  }

  return (
    <footer style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC", borderTop: "1px solid #222" }}>
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-xs tracking-[0.2em] uppercase mb-4 opacity-90">Help</h3>
          <div className="flex flex-col gap-2 text-sm opacity-70">
            <Link href="/contact" className="hover:opacity-100 transition-opacity">Contact Us</Link>
            <Link href="/faq" className="hover:opacity-100 transition-opacity">FAQ</Link>
            <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms & Conditions</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xs tracking-[0.2em] uppercase mb-4 opacity-90">About Us</h3>
          <p className="text-sm opacity-70 leading-relaxed">
            Nowhen isn't about time. It's about moments that stay. clothes made to outlast trends, not chase them.
          </p>
        </div>

        <div>
          <h3 className="text-xs tracking-[0.2em] uppercase mb-4 opacity-90">Connect</h3>
          <div className="flex flex-col gap-2 text-sm opacity-70">
            <a href="mailto:contact.nowhen@gmail.com" className="hover:opacity-100 transition-opacity">
              contact.nowhen@gmail.com
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-xs tracking-[0.2em] uppercase mb-4 opacity-90">Signup</h3>
          <p className="text-sm opacity-70 mb-4">
            Subscribe for updates on new drops.
          </p>
          <form onSubmit={handleSubscribe} className="flex">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
            />
            <button
              type="submit"
              className="px-4 text-sm"
              style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
            >
              →
            </button>
          </form>
          {subscribed && (
            <p className="text-xs mt-2 opacity-70">Thanks — you're on the list.</p>
          )}
          {subError && (
            <p className="text-xs mt-2" style={{ color: "#8B1E24" }}>
              {subError}
            </p>
          )}
        </div>
      </div>

      <div
        className="max-w-6xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs opacity-40"
        style={{ borderTop: "1px solid #1A1A1A" }}
      >
        <p>© {new Date().getFullYear()} Nowhen. All rights reserved.</p>
        <p style={{ fontFamily: "var(--font-display)" }}>N|W</p>
      </div>
    </footer>
  );
}