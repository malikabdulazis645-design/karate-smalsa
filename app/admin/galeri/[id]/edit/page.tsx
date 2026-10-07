"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const kategoriOptions = [
  "Latihan",
  "Kejuaraan",
  "Kegiatan",
  "Lainnya",
];

export default function EditAlbumPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const albumId = params.id as string;

  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("Latihan");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAlbum() {
      if (!albumId) return;

      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("albums")
        .select("id, judul, kategori")
        .eq("id", albumId)
        .single();

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setJudul(data.judul || "");
      setKategori(data.kategori || "Latihan");
      setLoading(false);
    }

    loadAlbum();
  }, [albumId]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!judul.trim()) {
      setError("Nama album wajib diisi.");
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from("albums")
      .update({
        judul: judul.trim(),
        kategori,
      })
      .eq("id", albumId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push(`/admin/galeri/${albumId}`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-100">
        <div className="mx-auto max-w-2xl px-5 py-10">
          <div className="rounded-3xl bg-white p-10 text-center">
            <p className="font-bold text-zinc-500">
              Memuat album...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-2xl px-5 py-8">
        <Link
          href={`/admin/galeri/${albumId}`}
          className="text-sm font-bold text-zinc-500 transition hover:text-red-600"
        >
          ← Kembali ke Album
        </Link>

        <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
              Galeri
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Edit Album
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Ubah nama atau kategori album.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >
            {/* NAMA ALBUM */}
            <div>
              <label className="text-sm font-black">
                Nama Album
              </label>

              <input
                type="text"
                value={judul}
                onChange={(e) =>
                  setJudul(e.target.value)
                }
                placeholder="Contoh: Kejuaraan Karate 2026"
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            {/* KATEGORI */}
            <div>
              <label className="text-sm font-black">
                Kategori
              </label>

              <select
                value={kategori}
                onChange={(e) =>
                  setKategori(e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                {kategoriOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* BUTTON */}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Link
                href={`/admin/galeri/${albumId}`}
                className="rounded-xl border border-zinc-300 px-5 py-3 text-center text-sm font-black text-zinc-700 transition hover:bg-zinc-50"
              >
                Batal
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}