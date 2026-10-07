"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Member = {
  id: string;
  nama_lengkap: string;
  kelas: string | null;
};

type Achievement = {
  id: string;
  championship_id: string;
  member_id: string;
  kategori: string | null;
  medali: string | null;
  keterangan: string | null;
};

type Championship = {
  id: string;
  nama_kejuaraan: string;
};

const medalOptions = ["Emas", "Perak", "Perunggu"];

export default function KelolaPeraihPrestasiPage() {
  const router = useRouter();
  const params = useParams();

  const championshipId = params.id as string;
  const achievementId = params.achievementId as string;

  const supabase = createClient();

  const [achievement, setAchievement] =
    useState<Achievement | null>(null);

  const [championship, setChampionship] =
    useState<Championship | null>(null);

  const [members, setMembers] = useState<Member[]>([]);

  const [memberId, setMemberId] = useState("");
  const [kategori, setKategori] = useState("");
  const [medali, setMedali] = useState("Emas");
  const [keterangan, setKeterangan] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const [
        achievementResult,
        championshipResult,
        membersResult,
      ] = await Promise.all([
        supabase
          .from("achievement_records")
          .select(
            "id, championship_id, member_id, kategori, medali, keterangan"
          )
          .eq("id", achievementId)
          .eq("championship_id", championshipId)
          .single(),

        supabase
          .from("championships")
          .select("id, nama_kejuaraan")
          .eq("id", championshipId)
          .single(),

        supabase
          .from("members")
          .select("id, nama_lengkap, kelas")
          .eq("status", "Aktif")
          .order("nama_lengkap", {
            ascending: true,
          }),
      ]);

      if (achievementResult.error) {
        setError(
          achievementResult.error.message
        );
        setLoading(false);
        return;
      }

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

      const achievementData =
        achievementResult.data;

      setAchievement(achievementData);
      setChampionship(
        championshipResult.data
      );
      setMembers(
        membersResult.data || []
      );

      setMemberId(
        achievementData.member_id
      );

      setKategori(
        achievementData.kategori || ""
      );

      setMedali(
        achievementData.medali || "Emas"
      );

      setKeterangan(
        achievementData.keterangan || ""
      );

      setLoading(false);
    }

    if (achievementId && championshipId) {
      loadData();
    }
  }, [achievementId, championshipId]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

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

    setSaving(true);

    const { error: updateError } =
      await supabase
        .from("achievement_records")
        .update({
          member_id: memberId,
          kategori: kategori.trim(),
          medali,
          keterangan:
            keterangan.trim() || null,
        })
        .eq("id", achievementId)
        .eq("championship_id", championshipId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSuccess(
      "Data prestasi berhasil diperbarui."
    );

    setSaving(false);

    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Yakin ingin menghapus prestasi anggota ini?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    const { error: deleteError } =
      await supabase
        .from("achievement_records")
        .delete()
        .eq("id", achievementId)
        .eq("championship_id", championshipId);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
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
              Memuat data prestasi...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!achievement || !championship) {
    return (
      <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-8">
            <h1 className="text-xl font-bold">
              Prestasi tidak ditemukan
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Data peraih prestasi yang ingin
              dikelola tidak tersedia.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/admin/prestasi/${championshipId}`
                )
              }
              className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-700"
            >
              Kembali ke Kejuaraan
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
            Kelola Peraih Prestasi
          </h1>

          <p className="mt-2 text-gray-400">
            Ubah atau hapus data prestasi anggota.
          </p>
        </div>

        {/* KEJUARAAN */}
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-950/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
            Kejuaraan
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {championship.nama_kejuaraan}
          </h2>
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
                  `/admin/prestasi/${championshipId}`
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
                : "Hapus Prestasi Ini"}
            </button>

            <p className="mt-2 text-center text-xs text-gray-600">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}