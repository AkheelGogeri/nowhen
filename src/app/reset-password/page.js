"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../Navbar";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      setDone(true);
      setTimeout(() => router.push("/account"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
      >
        <p className="text-sm opacity-60">Missing reset token. Use the link from your email.</p>
      </main>
    );
  }

  if (done) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
      >
        <p className="text-sm" style={{ color: "#3E8B4A" }}>
          Password updated — redirecting you to sign in.
        </p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#000000", color: "#F5F2EC" }}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-xl tracking-[0.2em] uppercase text-center mb-2">Reset Password</h1>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#F5F2EC" }}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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
          {loading ? "..." : "Set New Password"}
        </button>
      </form>
    </main>
  );
}

export default function ResetPassword() {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <ResetPasswordContent />
      </Suspense>
    </>
  );
}
