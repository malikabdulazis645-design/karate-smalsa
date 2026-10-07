import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Galeri",
  description:
    "Dokumentasi kegiatan Karate Smalsa SMA Al Islam 1 Surakarta.",
};

export default async function GaleriPage() {
  const supabase = await createClient();

  const { data: albums, error } = await supabase
    .from("albums")
    .select(
      `
      id,
      judul,
      kategori,
      cover,
      gallery_photos (
        id,
        foto,
        caption
      )
    `
    )
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />

      {/* HERO */}
      <section className="bg-black px-6 pb-16 pt-36 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
            Dokumentasi
          </p>

          <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
            Galeri Karate Smalsa
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
            Kumpulan dokumentasi kegiatan, latihan,
            kejuaraan, dan berbagai aktivitas Karate Smalsa.
          </p>
        </div>
      </section>

      {/* GALERI */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
              <p className="font-black">
                Gagal memuat galeri
              </p>

              <p className="mt-2 text-sm">
                {error.message}
              </p>
            </div>
          )}

          {!error &&
            (!albums || albums.length === 0) && (
              <div className="rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center">
                <div className="text-6xl">📷</div>

                <h2 className="mt-6 text-2xl font-black">
                  Belum Ada Dokumentasi
                </h2>

                <p className="mx-auto mt-3 max-w-md leading-7 text-zinc-500">
                  Dokumentasi kegiatan Karate Smalsa akan
                  ditampilkan di halaman ini.
                </p>
              </div>
            )}

          {!error && albums && albums.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => {
                const jumlahFoto =
                  album.gallery_photos?.length || 0;

                const cover =
                  album.cover ||
                  album.gallery_photos?.[0]?.foto ||
                  null;

                return (
                  <Link
                    key={album.id}
                    href={`/galeri/${album.id}`}
                    className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-red-500 hover:shadow-xl"
                  >
                    {/* COVER */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                      {cover ? (
                        <img
                          src={cover}
                          alt={album.judul}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-7xl">
                            📷
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-5 pt-16">
                        <div className="flex items-center justify-between">
                          {album.kategori && (
                            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
                              {album.kategori}
                            </span>
                          )}

                          <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                            {jumlahFoto} Foto
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* INFO */}
                    <div className="p-6">
                      <h2 className="text-xl font-black transition group-hover:text-red-600">
                        {album.judul}
                      </h2>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-zinc-500">
                          {jumlahFoto} dokumentasi
                        </span>

                        <span className="text-sm font-black text-red-600">
                          Lihat Album →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black px-6 py-10 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Karate Smalsa · SMA Al
        Islam 1 Surakarta
      </footer>
    </main>
  );
}