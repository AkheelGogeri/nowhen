"use client";
import { useState, useEffect } from "react";
import Navbar from "../Navbar";

const STATUS_LABELS = {
  created: "Order placed, payment pending",
  paid: "Paid — being prepared",
  shipped: "Shipped",
  delivered: "Delivered",
  failed: "Payment failed",
};

function GuestTracker() {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs tracking-[0.15em] uppercase opacity-60 hover:opacity-100 underline mt-8"
      >
        Checked out as a guest? Track your order
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm mt-8 pt-8" style={{ borderTop: "1px solid #222" }}>
      <p className="text-xs tracking-[0.2em] uppercase opacity-70 mb-4">Track a Guest Order</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
        />
        <input
          type="text"
          inputMode="numeric"
          placeholder="Order number (e.g. 42)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
        />
        {error && (
          <p className="text-xs" style={{ color: "#8B1E24" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="py-2.5 text-xs tracking-[0.2em] uppercase"
          style={{ border: "1px solid #F5F2EC" }}
        >
          {loading ? "Looking up..." : "Track Order"}
        </button>
      </form>

      {order && <OrderCard order={order} />}
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <div className="w-full mt-4 p-5 rounded" style={{ border: "1px solid #333" }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm">Order #{order.id}</p>
        <p className="text-sm font-semibold" style={{ color: "#8B1E24" }}>
          ₹{order.amount}
        </p>
      </div>
      <p className="text-xs opacity-50 mb-4">{new Date(order.created_at).toLocaleString()}</p>

      <p
        className="text-xs tracking-[0.15em] uppercase mb-4 inline-block px-3 py-1.5 rounded"
        style={{ border: "1px solid #F5F2EC" }}
      >
        {STATUS_LABELS[order.status] || order.status}
      </p>

      <div className="flex flex-col gap-1 text-xs opacity-80">
        {order.items.map((item, i) => (
          <p key={i}>
            {item.qty}× {item.name} {item.size ? `(${item.size})` : ""}
          </p>
        ))}
      </div>

      {order.offer_code && (
        <p className="text-xs mt-2" style={{ color: "#3E8B4A" }}>
          Code {order.offer_code} applied — ₹{order.discount_amount} off
        </p>
      )}
    </div>
  );
}

function Dashboard({ user, onLogout, onUserUpdate }) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const res = await fetch("/api/account/orders");
      if (res.ok) setOrders(await res.json());
      setOrdersLoading(false);
    }
    fetchOrders();
  }, []);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      onUserUpdate(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-8">
        <div>
          <p className="text-sm">{user.name}</p>
          <p className="text-xs opacity-50">{user.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="text-xs tracking-[0.15em] uppercase opacity-60 hover:opacity-100"
        >
          Log Out
        </button>
      </div>

      <form onSubmit={handleSaveProfile} className="w-full flex flex-col gap-4 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase opacity-70">Profile</p>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
        />
        <textarea
          placeholder="Default shipping address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          className="px-4 py-3 rounded outline-none text-sm resize-none"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
        />
        {error && (
          <p className="text-xs" style={{ color: "#8B1E24" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="py-2.5 text-xs tracking-[0.2em] uppercase"
          style={{
            backgroundColor: saved ? "#1A1A1A" : "#8B1E24",
            color: "#F5F2EC",
            border: saved ? "1px solid #8B1E24" : "none",
          }}
        >
          {saving ? "Saving..." : saved ? "✓ Saved" : "Save Profile"}
        </button>
      </form>

      <div className="w-full">
        <p className="text-xs tracking-[0.2em] uppercase opacity-70 mb-4">Order History</p>
        {ordersLoading ? (
          <p className="text-xs opacity-50">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-xs opacity-50">No orders yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AuthForms({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body = mode === "login" ? { email, password } : { name, email, password };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      onAuthed(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResetSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (mode === "forgot") {
    return (
      <div className="w-full max-w-sm flex flex-col items-center">
        <h2 className="text-sm tracking-[0.2em] uppercase mb-6">Reset Password</h2>
        {resetSent ? (
          <p className="text-xs text-center" style={{ color: "#3E8B4A" }}>
            If that email is registered, a reset link is on its way.
          </p>
        ) : (
          <form onSubmit={handleForgotSubmit} className="w-full flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded outline-none text-sm"
              style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
            />
            {error && (
              <p className="text-xs" style={{ color: "#8B1E24" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="py-3 text-xs tracking-[0.25em] uppercase font-semibold disabled:opacity-60"
              style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
            >
              {loading ? "..." : "Send Reset Link"}
            </button>
          </form>
        )}
        <button
          onClick={() => {
            setMode("login");
            setResetSent(false);
            setError("");
          }}
          className="text-xs tracking-[0.15em] uppercase opacity-60 hover:opacity-100 underline mt-6"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      <div className="flex w-full mb-8" style={{ border: "1px solid #333" }}>
        <button
          onClick={() => setMode("login")}
          className="flex-1 py-2.5 text-xs tracking-[0.2em] uppercase"
          style={{ backgroundColor: mode === "login" ? "#8B1E24" : "transparent", color: "#F5F2EC" }}
        >
          Log In
        </button>
        <button
          onClick={() => setMode("signup")}
          className="flex-1 py-2.5 text-xs tracking-[0.2em] uppercase"
          style={{ backgroundColor: mode === "signup" ? "#8B1E24" : "transparent", color: "#F5F2EC" }}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 rounded outline-none text-sm"
            style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
        />

        {error && (
          <p className="text-xs" style={{ color: "#8B1E24" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="py-3 text-xs tracking-[0.25em] uppercase font-semibold disabled:opacity-60"
          style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
        >
          {loading ? "..." : mode === "login" ? "Log In" : "Create Account"}
        </button>

        {mode === "login" && (
          <button
            type="button"
            onClick={() => setMode("forgot")}
            className="text-xs tracking-[0.15em] uppercase opacity-60 hover:opacity-100 underline self-center"
          >
            Forgot password?
          </button>
        )}
      </form>

      <GuestTracker />
    </div>
  );
}

export default function Account() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
      setChecking(false);
    }
    fetchMe();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen px-6 pt-32 pb-16 flex flex-col items-center"
        style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
      >
        {checking ? (
          <p className="text-xs opacity-50">Loading...</p>
        ) : user ? (
          <Dashboard user={user} onLogout={handleLogout} onUserUpdate={setUser} />
        ) : (
          <>
            <h1 className="text-xl tracking-[0.2em] uppercase mb-8 text-center">Account</h1>
            <AuthForms onAuthed={setUser} />
          </>
        )}
      </main>
    </>
  );
}
