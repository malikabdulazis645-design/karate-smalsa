"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type TrainingSession = {
  id: string;
  tanggal: string;
  waktu_mulai: string;
  judul: string;
  materi: string | null;
  status: "Terjadwal" | "Selesai" | "Dibatalkan";
};

export default function EditPresensiJadwalPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const id = params.id as string;

  const [session, setSession] = useState<TrainingSession | null>(null);

  const [tanggal, setTanggal] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [judul, setJudul] = useState("Latihan Rutin");
  const [materi, setMateri] = useState("");
  const [status, setStatus] =
    useState<TrainingSession["status"]>("Terjadwal");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadSession() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("training_sessions")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Jadwal latihan tidak ditemukan.");
        setLoading(false);
        return;
      }

      const training = data as TrainingSession;

      setSession(training);
      setTanggal(training.tanggal);
      setWaktuMulai(training.waktu_mulai.slice(0, 5));
      setJudul(training.judul);
      setMateri(training.materi ?? "");
      setStatus(training.status);

      setLoading(false);
    }

    if (id) {
      loadSession();
    }
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    if (!tanggal) {
      setError("Tanggal latihan wajib diisi.");
      setSaving(false);
      return;
    }

    if (!waktuMulai) {
      setError("Jam mulai latihan wajib diisi.");
      setSaving(false);
      return;
    }

    if (!judul.trim()) {
      setError("Judul latihan wajib diisi.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("training_sessions")
      .update({
        tanggal,
        waktu_mulai: waktuMulai,
        judul: judul.trim(),
        materi: materi.trim() || null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      setError("Gagal menyimpan perubahan jadwal.");
      setSaving(false);
      return;
    }

    setSuccess("Jadwal berhasil diperbarui.");

    setTimeout(() => {
      router.push(`/admin/presensi/${id}`);
      router.refresh();
    }, 700);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-zinc-400">
            Memuat data jadwal...
          </p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-black px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-900/50 bg-zinc-950 p-6">
            <h1 className="text-xl font-bold">
              Jadwal Tidak Ditemukan
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Jadwal latihan yang ingin diedit tidak ditemukan.
            </p>

            <button
              onClick={() => router.push("/admin/presensi")}
              className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-500"
            >
              Kembali
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/admin/presensi/${id}`)}
            className="mb-4 text-sm text-zinc-400 hover:text-white"
          >
            ← Kembali ke Detail Presensi
          </button>

          <h1 className="text-2xl font-black sm:text-3xl">
            Edit Jadwal Latihan
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Ubah tanggal, jam, dan informasi jadwal latihan.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl sm:p-7"
        >

          {/* TANGGAL + JAM */}
          <div className="grid gap-5 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Tanggal
              </label>

              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Jam Mulai
              </label>

              <input
                type="time"
                value={waktuMulai}
                onChange={(e) => setWaktuMulai(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
              />

              <p className="mt-2 text-xs text-zinc-500">
                Presensi dibuka mulai jam ini dan berlangsung selama 2 jam.
              </p>
            </div>

          </div>

          {/* JUDUL */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold">
              Judul Latihan
            </label>

            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Latihan Rutin"
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          {/* MATERI */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold">
              Materi Latihan
            </label>

            <textarea
              value={materi}
              onChange={(e) => setMateri(e.target.value)}
              rows={5}
              placeholder="Contoh: Kihon, Kata, Kumite, evaluasi teknik..."
              className="w-full resize-none rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          {/* STATUS */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold">
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as TrainingSession["status"]
                )
              }
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
            >
              <option value="Terjadwal">Terjadwal</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          {/* INFO */}
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-sm font-semibold text-white">
              ℹ️ Informasi Presensi
            </p>

            <p className="mt-2 text-xs leading-6 text-zinc-400">
              Mengubah tanggal atau jam latihan akan langsung mengubah
              waktu pembukaan presensi. Data presensi anggota yang sudah
              ada tetap tersimpan.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mt-5 rounded-xl border border-green-900/50 bg-green-950/40 px-4 py-3 text-sm text-green-300">
              {success}
            </div>
          )}

          {/* BUTTON */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                router.push(`/admin/presensi/${id}`)
              }
              disabled={saving}
              className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-900 disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

          </div>
        </form>

        <footer className="mt-8 pb-6 text-center text-xs text-zinc-600">
          Karate Smalsa • Admin Presensi
        </footer>
      </div>
    </main>
  );
}