"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Member = {
  id: string;
  nama_lengkap: string;
  kelas: string | null;
};

type Championship = {
  id: string;
  nama_kejuaraan: string;
  tanggal: string;
};

const medalOptions = ["Emas", "Perak", "Perunggu"];

export default function TambahPrestasiAnggotaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [members, setMembers] = useState<Member[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);

  const [memberId, setMemberId] = useState("");
  const [championshipId, setChampionshipId] = useState("");
  const [kategori, setKategori] = useState("");
  const [medali, setMedali] = useState("Emas");
  const [keterangan, setKeterangan] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      const [membersResult, championshipsResult] =
        await Promise.all([
          supabase
            .from("members")
            .select("id, nama_lengkap, kelas")
            .eq("status", "Aktif")
            .order("nama_lengkap", {
              ascending: true,
            }),

          supabase
            .from("championships")
            .select("id, nama_kejuaraan, tanggal")
            .order("tanggal", {
              ascending: false,
            }),
        ]);

      if (membersResult.error) {
        setError(membersResult.error.message);
        setLoading(false);
        return;
      }

      if (championshipsResult.error) {
        setError(championshipsResult.error.message);
        setLoading(false);
        return;
      }

      setMembers(membersResult.data || []);
      setChampionships(championshipsResult.data || []);

      setLoading(false);
    }

    loadData();
  }, []);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!memberId) {
      setError("Silakan pilih anggota.");
      return;
    }

    if (!championshipId) {
      setError("Silakan pilih kejuaraan.");
      return;
    }

    if (!kategori.trim()) {
      setError("Kategori pertandingan wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");

    const { error: insertError } = await supabase
      .from("achievement_records")
      .insert({
        championship_id: championshipId,
        member_id: memberId,
        kategori: kategori.trim(),
        medali,
        keterangan: keterangan.trim() || null,
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

        {/* HEADER */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin/prestasi")}
            className="text-sm font-semibold text-gray-400 transition hover:text-red-500"
          >
            ← Kembali ke Prestasi
          </button>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
            Admin Karate Smalsa
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Tambah Prestasi Anggota
          </h1>

          <p className="mt-2 text-gray-400">
            Catat pencapaian anggota dalam sebuah kejuaraan.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-white/10 bg-zinc-950 p-6 md:p-8"
        >

          {/* ANGGOTA */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Nama Anggota
            </label>

            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
            >
              <option value="">
                {loading
                  ? "Memuat anggota..."
                  : "Pilih anggota"}
              </option>

              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.nama_lengkap}
                  {member.kelas
                    ? ` — ${member.kelas}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* KEJUARAAN */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Kejuaraan
            </label>

            <select
              value={championshipId}
              onChange={(e) =>
                setChampionshipId(e.target.value)
              }
              disabled={loading}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
            >
              <option value="">
                {loading
                  ? "Memuat kejuaraan..."
                  : "Pilih kejuaraan"}
              </option>

              {championships.map((championship) => (
                <option
                  key={championship.id}
                  value={championship.id}
                >
                  {championship.nama_kejuaraan}
                </option>
              ))}
            </select>
          </div>

          {/* KATEGORI */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Kategori Pertandingan
            </label>

            <input
              type="text"
              value={kategori}
              onChange={(e) =>
                setKategori(e.target.value)
              }
              placeholder="Contoh: Kumite -55 Kg"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
            />
          </div>

          {/* MEDALI */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Medali
            </label>

            <select
              value={medali}
              onChange={(e) => setMedali(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
            >
              {medalOptions.map((medal) => (
                <option key={medal} value={medal}>
                  {medal}
                </option>
              ))}
            </select>
          </div>

          {/* KETERANGAN */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Keterangan
            </label>

            <textarea
              value={keterangan}
              onChange={(e) =>
                setKeterangan(e.target.value)
              }
              rows={5}
              placeholder="Contoh: Juara 1 Kumite Putra..."
              className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
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
              disabled={saving || loading}
              className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700 disabled:opacity-50"
            >
              {saving
                ? "Menyimpan..."
                : "Simpan Prestasi"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/prestasi")}
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