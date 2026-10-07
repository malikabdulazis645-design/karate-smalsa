"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function TambahPelatihPage() {
  const router = useRouter();
  const supabase = createClient();

  const [nama, setNama] = useState("");
  const [role, setRole] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }

    setError("");
    setFoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nama.trim()) {
      setError("Nama pelatih wajib diisi.");
      return;
    }

    if (!role.trim()) {
      setError("Jabatan/peran pelatih wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Buat data pelatih terlebih dahulu
      const { data: coach, error: insertError } = await supabase
        .from("coaches")
        .insert({
          nama: nama.trim(),
          role: role.trim(),
          deskripsi: deskripsi.trim(),
        })
        .select("id")
        .single();

      if (insertError) {
        throw insertError;
      }

      // 2. Upload foto jika ada
      if (foto && coach) {
        const extension =
          foto.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath = `pelatih/${coach.id}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("karate-smalsa")
          .upload(filePath, foto, {
            upsert: true,
            contentType: foto.type,
          });

        if (uploadError) {
          await supabase
            .from("coaches")
            .delete()
            .eq("id", coach.id);

          throw uploadError;
        }

        // Simpan PATH file, bukan URL lengkap
        const { error: updateError } = await supabase
          .from("coaches")
          .update({
            foto: filePath,
            updated_at: new Date().toISOString(),
          })
          .eq("id", coach.id);

        if (updateError) {
          throw updateError;
        }
      }

      router.push("/admin/pelatih");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-2xl">

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
            Admin Karate Smalsa
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Tambah Pelatih
          </h1>

          <p className="mt-2 text-gray-400">
            Tambahkan data pelatih baru.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-white/10 bg-zinc-950 p-6 md:p-8"
        >
          {/* NAMA */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Nama Pelatih
            </label>

            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama pelatih"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500"
            />
          </div>

          {/* ROLE */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Jabatan / Peran
            </label>

            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Contoh: Pelatih Utama"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500"
            />
          </div>

          {/* DESKRIPSI */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Deskripsi
            </label>

            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Masukkan deskripsi atau tugas pelatih"
              rows={5}
              className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500"
            />
          </div>

          {/* FOTO */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Foto Pelatih
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="block w-full rounded-xl border border-white/10 bg-black p-3 text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-red-700"
            />

            <p className="mt-2 text-xs text-gray-500">
              Format gambar. Maksimal 5 MB.
            </p>
          </div>

          {/* PREVIEW */}
          {preview && (
            <div className="overflow-hidden rounded-xl border border-white/10">
              <img
                src={preview}
                alt="Preview foto pelatih"
                className="h-72 w-full object-cover"
              />
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* BUTTON */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Pelatih"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/pelatih")}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}