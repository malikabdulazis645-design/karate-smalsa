"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

type Championship = {
  id: string;
  nama_kejuaraan: string;
  tanggal: string;
  tempat: string | null;
  tingkat: string | null;
  deskripsi: string | null;
};

export default function EditKejuaraanPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const supabase = createClient();

  const [championship, setChampionship] =
    useState<Championship | null>(null);

  const [namaKejuaraan, setNamaKejuaraan] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [tempat, setTempat] = useState("");
  const [tingkat, setTingkat] = useState("Sekolah");
  const [deskripsi, setDeskripsi] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadChampionship() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("championships")
        .select(
          "id, nama_kejuaraan, tanggal, tempat, tingkat, deskripsi"
        )
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setChampionship(data);

      setNamaKejuaraan(data.nama_kejuaraan || "");
      setTanggal(data.tanggal || "");
      setTempat(data.tempat || "");
      setTingkat(data.tingkat || "Sekolah");
      setDeskripsi(data.deskripsi || "");

      setLoading(false);
    }

    if (id) {
      loadChampionship();
    }
  }, [id]);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!namaKejuaraan.trim()) {
      setError("Nama kejuaraan wajib diisi.");
      return;
    }

    if (!tanggal) {
      setError("Tanggal kejuaraan wajib diisi.");
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from("championships")
      .update({
        nama_kejuaraan: namaKejuaraan.trim(),
        tanggal,
        tempat: tempat.trim() || null,
        tingkat,
        deskripsi: deskripsi.trim() || null,
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSuccess(
      "Data kejuaraan berhasil diperbarui."
    );

    setSaving(false);

    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Yakin ingin menghapus kejuaraan ini?\n\nSemua data peraih prestasi yang terhubung dengan kejuaraan ini juga akan terhapus jika database menggunakan cascade."
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("championships")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    router.push("/admin/prestasi");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8">
            <p className="text-gray-400">
              Memuat data kejuaraan...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!championship) {
    return (
      <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-8">
            <h1 className="text-xl font-bold">
              Kejuaraan tidak ditemukan
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Data kejuaraan yang ingin diedit
              tidak tersedia.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/admin/prestasi")
              }
              className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold transition hover:bg-red-700"
            >
              Kembali ke Prestasi
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-2xl">

        {/* HEADER */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/admin/prestasi/${id}`
              )
            }
            className="text-sm font-semibold text-gray-400 transition hover:text-red-500"
          >
            ← Kembali ke Kejuaraan
          </button>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
            Admin Karate Smalsa
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Edit Kejuaraan
          </h1>

          <p className="mt-2 text-gray-400">
            Perbarui informasi kejuaraan Karate
            Smalsa.
          </p>
        </div>

        {/* FORM */}
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
              onChange={(e) =>
                setTanggal(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500"
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
              onChange={(e) =>
                setTempat(e.target.value)
              }
              placeholder="Contoh: GOR Manahan Surakarta"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500"
            />
          </div>

          {/* TINGKAT */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Tingkat Kejuaraan
            </label>

            <select
              value={tingkat}
              onChange={(e) =>
                setTingkat(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500"
            >
              {tingkatOptions.map((item) => (
                <option
                  key={item}
                  value={item}
                >
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
              onChange={(e) =>
                setDeskripsi(e.target.value)
              }
              rows={6}
              placeholder="Ceritakan secara singkat tentang kejuaraan..."
              className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500"
            />
          </div>

          {/* SUCCESS */}
          {success && (
            <div className="rounded-xl border border-green-500/30 bg-green-950/20 p-4 text-sm text-green-400">
              {success}
            </div>
          )}

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
              disabled={saving || deleting}
              className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700 disabled:opacity-50"
            >
              {saving
                ? "Menyimpan..."
                : "Simpan Perubahan"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/admin/prestasi/${id}`
                )
              }
              disabled={saving || deleting}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10 disabled:opacity-50"
            >
              Batal
            </button>
          </div>

          {/* DELETE */}
          <div className="border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="w-full rounded-xl border border-red-500/30 bg-red-950/20 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-950/40 disabled:opacity-50"
            >
              {deleting
                ? "Menghapus..."
                : "Hapus Kejuaraan"}
            </button>

            <p className="mt-2 text-center text-xs text-gray-600">
              Pastikan Anda benar-benar ingin
              menghapus kejuaraan ini.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}