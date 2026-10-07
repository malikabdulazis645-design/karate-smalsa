import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export default async function GaleriDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  // Ambil data album
  const { data: album, error: albumError } = await supabase
    .from("albums")
    .select("id, judul, kategori, cover")
    .eq("id", id)
    .single();

  if (albumError || !album) {
    notFound();
  }

  // Ambil semua foto dalam album
  const { data: photos, error: photosError } = await supabase
    .from("gallery_photos")
    .select("id, foto, caption")
    .eq("album_id", id)
    .order("created_at", { ascending: true });

  if (photosError) {
    console.error("Gagal mengambil foto galeri:", photosError);
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <Navbar />

      {/* Hero */}
      <section className="bg-black px-6 pb-20 pt-36 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/galeri"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-red-500"
          >
            ← Kembali ke Galeri
          </Link>

          <div className="mt-8">
            <span className="inline-flex rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider">
              {album.kategori}
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              {album.judul}
            </h1>
          </div>
        </div>
      </section>

      {/* Photos */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                Dokumentasi
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Foto Kegiatan
              </h2>
            </div>

            <div className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-600">
              {photos?.length || 0} Foto
            </div>
          </div>

          {photos && photos.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-zinc-900"
                >
                  {photo.foto ? (
                    <img
                      src={photo.foto}
                      alt={
                        photo.caption ||
                        `${album.judul} - Foto ${index + 1}`
                      }
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-red-950">
                      <div className="text-center">
                        <div className="text-4xl">📷</div>

                        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
                          Foto {index + 1}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                    <p className="text-sm font-bold text-white">
                      {photo.caption || album.judul}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-20 text-center">
              <div className="text-5xl">📷</div>

              <h3 className="mt-5 text-xl font-black text-zinc-900">
                Belum Ada Foto
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Foto kegiatan untuk album ini belum ditambahkan.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-black px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-black">KARATE SMALSA</p>

            <p className="mt-1 text-sm text-zinc-500">
              SMA Al Islam 1 Surakarta
            </p>
          </div>

          <p className="text-sm text-zinc-500">
            © 2026 Karate Smalsa. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}