import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Presensi | Karate Smalsa",
  description: "Sistem presensi anggota Karate Smalsa.",
};

const members = [
  { id: 1, name: "Nama Anggota 01", class: "X IPA 1" },
  { id: 2, name: "Nama Anggota 02", class: "X IPA 2" },
  { id: 3, name: "Nama Anggota 03", class: "XI IPA 1" },
  { id: 4, name: "Nama Anggota 04", class: "XI IPS 1" },
  { id: 5, name: "Nama Anggota 05", class: "XII IPA 1" },
  { id: 6, name: "Nama Anggota 06", class: "XII IPS 1" },
];

export default function PresensiPage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />

      {/* HERO */}
      <section className="bg-black px-6 pb-20 pt-36 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-red-500">
            Internal Karate Smalsa
          </p>

          <h1 className="text-4xl font-black sm:text-6xl">
            Presensi <span className="text-red-600">Anggota</span>
          </h1>

          <p className="mt-5 max-w-2xl leading-7 text-zinc-400">
            Kelola kehadiran anggota Karate Smalsa dalam setiap kegiatan
            latihan dan agenda organisasi.
          </p>
        </div>
      </section>

      {/* PRESENSI */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">

          {/* HEADER PRESENSI */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-700">
                  Tanggal Latihan
                </label>

                <input
                  type="date"
                  defaultValue="2026-10-06"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-700">
                  Kegiatan
                </label>

                <select className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20">
                  <option>Latihan Rutin</option>
                  <option>Latihan Bersama</option>
                  <option>Persiapan Kejuaraan</option>
                  <option>Kegiatan Lainnya</option>
                </select>
              </div>

            </div>
          </div>

          {/* STATISTIK */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl bg-black p-6 text-white">
              <div className="text-sm text-zinc-500">Total Anggota</div>
              <div className="mt-2 text-3xl font-black">
                {members.length}
              </div>
            </div>

            <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
              <div className="text-sm text-green-700">Hadir</div>
              <div className="mt-2 text-3xl font-black text-green-700">
                0
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
              <div className="text-sm text-yellow-700">Izin / Sakit</div>
              <div className="mt-2 text-3xl font-black text-yellow-700">
                0
              </div>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="text-sm text-red-700">Alpa</div>
              <div className="mt-2 text-3xl font-black text-red-700">
                0
              </div>
            </div>

          </div>

          {/* DAFTAR ANGGOTA */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">

            <div className="border-b border-zinc-200 p-6">
              <h2 className="text-2xl font-black">
                Daftar Kehadiran
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Tentukan status kehadiran setiap anggota.
              </p>
            </div>

            <div className="divide-y divide-zinc-100">

              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between"
                >

                  {/* IDENTITAS */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black font-black text-white">
                      {member.id}
                    </div>

                    <div>
                      <h3 className="font-bold text-zinc-900">
                        {member.name}
                      </h3>

                      <p className="text-sm text-zinc-500">
                        {member.class}
                      </p>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto">

                    <button
                      type="button"
                      className="rounded-xl border border-green-200 px-5 py-3 text-sm font-bold text-green-700 transition hover:bg-green-50"
                    >
                      Hadir
                    </button>

                    <button
                      type="button"
                      className="rounded-xl border border-yellow-200 px-5 py-3 text-sm font-bold text-yellow-700 transition hover:bg-yellow-50"
                    >
                      Izin
                    </button>

                    <button
                      type="button"
                      className="rounded-xl border border-orange-200 px-5 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-50"
                    >
                      Sakit
                    </button>

                    <button
                      type="button"
                      className="rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
                    >
                      Alpa
                    </button>

                  </div>

                </div>
              ))}

            </div>

            {/* SIMPAN */}
            <div className="border-t border-zinc-200 bg-zinc-50 p-6">
              <button
                type="button"
                className="w-full rounded-xl bg-red-600 px-6 py-4 font-black text-white transition hover:bg-red-700 sm:w-auto"
              >
                Simpan Presensi
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black px-6 py-10 text-zinc-500">
        <div className="mx-auto max-w-7xl">
          <div className="font-black text-white">
            KARATE SMALSA
          </div>

          <div className="mt-1 text-sm">
            Karate SMA Al Islam 1 Surakarta
          </div>

          <div className="mt-5 text-sm">
            © 2026 Karate Smalsa. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}