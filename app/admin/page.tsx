import Link from "next/link";

const menus = [
  {
    title: "Anggota",
    description: "Kelola data anggota Karate Smalsa.",
    href: "/admin/anggota",
  },
  {
    title: "Pengurus",
    description: "Kelola struktur dan data pengurus.",
    href: "/admin/pengurus",
  },
  {
    title: "Pelatih",
    description: "Kelola data pelatih dan pembimbing.",
    href: "/admin/pelatih",
  },
  {
    title: "Agenda",
    description: "Kelola jadwal dan kegiatan.",
    href: "/admin/agenda",
  },
  {
    title: "Prestasi",
    description: "Kelola kejuaraan dan prestasi anggota.",
    href: "/admin/prestasi",
  },
  {
    title: "Presensi",
    description: "Kelola jadwal latihan dan kehadiran anggota.",
    href: "/admin/presensi",
  },
  {
    title: "Galeri",
    description: "Kelola album dan foto kegiatan.",
    href: "/admin/galeri",
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-black">
              Admin Karate Smalsa
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-red-600 hover:text-red-500"
          >
            Lihat Website
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <h2 className="text-3xl font-black">Selamat datang, Admin</h2>

          <p className="mt-2 text-zinc-500">
            Pilih menu untuk mengelola konten website Karate Smalsa.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-red-600/50 hover:bg-zinc-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-lg font-black">
                +
              </div>

              <h3 className="mt-6 text-xl font-bold group-hover:text-red-500">
                {menu.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {menu.description}
              </p>

              <div className="mt-5 text-sm font-bold text-red-500">
                Kelola →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}