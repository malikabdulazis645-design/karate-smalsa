"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

type BoardMember = {
  id: string;
  posisi: string;
  nama: string;
  kelas: string | null;
  tugas: string | null;
  foto: string | null;
};

export default function KelolaPengurusPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [member, setMember] = useState<BoardMember | null>(null);

  const [posisi, setPosisi] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [tugas, setTugas] = useState("");
  const [foto, setFoto] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadMember() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("board_members")
        .select("id, posisi, nama, kelas, tugas, foto")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Data pengurus tidak ditemukan.");
        setLoading(false);
        return;
      }

      setMember(data);

      setPosisi(data.posisi || "");
      setNama(data.nama || "");
      setKelas(data.kelas || "");
      setTugas(data.tugas || "");
      setFoto(data.foto || "");

      setLoading(false);
    }

    loadMember();
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const supabase = createClient();

    const { error } = await supabase
      .from("board_members")
      .update({
        posisi,
        nama,
        kelas,
        tugas,
        foto,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSuccess("Data pengurus berhasil diperbarui.");
    setSaving(false);

    setMember({
      id,
      posisi,
      nama,
      kelas,
      tugas,
      foto,
    });

    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Yakin ingin menghapus pengurus "${nama}"?\n\nData yang dihapus tidak dapat dikembalikan.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase
      .from("board_members")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      setDeleting(false);
      return;
    }

    router.push("/admin/pengurus");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-zinc-500">
            Memuat data pengurus...
          </p>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-8">
            <h1 className="text-2xl font-black">
              Data pengurus tidak ditemukan
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              {error || "Pengurus yang Anda cari tidak tersedia."}
            </p>

            <Link
              href="/admin/pengurus"
              className="mt-6 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Kembali ke Pengurus
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/admin/pengurus"
                className="text-sm font-medium text-zinc-500 transition hover:text-red-500"
              >
                ← Kembali ke Pengurus
              </Link>

              <h1 className="mt-4 text-3xl font-black">
                Kelola Pengurus
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Edit data pengurus Karate Smalsa.
              </p>
            </div>

            <Link
              href="/admin/pengurus/tambah"
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              + Tambah Pengurus
            </Link>
          </div>
        </div>
      </header>

      {/* FORM */}
      <section className="mx-auto max-w-4xl px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8"
        >
          {/* INFO */}
          <div className="mb-8 border-b border-zinc-800 pb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
              Data Pengurus
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {member.nama}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              ID: {member.id}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* POSISI */}
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

            {/* KELAS */}
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
                required
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-red-600"
              />
            </div>

            {/* NAMA */}
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
                required
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-red-600"
              />
            </div>

            {/* TUGAS */}
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
                required
                rows={6}
                className="mt-2 w-full resize-none rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-red-600"
              />
            </div>

            {/* FOTO */}
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
                placeholder="/pengurus/ketua.jpg"
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-700 focus:border-red-600"
              />

              <p className="mt-2 text-xs text-zinc-600">
                Untuk sementara masukkan path foto dari folder public.
              </p>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              <div className="font-bold">
                Terjadi kesalahan
              </div>

              <div className="mt-1 text-xs">
                {error}
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mt-6 rounded-xl border border-green-900/50 bg-green-950/30 px-4 py-3 text-sm text-green-400">
              {success}
            </div>
          )}

          {/* ACTION */}
          <div className="mt-8 flex flex-col gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="rounded-xl border border-red-900/70 px-6 py-3 text-sm font-bold text-red-500 transition hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Menghapus..." : "Hapus Pengurus"}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/pengurus"
                className="rounded-xl border border-zinc-700 px-6 py-3 text-center text-sm font-bold text-zinc-300 transition hover:border-zinc-500"
              >
                Batal
              </Link>

              <button
                type="submit"
                disabled={saving || deleting}
                className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}