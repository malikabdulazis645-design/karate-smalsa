import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

type Event = {
  id: string;
  judul: string;
  tanggal: string;
  waktu: string | null;
  lokasi: string | null;
  kategori: string | null;
  status: string | null;
  deskripsi: string | null;
};

function formatTanggal(tanggal: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${tanggal}T00:00:00`));
}

export default async function AgendaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: agenda, error } = await supabase
    .from("events")
    .select(
      "id, judul, tanggal, waktu, lokasi, kategori, status, deskripsi"
    )
    .eq("id", id)
    .single();

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-black to-black" />

        <div className="relative mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-24">
          <Link
            href="/agenda"
            className="inline-flex items-center text-sm font-semibold text-gray-400 transition hover:text-red-500"
          >
            ← Kembali ke Agenda
          </Link>

          {error || !agenda ? (
            <div className="mt-10 rounded-2xl border border-red-500/30 bg-red-950/20 p-8">
              <p className="text-xl font-bold">
                Agenda tidak ditemukan
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Agenda yang Anda cari tidak tersedia atau telah dihapus.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-400">
                  {agenda.kategori || "Kegiatan"}
                </span>

                <span
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    agenda.status === "Dibatalkan"
                      ? "bg-red-500/10 text-red-400"
                      : agenda.status === "Selesai"
                        ? "bg-white/10 text-gray-400"
                        : "bg-green-500/10 text-green-400"
                  }`}
                >
                  {agenda.status || "Akan Datang"}
                </span>
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
                {agenda.judul}
              </h1>

              <p className="mt-6 text-lg text-gray-400">
                {formatTanggal(agenda.tanggal)}
              </p>
            </>
          )}
        </div>
      </section>

      {/* DETAIL */}
      {agenda && !error && (
        <section className="mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-20">
          <div className="grid gap-8 md:grid-cols-[1fr_320px]">

            {/* DESKRIPSI */}
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
                Tentang Kegiatan
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Detail Agenda
              </h2>

              {agenda.deskripsi ? (
                <p className="mt-6 whitespace-pre-line text-base leading-8 text-gray-400">
                  {agenda.deskripsi}
                </p>
              ) : (
                <p className="mt-6 text-gray-500">
                  Belum ada deskripsi untuk kegiatan ini.
                </p>
              )}
            </div>

            {/* INFORMASI */}
            <div className="h-fit rounded-2xl border border-white/10 bg-zinc-950 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
                Informasi
              </p>

              <div className="mt-6 space-y-5">

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Tanggal
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatTanggal(agenda.tanggal)}
                  </p>
                </div>

                {agenda.waktu && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-600">
                      Waktu
                    </p>
                    <p className="mt-1 font-semibold">
                      {agenda.waktu}
                    </p>
                  </div>
                )}

                {agenda.lokasi && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-600">
                      Lokasi
                    </p>
                    <p className="mt-1 font-semibold">
                      {agenda.lokasi}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Kategori
                  </p>
                  <p className="mt-1 font-semibold">
                    {agenda.kategori || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Status
                  </p>
                  <p className="mt-1 font-semibold">
                    {agenda.status || "-"}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* BACK */}
          <div className="mt-10">
            <Link
              href="/agenda"
              className="inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
            >
              ← Lihat Semua Agenda
            </Link>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-gray-500 md:px-10">
          © {new Date().getFullYear()} Karate Smalsa · SMA Al Islam 1
          Surakarta
        </div>
      </footer>
    </main>
  );
}