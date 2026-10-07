import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Pelatih",
  description:
    "Pelatih dan pembimbing Karate Smalsa SMA Al Islam 1 Surakarta.",
};

export default async function PelatihPage() {
  const supabase = await createClient();

  const { data: pelatih, error } = await supabase
    .from("coaches")
    .select("id, nama, role, deskripsi, foto")
    .order("created_at", { ascending: true });

  function getFotoUrl(foto: string | null) {
    if (!foto) return null;

    // Jika database berisi URL lengkap
    if (foto.startsWith("http")) {
      return foto;
    }

    // Jika database berisi path Storage
    const { data } = supabase.storage
      .from("karate-smalsa")
      .getPublicUrl(foto);

    return data.publicUrl;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-black pt-32 pb-20">
        <div className="absolute left-[-10%] top-20 h-80 w-80 rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute right-[-10%] bottom-0 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Tim Pembinaan
            </p>

            <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">
              Pelatih &
              <span className="text-red-600"> Pembimbing</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Mendampingi perjalanan Karate Smalsa dalam
              membangun kemampuan, kedisiplinan, mental, dan karakter anggota.
            </p>
          </div>
        </div>
      </section>

      {/* PELATIH & PEMBIMBING */}
      <section className="border-t border-zinc-900 bg-zinc-950 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-red-400">
              Gagal mengambil data pelatih:
              <br />
              {error.message}
            </div>
          ) : pelatih && pelatih.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {pelatih.map((item) => {
                const fotoUrl = getFotoUrl(item.foto);

                return (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-3xl border border-zinc-800 bg-black transition duration-300 hover:border-red-600/50"
                  >
                    {/* FOTO */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt={`Foto ${item.role} Karate Smalsa`}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-zinc-600">
                          Foto belum tersedia
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-7">
                        <span className="inline-flex rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                          {item.role}
                        </span>

                        <h2 className="mt-4 text-3xl font-black text-white">
                          {item.nama}
                        </h2>
                      </div>
                    </div>

                    {/* INFORMASI */}
                    <div className="p-7">
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">
                        Peran
                      </p>

                      <p className="mt-3 leading-7 text-zinc-400">
                        {item.deskripsi}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-black p-10 text-center">
              <p className="text-zinc-500">
                Data pelatih belum tersedia.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FOKUS PEMBINAAN */}
      <section className="border-t border-zinc-900 bg-black py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Fokus Pembinaan
            </p>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl">
              Membentuk karateka
              <span className="text-red-600"> secara menyeluruh.</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
              <div className="text-3xl font-black text-red-600">01</div>

              <h3 className="mt-6 text-xl font-bold">
                Teknik
              </h3>

              <p className="mt-3 leading-7 text-zinc-500">
                Pengembangan kihon, kata, kumite, dan kemampuan teknik karate
                secara bertahap.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
              <div className="text-3xl font-black text-red-600">02</div>

              <h3 className="mt-6 text-xl font-bold">
                Mental
              </h3>

              <p className="mt-3 leading-7 text-zinc-500">
                Membangun keberanian, kepercayaan diri, ketahanan mental, dan
                sportivitas.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
              <div className="text-3xl font-black text-red-600">03</div>

              <h3 className="mt-6 text-xl font-bold">
                Prestasi
              </h3>

              <p className="mt-3 leading-7 text-zinc-500">
                Mempersiapkan anggota untuk berkembang dan berkompetisi secara
                sehat dalam berbagai kejuaraan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-black py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <div className="font-bold text-white">
              KARATE SMALSA
            </div>

            <div className="mt-1">
              SMA Al Islam 1 Surakarta
            </div>
          </div>

          <div>
            © {new Date().getFullYear()} Karate Smalsa. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}