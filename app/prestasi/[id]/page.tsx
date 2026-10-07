import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

type Achievement = {
  id: string;
  kategori: string | null;
  medali: string | null;
  keterangan: string | null;
  member: {
    id: string;
    nama_lengkap: string;
    kelas: string | null;
  }[];
};

export const metadata = {
  title: "Detail Prestasi",
  description:
    "Detail kejuaraan dan pencapaian Karate Smalsa SMA Al Islam 1 Surakarta.",
};

export default async function PrestasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  // =====================================================
  // DATA KEJUARAAN
  // =====================================================

  const { data: championship, error: championshipError } =
    await supabase
      .from("championships")
      .select(
        "id, nama_kejuaraan, tanggal, tempat, tingkat, deskripsi"
      )
      .eq("id", id)
      .maybeSingle();

  if (championshipError || !championship) {
    notFound();
  }

  // =====================================================
  // DATA PERAIH PRESTASI
  // =====================================================

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
          id,
          nama_lengkap,
          kelas
        )
      `
      )
      .eq("championship_id", id)
      .order("created_at", { ascending: true });

  const dataPrestasi: Achievement[] = achievements || [];

  // =====================================================
  // FORMAT TANGGAL
  // =====================================================

  const tanggalKejuaraan = championship.tanggal
    ? new Date(championship.tanggal).toLocaleDateString(
        "id-ID",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "-";

  const tahunKejuaraan = championship.tanggal
    ? new Date(championship.tanggal).getFullYear()
    : "";

  // =====================================================
  // WARNA MEDALI
  // =====================================================

  const medalStyle = (medali: string | null) => {
    if (medali === "Emas") {
      return {
        emoji: "🥇",
        className:
          "border-yellow-200 bg-yellow-50 text-yellow-700",
      };
    }

    if (medali === "Perak") {
      return {
        emoji: "🥈",
        className:
          "border-zinc-300 bg-zinc-100 text-zinc-700",
      };
    }

    if (medali === "Perunggu") {
      return {
        emoji: "🥉",
        className:
          "border-orange-200 bg-orange-50 text-orange-700",
      };
    }

    return {
      emoji: "🏅",
      className:
        "border-zinc-200 bg-zinc-100 text-zinc-600",
    };
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-black px-6 pb-16 pt-36 text-white">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/prestasi"
            className="mb-8 inline-flex items-center text-sm font-bold text-zinc-400 transition hover:text-red-500"
          >
            ← Kembali ke Prestasi
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              {championship.tingkat && (
                <span className="inline-flex rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-wider">
                  {championship.tingkat}
                </span>
              )}

              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                {championship.nama_kejuaraan}
              </h1>

              {championship.deskripsi && (
                <p className="mt-4 max-w-2xl text-zinc-400">
                  {championship.deskripsi}
                </p>
              )}
            </div>

            <div className="shrink-0">
              <span className="text-7xl font-black text-white/10 md:text-9xl">
                {tahunKejuaraan}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          INFORMASI KEJUARAAN
      ================================================= */}

      <section className="px-6 py-12">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Tanggal
            </p>

            <p className="mt-2 text-lg font-black">
              {tanggalKejuaraan}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Tempat
            </p>

            <p className="mt-2 text-lg font-black">
              {championship.tempat || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Tingkat Kejuaraan
            </p>

            <p className="mt-2 text-lg font-black text-red-600">
              {championship.tingkat || "-"}
            </p>
          </div>
        </div>
      </section>

      {/* =================================================
          KATEGORI JUARA
      ================================================= */}

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
              Rekap Pencapaian
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Kategori Juara
            </h2>

            <p className="mt-3 text-zinc-500">
              Anggota Karate Smalsa yang berhasil meraih
              medali dalam kejuaraan ini.
            </p>
          </div>

          {/* ERROR */}
          {achievementError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
              Gagal memuat data peraih prestasi:
              <br />
              {achievementError.message}
            </div>
          )}

          {/* BELUM ADA PRESTASI */}
          {!achievementError &&
            dataPrestasi.length === 0 && (
              <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center">
                <div className="text-5xl">
                  🏆
                </div>

                <h3 className="mt-5 text-xl font-black">
                  Belum Ada Peraih Prestasi
                </h3>

                <p className="mx-auto mt-2 max-w-md text-zinc-500">
                  Belum ada anggota Karate Smalsa yang
                  tercatat memperoleh prestasi pada
                  kejuaraan ini.
                </p>
              </div>
            )}

          {/* DATA PRESTASI */}
          {!achievementError &&
            dataPrestasi.length > 0 && (
              <div className="space-y-4">
                {dataPrestasi.map(
                  (achievement, index) => {
                    const medal = medalStyle(
                      achievement.medali
                    );

                    return (
                      <div
                        key={achievement.id}
                        className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-red-500 hover:shadow-lg md:p-6"
                      >
                        <div className="flex flex-col gap-5 md:flex-row md:items-center">
                          {/* MEDALI */}
                          <div
                            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-3xl ${medal.className}`}
                          >
                            {medal.emoji}
                          </div>

                          {/* KATEGORI */}
                          <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                              Kategori
                            </p>

                            <h3 className="mt-1 text-lg font-black md:text-xl">
                              {achievement.kategori ||
                                "Kategori tidak dicantumkan"}
                            </h3>

                            {achievement.keterangan && (
                              <p className="mt-2 text-sm leading-6 text-zinc-500">
                                {achievement.keterangan}
                              </p>
                            )}

                            <div className="mt-3">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${medal.className}`}
                              >
                                {medal.emoji}{" "}
                                {achievement.medali ||
                                  "Prestasi"}
                              </span>
                            </div>
                          </div>

                          {/* ANGGOTA */}
                          {achievement.member?.[0] ? (
                            <Link
                              href={`/anggota/${achievement.member[0].id}`}
                              className="rounded-xl bg-zinc-50 px-5 py-4 transition hover:bg-red-50"
                            >
                              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                Peraih
                              </p>

                              <p className="mt-1 font-black text-zinc-900 transition group-hover:text-red-600">
                                {
                                  achievement.member[0]
                                    .nama_lengkap
                                }
                              </p>

                              <p className="mt-1 text-sm text-zinc-500">
                                {achievement.member[0]
                                  .kelas || "-"}
                              </p>

                              <p className="mt-2 text-xs font-bold text-red-600">
                                Lihat Profil →
                              </p>
                            </Link>
                          ) : (
                            <div className="rounded-xl bg-zinc-50 px-5 py-4">
                              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                Peraih
                              </p>

                              <p className="mt-1 font-bold text-zinc-500">
                                Anggota tidak ditemukan
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
        </div>
      </section>

      {/* =================================================
          RINGKASAN
      ================================================= */}

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl rounded-3xl bg-black p-8 text-white md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">
                Total Peraih Medali
              </p>

              <h2 className="mt-2 text-4xl font-black">
                {dataPrestasi.length} Anggota
              </h2>

              <p className="mt-3 text-zinc-400">
                Berhasil membawa pulang medali untuk
                Karate Smalsa.
              </p>
            </div>

            <Link
              href="/anggota"
              className="inline-flex shrink-0 rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
            >
              Lihat Semua Anggota
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="bg-black px-6 py-10 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Karate Smalsa · SMA Al
        Islam 1 Surakarta
      </footer>
    </main>
  );
}