import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Achievement = {
  id: string;
  medali: string | null;
  kategori: string | null;
  championship:
    | {
        nama_kejuaraan: string | null;
        tanggal: string | null;
        tingkat: string | null;
      }
    | {
        nama_kejuaraan: string | null;
        tanggal: string | null;
        tingkat: string | null;
      }[]
    | null;
};

type Member = {
  id: string;
  nama_lengkap: string;
  kelas: string | null;
  warna_sabuk: string | null;
  status: string | null;
  foto: string | null;
  achievement_records: Achievement[] | null;
};

type AttendanceRecord = {
  member_id: string;
  status: string;
};

export default async function AnggotaPage() {
  const supabase = await createClient();

  /*
   * ============================================================
   * AMBIL DATA ANGGOTA
   * ============================================================
   */

  const { data: anggotaData, error } = await supabase
    .from("members")
    .select(`
      id,
      nama_lengkap,
      kelas,
      warna_sabuk,
      status,
      foto,
      achievement_records (
        id,
        medali,
        kategori,
        championship:championships (
          nama_kejuaraan,
          tanggal,
          tingkat
        )
      )
    `)
    .eq("status", "Aktif")
    .order("nama_lengkap", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">
            Anggota Karate Smalsa
          </h1>

          <p className="mt-4 text-red-400">
            Gagal mengambil data anggota: {error.message}
          </p>
        </div>
      </main>
    );
  }

  const anggota = (anggotaData || []) as Member[];

  /*
   * ============================================================
   * TAHUN BERJALAN
   * ============================================================
   *
   * Digunakan untuk perhitungan Best Athlete.
   */

  const tahunSekarang = new Date().getFullYear();

  const awalTahun = new Date(
    `${tahunSekarang}-01-01T00:00:00`
  );

  const akhirTahun = new Date(
    `${tahunSekarang + 1}-01-01T00:00:00`
  );

  /*
   * ============================================================
   * BULAN BERJALAN — MOST DILIGENT
   * ============================================================
   *
   * Kita gunakan zona waktu Asia/Jakarta agar bulan yang dihitung
   * sesuai dengan waktu Indonesia.
   */

  const formatterJakarta = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  });

  const bagianTanggal = formatterJakarta.formatToParts(
    new Date()
  );

  const tahunJakarta = Number(
    bagianTanggal.find(
      (part) => part.type === "year"
    )?.value
  );

  const bulanJakarta = Number(
    bagianTanggal.find(
      (part) => part.type === "month"
    )?.value
  );

  const awalBulanString =
    `${tahunJakarta}-${String(bulanJakarta).padStart(2, "0")}-01`;

  const bulanBerikutnya =
    bulanJakarta === 12
      ? 1
      : bulanJakarta + 1;

  const tahunBulanBerikutnya =
    bulanJakarta === 12
      ? tahunJakarta + 1
      : tahunJakarta;

  const akhirBulanString =
    `${tahunBulanBerikutnya}-${String(
      bulanBerikutnya
    ).padStart(2, "0")}-01`;

  /*
   * ============================================================
   * AMBIL JADWAL LATIHAN BULAN BERJALAN
   * ============================================================
   */

  const { data: trainingSessionsData } = await supabase
    .from("training_sessions")
    .select("id, tanggal, status")
    .gte("tanggal", awalBulanString)
    .lt("tanggal", akhirBulanString)
    .neq("status", "Dibatalkan");

  const trainingSessions =
    trainingSessionsData || [];

  /*
   * ============================================================
   * AMBIL PRESENSI BULAN BERJALAN
   * ============================================================
   */

  let attendanceRecords: AttendanceRecord[] = [];

  if (trainingSessions.length > 0) {
    const trainingSessionIds =
      trainingSessions.map(
        (session) => session.id
      );

    const {
      data: attendanceData,
    } = await supabase
      .from("attendance_records")
      .select(
        "member_id, status"
      )
      .in(
        "training_session_id",
        trainingSessionIds
      )
      .eq("status", "Hadir");

    attendanceRecords =
      (attendanceData || []) as AttendanceRecord[];
  }

  /*
   * ============================================================
   * HITUNG JUMLAH HADIR SETIAP ANGGOTA
   * ============================================================
   */

  const jumlahHadirMap =
    new Map<string, number>();

  attendanceRecords.forEach(
    (record) => {
      const jumlah =
        jumlahHadirMap.get(
          record.member_id
        ) || 0;

      jumlahHadirMap.set(
        record.member_id,
        jumlah + 1
      );
    }
  );

  /*
   * ============================================================
   * JUMLAH HADIR TERTINGGI
   * ============================================================
   *
   * Jika ada beberapa anggota dengan jumlah tertinggi
   * yang sama, semuanya akan menjadi Most Diligent.
   */

  let jumlahHadirTertinggi = 0;

  anggota.forEach((member) => {
    const jumlah =
      jumlahHadirMap.get(member.id) || 0;

    if (
      jumlah >
      jumlahHadirTertinggi
    ) {
      jumlahHadirTertinggi =
        jumlah;
    }
  });

  /*
   * ============================================================
   * NAMA BULAN
   * ============================================================
   */

  const namaBulan = new Intl.DateTimeFormat(
    "id-ID",
    {
      timeZone: "Asia/Jakarta",
      month: "long",
    }
  ).format(new Date());

  /*
   * ============================================================
   * FUNGSI CHAMPIONSHIP
   * ============================================================
   */

  function getChampionship(
    championship: Achievement["championship"]
  ) {
    if (!championship) {
      return null;
    }

    if (Array.isArray(championship)) {
      return championship[0] || null;
    }

    return championship;
  }

  /*
   * ============================================================
   * NILAI MEDALI
   * ============================================================
   */

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

  /*
   * ============================================================
   * HITUNG PRESTASI SETIAP ANGGOTA
   * ============================================================
   */

  const statistikAnggota = anggota.map(
    (member) => {
      const achievements =
        member.achievement_records || [];

      /*
       * Hanya prestasi pada tahun berjalan.
       */

      const prestasiTahunIni =
        achievements.filter(
          (achievement) => {
            const championship =
              getChampionship(
                achievement.championship
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

      const jumlahHadir =
        jumlahHadirMap.get(
          member.id
        ) || 0;

      /*
       * Most Diligent:
       *
       * - harus punya minimal 1 Hadir
       * - jumlah Hadir harus sama dengan
       *   jumlah tertinggi bulan ini
       */

      const isMostDiligent =
        jumlahHadir > 0 &&
        jumlahHadir ===
          jumlahHadirTertinggi;

      return {
        member,
        emas,
        perak,
        perunggu,
        jumlahHadir,
        isMostDiligent,
      };
    }
  );

  /*
   * ============================================================
   * MENENTUKAN BEST ATHLETE
   * ============================================================
   */

  const statistikTerbaik =
    statistikAnggota.reduce(
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
      null as
        | (typeof statistikAnggota)[number]
        | null
    );

  /*
   * ============================================================
   * DAFTAR BEST ATHLETE
   * ============================================================
   */

  const bestAthleteIds =
    new Set(
      statistikAnggota
        .filter((statistik) => {
          const memilikiMedali =
            statistik.emas > 0 ||
            statistik.perak > 0 ||
            statistik.perunggu > 0;

          if (!memilikiMedali) {
            return false;
          }

          return (
            statistik.emas ===
              statistikTerbaik?.emas &&
            statistik.perak ===
              statistikTerbaik?.perak &&
            statistik.perunggu ===
              statistikTerbaik?.perunggu
          );
        })
        .map(
          (statistik) =>
            statistik.member.id
        )
    );

  /*
   * ============================================================
   * FOTO ANGGOTA
   * ============================================================
   */

  function getFotoUrl(
    foto: string | null
  ) {
    if (!foto) {
      return null;
    }

    /*
     * Jika database menyimpan URL lengkap.
     */

    if (foto.startsWith("http")) {
      return foto;
    }

    /*
     * Jika database menyimpan path seperti:
     * anggota/namafile.jpg
     */

    const { data } =
      supabase.storage
        .from("karate-smalsa")
        .getPublicUrl(foto);

    return data.publicUrl;
  }

  /*
   * ============================================================
   * TAMPILAN
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Karate Smalsa
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Anggota
          </h1>

          <p className="mt-4 max-w-2xl text-gray-400">
            Daftar anggota aktif ekstrakurikuler Karate SMA Al Islam 1
            Surakarta.
          </p>
        </div>

        {/* DAFTAR ANGGOTA */}
        {anggota.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {statistikAnggota.map(
              (statistik) => {
                const member =
                  statistik.member;

                const fotoUrl =
                  getFotoUrl(
                    member.foto
                  );

                const isBestAthlete =
                  bestAthleteIds.has(
                    member.id
                  );

                const isMostDiligent =
                  statistik.isMostDiligent;

                return (
                  <Link
                    key={member.id}
                    href={`/anggota/${member.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 transition hover:-translate-y-1 hover:border-red-500/50"
                  >

                    {/* ====================================================
                        PITA BEST ATHLETE
                       ==================================================== */}

                    {isBestAthlete && (
                      <div className="absolute right-[-45px] top-[25px] z-20 w-[180px] rotate-45 bg-red-600 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-lg">
                        🏆 Best Athlete
                      </div>
                    )}

                    {/* ====================================================
                        BADGE MOST DILIGENT
                       ==================================================== */}

                    {isMostDiligent && (
                      <div className="absolute left-3 top-3 z-20 rounded-full border border-yellow-500/40 bg-black/85 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-yellow-300 shadow-lg backdrop-blur-sm">
                        ⭐ Most Diligent
                      </div>
                    )}

                    {/* FOTO */}
                    <div className="aspect-[4/3] overflow-hidden bg-zinc-900">
                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt={
                            member.nama_lengkap
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-600">
                          <span className="text-sm">
                            Belum ada foto
                          </span>
                        </div>
                      )}
                    </div>

                    {/* INFORMASI */}
                    <div className="p-5">

                      <p className="text-xs font-semibold uppercase tracking-widest text-red-500">
                        {member.kelas ||
                          "Kelas belum diisi"}
                      </p>

                      <h2 className="mt-2 text-xl font-bold text-white">
                        {member.nama_lengkap}
                      </h2>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">
                          Sabuk{" "}
                          {member.warna_sabuk ||
                            "-"}
                        </span>

                        <span className="text-sm text-red-400 transition group-hover:text-red-300">
                          Lihat detail →
                        </span>
                      </div>

                      {/* ==================================================
                          INFO MOST DILIGENT
                         ================================================== */}

                      {isMostDiligent && (
                        <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold text-yellow-300">
                              ⭐ Most Diligent
                            </span>

                            <span className="text-xs text-yellow-500/80">
                              {statistik.jumlahHadir}× Hadir
                            </span>
                          </div>

                          <p className="mt-1 text-[10px] text-zinc-500">
                            {namaBulan} {tahunJakarta}
                          </p>
                        </div>
                      )}

                    </div>
                  </Link>
                );
              }
            )}

          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-10 text-center">
            <p className="text-gray-400">
              Belum ada anggota aktif.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}