"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(data.error || "Login failed");
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#0D0D0D" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 p-8 rounded"
        style={{ backgroundColor: "#1A1A1A" }}
      >
        <h1
          className="text-xl tracking-[0.2em] uppercase text-center mb-2"
          style={{ color: "#F5F2EC", fontFamily: "var(--font-display)" }}
        >
          Nowhen Admin
        </h1>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-3 rounded outline-none text-sm"
          style={{ backgroundColor: "#0D0D0D", color: "#F5F2EC", border: "1px solid #333" }}
          required
        />

        {error && (
          <p className="text-xs" style={{ color: "#8B1E24" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="py-3 text-xs tracking-[0.25em] uppercase font-semibold"
          style={{ backgroundColor: "#8B1E24", color: "#F5F2EC" }}
        >
          {loading ? "Checking..." : "Enter"}
        </button>
      </form>
    </main>
  );
}