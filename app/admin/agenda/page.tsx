import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAgendaPage() {
  const supabase = await createClient();

  const { data: agenda, error } = await supabase
    .from("events")
    .select(
      "id, judul, tanggal, waktu, lokasi, kategori, status, deskripsi"
    )
    .order("tanggal", { ascending: true })
    .order("waktu", { ascending: true });

  function formatTanggal(tanggal: string) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${tanggal}T00:00:00`));
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
              Admin Karate Smalsa
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Kelola Agenda
            </h1>

            <p className="mt-2 text-gray-400">
              Kelola jadwal dan kegiatan Karate Smalsa.
            </p>
          </div>

          <Link
            href="/admin/agenda/tambah"
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700"
          >
            + Tambah Agenda
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-red-400">
            Gagal mengambil data agenda: {error.message}
          </div>
        )}

        {/* DAFTAR */}
        <div className="mt-10 space-y-4">
          {agenda?.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-zinc-950 p-5 transition hover:border-red-500/30"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                {/* INFO */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-600/10 px-3 py-1 text-xs font-semibold text-red-400">
                      {item.kategori || "Kegiatan"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "Selesai"
                          ? "bg-zinc-800 text-zinc-400"
                          : item.status === "Dibatalkan"
                          ? "bg-red-950 text-red-400"
                          : "bg-green-950 text-green-400"
                      }`}
                    >
                      {item.status || "Akan Datang"}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold">
                    {item.judul}
                  </h2>

                  <div className="mt-3 flex flex-col gap-1 text-sm text-gray-400 sm:flex-row sm:flex-wrap sm:gap-x-5">
                    <span>
                      📅 {formatTanggal(item.tanggal)}
                    </span>

                    {item.waktu && (
                      <span>
                        🕐 {item.waktu}
                      </span>
                    )}

                    {item.lokasi && (
                      <span>
                        📍 {item.lokasi}
                      </span>
                    )}
                  </div>

                  {item.deskripsi && (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
                      {item.deskripsi}
                    </p>
                  )}
                </div>

                {/* ACTION */}
                <Link
                  href={`/admin/agenda/${item.id}`}
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
                >
                  Kelola
                </Link>
              </div>
            </div>
          ))}

          {(!agenda || agenda.length === 0) && !error && (
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-10 text-center">
              <p className="text-gray-400">
                Belum ada agenda.
              </p>

              <Link
                href="/admin/agenda/tambah"
                className="mt-5 inline-flex rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
              >
                Tambah Agenda
              </Link>
            </div>
          )}
        </div>

        {/* BACK */}
        <div className="mt-10">
          <Link
            href="/admin"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}