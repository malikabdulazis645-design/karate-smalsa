import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPelatihPage() {
  const supabase = await createClient();

  const { data: pelatih, error } = await supabase
    .from("coaches")
    .select("id, nama, role, deskripsi, foto")
    .order("created_at", { ascending: true });

  function getFotoUrl(foto: string | null) {
    if (!foto) return null;

    if (foto.startsWith("http")) {
      return foto;
    }

    const { data } = supabase.storage
      .from("karate-smalsa")
      .getPublicUrl(foto);

    return data.publicUrl;
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
              Kelola Pelatih
            </h1>

            <p className="mt-2 text-gray-400">
              Tambahkan dan kelola data pelatih Karate Smalsa.
            </p>
          </div>

          <Link
            href="/admin/pelatih/tambah"
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700"
          >
            + Tambah Pelatih
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-red-400">
            Gagal mengambil data pelatih: {error.message}
          </div>
        )}

        {/* LIST */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {pelatih?.map((coach) => {
            const fotoUrl = getFotoUrl(coach.foto);

            return (
              <div
                key={coach.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
              >
                <div className="flex flex-col sm:flex-row">

                  {/* FOTO */}
                  <div className="h-64 bg-zinc-900 sm:h-auto sm:w-56">
                    {fotoUrl ? (
                      <img
                        src={fotoUrl}
                        alt={coach.nama}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-64 items-center justify-center text-sm text-gray-600">
                        Belum ada foto
                      </div>
                    )}
                  </div>

                  {/* DATA */}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-xs font-semibold uppercase tracking-widest text-red-500">
                      {coach.role}
                    </span>

                    <h2 className="mt-2 text-2xl font-bold">
                      {coach.nama}
                    </h2>

                    <p className="mt-3 flex-1 text-sm leading-6 text-gray-400">
                      {coach.deskripsi || "Belum ada deskripsi."}
                    </p>

                    <Link
                      href={`/admin/pelatih/${coach.id}`}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold transition hover:bg-white/10"
                    >
                      Kelola
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {(!pelatih || pelatih.length === 0) && !error && (
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-10 text-center md:col-span-2">
              <p className="text-gray-400">
                Belum ada data pelatih.
              </p>

              <Link
                href="/admin/pelatih/tambah"
                className="mt-5 inline-flex rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
              >
                Tambah Pelatih
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