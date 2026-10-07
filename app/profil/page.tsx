export const metadata = {
  title: "Profil",
  description:
    "Profil Karate Smalsa, ekstrakurikuler Karate SMA Al Islam 1 Surakarta.",
};

export default function ProfilPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* HEADER */}
      <header className="border-b border-zinc-200 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 font-black text-white">
              KS
            </div>

            <div>
              <div className="font-black tracking-wide text-white">
                KARATE SMALSA
              </div>

              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                SMA Al Islam 1 Surakarta
              </div>
            </div>
          </a>

          <a
            href="/"
            className="text-sm font-bold text-zinc-300 transition hover:text-red-500"
          >
            ← Kembali ke Beranda
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-zinc-950 px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-red-500">
            Tentang Kami
          </p>

          <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-6xl">
            Profil Karate
            <span className="text-red-600"> Smalsa</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Mengenal lebih dekat ekstrakurikuler Karate SMA Al Islam 1
            Surakarta.
          </p>
        </div>
      </section>

      {/* SEJARAH */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-red-600">
              Sejarah
            </p>

            <h2 className="text-4xl font-black sm:text-5xl">
              Perjalanan Karate Smalsa
            </h2>
          </div>

          <div className="space-y-6 text-zinc-600">
            <p className="leading-8">
              Karate Smalsa merupakan salah satu ekstrakurikuler olahraga bela
              diri di SMA Al Islam 1 Surakarta. Kegiatan ini menjadi wadah bagi
              siswa untuk mengembangkan kemampuan karate sekaligus membentuk
              karakter yang disiplin dan bertanggung jawab.
            </p>

            <p className="leading-8">
              Dalam perkembangannya, Karate Smalsa tidak hanya berfokus pada
              kemampuan teknik, tetapi juga membangun rasa persaudaraan,
              sportivitas, keberanian, dan semangat untuk meraih prestasi.
            </p>

            <p className="leading-8">
              Melalui latihan rutin dan berbagai kegiatan, para anggota
              mendapatkan kesempatan untuk mengembangkan potensi mereka baik
              dalam bidang olahraga maupun organisasi.
            </p>
          </div>
        </div>
      </section>

      {/* VISI MISI */}
      <section className="bg-zinc-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-black p-10 text-white">
              <div className="text-sm font-black uppercase tracking-[0.25em] text-red-500">
                Visi
              </div>

              <h2 className="mt-6 text-3xl font-black">
                Menjadi wadah pembentukan karakter dan prestasi melalui karate.
              </h2>

              <p className="mt-6 leading-8 text-zinc-400">
                Membentuk anggota yang disiplin, berkarakter, percaya diri,
                sportif, serta memiliki semangat untuk terus berkembang dan
                berprestasi.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-10">
              <div className="text-sm font-black uppercase tracking-[0.25em] text-red-600">
                Misi
              </div>

              <div className="mt-7 space-y-5">
                {[
                  "Meningkatkan kemampuan teknik karate anggota.",
                  "Membangun kedisiplinan dan tanggung jawab.",
                  "Menumbuhkan rasa persaudaraan dan kekeluargaan.",
                  "Mendorong anggota untuk mengikuti berbagai kompetisi.",
                  "Mengembangkan potensi siswa secara positif.",
                ].map((mission, index) => (
                  <div key={mission} className="flex gap-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white">
                      {index + 1}
                    </div>

                    <p className="leading-7 text-zinc-600">{mission}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NILAI */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-600">
              Nilai Kami
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Prinsip yang kami pegang
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {[
              ["Disiplin", "Konsisten dalam latihan dan tanggung jawab."],
              ["Keberanian", "Berani menghadapi tantangan dan terus berkembang."],
              ["Sportivitas", "Menghargai lawan, teman, dan proses."],
              ["Prestasi", "Memberikan yang terbaik untuk diri dan sekolah."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-zinc-200 p-7"
              >
                <div className="mb-5 h-2 w-12 rounded-full bg-red-600" />

                <h3 className="text-xl font-black">{title}</h3>

                <p className="mt-3 text-sm leading-7 text-zinc-500">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black px-6 py-10 text-zinc-500">
        <div className="mx-auto max-w-7xl">
          <div className="font-black text-white">KARATE SMALSA</div>

          <div className="mt-1 text-sm">
            Karate SMA Al Islam 1 Surakarta
          </div>

          <div className="mt-6 border-t border-zinc-800 pt-6 text-sm">
            © 2026 Karate Smalsa.
          </div>
        </div>
      </footer>
    </main>
  );
}