import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Agenda",
  description:
    "Agenda dan kegiatan Karate Smalsa SMA Al Islam 1 Surakarta.",
};

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

export default async function AgendaPage() {
  const supabase = await createClient();

  const { data: agenda, error } = await supabase
    .from("events")
    .select(
      "id, judul, tanggal, waktu, lokasi, kategori, status, deskripsi"
    )
    .order("tanggal", { ascending: true })
    .order("waktu", { ascending: true });

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-black to-black" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Karate Smalsa
          </p>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
            Agenda & Kegiatan
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-gray-400 md:text-lg">
            Informasi jadwal latihan, kegiatan organisasi, ujian sabuk,
            kejuaraan, dan berbagai kegiatan Karate Smalsa.
          </p>
        </div>
      </section>

      {/* AGENDA */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
            Kegiatan Terbaru
          </p>

          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            Agenda Karate Smalsa
          </h2>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-red-400">
            Gagal mengambil data agenda.
            <p className="mt-2 text-sm text-gray-500">
              {error.message}
            </p>
          </div>
        ) : !agenda || agenda.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-10 text-center">
            <p className="text-lg font-semibold">
              Belum ada agenda.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Agenda kegiatan akan ditampilkan di halaman ini.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agenda.map((item: Event) => (
              <Link
                key={item.id}
                href={`/agenda/${item.id}`}
                className="group rounded-2xl border border-white/10 bg-zinc-950 p-6 transition hover:-translate-y-1 hover:border-red-500/50 hover:bg-zinc-900"
              >
                {/* STATUS */}
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                    {item.kategori || "Kegiatan"}
                  </span>

                  <span
                    className={`text-xs font-semibold ${
                      item.status === "Dibatalkan"
                        ? "text-red-500"
                        : item.status === "Selesai"
                          ? "text-gray-500"
                          : "text-green-400"
                    }`}
                  >
                    {item.status || "Akan Datang"}
                  </span>
                </div>

                {/* TITLE */}
                <h3 className="text-xl font-bold transition group-hover:text-red-400">
                  {item.judul}
                </h3>

                {/* DATE */}
                <div className="mt-5 space-y-2 text-sm text-gray-400">
                  <p>
                    <span className="mr-2 text-red-500">●</span>
                    {formatTanggal(item.tanggal)}
                  </p>

                  {item.waktu && (
                    <p>
                      <span className="mr-2 text-red-500">●</span>
                      {item.waktu}
                    </p>
                  )}

                  {item.lokasi && (
                    <p>
                      <span className="mr-2 text-red-500">●</span>
                      {item.lokasi}
                    </p>
                  )}
                </div>

                {/* DESCRIPTION */}
                {item.deskripsi && (
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-500">
                    {item.deskripsi}
                  </p>
                )}

                <div className="mt-6 border-t border-white/10 pt-4 text-sm font-semibold text-red-500">
                  Lihat Detail →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

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