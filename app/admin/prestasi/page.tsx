import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Kelola Prestasi",
};

function formatTanggal(tanggal: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${tanggal}T00:00:00`));
}

export default async function AdminPrestasiPage() {
  const supabase = await createClient();

  const { data: championships, error } = await supabase
    .from("championships")
    .select(
      "id, nama_kejuaraan, tanggal, tempat, tingkat, deskripsi"
    )
    .order("tanggal", { ascending: false });

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
              Admin Karate Smalsa
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Kelola Prestasi
            </h1>

            <p className="mt-2 text-gray-400">
              Kelola kejuaraan dan pencapaian anggota Karate Smalsa.
            </p>
          </div>

          <Link
            href="/admin/prestasi/tambah"
            className="rounded-xl bg-red-600 px-5 py-3 text-center text-sm font-semibold transition hover:bg-red-700"
          >
            + Tambah Kejuaraan
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/20 p-5 text-red-400">
            Gagal mengambil data prestasi.
            <p className="mt-2 text-sm text-gray-500">
              {error.message}
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!error && (!championships || championships.length === 0) && (
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-10 text-center">
            <p className="text-lg font-semibold">
              Belum ada data kejuaraan
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Tambahkan kejuaraan untuk mulai mencatat prestasi.
            </p>

            <Link
              href="/admin/prestasi/tambah"
              className="mt-6 inline-block rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-700"
            >
              Tambah Kejuaraan
            </Link>
          </div>
        )}

        {/* LIST */}
        {championships && championships.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {championships.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-zinc-950 p-6 transition hover:border-red-500/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                      {item.tingkat || "Umum"}
                    </span>

                    <h2 className="mt-4 text-xl font-bold">
                      {item.nama_kejuaraan}
                    </h2>
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-sm text-gray-400">
                  <p>
                    <span className="text-gray-600">
                      Tanggal:
                    </span>{" "}
                    {formatTanggal(item.tanggal)}
                  </p>

                  <p>
                    <span className="text-gray-600">
                      Tempat:
                    </span>{" "}
                    {item.tempat || "-"}
                  </p>
                </div>

                {item.deskripsi && (
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">
                    {item.deskripsi}
                  </p>
                )}

                <div className="mt-6 border-t border-white/10 pt-5">
                  <Link
                    href={`/admin/prestasi/${item.id}`}
                    className="inline-flex rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
                  >
                    Kelola Kejuaraan →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}