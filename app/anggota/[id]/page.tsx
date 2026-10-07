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
  kategori: string | null;
  medali: string | null;
  keterangan: string | null;
  championship: {
    nama_kejuaraan: string;
    tanggal: string;
    tempat: string | null;
    tingkat: string | null;
  }[];
};

export default async function AnggotaDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // DATA ANGGOTA
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

  // DATA PRESTASI ANGGOTA
  const { data: achievements, error: achievementError } =
    await supabase
      .from("achievement_records")
      .select(
        `
        id,
        kategori,
        medali,
        keterangan,
        championship:championships (
          nama_kejuaraan,
          tanggal,
          tempat,
          tingkat
        )
      `
      )
      .eq("member_id", id)
      .order("created_at", { ascending: false });

  const prestasi: Achievement[] = achievements || [];

  const tanggalLahir = member.tanggal_lahir
    ? new Date(member.tanggal_lahir).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

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
                    {member.nama_lengkap.charAt(0).toUpperCase()}
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
                    Sabuk {member.warna_sabuk}
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

            {prestasi.length > 0 && (
              <div className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400">
                🏆 {prestasi.length} Prestasi
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

          {!achievementError && prestasi.length === 0 && (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
              <p className="text-zinc-500">
                Belum ada data prestasi untuk anggota ini.
              </p>
            </div>
          )}

          {!achievementError && prestasi.length > 0 && (
            <div className="mt-8 grid gap-5">
              {prestasi.map((achievement) => (
  <div
    key={achievement.id}
    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-zinc-700"
  >
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className="text-xl font-black text-white">
          {achievement.championship?.[0]?.nama_kejuaraan ||
            "Kejuaraan"}
        </h3>

        {achievement.championship?.[0] && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
            <span>
              📅 {achievement.championship[0].tanggal}
            </span>

            {achievement.championship[0].tempat && (
              <span>
                📍 {achievement.championship[0].tempat}
              </span>
            )}

            {achievement.championship[0].tingkat && (
              <span>
                🏆 {achievement.championship[0].tingkat}
              </span>
            )}
          </div>
        )}

        {achievement.kategori && (
          <p className="mt-4 text-sm text-zinc-300">
            <span className="text-zinc-600">
              Kategori:
            </span>{" "}
            {achievement.kategori}
          </p>
        )}

        {achievement.keterangan && (
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            {achievement.keterangan}
          </p>
        )}
      </div>

      <div className="shrink-0">
        <span
          className={`inline-flex rounded-full border px-4 py-2 text-sm font-bold ${medalClass(
            achievement.medali
          )}`}
        >
          🏅 {achievement.medali || "Prestasi"}
        </span>
      </div>
    </div>
  </div>
))}
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