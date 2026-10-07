"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const pilihanPosisi = [
  "Ketua",
  "Sekretaris 1",
  "Sekretaris 2",
  "Bendahara 1",
  "Bendahara 2",
  "Humas 1",
  "Humas 2",
];

export default function TambahPengurusPage() {
  const router = useRouter();

  const [posisi, setPosisi] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [tugas, setTugas] = useState("");
  const [foto, setFoto] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase
      .from("board_members")
      .insert({
        posisi,
        nama,
        kelas,
        tugas,
        foto,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/pengurus");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Link
            href="/admin/pengurus"
            className="text-sm font-medium text-zinc-500 transition hover:text-red-500"
          >
            ← Kembali ke Pengurus
          </Link>

          <h1 className="mt-4 text-3xl font-black">
            Tambah Pengurus
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Tambahkan data pengurus Karate Smalsa.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="posisi"
                className="text-sm font-semibold text-zinc-300"
              >
                Posisi
              </label>

              <select
                id="posisi"
                value={posisi}
                onChange={(e) => setPosisi(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-red-600"
              >
                <option value="">Pilih posisi</option>

                {pilihanPosisi.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="kelas"
                className="text-sm font-semibold text-zinc-300"
              >
                Kelas
              </label>

              <input
                id="kelas"
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Contoh: XI.2"
                required
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-700 focus:border-red-600"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="nama"
                className="text-sm font-semibold text-zinc-300"
              >
                Nama Lengkap
              </label>

              <input
                id="nama"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-700 focus:border-red-600"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="tugas"
                className="text-sm font-semibold text-zinc-300"
              >
                Tugas
              </label>

              <textarea
                id="tugas"
                value={tugas}
                onChange={(e) => setTugas(e.target.value)}
                placeholder="Masukkan tugas pengurus"
                required
                rows={5}
                className="mt-2 w-full resize-none rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-700 focus:border-red-600"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="foto"
                className="text-sm font-semibold text-zinc-300"
              >
                Foto
              </label>

              <input
                id="foto"
                type="text"
                value={foto}
                onChange={(e) => setFoto(e.target.value)}
                placeholder="Contoh: /pengurus/ketua.jpg"
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-700 focus:border-red-600"
              />

              <p className="mt-2 text-xs text-zinc-600">
                Untuk sementara gunakan path foto yang ada di folder public.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/pengurus"
              className="rounded-xl border border-zinc-700 px-6 py-3 text-center text-sm font-bold text-zinc-300 transition hover:border-zinc-500"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Pengurus"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}