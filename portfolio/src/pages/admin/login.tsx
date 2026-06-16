import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin — Login</title>
      </Head>
      <div className={`${inter.variable} font-inter min-h-screen bg-[#f5f5f7] flex items-center justify-center px-6`}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Admin</h1>
            <p className="text-[#86868b] mt-2 text-sm">Enter your password to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm">
            <label htmlFor="password" className="block text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] text-[#1d1d1f] text-base focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition"
              placeholder="••••••••"
              autoFocus
              required
            />

            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#0071e3] text-white font-medium py-3 rounded-xl hover:bg-[#0077ed] transition disabled:opacity-50 text-base"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
