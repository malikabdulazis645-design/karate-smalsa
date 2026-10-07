import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAnggotaPage() {
  const supabase = await createClient();

  const { data: anggota, error } = await supabase
    .from("members")
    .select(
      "id, nama_lengkap, kelas, warna_sabuk, nomor_whatsapp, status, foto"
    )
    .order("nama_lengkap", { ascending: true });

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <Link
              href="/admin"
              className="text-sm font-medium text-zinc-500 hover:text-red-500"
            >
              ← Kembali ke Dashboard
            </Link>

            <h1 className="mt-3 text-2xl font-black">
              Kelola Anggota
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Kelola data anggota Karate Smalsa.
            </p>
          </div>

          <Link
            href="/admin/anggota/tambah"
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            + Tambah Anggota
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400">
            Gagal mengambil data anggota.
            <div className="mt-1 text-xs text-red-500/80">
              {error.message}
            </div>
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="text-sm text-zinc-500">Total Anggota</div>
          <div className="mt-1 text-3xl font-black">
            {anggota?.length ?? 0}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-zinc-800 bg-zinc-900">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Nama
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Kelas
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Sabuk
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    WhatsApp
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {anggota && anggota.length > 0 ? (
                  anggota.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-zinc-900 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">
                          {member.nama_lengkap}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {member.kelas || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {member.warna_sabuk || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {member.nomor_whatsapp || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            member.status === "Aktif"
                              ? "rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400"
                              : "rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-400"
                          }
                        >
                          {member.status || "Aktif"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/anggota/${member.id}`}
                          className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:border-red-600 hover:text-red-500"
                        >
                          Kelola
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >
                      <div className="text-lg font-bold text-zinc-300">
                        Belum ada anggota
                      </div>

                      <p className="mt-2 text-sm text-zinc-600">
                        Tambahkan anggota pertama Karate Smalsa.
                      </p>

                      <Link
                        href="/admin/anggota/tambah"
                        className="mt-5 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"
                      >
                        + Tambah Anggota
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}