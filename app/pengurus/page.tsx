import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Pengurus | Karate Smalsa",
  description:
    "Struktur kepengurusan ekstrakurikuler Karate SMA Al Islam 1 Surakarta.",
};

const pengurus = [
  {
    position: "Ketua",
    name: "Laozai Naufal Alvaro",
    className: "XI.2",
    task: "Memimpin dan mengkoordinasikan seluruh kegiatan serta kepengurusan Karate Smalsa.",
    photo: "/pengurus/ketua.jpg",
  },
  {
    position: "Sekretaris 1",
    name: "Almeira Charmalita",
    className: "XI.1",
    task: "Mengelola administrasi, surat-menyurat, arsip, dan kebutuhan dokumentasi organisasi.",
    photo: "/pengurus/sekretaris-1.jpg",
  },
  {
    position: "Sekretaris 2",
    name: "Muhammad Abdul Hafidz",
    className: "XI.1",
    task: "Mengelola administrasi, surat-menyurat, arsip, dan kebutuhan dokumentasi organisasi.",
    photo: "/pengurus/sekretaris-2.jpg",
  },
  {
    position: "Bendahara 1",
    name: "Salwa Nur Jannah",
    className: "XI.2",
    task: "Mengelola keuangan, pencatatan pemasukan, pengeluaran, dan kebutuhan operasional organisasi.",
    photo: "/pengurus/bendahara-1.jpg",
  },
  {
    position: "Bendahara 2",
    name: "Ilvan Prayogo Wagis",
    className: "XI.5",
    task: "Mengelola keuangan, pencatatan pemasukan, pengeluaran, dan kebutuhan operasional organisasi.",
    photo: "/pengurus/bendahara-2.jpg",
  },
  {
    position: "Humas 1",
    name: "Aisyah Egya Putri",
    className: "XI.1",
    task: "Membantu mengatur jadwal, kebutuhan, dan koordinasi kegiatan latihan anggota.",
    photo: "/pengurus/humas-1.jpg",
  },
  {
    position: "Humas 2",
    name: "Fahrizal Hanif Setiawan",
    className: "XI.6",
    task: "Membantu mengatur jadwal, kebutuhan, dan koordinasi kegiatan latihan anggota.",
    photo: "",
  },
];

export default function PengurusPage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />

      {/* HERO */}
      <section className="bg-black px-6 pb-20 pt-36 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-red-500">
            Organisasi
          </p>

          <h1 className="text-4xl font-black sm:text-6xl">
            Pengurus <span className="text-red-600">Karate Smalsa</span>
          </h1>

          <p className="mt-5 max-w-2xl leading-7 text-zinc-400">
            Kenali para pengurus yang berperan dalam mengelola kegiatan,
            menjaga kekompakan, dan mengembangkan Karate Smalsa.
          </p>
        </div>
      </section>

      {/* DAFTAR PENGURUS */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <div className="mb-12">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-600">
              Struktur Organisasi
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Pengurus Karate Smalsa
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-zinc-500">
              Setiap pengurus memiliki tanggung jawab masing-masing untuk
              mendukung kegiatan organisasi dan latihan Karate Smalsa.
            </p>
          </div>

          {/* GRID */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {pengurus.map((item) => (
              <article
                key={item.position}
                className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white transition duration-300 hover:-translate-y-2 hover:border-red-200 hover:shadow-2xl"
              >
                {/* FOTO */}
                <div className="relative aspect-[4/4.5] overflow-hidden bg-zinc-200">

                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-red-950">
                      <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-red-600 bg-black text-4xl font-black text-white shadow-2xl">
                        {item.name.charAt(0)}
                      </div>
                    </div>
                  )}

                  {/* POSISI */}
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                      {item.position}
                    </span>
                  </div>
                </div>

                {/* INFORMASI */}
                <div className="p-6">

                  <h3 className="text-xl font-black text-zinc-900">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm font-bold text-red-600">
                    {item.className}
                  </p>

                  <div className="my-5 h-px bg-zinc-100" />

                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Tugas
                  </p>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {item.task}
                  </p>

                </div>
              </article>
            ))}

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-600 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-100">
            Karate Smalsa
          </p>

          <h2 className="mt-3 max-w-3xl text-4xl font-black sm:text-5xl">
            Bersama membangun organisasi yang solid dan berprestasi.
          </h2>

          <p className="mt-5 max-w-2xl leading-7 text-red-100">
            Setiap anggota memiliki peran dalam menjaga semangat, kekompakan,
            dan perkembangan Karate Smalsa.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black px-6 py-10 text-zinc-500">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row">
          <div>
            <div className="font-black text-white">
              KARATE SMALSA
            </div>

            <div className="mt-1 text-sm">
              Karate SMA Al Islam 1 Surakarta
            </div>
          </div>

          <div className="text-sm">
            © 2026 Karate Smalsa. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}