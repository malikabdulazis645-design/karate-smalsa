"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Album = {
  id: string;
  judul: string;
  kategori: string | null;
  cover: string | null;
  gallery_photos: {
    id: string;
  }[];
};

export default function AdminGaleriPage() {
  const supabase = createClient();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAlbums() {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("albums")
      .select(
        `
        id,
        judul,
        kategori,
        cover,
        gallery_photos (
          id
        )
      `
      )
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setAlbums([]);
      setLoading(false);
      return;
    }

    setAlbums((data as Album[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAlbums();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-8">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-bold text-zinc-500 transition hover:text-red-600"
            >
              ← Kembali ke Dashboard
            </Link>

            <div className="mt-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                Admin
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Galeri
              </h1>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Kelola album dan dokumentasi foto Karate
                Smalsa.
              </p>
            </div>
          </div>

          {/* TAMBAH ALBUM */}
          <Link
            href="/admin/galeri/tambah"
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
          >
            + Tambah Album
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
            <p className="font-black">
              Gagal memuat galeri
            </p>

            <p className="mt-1">
              {error}
            </p>

            <button
              type="button"
              onClick={loadAlbums}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-black text-white"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm">
            <p className="font-bold text-zinc-500">
              Memuat album...
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          albums.length === 0 && (
            <div className="mt-8 rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center">
              <div className="text-6xl">📷</div>

              <h2 className="mt-5 text-2xl font-black">
                Belum Ada Album
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
                Buat album terlebih dahulu untuk mulai
                menambahkan foto dokumentasi.
              </p>

              <Link
                href="/admin/galeri/tambah"
                className="mt-6 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
              >
                + Buat Album
              </Link>
            </div>
          )}

        {/* ALBUM */}
        {!loading &&
          !error &&
          albums.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => {
                const jumlahFoto =
                  album.gallery_photos?.length || 0;

                return (
                  <div
                    key={album.id}
                    className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* COVER */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                      {album.cover ? (
                        <img
                          src={album.cover}
                          alt={album.judul}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-7xl">
                            📷
                          </span>
                        </div>
                      )}

                      {/* PHOTO COUNT */}
                      <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-black text-white backdrop-blur">
                        {jumlahFoto} Foto
                      </div>
                    </div>

                    {/* INFO */}
                    <div className="p-5">
                      {album.kategori && (
                        <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-red-600">
                          {album.kategori}
                        </span>
                      )}

                      <h2 className="mt-3 text-xl font-black">
                        {album.judul}
                      </h2>

                      <p className="mt-2 text-sm text-zinc-500">
                        {jumlahFoto} foto dalam album
                      </p>

                      {/* ACTION */}
                      <Link
                        href={`/admin/galeri/${album.id}`}
                        className="mt-5 flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-black text-white transition hover:bg-red-600"
                      >
                        Kelola Album →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </main>
  );
}