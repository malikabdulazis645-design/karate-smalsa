import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

type Achievement = {
  id: string;
  member_id: string | null;
  kategori: string | null;
  medali: string | null;
  keterangan: string | null;
};

type Member = {
  id: string;
  nama_lengkap: string;
  kelas: string | null;
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
        "id, member_id, kategori, medali, keterangan"
      )
      .eq("championship_id", id)
      .order("created_at", { ascending: true });

  const dataPrestasi = (achievements || []) as Achievement[];

  // =====================================================
  // DATA ANGGOTA
  // =====================================================

  const memberIds = dataPrestasi
    .map((achievement) => achievement.member_id)
    .filter(
      (memberId): memberId is string =>
        Boolean(memberId)
    );

  let members: Member[] = [];

  if (memberIds.length > 0) {
    const { data: memberData } = await supabase
      .from("members")
      .select("id, nama_lengkap, kelas")
      .in("id", memberIds);

    members = (memberData || []) as Member[];
  }

  // =====================================================
  // TOTAL PERAIH MEDALI
  // =====================================================
  //
  // Satu anggota hanya dihitung satu kali.
  //
  // Contoh:
  // Fadhil -> Emas
  // Fadhil -> Perak
  // Salwa  -> Emas
  //
  // Total = 2 anggota, bukan 3 prestasi.
  //
  // =====================================================

  const totalPeraihMedali = new Set(
    dataPrestasi
      .map((achievement) => achievement.member_id)
      .filter(Boolean)
  ).size;

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
  // STYLE MEDALI
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

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="bg-black px-6 pb-20 pt-36 text-white">
        <div className="mx-auto max-w-7xl">
          {/* KEMBALI */}
          <Link
            href="/prestasi"
            className="inline-flex items-center text-sm font-medium text-zinc-500 transition hover:text-red-500"
          >
            ← Kembali ke Prestasi
          </Link>

          {/* LABEL */}
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.25em] text-red-500">
            Detail Kejuaraan
          </p>

          {/* JUDUL */}
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            {championship.nama_kejuaraan}
          </h1>

          {/* INFO KEJUARAAN */}
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
              {tahunKejuaraan}
            </span>

            {championship.tingkat && (
              <span className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300">
                🏆 {championship.tingkat}
              </span>
            )}

            {championship.tanggal && (
              <span className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300">
                📅 {tanggalKejuaraan}
              </span>
            )}

            {championship.tempat && (
              <span className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300">
                📍 {championship.tempat}
              </span>
            )}
          </div>

          {/* DESKRIPSI */}
          {championship.deskripsi && (
            <p className="mt-8 max-w-3xl text-base leading-7 text-zinc-400 md:text-lg">
              {championship.deskripsi}
            </p>
          )}
        </div>
      </section>

      {/* =====================================================
          STATISTIK
      ===================================================== */}

      <section className="-mt-8 px-6">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2">
          {/* TOTAL DATA PRESTASI */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
            <p className="text-sm font-medium text-zinc-500">
              Total Prestasi
            </p>

            <p className="mt-2 text-4xl font-black text-red-600">
              {dataPrestasi.length}
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Jumlah medali yang berhasil diraih.
            </p>
          </div>

          {/* TOTAL ANGGOTA UNIK */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
            <p className="text-sm font-medium text-zinc-500">
              Total Peraih Medali
            </p>

            <p className="mt-2 text-4xl font-black">
              {totalPeraihMedali}
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Anggota yang berhasil meraih medali.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {achievementError && (
        <section className="px-6 pt-10">
          <div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            Gagal memuat data prestasi:
            <br />
            {achievementError.message}
          </div>
        </section>
      )}

      {/* =====================================================
          REKAP PENCAPAIAN
      ===================================================== */}

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
              Rekap Pencapaian
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Kategori Juara
            </h2>

            <p className="mt-3 max-w-2xl text-zinc-500">
              Anggota Karate Smalsa yang berhasil meraih medali
              dalam kejuaraan ini.
            </p>
          </div>

          {/* BELUM ADA DATA */}
          {!achievementError && dataPrestasi.length === 0 && (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center">
              <div className="text-5xl">🏅</div>

              <h3 className="mt-5 text-xl font-black">
                Belum Ada Data Prestasi
              </h3>

              <p className="mt-2 text-zinc-500">
                Belum ada anggota yang tercatat meraih medali
                dalam kejuaraan ini.
              </p>
            </div>
          )}

          {/* DAFTAR PRESTASI */}
          {!achievementError && dataPrestasi.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              {dataPrestasi.map((achievement) => {
                const member = members.find(
                  (item) =>
                    item.id === achievement.member_id
                );

                const medal = medalStyle(
                  achievement.medali
                );

                return (
                  <div
                    key={achievement.id}
                    className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-lg"
                  >
                    {/* HEADER MEDALI */}
                    <div className="flex items-start justify-between gap-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-50 text-3xl">
                        {medal.emoji}
                      </div>

                      <span
                        className={`rounded-full border px-4 py-2 text-sm font-black ${medal.className}`}
                      >
                        {medal.emoji}{" "}
                        {achievement.medali ||
                          "Prestasi"}
                      </span>
                    </div>

                    {/* KATEGORI */}
                    <div className="mt-7">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                        Kategori
                      </p>

                      <h3 className="mt-2 text-2xl font-black leading-tight text-zinc-900">
                        {achievement.kategori ||
                          "Kategori tidak tersedia"}
                      </h3>
                    </div>

                    {/* KETERANGAN */}
                    {achievement.keterangan && (
                      <p className="mt-4 text-sm leading-6 text-zinc-500">
                        {achievement.keterangan}
                      </p>
                    )}

                    {/* DATA PERAIH */}
                    <div className="mt-7 border-t border-zinc-100 pt-6">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                        Peraih
                      </p>

                      {member ? (
                        <Link
                          href={`/anggota/${member.id}`}
                          className="group/member mt-4 flex items-center justify-between gap-4 rounded-2xl bg-zinc-50 p-4 transition hover:bg-red-50"
                        >
                          <div>
                            <p className="font-black text-zinc-900 transition group-hover/member:text-red-600">
                              {member.nama_lengkap}
                            </p>

                            <p className="mt-1 text-sm font-medium text-zinc-500">
                              {member.kelas || "-"}
                            </p>
                          </div>

                          <span className="shrink-0 text-sm font-bold text-zinc-400 transition group-hover/member:translate-x-1 group-hover/member:text-red-600">
                            Lihat Profil →
                          </span>
                        </Link>
                      ) : (
                        <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
                          <p className="font-bold text-zinc-500">
                            Anggota tidak ditemukan
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          TOTAL PERAIH MEDALI
      ===================================================== */}

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-black px-8 py-12 text-center text-white md:px-16">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">
              Total Peraih Medali
            </p>

            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              {totalPeraihMedali} Anggota
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
              Berhasil menyumbang medali untuk Karate
              Smalsa.
            </p>

            <Link
              href="/anggota"
              className="mt-8 inline-flex rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
            >
              Lihat Semua Anggota
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-black px-6 py-10 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Karate Smalsa · SMA Al Islam 1
        Surakarta
      </footer>
    </main>
  );
}