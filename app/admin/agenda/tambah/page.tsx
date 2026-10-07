"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const kategoriOptions = [
  "Latihan",
  "Kejuaraan",
  "Ujian Sabuk",
  "Latihan Bersama",
  "Kegiatan Organisasi",
  "Lainnya",
];

const statusOptions = [
  "Akan Datang",
  "Berlangsung",
  "Selesai",
  "Dibatalkan",
];

export default function TambahAgendaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [judul, setJudul] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [waktu, setWaktu] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [kategori, setKategori] = useState("Latihan");
  const [status, setStatus] = useState("Akan Datang");
  const [deskripsi, setDeskripsi] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!judul.trim()) {
      setError("Judul agenda wajib diisi.");
      return;
    }

    if (!tanggal) {
      setError("Tanggal agenda wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: insertError } = await supabase
        .from("events")
        .insert({
          judul: judul.trim(),
          tanggal,
          waktu: waktu || null,
          lokasi: lokasi.trim() || null,
          kategori,
          status,
          deskripsi: deskripsi.trim() || null,
        });

      if (insertError) {
        throw insertError;
      }

      router.push("/admin/agenda");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan agenda."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-2xl">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
            Admin Karate Smalsa
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Tambah Agenda
          </h1>

          <p className="mt-2 text-gray-400">
            Tambahkan kegiatan atau jadwal baru.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-white/10 bg-zinc-950 p-6 md:p-8"
        >

          {/* JUDUL */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Judul Agenda
            </label>

            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Latihan Rutin"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500"
            />
          </div>

          {/* TANGGAL */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Tanggal
            </label>

            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500"
            />
          </div>

          {/* WAKTU */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Waktu
            </label>

            <input
              type="time"
              value={waktu}
              onChange={(e) => setWaktu(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500"
            />
          </div>

          {/* LOKASI */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Lokasi
            </label>

            <input
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Contoh: Dojo SMA Al Islam 1 Surakarta"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500"
            />
          </div>

          {/* KATEGORI */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Kategori
            </label>

            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
            >
              {kategoriOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
            >
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* DESKRIPSI */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Deskripsi
            </label>

            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={6}
              placeholder="Tuliskan informasi mengenai agenda..."
              className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* ACTION */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Agenda"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/agenda")}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}