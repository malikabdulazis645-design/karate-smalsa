"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const tingkatOptions = [
  "Sekolah",
  "Kota",
  "Kabupaten",
  "Keresidenan",
  "Provinsi",
  "Nasional",
  "Internasional",
];

export default function TambahPrestasiPage() {
  const router = useRouter();
  const supabase = createClient();

  const [namaKejuaraan, setNamaKejuaraan] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [tempat, setTempat] = useState("");
  const [tingkat, setTingkat] = useState("Sekolah");
  const [deskripsi, setDeskripsi] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!namaKejuaraan.trim()) {
      setError("Nama kejuaraan wajib diisi.");
      return;
    }

    if (!tanggal) {
      setError("Tanggal kejuaraan wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");

    const { error: insertError } = await supabase
      .from("championships")
      .insert({
        nama_kejuaraan: namaKejuaraan.trim(),
        tanggal,
        tempat: tempat.trim() || null,
        tingkat,
        deskripsi: deskripsi.trim() || null,
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/prestasi");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-2xl">

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
            Admin Karate Smalsa
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Tambah Kejuaraan
          </h1>

          <p className="mt-2 text-gray-400">
            Tambahkan informasi kejuaraan yang diikuti Karate Smalsa.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-white/10 bg-zinc-950 p-6 md:p-8"
        >

          {/* NAMA */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Nama Kejuaraan
            </label>

            <input
              type="text"
              value={namaKejuaraan}
              onChange={(e) =>
                setNamaKejuaraan(e.target.value)
              }
              placeholder="Contoh: Kejuaraan Karate Antar Pelajar"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
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
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          {/* TEMPAT */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Tempat
            </label>

            <input
              type="text"
              value={tempat}
              onChange={(e) => setTempat(e.target.value)}
              placeholder="Contoh: GOR Manahan Surakarta"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          {/* TINGKAT */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Tingkat Kejuaraan
            </label>

            <select
              value={tingkat}
              onChange={(e) => setTingkat(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
            >
              {tingkatOptions.map((item) => (
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
              placeholder="Ceritakan secara singkat tentang kejuaraan..."
              className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* BUTTON */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Kejuaraan"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/prestasi")}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
            >
              Batal
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}