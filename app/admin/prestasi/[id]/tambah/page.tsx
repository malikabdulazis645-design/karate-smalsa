"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  tempat: string | null;
  tingkat: string | null;
};

const medalOptions = ["Emas", "Perak", "Perunggu"];

export default function TambahPeraihPrestasiPage() {
  const router = useRouter();
  const params = useParams();

  const championshipId = params.id as string;

  const supabase = createClient();

  const [championship, setChampionship] =
    useState<Championship | null>(null);

  const [members, setMembers] = useState<Member[]>([]);

  const [memberId, setMemberId] = useState("");
  const [kategori, setKategori] = useState("");
  const [medali, setMedali] = useState("Emas");
  const [keterangan, setKeterangan] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const [championshipResult, membersResult] =
        await Promise.all([
          supabase
            .from("championships")
            .select(
              "id, nama_kejuaraan, tanggal, tempat, tingkat"
            )
            .eq("id", championshipId)
            .single(),

          supabase
            .from("members")
            .select(
              "id, nama_lengkap, kelas"
            )
            .eq("status", "Aktif")
            .order("nama_lengkap", {
              ascending: true,
            }),
        ]);

      if (championshipResult.error) {
        setError(
          championshipResult.error.message
        );
        setLoading(false);
        return;
      }

      if (membersResult.error) {
        setError(
          membersResult.error.message
        );
        setLoading(false);
        return;
      }

      setChampionship(
        championshipResult.data
      );

      setMembers(
        membersResult.data || []
      );

      setLoading(false);
    }

    if (championshipId) {
      loadData();
    }
  }, [championshipId]);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!memberId) {
      setError("Silakan pilih anggota.");
      return;
    }

    if (!kategori.trim()) {
      setError(
        "Kategori pertandingan wajib diisi."
      );
      return;
    }

    if (!medali) {
      setError("Silakan pilih medali.");
      return;
    }

    setSaving(true);
    setError("");

    const { error: insertError } =
      await supabase
        .from("achievement_records")
        .insert({
          championship_id: championshipId,
          member_id: memberId,
          kategori: kategori.trim(),
          medali,
          keterangan:
            keterangan.trim() || null,
        });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push(
      `/admin/prestasi/${championshipId}`
    );

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
              Data kejuaraan yang ingin diberi
              prestasi tidak tersedia.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/admin/prestasi")
              }
              className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-700"
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
                `/admin/prestasi/${championshipId}`
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
            Tambah Peraih Prestasi
          </h1>

          <p className="mt-2 text-gray-400">
            Tambahkan anggota yang memperoleh
            prestasi pada kejuaraan ini.
          </p>
        </div>

        {/* INFORMASI KEJUARAAN */}
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-950/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
            Kejuaraan
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {championship.nama_kejuaraan}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {championship.tanggal}
            </span>

            {championship.tempat && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {championship.tempat}
              </span>
            )}

            {championship.tingkat && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {championship.tingkat}
              </span>
            )}
          </div>
        </div>

        {/* FORM */}
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
              onChange={(e) =>
                setMemberId(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
            >
              <option value="">
                Pilih anggota
              </option>

              {members.map((member) => (
                <option
                  key={member.id}
                  value={member.id}
                >
                  {member.nama_lengkap}
                  {member.kelas
                    ? ` — ${member.kelas}`
                    : ""}
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

            <p className="mt-2 text-xs text-gray-600">
              Contoh: Kata Perorangan, Kumite
              -50 Kg, Kumite -55 Kg, Kumite
              Beregu.
            </p>
          </div>

          {/* MEDALI */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Medali
            </label>

            <select
              value={medali}
              onChange={(e) =>
                setMedali(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
            >
              {medalOptions.map((medal) => (
                <option
                  key={medal}
                  value={medal}
                >
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
              disabled={saving}
              className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700 disabled:opacity-50"
            >
              {saving
                ? "Menyimpan..."
                : "Simpan Prestasi"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/admin/prestasi/${championshipId}`
                )
              }
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