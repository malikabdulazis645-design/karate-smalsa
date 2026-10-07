import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Kelola Pengurus",
  description: "Kelola data pengurus Karate Smalsa.",
};

export default async function AdminPengurusPage() {
  const supabase = await createClient();

  const { data: pengurus, error } = await supabase
    .from("board_members")
    .select("id, posisi, nama, kelas, tugas, foto")
    .order("id", { ascending: true });

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/admin"
                className="text-sm font-medium text-zinc-500 transition hover:text-red-500"
              >
                ← Dashboard
              </Link>

              <h1 className="mt-4 text-3xl font-black">
                Kelola Pengurus
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Kelola data pengurus Karate Smalsa.
              </p>
            </div>

            <Link
              href="/admin/pengurus/tambah"
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              + Tambah Pengurus
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-6 text-red-400">
            <div className="font-bold">
              Gagal mengambil data pengurus.
            </div>

            <div className="mt-2 text-xs">
              {error.message}
            </div>
          </div>
        )}

        {!error && (!pengurus || pengurus.length === 0) && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-10 text-center">
            <h2 className="text-2xl font-black">
              Belum ada data pengurus
            </h2>

            <p className="mt-3 text-sm text-zinc-500">
              Belum ada data pengurus di database.
            </p>

            <Link
              href="/admin/pengurus/tambah"
              className="mt-6 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              + Tambah Pengurus
            </Link>
          </div>
        )}

        {pengurus && pengurus.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="border-b border-zinc-800 px-6 py-5">
              <div className="text-sm text-zinc-500">
                Total Pengurus
              </div>

              <div className="mt-1 text-3xl font-black text-red-500">
                {pengurus.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="border-b border-zinc-800 bg-black">
                  <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-6 py-4">Nama</th>
                    <th className="px-6 py-4">Posisi</th>
                    <th className="px-6 py-4">Kelas</th>
                    <th className="px-6 py-4">Tugas</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800">
                  {pengurus.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-black"
                    >
                      <td className="px-6 py-5">
                        <div className="font-bold text-white">
                          {item.nama}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
                          {item.posisi}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-zinc-400">
                        {item.kelas || "-"}
                      </td>

                      <td className="max-w-sm px-6 py-5 text-sm text-zinc-500">
                        <div className="line-clamp-2">
                          {item.tugas || "-"}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/admin/pengurus/${item.id}`}
                          className="inline-flex rounded-lg border border-zinc-700 px-4 py-2 text-sm font-bold text-white transition hover:border-red-600 hover:bg-red-600"
                        >
                          Kelola
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}