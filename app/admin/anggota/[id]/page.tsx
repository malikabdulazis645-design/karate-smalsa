"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

type Member = {
  id: string;
  nama_lengkap: string;
  kelas: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  warna_sabuk: string | null;
  nomor_whatsapp: string | null;
  foto: string | null;
  status: string;
};

export default function KelolaAnggotaPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const id = params.id as string;

  const [member, setMember] = useState<Member | null>(null);

  const [namaLengkap, setNamaLengkap] = useState("");
  const [kelas, setKelas] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [warnaSabuk, setWarnaSabuk] = useState("");
  const [nomorWhatsapp, setNomorWhatsapp] = useState("");
  const [status, setStatus] = useState("Aktif");

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadMember() {
      const { data, error } = await supabase
        .from("members")
        .select(
          "id, nama_lengkap, kelas, tempat_lahir, tanggal_lahir, warna_sabuk, nomor_whatsapp, foto, status"
        )
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("Data anggota tidak ditemukan.");
        setLoading(false);
        return;
      }

      const anggota = data as Member;

      setMember(anggota);

      setNamaLengkap(anggota.nama_lengkap || "");
      setKelas(anggota.kelas || "");
      setTempatLahir(anggota.tempat_lahir || "");
      setTanggalLahir(anggota.tanggal_lahir || "");
      setWarnaSabuk(anggota.warna_sabuk || "");
      setNomorWhatsapp(anggota.nomor_whatsapp || "");
      setStatus(anggota.status || "Aktif");

      setPreviewFoto(anggota.foto || "");

      setLoading(false);
    }

    loadMember();
  }, [id]);

  function handleFotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setErrorMessage("");
    setSuccessMessage("");

    // Cek tipe file
    if (!file.type.startsWith("image/")) {
      setErrorMessage("File foto harus berupa gambar.");
      return;
    }

    // Maksimal 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran foto maksimal 5 MB.");
      return;
    }

    setFotoFile(file);

    const previewUrl = URL.createObjectURL(file);
    setPreviewFoto(previewUrl);
  }

  async function uploadFoto(): Promise<{
    fotoUrl: string;
    filePath: string;
  }> {
    if (!fotoFile) {
      throw new Error("Tidak ada foto yang dipilih.");
    }

    const extension =
      fotoFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `anggota/${id}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("karate-smalsa")
      .upload(filePath, fotoFile, {
        cacheControl: "3600",
        upsert: true,
        contentType: fotoFile.type,
      });

    if (uploadError) {
      throw new Error(
        `Foto gagal diupload: ${uploadError.message}`
      );
    }

    const { data } = supabase.storage
      .from("karate-smalsa")
      .getPublicUrl(filePath);

    return {
      fotoUrl: data.publicUrl,
      filePath,
    };
  }

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let fotoUrl = member?.foto || "";

      /*
       * Jika user memilih foto baru,
       * upload foto terlebih dahulu.
       */
      if (fotoFile) {
        const result = await uploadFoto();
        fotoUrl = result.fotoUrl;
      }

      /*
       * Update data anggota.
       */
      const { error: updateError } = await supabase
        .from("members")
        .update({
          nama_lengkap: namaLengkap,
          kelas,
          tempat_lahir: tempatLahir,
          tanggal_lahir: tanggalLahir || null,
          warna_sabuk: warnaSabuk,
          nomor_whatsapp: nomorWhatsapp,
          status,
          foto: fotoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setMember((prev) =>
        prev
          ? {
              ...prev,
              nama_lengkap: namaLengkap,
              kelas,
              tempat_lahir: tempatLahir,
              tanggal_lahir: tanggalLahir || null,
              warna_sabuk: warnaSabuk,
              nomor_whatsapp: nomorWhatsapp,
              status,
              foto: fotoUrl,
            }
          : prev
      );

      setFotoFile(null);

      setSuccessMessage(
        fotoFile
          ? "Data dan foto anggota berhasil diperbarui."
          : "Data anggota berhasil diperbarui."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Yakin ingin menghapus anggota ini? Data yang dihapus tidak dapat dikembalikan."
    );

    if (!confirmed) return;

    setDeleting(true);
    setErrorMessage("");

    try {
      /*
       * Hapus data anggota.
       */
      const { error: deleteError } = await supabase
        .from("members")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      /*
       * Hapus file foto dari Storage jika ada.
       *
       * Kita coba beberapa ekstensi umum.
       */
      const extensions = ["jpg", "jpeg", "png", "webp"];

      await supabase.storage
        .from("karate-smalsa")
        .remove(
          extensions.map(
            (extension) => `anggota/${id}.${extension}`
          )
        );

      router.push("/admin/anggota");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menghapus anggota."
      );

      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-sm text-zinc-400">
          Memuat data anggota...
        </p>
      </main>
    );
  }

  if (!member) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {errorMessage || "Data anggota tidak ditemukan."}
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin/anggota")}
            className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold"
          >
            Kembali
          </button>
        </div>
      </main>
    );
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
            Kelola Anggota
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Edit data anggota dan kelola foto profil.
          </p>
        </div>

        {/* Success */}
        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
            {successMessage}
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-7"
        >
          {/* FOTO */}
          <div>
            <label className="mb-3 block text-sm font-semibold">
              Foto Anggota
            </label>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Preview */}
              <div className="flex h-44 w-44 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950">
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt={namaLengkap}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center text-zinc-500">
                    <div className="mb-2 text-4xl">
                      👤
                    </div>
                    <div className="text-xs">
                      Belum ada foto
                    </div>
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

                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  Pilih foto baru untuk mengganti foto saat ini.
                  <br />
                  Format: JPG, PNG, WEBP.
                  <br />
                  Maksimal ukuran: 5 MB.
                </p>

                {fotoFile && (
                  <div className="mt-3 rounded-lg bg-red-500/10 p-3 text-xs text-red-300">
                    Foto baru dipilih:
                    <br />
                    <span className="font-semibold text-white">
                      {fotoFile.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* NAMA */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Nama Lengkap
            </label>

            <input
              type="text"
              value={namaLengkap}
              onChange={(e) =>
                setNamaLengkap(e.target.value)
              }
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-red-500"
            />
          </div>

          {/* KELAS */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Kelas
            </label>

            <input
              type="text"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-red-500"
            />
          </div>

          {/* TEMPAT LAHIR */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Tempat Lahir
            </label>

            <input
              type="text"
              value={tempatLahir}
              onChange={(e) =>
                setTempatLahir(e.target.value)
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-red-500"
            />
          </div>

          {/* TANGGAL LAHIR */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Tanggal Lahir
            </label>

            <input
              type="date"
              value={tanggalLahir}
              onChange={(e) =>
                setTanggalLahir(e.target.value)
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-red-500"
            />
          </div>

          {/* SABUK */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Warna Sabuk
            </label>

            <select
              value={warnaSabuk}
              onChange={(e) =>
                setWarnaSabuk(e.target.value)
              }
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

          {/* WHATSAPP */}
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
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-red-500"
            />
          </div>

          {/* STATUS */}
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

          {/* BUTTONS */}
          <div className="flex flex-col gap-3 border-t border-zinc-800 pt-6 sm:flex-row">
            <button
              type="submit"
              disabled={saving || deleting}
              className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Menyimpan..."
                : "Simpan Perubahan"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/admin/anggota")
              }
              disabled={saving || deleting}
              className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-bold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="rounded-xl border border-red-500/30 px-6 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50 sm:ml-auto"
            >
              {deleting
                ? "Menghapus..."
                : "Hapus Anggota"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}