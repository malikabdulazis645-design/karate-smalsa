"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Album = {
  id: string;
  judul: string;
  kategori: string | null;
  cover: string | null;
};

type Photo = {
  id: string;
  foto: string;
  caption: string | null;
};

export default function KelolaAlbumPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const albumId = params.id as string;

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function loadAlbum() {
    setLoading(true);
    setError("");

    const { data: albumData, error: albumError } =
      await supabase
        .from("albums")
        .select("id, judul, kategori, cover")
        .eq("id", albumId)
        .single();

    if (albumError) {
      setError(albumError.message);
      setLoading(false);
      return;
    }

    const { data: photoData, error: photoError } =
      await supabase
        .from("gallery_photos")
        .select("id, foto, caption")
        .eq("album_id", albumId)
        .order("created_at", { ascending: true });

    if (photoError) {
      setError(photoError.message);
      setLoading(false);
      return;
    }

    setAlbum(albumData);
    setPhotos(photoData || []);
    setLoading(false);
  }

  useEffect(() => {
    if (albumId) {
      loadAlbum();
    }
  }, [albumId]);

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          continue;
        }

        const extension =
          file.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}.${extension}`;

        const filePath = `galeri/${albumId}/${fileName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("karate-smalsa")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("karate-smalsa")
            .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;

        const { error: insertError } =
          await supabase
            .from("gallery_photos")
            .insert({
              album_id: albumId,
              foto: publicUrl,
            });

        if (insertError) {
          await supabase.storage
            .from("karate-smalsa")
            .remove([filePath]);

          throw insertError;
        }

        if (!album?.cover) {
          await supabase
            .from("albums")
            .update({
              cover: publicUrl,
            })
            .eq("id", albumId);

          setAlbum((current) =>
            current
              ? {
                  ...current,
                  cover: publicUrl,
                }
              : current
          );
        }
      }

      await loadAlbum();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengupload foto."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDeletePhoto(photo: Photo) {
    const yakin = window.confirm(
      "Hapus foto ini dari album?"
    );

    if (!yakin) {
      return;
    }

    setError("");

    try {
      const marker =
        "/storage/v1/object/public/karate-smalsa/";

      const index = photo.foto.indexOf(marker);

      if (index !== -1) {
        const filePath = decodeURIComponent(
          photo.foto.substring(
            index + marker.length
          )
        );

        await supabase.storage
          .from("karate-smalsa")
          .remove([filePath]);
      }

      const { error: deleteError } =
        await supabase
          .from("gallery_photos")
          .delete()
          .eq("id", photo.id)
          .eq("album_id", albumId);

      if (deleteError) {
        throw deleteError;
      }

      if (album?.cover === photo.foto) {
        const fotoBerikutnya = photos.find(
          (item) => item.id !== photo.id
        );

        await supabase
          .from("albums")
          .update({
            cover: fotoBerikutnya?.foto || null,
          })
          .eq("id", albumId);
      }

      await loadAlbum();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus foto."
      );
    }
  }

  async function handleSetCover(photo: Photo) {
    setError("");

    const { error: updateError } =
      await supabase
        .from("albums")
        .update({
          cover: photo.foto,
        })
        .eq("id", albumId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setAlbum((current) =>
      current
        ? {
            ...current,
            cover: photo.foto,
          }
        : current
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-100">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="rounded-3xl bg-white p-10 text-center">
            <p className="font-bold text-zinc-500">
              Memuat album...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!album) {
    return (
      <main className="min-h-screen bg-zinc-100">
        <div className="mx-auto max-w-2xl px-5 py-10">
          <div className="rounded-3xl bg-white p-8 text-center">
            <div className="text-5xl">📷</div>

            <h1 className="mt-4 text-2xl font-black">
              Album tidak ditemukan
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Album yang ingin kamu kelola tidak tersedia.
            </p>

            <Link
              href="/admin/galeri"
              className="mt-6 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white"
            >
              ← Kembali ke Galeri
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-5 py-8">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/admin/galeri"
              className="text-sm font-bold text-zinc-500 transition hover:text-red-600"
            >
              ← Kembali ke Galeri
            </Link>

            <div className="mt-5">
              {album.kategori && (
                <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                  {album.kategori}
                </p>
              )}

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                {album.judul}
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                {photos.length} foto dalam album
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/admin/galeri/${albumId}/edit`}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-black text-zinc-700 transition hover:border-red-500 hover:bg-red-50 hover:text-red-600"
            >
              ✎ Edit Album
            </Link>

            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700">
              {uploading
                ? "Mengupload..."
                : "+ Tambah Foto"}

              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
            <p className="font-black">
              Terjadi kesalahan
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        )}

        {/* UPLOAD INFO */}
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="font-black">
            Tambahkan Foto
          </p>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Kamu dapat memilih beberapa foto sekaligus dari
            HP atau komputer. Foto pertama otomatis menjadi
            cover album jika album belum memiliki cover.
          </p>
        </div>

        {/* FOTO */}
        {photos.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <div className="text-6xl">📷</div>

            <h2 className="mt-5 text-xl font-black">
              Belum Ada Foto
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Tambahkan foto kegiatan untuk mengisi album
              ini.
            </p>

            <label className="mt-6 inline-flex cursor-pointer rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white">
              + Tambah Foto

              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => {
              const isCover =
                album.cover === photo.foto;

              return (
                <div
                  key={photo.id}
                  className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                >
                  <div className="relative aspect-square overflow-hidden bg-zinc-200">
                    <img
                      src={photo.foto}
                      alt={
                        photo.caption ||
                        album.judul
                      }
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    {isCover && (
                      <div className="absolute left-2 top-2 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
                        COVER
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() =>
                          handleSetCover(photo)
                        }
                        className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-xs font-black text-zinc-700 transition hover:bg-red-50 hover:text-red-600"
                      >
                        Jadikan Cover
                      </button>
                    )}

                    {isCover && (
                      <div className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-black text-red-600">
                        Cover Album
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleDeletePhoto(photo)
                      }
                      className="mt-2 w-full rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-50"
                    >
                      Hapus Foto
                    </button>
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