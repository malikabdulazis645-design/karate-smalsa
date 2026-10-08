"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil" },
  { href: "/pelatih", label: "Pelatih" },
  { href: "/pengurus", label: "Pengurus" },
  { href: "/anggota", label: "Anggota" },
  { href: "/prestasi", label: "Prestasi" },
  { href: "/agenda", label: "Agenda" },
  { href: "/galeri", label: "Galeri" },
  { href: "/presensi", label: "Presensi" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">

          {/* =========================
              LOGO
          ========================== */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="relative h-12 w-12 shrink-0">
              <Image
                src="/logo-smalsa.png"
                alt="Logo Karate Smalsa"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div>
              <div className="text-sm font-black tracking-wider text-white">
                KARATE SMALSA
              </div>

              <div className="text-[10px] text-zinc-500">
                SMA Al Islam 1 Surakarta
              </div>
            </div>
          </Link>

          {/* =========================
              DESKTOP MENU
          ========================== */}
          <nav className="hidden items-center gap-5 text-sm font-medium text-zinc-300 xl:flex">
            {links.map((link) => {
              const isPresensi = link.href === "/presensi";

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isPresensi
                      ? "rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700"
                      : "transition hover:text-red-500"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* =========================
              MOBILE MENU BUTTON
          ========================== */}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-white transition hover:border-red-600 hover:text-red-500 xl:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
          >
            <span className="text-2xl leading-none">
              {open ? "×" : "☰"}
            </span>
          </button>
        </div>

        {/* =========================
            MOBILE MENU
        ========================== */}
        {open && (
          <div className="border-t border-zinc-800 pb-5 pt-4 xl:hidden">
            <nav className="space-y-1">
              {links.map((link) => {
                const isPresensi = link.href === "/presensi";

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={
                      isPresensi
                        ? "mt-2 block rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                        : "block rounded-lg px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-red-500"
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}