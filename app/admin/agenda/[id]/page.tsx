"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

type EventData = {
  id: string;
  judul: string;
  tanggal: string;
  waktu: string | null;
  lokasi: string | null;
  kategori: string | null;
  status: string | null;
  deskripsi: string | null;
};

export default function KelolaAgendaPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const id = params.id as string;

  const [agenda, setAgenda] = useState<EventData | null>(null);

  const [judul, setJudul] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [waktu, setWaktu] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [kategori, setKategori] = useState("Latihan");
  const [status, setStatus] = useState("Akan Datang");
  const [deskripsi, setDeskripsi] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAgenda() {
      const { data, error } = await supabase
        .from("events")
        .select(
          "id, judul, tanggal, waktu, lokasi, kategori, status, deskripsi"
        )
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setAgenda(data);

      setJudul(data.judul || "");
      setTanggal(data.tanggal || "");
      setWaktu(data.waktu || "");
      setLokasi(data.lokasi || "");
      setKategori(data.kategori || "Latihan");
      setStatus(data.status || "Akan Datang");
      setDeskripsi(data.deskripsi || "");

      setLoading(false);
    }

    loadAgenda();
  }, [id]);

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

    setSaving(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("events")
        .update({
          judul: judul.trim(),
          tanggal,
          waktu: waktu || null,
          lokasi: lokasi.trim() || null,
          kategori,
          status,
          deskripsi: deskripsi.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      router.push("/admin/agenda");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan perubahan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Yakin ingin menghapus agenda ini?"
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      router.push("/admin/agenda");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus agenda."
      );

      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <div className="mx-auto max-w-2xl">
          <p className="text-gray-400">
            Memuat data agenda...
          </p>
        </div>
      </main>
    );
  }

  if (!agenda) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-5 text-red-400">
            Data agenda tidak ditemukan.
          </div>

          <button
            onClick={() => router.push("/admin/agenda")}
            className="mt-5 rounded-xl bg-white/10 px-5 py-3"
          >
            Kembali
          </button>
        </div>
      </main>
    );
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
            Kelola Agenda
          </h1>

          <p className="mt-2 text-gray-400">
            Ubah informasi atau hapus agenda.
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
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
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
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
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
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
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
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
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
              className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* BUTTON */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving || deleting}
              className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/agenda")}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
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
              className="w-full rounded-xl border border-red-500/30 bg-red-950/20 px-5 py-3 font-semibold text-red-400 hover:bg-red-950/40 disabled:opacity-50"
            >
              {deleting ? "Menghapus..." : "Hapus Agenda"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}