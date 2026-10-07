import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Prestasi",
  description:
    "Daftar kejuaraan dan prestasi Karate Smalsa SMA Al Islam 1 Surakarta.",
};

type Championship = {
  id: string;
  nama_kejuaraan: string;
  tanggal: string;
  tempat: string | null;
  tingkat: string | null;
  deskripsi: string | null;
};

type Achievement = {
  id: string;
  medali: string | null;
  member_id: string;
};

export default async function PrestasiPage() {
  const supabase = await createClient();

  // Ambil semua kejuaraan dari database
  const { data: kejuaraan, error: championshipError } =
    await supabase
      .from("championships")
      .select(
        "id, nama_kejuaraan, tanggal, tempat, tingkat, deskripsi"
      )
      .order("tanggal", { ascending: false });

  // Ambil semua data peraih prestasi
  const { data: achievements, error: achievementError } =
    await supabase
      .from("achievement_records")
      .select("id, medali, member_id");

  const championships: Championship[] = kejuaraan || [];
  const prestasi: Achievement[] = achievements || [];

  // Tahun kejuaraan terbaru
  const tahunTerbaru =
    championships.length > 0
      ? new Date(championships[0].tanggal).getFullYear()
      : "-";

  // Jumlah anggota unik yang pernah meraih prestasi
  const anggotaPeraih = new Set(
    prestasi.map((item) => item.member_id)
  ).size;

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />

      {/* HERO */}
      <section className="bg-black px-6 pb-20 pt-36 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-red-500">
            Rekam Jejak Karate Smalsa
          </p>

          <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            Prestasi &{" "}
            <span className="text-red-600">Kejuaraan</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
            Dokumentasi kejuaraan yang diikuti Karate Smalsa beserta
            pencapaian anggota di setiap kategori pertandingan.
          </p>
        </div>
      </section>

      {/* STATISTIK */}
      <section className="-mt-8 px-6">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
            <p className="text-sm font-medium text-zinc-500">
              Total Kejuaraan
            </p>

            <p className="mt-2 text-4xl font-black text-red-600">
              {championships.length}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
            <p className="text-sm font-medium text-zinc-500">
              Kejuaraan Terbaru
            </p>

            <p className="mt-2 text-4xl font-black">
              {tahunTerbaru}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
            <p className="text-sm font-medium text-zinc-500">
              Anggota Peraih Medali
            </p>

            <p className="mt-2 text-4xl font-black">
              {anggotaPeraih}
            </p>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {championshipError && (
        <section className="px-6 pt-10">
          <div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            Gagal memuat data kejuaraan:
            <br />
            {championshipError.message}
          </div>
        </section>
      )}

      {achievementError && (
        <section className="px-6 pt-4">
          <div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            Gagal memuat data prestasi:
            <br />
            {achievementError.message}
          </div>
        </section>
      )}

      {/* DAFTAR KEJUARAAN */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
              Daftar Kejuaraan
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Pencapaian Karate Smalsa
            </h2>
          </div>

          {championships.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center">
              <div className="text-5xl">🏆</div>

              <h3 className="mt-5 text-xl font-black">
                Belum Ada Kejuaraan
              </h3>

              <p className="mt-2 text-zinc-500">
                Data kejuaraan Karate Smalsa belum tersedia.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {championships.map((item) => {
                const tahun = new Date(
                  item.tanggal
                ).getFullYear();

                const jumlahPeraih = prestasi.filter(
                  (achievement) =>
                    achievement.member_id &&
                    // achievement_records yang terkait
                    // dengan kejuaraan ini akan dihitung
                    // melalui query tambahan di bawah
                    false
                ).length;

                return (
                  <ChampionshipCard
                    key={item.id}
                    championship={item}
                    tahun={tahun}
                    fallbackCount={jumlahPeraih}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl rounded-3xl bg-black px-8 py-12 text-center text-white md:px-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">
            Karate Smalsa
          </p>

          <h2 className="mt-3 text-3xl font-black md:text-4xl">
            Setiap medali memiliki cerita.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Lihat perjalanan dan pencapaian anggota Karate Smalsa
            dalam berbagai kejuaraan.
          </p>

          <Link
            href="/anggota"
            className="mt-8 inline-flex rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
          >
            Lihat Anggota
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black px-6 py-10 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Karate Smalsa · SMA Al Islam 1 Surakarta
      </footer>
    </main>
  );
}

function ChampionshipCard({
  championship,
  tahun,
}: {
  championship: Championship;
  tahun: number;
  fallbackCount: number;
}) {
  return (
    <Link
      href={`/prestasi/${championship.id}`}
      className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-red-500 hover:shadow-xl"
    >
      {/* Dekorasi tahun */}
      <div className="absolute -right-4 -top-8 select-none text-[120px] font-black leading-none text-zinc-100 transition duration-300 group-hover:text-red-50">
        {tahun}
      </div>

      <div className="relative p-7">
        {/* Tahun */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-black text-white">
            {tahun}
          </span>

          <span className="text-2xl">
            🏅
          </span>
        </div>

        {/* Nama kejuaraan */}
        <h3 className="mt-8 min-h-[70px] text-2xl font-black leading-tight text-zinc-900 transition group-hover:text-red-600">
          {championship.nama_kejuaraan}
        </h3>

        {/* Tingkat */}
        <div className="mt-6 border-t border-zinc-100 pt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Tingkat Kejuaraan
          </p>

          <p className="mt-1 font-bold text-zinc-800">
            {championship.tingkat || "-"}
          </p>
        </div>

        {/* Informasi tambahan */}
        <div className="mt-4 flex flex-wrap gap-2">
          {championship.tanggal && (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
              📅 {formatTanggal(championship.tanggal)}
            </span>
          )}

          {championship.tempat && (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
              📍 {championship.tempat}
            </span>
          )}
        </div>

        {/* Deskripsi */}
        {championship.deskripsi && (
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-500">
            {championship.deskripsi}
          </p>
        )}

        {/* Link */}
        <div className="mt-6 flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 transition group-hover:bg-red-50">
          <span className="text-sm font-bold text-zinc-600 group-hover:text-red-600">
            Lihat Detail Kejuaraan
          </span>

          <span className="text-lg text-zinc-300 transition group-hover:translate-x-1 group-hover:text-red-600">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function formatTanggal(tanggal: string) {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}