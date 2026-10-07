import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-black pt-24">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute left-[-10%] top-1/4 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-red-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8">
          {/* LEFT */}
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400">
              Ekstrakurikuler Karate
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              KARATE
              <span className="block text-red-600">SMALSA</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
              Wadah pembinaan karate bagi siswa SMA Al Islam 1 Surakarta
              untuk membangun disiplin, mental, karakter, dan prestasi.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/profil"
                className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Kenali Kami
              </Link>

              <Link
                href="/anggota"
                className="rounded-xl border border-zinc-700 px-6 py-3 font-bold text-zinc-200 transition hover:border-red-600 hover:text-red-500"
              >
                Lihat Anggota
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-8 border-t border-zinc-800 pt-8">
              <div>
                <div className="text-2xl font-black text-white">01</div>
                <div className="mt-1 text-sm text-zinc-500">
                  Organisasi Karate
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-white">02</div>
                <div className="mt-1 text-sm text-zinc-500">
                  Pembinaan Karakter
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-white">03</div>
                <div className="mt-1 text-sm text-zinc-500">
                  Pengembangan Prestasi
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - LOGO */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-[360px] w-[360px] rounded-full bg-red-600/10 blur-3xl" />

            <div className="relative flex h-[340px] w-[340px] items-center justify-center rounded-full border border-red-600/20 bg-zinc-950 shadow-2xl shadow-red-950/30 sm:h-[420px] sm:w-[420px]">
              <div className="absolute inset-6 rounded-full border border-zinc-800" />

              <Image
                src="/logo-smalsa.png"
                alt="Logo Karate Smalsa"
                width={300}
                height={300}
                priority
                className="relative z-10 h-auto w-64 object-contain sm:w-72"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TENTANG */}
      <section className="border-t border-zinc-900 bg-zinc-950 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
                Tentang Kami
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Lebih dari sekadar
                <span className="block text-red-600">latihan karate.</span>
              </h2>
            </div>

            <div>
              <p className="leading-8 text-zinc-400">
                Karate Smalsa merupakan ekstrakurikuler karate SMA Al Islam 1
                Surakarta yang menjadi wadah bagi siswa untuk belajar dan
                mengembangkan kemampuan karate secara terarah.
              </p>

              <p className="mt-5 leading-8 text-zinc-400">
                Melalui latihan yang disiplin dan konsisten, Karate Smalsa
                mendorong setiap anggota untuk memiliki mental yang kuat,
                karakter yang baik, serta semangat untuk terus berkembang.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NILAI */}
      <section className="bg-black py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Nilai Kami
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Membentuk karakter melalui karate.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 transition hover:border-red-600/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-xl font-black">
                01
              </div>

              <h3 className="mt-6 text-xl font-bold">Disiplin</h3>

              <p className="mt-3 leading-7 text-zinc-500">
                Membiasakan diri untuk konsisten, bertanggung jawab, dan
                menghargai proses dalam setiap latihan.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 transition hover:border-red-600/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-xl font-black">
                02
              </div>

              <h3 className="mt-6 text-xl font-bold">Mental</h3>

              <p className="mt-3 leading-7 text-zinc-500">
                Melatih keberanian, ketahanan mental, kepercayaan diri, dan
                kemampuan menghadapi tantangan.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 transition hover:border-red-600/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-xl font-black">
                03
              </div>

              <h3 className="mt-6 text-xl font-bold">Prestasi</h3>

              <p className="mt-3 leading-7 text-zinc-500">
                Memberikan ruang bagi anggota untuk mengembangkan kemampuan
                dan mencapai prestasi melalui latihan yang terarah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-900 bg-zinc-950 py-24">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Keraguan
            <span className="text-red-600"> Adalah Kekalahan</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-zinc-500">
            Bersama Karate Smalsa, tumbuh menjadi pribadi yang lebih disiplin,
            tangguh, dan percaya diri.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/profil"
              className="rounded-xl bg-red-600 px-7 py-3 font-bold text-white transition hover:bg-red-700"
            >
              Tentang Karate Smalsa
            </Link>

            <Link
              href="/galeri"
              className="rounded-xl border border-zinc-700 px-7 py-3 font-bold text-zinc-200 transition hover:border-red-600 hover:text-red-500"
            >
              Lihat Galeri
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-black py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <div className="font-bold text-white">KARATE SMALSA</div>
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