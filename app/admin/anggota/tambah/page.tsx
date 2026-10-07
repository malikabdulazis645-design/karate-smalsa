"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const sabukOptions = [
  "Putih",
  "Kuning",
  "Oranye",
  "Hijau",
  "Biru Muda",
  "Biru Tua",
  "Ungu",
  "Cokelat",
  "Hitam",
];

export default function TambahAnggotaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [namaLengkap, setNamaLengkap] = useState("");
  const [kelas, setKelas] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [warnaSabuk, setWarnaSabuk] = useState("");
  const [nomorWhatsapp, setNomorWhatsapp] = useState("");
  const [status, setStatus] = useState("Aktif");

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleFotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setErrorMessage("File foto harus berupa gambar.");
      return;
    }

    // Maksimal 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran foto maksimal 5 MB.");
      return;
    }

    setErrorMessage("");
    setFotoFile(file);

    // Preview
    const previewUrl = URL.createObjectURL(file);
    setPreviewFoto(previewUrl);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Buat data anggota terlebih dahulu
      const { data: anggota, error: insertError } = await supabase
        .from("members")
        .insert({
          nama_lengkap: namaLengkap,
          kelas,
          tempat_lahir: tempatLahir,
          tanggal_lahir: tanggalLahir || null,
          warna_sabuk: warnaSabuk,
          nomor_whatsapp: nomorWhatsapp,
          status,
          foto: "",
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      let fotoUrl = "";

      // 2. Upload foto jika ada
      if (fotoFile) {
        const fileExtension =
          fotoFile.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName = `${anggota.id}.${fileExtension}`;

        const filePath = `anggota/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("karate-smalsa")
          .upload(filePath, fotoFile, {
            cacheControl: "3600",
            upsert: true,
            contentType: fotoFile.type,
          });

        if (uploadError) {
          // Hapus anggota jika upload foto gagal
          await supabase
            .from("members")
            .delete()
            .eq("id", anggota.id);

          throw new Error(
            `Foto gagal diupload: ${uploadError.message}`
          );
        }

        // 3. Ambil URL publik foto
        const { data: publicUrlData } = supabase.storage
          .from("karate-smalsa")
          .getPublicUrl(filePath);

        fotoUrl = publicUrlData.publicUrl;

        // 4. Simpan URL foto ke members
        const { error: updateError } = await supabase
          .from("members")
          .update({
            foto: fotoUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", anggota.id);

        if (updateError) {
          throw new Error(
            `Foto sudah terupload tetapi URL gagal disimpan: ${updateError.message}`
          );
        }
      }

      router.push("/admin/anggota");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan anggota."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin/anggota")}
            className="mb-4 text-sm text-zinc-400 hover:text-white"
          >
            ← Kembali ke Anggota
          </button>

          <h1 className="text-3xl font-black">
            Tambah Anggota
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Tambahkan data anggota baru beserta foto.
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-7"
        >
          {/* Foto */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-200">
              Foto Anggota
            </label>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Preview */}
              <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950">
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt="Preview foto anggota"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center text-xs text-zinc-500">
                    <div className="mb-2 text-3xl">📷</div>
                    Belum ada foto
                  </div>
                )}
              </div>

              {/* Upload */}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFotoChange}
                  className="block w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-red-700"
                />

                <p className="mt-2 text-xs text-zinc-500">
                  JPG, PNG, atau WEBP. Maksimal 5 MB.
                </p>

                {fotoFile && (
                  <p className="mt-2 text-xs text-zinc-400">
                    File dipilih:{" "}
                    <span className="text-white">
                      {fotoFile.name}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Nama */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Nama Lengkap
            </label>

            <input
              type="text"
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              required
              placeholder="Contoh: Fadhil Laqief Zainu"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-red-500"
            />
          </div>

          {/* Kelas */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Kelas
            </label>

            <input
              type="text"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              required
              placeholder="Contoh: XII.5"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-red-500"
            />
          </div>

          {/* Tempat lahir */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Tempat Lahir
            </label>

            <input
              type="text"
              value={tempatLahir}
              onChange={(e) => setTempatLahir(e.target.value)}
              placeholder="Contoh: Surakarta"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-red-500"
            />
          </div>

          {/* Tanggal lahir */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Tanggal Lahir
            </label>

            <input
              type="date"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-red-500"
            />
          </div>

          {/* Sabuk */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Warna Sabuk
            </label>

            <select
              value={warnaSabuk}
              onChange={(e) => setWarnaSabuk(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500"
            >
              <option value="">
                Pilih warna sabuk
              </option>

              {sabukOptions.map((sabuk) => (
                <option key={sabuk} value={sabuk}>
                  {sabuk}
                </option>
              ))}
            </select>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Nomor WhatsApp
            </label>

            <input
              type="tel"
              value={nomorWhatsapp}
              onChange={(e) =>
                setNomorWhatsapp(e.target.value)
              }
              placeholder="Contoh: 081234567890"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-red-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>

          {/* Tombol */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Menyimpan & Upload Foto..."
                : "Simpan Anggota"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/anggota")}
              className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-bold text-zinc-300 transition hover:bg-zinc-800"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}