import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Achievement = {
  id: string;
  championship_id: string | null;
  kategori: string | null;
  medali: string | null;
  keterangan: string | null;
};

type Championship = {
  id: string;
  nama_kejuaraan: string;
  tanggal: string;
  tempat: string | null;
  tingkat: string | null;
};

export default async function AnggotaDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // =====================================================
  // DATA ANGGOTA
  // =====================================================

  const { data: member, error } = await supabase
    .from("members")
    .select(
      "id, nama_lengkap, kelas, tempat_lahir, tanggal_lahir, warna_sabuk, nomor_whatsapp, foto, status"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !member) {
    notFound();
  }

  // =====================================================
  // DATA PRESTASI ANGGOTA
  // =====================================================

  const { data: achievements, error: achievementError } =
    await supabase
      .from("achievement_records")
      .select(
        "id, championship_id, kategori, medali, keterangan"
      )
      .eq("member_id", id)
      .order("created_at", { ascending: false });

  const prestasi = (achievements || []) as Achievement[];

  // =====================================================
  // DATA KEJUARAAN
  // =====================================================

  const championshipIds = prestasi
    .map((achievement) => achievement.championship_id)
    .filter(
      (championshipId): championshipId is string =>
        Boolean(championshipId)
    );

  let championships: Championship[] = [];

  if (championshipIds.length > 0) {
    const { data: championshipData } = await supabase
      .from("championships")
      .select(
        "id, nama_kejuaraan, tanggal, tempat, tingkat"
      )
      .in("id", championshipIds);

    championships =
      (championshipData || []) as Championship[];
  }

  // =====================================================
  // URUTKAN PRESTASI BERDASARKAN TANGGAL KEJUARAAN
  // TERBARU → TERLAMA
  // =====================================================

  const prestasiTerurut = [...prestasi].sort((a, b) => {
    const championshipA = championships.find(
      (item) => item.id === a.championship_id
    );

    const championshipB = championships.find(
      (item) => item.id === b.championship_id
    );

    const tanggalA = championshipA?.tanggal
      ? new Date(championshipA.tanggal).getTime()
      : 0;

    const tanggalB = championshipB?.tanggal
      ? new Date(championshipB.tanggal).getTime()
      : 0;

    return tanggalB - tanggalA;
  });

  // =====================================================
  // BEST ATHLETE OF THE YEAR
  // =====================================================

  const tahunSekarang = new Date().getFullYear();

  const awalTahun = new Date(
    `${tahunSekarang}-01-01T00:00:00`
  );

  const akhirTahun = new Date(
    `${tahunSekarang + 1}-01-01T00:00:00`
  );

  function getMedalValue(
    medali: string | null
  ) {
    if (!medali) {
      return 0;
    }

    const value = medali
      .toLowerCase()
      .trim();

    if (
      value === "emas" ||
      value === "gold"
    ) {
      return 3;
    }

    if (
      value === "perak" ||
      value === "silver"
    ) {
      return 2;
    }

    if (
      value === "perunggu" ||
      value === "bronze"
    ) {
      return 1;
    }

    return 0;
  }

  // =====================================================
  // HITUNG MEDALI ANGGOTA TAHUN BERJALAN
  // =====================================================

  const prestasiTahunIni = prestasi.filter(
    (achievement) => {
      const championship = championships.find(
        (item) =>
          item.id ===
          achievement.championship_id
      );

      if (!championship?.tanggal) {
        return false;
      }

      const tanggal = new Date(
        championship.tanggal
      );

      return (
        tanggal >= awalTahun &&
        tanggal < akhirTahun &&
        getMedalValue(
          achievement.medali
        ) > 0
      );
    }
  );

  let emas = 0;
  let perak = 0;
  let perunggu = 0;

  prestasiTahunIni.forEach(
    (achievement) => {
      const medalValue =
        getMedalValue(
          achievement.medali
        );

      if (medalValue === 3) {
        emas++;
      }

      if (medalValue === 2) {
        perak++;
      }

      if (medalValue === 1) {
        perunggu++;
      }
    }
  );

  // =====================================================
  // CEK APAKAH ANGGOTA INI BEST ATHLETE
  // =====================================================
  //
  // Perhitungan:
  //
  // 1. Emas
  // 2. Jika sama → Perak
  // 3. Jika sama → Perunggu
  //
  // Jika statistik seluruhnya sama,
  // semua anggota tersebut menjadi Best Athlete.
  //
  // Karena halaman ini hanya menampilkan satu anggota,
  // kita perlu mengambil seluruh anggota aktif dan
  // menghitung statistik mereka.

  const { data: semuaAnggota } = await supabase
    .from("members")
    .select(
      `
      id,
      achievement_records (
        id,
        medali,
        championship_id
      )
    `
    )
    .eq("status", "Aktif");

  const semuaAchievement = (semuaAnggota || []) as {
    id: string;
    achievement_records:
      | {
          id: string;
          medali: string | null;
          championship_id: string | null;
        }[]
      | null;
  }[];

  // =====================================================
  // AMBIL SEMUA CHAMPIONSHIP YANG DIPERLUKAN
  // =====================================================

  const semuaChampionshipIds = Array.from(
    new Set(
      semuaAchievement.flatMap(
        (anggota) =>
          (anggota.achievement_records || [])
            .map(
              (achievement) =>
                achievement.championship_id
            )
            .filter(
              (
                championshipId
              ): championshipId is string =>
                Boolean(championshipId)
            )
      )
    )
  );

  let semuaChampionships: Championship[] = [];

  if (semuaChampionshipIds.length > 0) {
    const {
      data: semuaChampionshipData,
    } = await supabase
      .from("championships")
      .select(
        "id, nama_kejuaraan, tanggal, tempat, tingkat"
      )
      .in(
        "id",
        semuaChampionshipIds
      );

    semuaChampionships =
      (semuaChampionshipData ||
        []) as Championship[];
  }

  // =====================================================
  // HITUNG STATISTIK SEMUA ANGGOTA
  // =====================================================

  const statistikSemuaAnggota =
    semuaAchievement.map(
      (anggota) => {
        let jumlahEmas = 0;
        let jumlahPerak = 0;
        let jumlahPerunggu = 0;

        const achievements =
          anggota.achievement_records ||
          [];

        achievements.forEach(
          (achievement) => {
            const championship =
              semuaChampionships.find(
                (item) =>
                  item.id ===
                  achievement.championship_id
              );

            if (!championship?.tanggal) {
              return;
            }

            const tanggal = new Date(
              championship.tanggal
            );

            if (
              tanggal < awalTahun ||
              tanggal >= akhirTahun
            ) {
              return;
            }

            const medalValue =
              getMedalValue(
                achievement.medali
              );

            if (medalValue === 3) {
              jumlahEmas++;
            }

            if (medalValue === 2) {
              jumlahPerak++;
            }

            if (medalValue === 1) {
              jumlahPerunggu++;
            }
          }
        );

        return {
          id: anggota.id,
          emas: jumlahEmas,
          perak: jumlahPerak,
          perunggu: jumlahPerunggu,
        };
      }
    );

  // =====================================================
  // CARI STATISTIK TERBAIK
  // =====================================================

  const statistikTerbaik =
    statistikSemuaAnggota.reduce(
      (terbaik, current) => {
        if (!terbaik) {
          return current;
        }

        if (
          current.emas >
          terbaik.emas
        ) {
          return current;
        }

        if (
          current.emas <
          terbaik.emas
        ) {
          return terbaik;
        }

        if (
          current.perak >
          terbaik.perak
        ) {
          return current;
        }

        if (
          current.perak <
          terbaik.perak
        ) {
          return terbaik;
        }

        if (
          current.perunggu >
          terbaik.perunggu
        ) {
          return current;
        }

        return terbaik;
      },
      null as {
        id: string;
        emas: number;
        perak: number;
        perunggu: number;
      } | null
    );

  // =====================================================
  // CEK BEST ATHLETE
  // =====================================================

  const memilikiMedali =
    emas > 0 ||
    perak > 0 ||
    perunggu > 0;

  const isBestAthlete =
    memilikiMedali &&
    statistikTerbaik !== null &&
    emas === statistikTerbaik.emas &&
    perak === statistikTerbaik.perak &&
    perunggu === statistikTerbaik.perunggu;

  // =====================================================
  // TOTAL MEDALI TAHUN BERJALAN
  // =====================================================

  const totalMedaliTahunIni =
    emas + perak + perunggu;

  // =====================================================
  // FORMAT TANGGAL LAHIR
  // =====================================================

  const tanggalLahir =
    member.tanggal_lahir
      ? new Date(
          member.tanggal_lahir
        ).toLocaleDateString(
          "id-ID",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )
      : "-";

  // =====================================================
  // WARNA MEDALI
  // =====================================================

  const medalClass = (
    medali: string | null
  ) => {
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
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="border-b border-zinc-900 bg-black pt-36 pb-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">

          <Link
            href="/anggota"
            className="text-sm font-medium text-zinc-500 transition hover:text-red-500"
          >
            ← Kembali ke Anggota
          </Link>

          <div className="mt-10 grid gap-10 md:grid-cols-[320px_1fr] md:items-center">

            {/* FOTO */}
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">

              {member.foto ? (
                <Image
                  src={member.foto}
                  alt={member.nama_lengkap}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border border-red-600/30 bg-red-600/10 text-5xl font-black text-red-500">
                    {member.nama_lengkap
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                </div>
              )}

            </div>

            {/* INFORMASI UTAMA */}
            <div>

              <div className="flex flex-wrap gap-3">

                <span className="rounded-full bg-green-500/10 px-4 py-2 text-xs font-bold text-green-400">
                  {member.status || "Aktif"}
                </span>

                {member.warna_sabuk && (
                  <span className="rounded-full bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400">
                    Sabuk{" "}
                    {member.warna_sabuk}
                  </span>
                )}

                {isBestAthlete && (
                  <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-yellow-400">
                    🏆 Best Athlete of the Year{" "}
                    {tahunSekarang}
                  </span>
                )}

              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                {member.nama_lengkap}
              </h1>

              <p className="mt-3 text-lg text-zinc-500">
                {member.kelas}
              </p>

              {member.nomor_whatsapp && (
                <a
                  href={`https://wa.me/${member.nomor_whatsapp.replace(
                    /^0/,
                    "62"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
                >
                  Hubungi WhatsApp
                </a>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* BEST ATHLETE OF THE YEAR */}
      <section className="border-b border-zinc-900 bg-zinc-950 py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">

          <div
            className={`overflow-hidden rounded-3xl border p-8 ${
              isBestAthlete
                ? "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-zinc-950 to-black"
                : "border-zinc-800 bg-black"
            }`}
          >

            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

              {/* KETERANGAN */}
              <div>

                <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
                  Performa Tahun {tahunSekarang}
                </p>

                {isBestAthlete ? (
                  <>
                    <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                      🏆 Best Athlete of the Year
                    </h2>

                    <p className="mt-3 max-w-2xl text-zinc-400">
                      {member.nama_lengkap} menjadi salah satu
                      atlet terbaik Karate Smalsa pada tahun{" "}
                      {tahunSekarang}, berdasarkan perolehan
                      medali selama satu tahun.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                      Perolehan Medali {tahunSekarang}
                    </h2>

                    <p className="mt-3 max-w-2xl text-zinc-400">
                      Statistik medali {member.nama_lengkap} selama
                      tahun {tahunSekarang}.
                    </p>
                  </>
                )}

              </div>

              {/* TOTAL MEDALI */}
              <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Total Medali
                </div>

                <div className="mt-2 text-4xl font-black text-white">
                  {totalMedaliTahunIni}
                </div>

                <div className="mt-1 text-xs text-zinc-500">
                  tahun {tahunSekarang}
                </div>
              </div>

            </div>

            {/* STATISTIK MEDALI */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">

              {/* EMAS */}
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                <div className="text-3xl">
                  🥇
                </div>

                <div className="mt-3 text-xs font-bold uppercase tracking-wider text-yellow-500/70">
                  Emas
                </div>

                <div className="mt-1 text-3xl font-black text-yellow-400">
                  {emas}
                </div>
              </div>

              {/* PERAK */}
              <div className="rounded-2xl border border-gray-400/20 bg-gray-400/5 p-5">
                <div className="text-3xl">
                  🥈
                </div>

                <div className="mt-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Perak
                </div>

                <div className="mt-1 text-3xl font-black text-gray-300">
                  {perak}
                </div>
              </div>

              {/* PERUNGGU */}
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
                <div className="text-3xl">
                  🥉
                </div>

                <div className="mt-3 text-xs font-bold uppercase tracking-wider text-orange-500/70">
                  Perunggu
                </div>

                <div className="mt-1 text-3xl font-black text-orange-400">
                  {perunggu}
                </div>
              </div>

            </div>

            {/* ATURAN PENILAIAN */}
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-black/50 p-5">

              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Dasar Perhitungan Best Athlete
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Penilaian dilakukan berdasarkan jumlah medali
                pada tahun berjalan dengan urutan prioritas{" "}
                <span className="font-bold text-white">
                  emas → perak → perunggu
                </span>
                . Jika beberapa anggota memiliki jumlah
                medali yang sama persis, semuanya ditetapkan
                sebagai Best Athlete of the Year.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* DATA PRIBADI */}
      <section className="bg-zinc-950 py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">

          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Profil Anggota
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Informasi Pribadi
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <InfoCard
              label="Nama Lengkap"
              value={member.nama_lengkap}
            />

            <InfoCard
              label="Kelas"
              value={member.kelas || "-"}
            />

            <InfoCard
              label="Tempat Lahir"
              value={member.tempat_lahir || "-"}
            />

            <InfoCard
              label="Tanggal Lahir"
              value={tanggalLahir}
            />

            <InfoCard
              label="Warna Sabuk"
              value={member.warna_sabuk || "-"}
            />

            <InfoCard
              label="Nomor WhatsApp"
              value={member.nomor_whatsapp || "-"}
            />

          </div>
        </div>
      </section>

      {/* PRESTASI */}
      <section className="border-t border-zinc-900 bg-black py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">

          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
            Prestasi
          </p>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h2 className="text-3xl font-black sm:text-4xl">
                Prestasi Anggota
              </h2>

              <p className="mt-2 text-zinc-500">
                Riwayat pencapaian {member.nama_lengkap}.
              </p>
            </div>

            {prestasiTerurut.length > 0 && (
              <div className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400">
                🏆 {prestasiTerurut.length} Prestasi
              </div>
            )}

          </div>

          {achievementError && (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-sm text-red-400">
              Gagal memuat data prestasi:
              <br />
              {achievementError.message}
            </div>
          )}

          {!achievementError &&
            prestasiTerurut.length === 0 && (
              <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
                <p className="text-zinc-500">
                  Belum ada data prestasi untuk anggota ini.
                </p>
              </div>
            )}

          {!achievementError &&
            prestasiTerurut.length > 0 && (
              <div className="mt-8 grid gap-5">

                {prestasiTerurut.map(
                  (achievement) => {
                    const championship =
                      championships.find(
                        (item) =>
                          item.id ===
                          achievement.championship_id
                      ) || null;

                    return (
                      <div
                        key={achievement.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-zinc-700"
                      >

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                          <div>

                            {/* NAMA KEJUARAAN */}
                            <h3 className="text-xl font-black text-white">
                              {championship?.nama_kejuaraan ||
                                "Kejuaraan"}
                            </h3>

                            {/* INFORMASI KEJUARAAN */}
                            {championship && (
                              <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">

                                <span>
                                  📅{" "}
                                  {new Date(
                                    championship.tanggal
                                  ).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    }
                                  )}
                                </span>

                                {championship.tempat && (
                                  <span>
                                    📍{" "}
                                    {championship.tempat}
                                  </span>
                                )}

                                {championship.tingkat && (
                                  <span>
                                    🏆{" "}
                                    {championship.tingkat}
                                  </span>
                                )}

                              </div>
                            )}

                            {/* KATEGORI */}
                            {achievement.kategori && (
                              <p className="mt-4 text-sm text-zinc-300">
                                <span className="text-zinc-600">
                                  Kategori:
                                </span>{" "}
                                {achievement.kategori}
                              </p>
                            )}

                            {/* KETERANGAN */}
                            {achievement.keterangan && (
                              <p className="mt-3 text-sm leading-6 text-zinc-500">
                                {achievement.keterangan}
                              </p>
                            )}

                          </div>

                          {/* MEDALI */}
                          <div className="shrink-0">

                            <span
                              className={`inline-flex rounded-full border px-4 py-2 text-sm font-bold ${medalClass(
                                achievement.medali
                              )}`}
                            >
                              🏅{" "}
                              {achievement.medali ||
                                "Prestasi"}
                            </span>

                          </div>

                        </div>
                      </div>
                    );
                  }
                )}

              </div>
            )}

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-black py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="font-bold text-white">
              KARATE SMALSA
            </div>

            <div className="mt-1">
              SMA Al Islam 1 Surakarta
            </div>
          </div>

          <div>
            © {new Date().getFullYear()} Karate Smalsa.
          </div>

        </div>
      </footer>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

      <div className="text-xs font-bold uppercase tracking-wider text-zinc-600">
        {label}
      </div>

      <div className="mt-3 text-base font-bold text-white">
        {value}
      </div>

    </div>
  );
}