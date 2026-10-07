import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AnggotaPage() {
  const supabase = await createClient();

  const { data: anggota, error } = await supabase
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
          <h1 className="text-3xl font-bold">Anggota Karate Smalsa</h1>

          <p className="mt-4 text-red-400">
            Gagal mengambil data anggota: {error.message}
          </p>
        </div>
      </main>
    );
  }

  function getFotoUrl(foto: string | null) {
    if (!foto) return null;

    // Jika database menyimpan URL lengkap
    if (foto.startsWith("http")) {
      return foto;
    }

    // Jika database menyimpan path seperti:
    // anggota/namafile.jpg
    const { data } = supabase.storage
      .from("karate-smalsa")
      .getPublicUrl(foto);

    return data.publicUrl;
  }

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
        {anggota && anggota.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {anggota.map((member) => {
              const fotoUrl = getFotoUrl(member.foto);

              return (
                <Link
                  key={member.id}
                  href={`/anggota/${member.id}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 transition hover:-translate-y-1 hover:border-red-500/50"
                >
                  {/* FOTO */}
                  <div className="aspect-[4/3] overflow-hidden bg-zinc-900">
                    {fotoUrl ? (
                      <img
                        src={fotoUrl}
                        alt={member.nama_lengkap}
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
                      {member.kelas || "Kelas belum diisi"}
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-white">
                      {member.nama_lengkap}
                    </h2>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">
                        Sabuk {member.warna_sabuk || "-"}
                      </span>

                      <span className="text-sm text-red-400 transition group-hover:text-red-300">
                        Lihat detail →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
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