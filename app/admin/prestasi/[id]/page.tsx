import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Achievement = {
  id: string;
  kategori: string;
  medali: string;
  keterangan: string | null;
  member: {
    nama_lengkap: string;
    kelas: string | null;
  }[];
};

export default async function PrestasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: championship, error: championshipError } =
    await supabase
      .from("championships")
      .select(
        "id, nama_kejuaraan, tanggal, tempat, tingkat, deskripsi"
      )
      .eq("id", id)
      .single();

  if (championshipError || !championship) {
    notFound();
  }

  const { data: achievements, error: achievementError } =
    await supabase
      .from("achievement_records")
      .select(
        `
        id,
        kategori,
        medali,
        keterangan,
        member:members (
          nama_lengkap,
          kelas
        )
      `
      )
      .eq("championship_id", id)
      .order("created_at", {
        ascending: true,
      });

  const medalClass = (medali: string | null) => {
    if (medali === "Emas") {
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
    }

    if (medali === "Perak") {
      return "border-gray-400/30 bg-gray-400/10 text-gray-300";
    }

    if (medali === "Perunggu") {
      return "border-orange-500/30 bg-orange-500/10 text-orange-400";
    }

    return "border-white/10 bg-white/5 text-gray-400";
  };

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/admin/prestasi"
            className="text-sm font-semibold text-gray-400 transition hover:text-red-500"
          >
            ← Kembali ke Prestasi
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
            Admin Karate Smalsa
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {championship.nama_kejuaraan}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              📅 {championship.tanggal}
            </span>

            {championship.tempat && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                📍 {championship.tempat}
              </span>
            )}

            {championship.tingkat && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                🏆 {championship.tingkat}
              </span>
            )}
          </div>

          {championship.deskripsi && (
            <p className="mt-5 max-w-3xl leading-7 text-gray-400">
              {championship.deskripsi}
            </p>
          )}
        </div>

        {/* ACTION */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/admin/prestasi/${id}/tambah`}
            className="rounded-xl bg-red-600 px-5 py-3 text-center text-sm font-semibold transition hover:bg-red-700"
          >
            + Tambah Peraih Prestasi
          </Link>

          <Link
            href={`/admin/prestasi/${id}/edit`}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-semibold transition hover:bg-white/10"
          >
            Edit Kejuaraan
          </Link>
        </div>

        {/* PERAIH PRESTASI */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold">
              Peraih Prestasi
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Anggota Karate Smalsa yang memperoleh
              prestasi pada kejuaraan ini.
            </p>
          </div>

          {achievementError && (
            <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-5 text-sm text-red-400">
              Gagal memuat data prestasi:
              {" "}
              {achievementError.message}
            </div>
          )}

          {!achievementError &&
            (!achievements || achievements.length === 0) && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950 p-8 text-center">
                <div className="text-4xl">
                  🏆
                </div>

                <h3 className="mt-4 text-lg font-semibold">
                  Belum ada peraih prestasi
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Tambahkan anggota yang memperoleh
                  medali pada kejuaraan ini.
                </p>

                <Link
                  href={`/admin/prestasi/${id}/tambah`}
                  className="mt-5 inline-block rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-700"
                >
                  + Tambah Peraih Prestasi
                </Link>
              </div>
            )}

          {achievements &&
            achievements.length > 0 && (
              <div className="grid gap-4">
                {achievements.map((achievement: Achievement) => (
                    <div
                      key={achievement.id}
                      className="rounded-2xl border border-white/10 bg-zinc-950 p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div>
                          <h3 className="text-lg font-bold">
  {achievement.member?.[0]?.nama_lengkap ||
    "Anggota tidak ditemukan"}
</h3>

{achievement.member?.[0]?.kelas && (
  <p className="mt-1 text-sm text-gray-500">
    {achievement.member[0].kelas}
  </p>
)}

                          {achievement.kategori && (
                            <p className="mt-4 text-sm text-gray-300">
                              <span className="text-gray-500">
                                Kategori:
                              </span>{" "}
                              {achievement.kategori}
                            </p>
                          )}

                          {achievement.keterangan && (
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                              {achievement.keterangan}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-start gap-3 sm:items-end">
                          <span
                            className={`rounded-full border px-4 py-2 text-sm font-bold ${medalClass(
                              achievement.medali
                            )}`}
                          >
                            🏅 {achievement.medali}
                          </span>

                          <Link
                            href={`/admin/prestasi/${id}/peraih/${achievement.id}`}
                            className="text-sm font-semibold text-red-500 hover:text-red-400"
                          >
                            Kelola Peraih →
                          </Link>
                        </div>

                      </div>
                        </div>
  ))}
              </div>
            )}
        </section>
      </div>
    </main>
  );
}