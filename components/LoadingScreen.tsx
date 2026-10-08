export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-black">
      <div className="flex w-full max-w-xs flex-col items-center px-6">
        {/* Logo */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.25)]">
          <span className="relative z-10 text-2xl font-black tracking-tight text-white">
            KS
          </span>

          <span className="absolute inset-0 animate-ping rounded-2xl bg-red-600 opacity-20" />
        </div>

        {/* Nama */}
        <h1 className="mt-6 text-xl font-black tracking-tight text-white">
          Karate Smalsa
        </h1>

        <p className="mt-1 text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
          SMA Al Islam 1 Surakarta
        </p>

        {/* Loading spinner */}
        <div className="mt-8 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-red-600" />
        </div>

        <p className="mt-4 text-xs text-zinc-600">
          Memuat halaman...
        </p>
      </div>
    </div>
  );
}