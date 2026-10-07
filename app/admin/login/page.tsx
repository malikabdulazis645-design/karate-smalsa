"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Login gagal. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("id, nama, role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (adminError || !admin) {
      await supabase.auth.signOut();

      setError("Akun ini tidak memiliki akses sebagai admin.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-12 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-xl font-black">
            KS
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight">
            Admin Karate Smalsa
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Masuk untuk mengelola website Karate Smalsa.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl sm:p-8"
        >
          <div>
            <label
              htmlFor="email"
              className="text-sm font-semibold text-zinc-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@email.com"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-red-600"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-zinc-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-red-600"
            />
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk sebagai Admin"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Karate Smalsa · SMA Al Islam 1 Surakarta
        </p>
      </div>
    </main>
  );
}