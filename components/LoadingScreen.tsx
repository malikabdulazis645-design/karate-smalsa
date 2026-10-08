import Image from "next/image";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-black">
      <div className="flex w-full max-w-xs flex-col items-center px-6">
        {/* Logo Karate Smalsa */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* Efek pulse */}
          <div className="absolute inset-0 animate-ping rounded-full bg-red-600 opacity-10" />

          <Image
            src="/logo-smalsa.png"
            alt="Logo Karate Smalsa"
            width={96}
            height={96}
            priority
            className="relative z-10 h-24 w-24 object-contain"
          />
        </div>

        {/* Nama klub */}
        <h1 className="mt-6 text-xl font-black tracking-tight text-white">
          Karate Smalsa
        </h1>

        {/* Nama sekolah */}
        <p className="mt-1 text-center text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
          SMA Al Islam 1 Surakarta
        </p>

        {/* Loading spinner */}
        <div className="mt-8 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-red-600" />
        </div>

        {/* Keterangan */}
        <p className="mt-4 text-xs text-zinc-600">
          Memuat halaman...
        </p>
      </div>
    </div>
  );
}