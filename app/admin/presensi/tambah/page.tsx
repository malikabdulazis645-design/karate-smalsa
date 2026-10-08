"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function TambahPresensiPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tanggal, setTanggal] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [judul, setJudul] = useState("Latihan Rutin");
  const [materi, setMateri] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!tanggal || !waktuMulai) {
      setError("Tanggal dan waktu mulai wajib diisi.");
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase
      .from("training_sessions")
      .insert({
        tanggal,
        waktu_mulai: waktuMulai,
        judul: judul.trim() || "Latihan Rutin",
        materi: materi.trim() || null,
        status: "Terjadwal",
      });

    if (insertError) {
      console.error(insertError);
      setError(
        "Latihan gagal disimpan. Pastikan Anda memiliki akses sebagai admin."
      );
      setSaving(false);
      return;
    }

    router.push("/admin/presensi");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/admin/presensi"
            className="inline-flex min-h-10 items-center text-sm font-bold text-zinc-500 transition hover:text-red-500"
          >
            ← Kembali ke Presensi
          </Link>

          <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-red-500">
            Admin Presensi
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Tambah Latihan Rutin
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Buat jadwal latihan yang nantinya digunakan untuk presensi anggota.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8"
        >
          {/* TANGGAL */}
          <div>
            <label
              htmlFor="tanggal"
              className="mb-2 block text-sm font-bold"
            >
              Tanggal Latihan
            </label>

            <input
              id="tanggal"
              name="tanggal"
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              onClick={(e) => {
                const input = e.currentTarget;
                if ("showPicker" in input) {
                  try {
                    input.showPicker();
                  } catch {}
                }
              }}
              className="block min-h-12 w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
              style={{ colorScheme: "dark" }}
              required
            />

            <p className="mt-2 text-xs text-zinc-500">
              Ketuk kolom untuk memilih tanggal.
            </p>
          </div>

          {/* WAKTU */}
          <div className="mt-6">
            <label
              htmlFor="waktuMulai"
              className="mb-2 block text-sm font-bold"
            >
              Jam Mulai
            </label>

            <input
              id="waktuMulai"
              name="waktuMulai"
              type="time"
              value={waktuMulai}
              onChange={(e) => setWaktuMulai(e.target.value)}
              onClick={(e) => {
                const input = e.currentTarget;
                if ("showPicker" in input) {
                  try {
                    input.showPicker();
                  } catch {}
                }
              }}
              className="block min-h-12 w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
              style={{ colorScheme: "dark" }}
              required
            />

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Ketuk kolom untuk memilih jam. Presensi otomatis dibuka pada jam
              ini dan ditutup 2 jam kemudian.
            </p>
          </div>

          {/* JUDUL */}
          <div className="mt-6">
            <label
              htmlFor="judul"
              className="mb-2 block text-sm font-bold"
            >
              Judul Latihan
            </label>

            <input
              id="judul"
              name="judul"
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Latihan Rutin"
              className="min-h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white placeholder:text-zinc-600 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />

            <p className="mt-2 text-xs text-zinc-500">
              Biasanya cukup menggunakan “Latihan Rutin”.
            </p>
          </div>

          {/* MATERI */}
          <div className="mt-6">
            <label
              htmlFor="materi"
              className="mb-2 block text-sm font-bold"
            >
              Materi Latihan
              <span className="ml-2 font-normal text-zinc-500">
                (opsional)
              </span>
            </label>

            <textarea
              id="materi"
              name="materi"
              value={materi}
              onChange={(e) => setMateri(e.target.value)}
              rows={4}
              placeholder="Contoh: Kihon, kata, kumite, dan evaluasi teknik"
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base leading-6 text-white placeholder:text-zinc-600 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* INFO */}
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm font-bold text-red-400">
              ⏱️ Waktu Presensi
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-400">
              Anggota hanya dapat melakukan presensi mulai dari jam latihan
              sampai 2 jam setelah jam tersebut.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
              {error}
            </div>
          )}

          {/* BUTTON */}
          <div className="mt-8 flex flex-col gap-3 border-t border-zinc-800 pt-6 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="min-h-12 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Latihan"}
            </button>

            <Link
              href="/admin/presensi"
              className="flex min-h-12 items-center justify-center rounded-xl border border-zinc-700 px-6 py-3 text-center text-sm font-bold text-zinc-300 transition hover:bg-zinc-800"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}