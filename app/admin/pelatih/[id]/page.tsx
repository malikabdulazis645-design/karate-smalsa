"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Coach = {
  id: string;
  nama: string;
  role: string;
  deskripsi: string | null;
  foto: string | null;
};

export default function KelolaPelatihPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const id = params.id as string;

  const [coach, setCoach] = useState<Coach | null>(null);

  const [nama, setNama] = useState("");
  const [role, setRole] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCoach() {
      const { data, error } = await supabase
        .from("coaches")
        .select("id, nama, role, deskripsi, foto")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setCoach(data);
      setNama(data.nama || "");
      setRole(data.role || "");
      setDeskripsi(data.deskripsi || "");

      if (data.foto) {
        if (data.foto.startsWith("http")) {
          setPreview(data.foto);
        } else {
          const { data: publicData } = supabase.storage
            .from("karate-smalsa")
            .getPublicUrl(data.foto);

          setPreview(publicData.publicUrl);
        }
      }

      setLoading(false);
    }

    loadCoach();
  }, [id]);

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
      setError("Jabatan/peran wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let fotoPath = coach?.foto || null;

      // Jika upload foto baru
      if (foto) {
        const extension =
          foto.name.split(".").pop()?.toLowerCase() || "jpg";

        fotoPath = `pelatih/${id}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("karate-smalsa")
          .upload(fotoPath, foto, {
            upsert: true,
            contentType: foto.type,
          });

        if (uploadError) {
          throw uploadError;
        }
      }

      const { error: updateError } = await supabase
        .from("coaches")
        .update({
          nama: nama.trim(),
          role: role.trim(),
          deskripsi: deskripsi.trim(),
          foto: fotoPath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      router.push("/admin/pelatih");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan perubahan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Yakin ingin menghapus data pelatih ini?"
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      // Hapus foto jika ada
      if (coach?.foto) {
        const path = coach.foto.includes("/storage/v1/object/public/karate-smalsa/")
          ? coach.foto.split(
              "/storage/v1/object/public/karate-smalsa/"
            )[1]
          : coach.foto;

        await supabase.storage
          .from("karate-smalsa")
          .remove([path]);
      }

      const { error: deleteError } = await supabase
        .from("coaches")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      router.push("/admin/pelatih");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus pelatih."
      );
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <div className="mx-auto max-w-2xl">
          <p className="text-gray-400">
            Memuat data pelatih...
          </p>
        </div>
      </main>
    );
  }

  if (!coach) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-5 text-red-400">
            Data pelatih tidak ditemukan.
          </div>

          <button
            onClick={() => router.push("/admin/pelatih")}
            className="mt-5 rounded-xl bg-white/10 px-5 py-3"
          >
            Kembali
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-2xl">

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
            Admin Karate Smalsa
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Kelola Pelatih
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-white/10 bg-zinc-950 p-6 md:p-8"
        >
          {/* FOTO */}
          <div>
            <label className="mb-3 block text-sm font-semibold">
              Foto Pelatih
            </label>

            {preview ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                <img
                  src={preview}
                  alt={nama}
                  className="h-80 w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 text-gray-600">
                Belum ada foto
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="mt-4 block w-full rounded-xl border border-white/10 bg-black p-3 text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-red-700"
            />

            <p className="mt-2 text-xs text-gray-500">
              Pilih foto baru jika ingin mengganti foto.
              Maksimal 5 MB.
            </p>
          </div>

          {/* NAMA */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Nama Pelatih
            </label>

            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
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
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
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
              rows={6}
              className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* ACTION */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving || deleting}
              className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/pelatih")}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
            >
              Batal
            </button>
          </div>

          {/* DELETE */}
          <div className="border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="w-full rounded-xl border border-red-500/30 bg-red-950/20 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-950/40 disabled:opacity-50"
            >
              {deleting ? "Menghapus..." : "Hapus Pelatih"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}