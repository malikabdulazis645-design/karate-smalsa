"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type TrainingSession = {
  id: string;
  tanggal: string;
  waktu_mulai: string;
  judul: string;
  materi: string | null;
  status: "Terjadwal" | "Selesai" | "Dibatalkan";
};

type AttendanceRecord = {
  training_session_id: string;
  status: "Hadir" | "Izin" | "Sakit";
};

export default function PresensiPage() {
  const supabase = createClient();

  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    const { data: sessionData, error: sessionError } =
      await supabase
        .from("training_sessions")
        .select(
          "id, tanggal, waktu_mulai, judul, materi, status"
        )
        .order("tanggal", { ascending: false })
        .order("waktu_mulai", { ascending: false });

    if (sessionError) {
      console.error(sessionError);
      setError("Jadwal latihan gagal dimuat.");
      setLoading(false);
      return;
    }

    const { data: attendanceData, error: attendanceError } =
      await supabase
        .from("attendance_records")
        .select("training_session_id, status");

    if (attendanceError) {
      console.error(attendanceError);
      setError("Data presensi gagal dimuat.");
      setLoading(false);
      return;
    }

    setSessions(sessionData || []);
    setAttendance(attendanceData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function formatTanggal(tanggal: string) {
    return new Date(`${tanggal}T00:00:00`).toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }

  function formatWaktu(waktu: string) {
    return waktu.slice(0, 5);
  }

  function getHadirCount(sessionId: string) {
    return attendance.filter(
      (item) =>
        item.training_session_id === sessionId &&
        item.status === "Hadir"
    ).length;
  }

  function getStatusClass(
    status: TrainingSession["status"]
  ) {
    if (status === "Terjadwal") {
      return "bg-green-500/10 text-green-400";
    }

    if (status === "Selesai") {
      return "bg-zinc-800 text-zinc-300";
    }

    return "bg-red-500/10 text-red-400";
  }

  /*
   * Jadwal terbaru:
   * - bukan jadwal yang dibatalkan
   * - berdasarkan tanggal + waktu latihan
   */
  const activeSessions = sessions
    .filter((session) => session.status !== "Dibatalkan")
    .sort((a, b) => {
      const dateA = new Date(
        `${a.tanggal}T${a.waktu_mulai}`
      ).getTime();

      const dateB = new Date(
        `${b.tanggal}T${b.waktu_mulai}`
      ).getTime();

      return dateB - dateA;
    });

  const cancelledSessions = sessions
    .filter((session) => session.status === "Dibatalkan")
    .sort((a, b) => {
      const dateA = new Date(
        `${a.tanggal}T${a.waktu_mulai}`
      ).getTime();

      const dateB = new Date(
        `${b.tanggal}T${b.waktu_mulai}`
      ).getTime();

      return dateB - dateA;
    });

  const sortedSessions = [
    ...activeSessions,
    ...cancelledSessions,
  ];

  /*
   * Kartu pertama dari jadwal aktif adalah
   * jadwal terbaru dan akan di-highlight.
   */
  const highlightedSessionId =
    activeSessions.length > 0
      ? activeSessions[0].id
      : null;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* =========================
          HEADER
      ========================== */}
      <section className="border-b border-white/10 bg-black">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-32">

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
            Internal Karate Smalsa
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Presensi Anggota
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Pilih jadwal latihan untuk melakukan presensi
            kehadiran anggota Karate Smalsa.
          </p>

        </div>
      </section>

      {/* =========================
          CONTENT
      ========================== */}
      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">
            Jadwal Latihan
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Pilih Latihan
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Jadwal latihan mengikuti data yang dibuat
            melalui dashboard admin.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <p className="text-sm text-zinc-400">
              Memuat jadwal latihan...
            </p>
          </div>
        ) : sortedSessions.length === 0 ? (
          /* EMPTY */
          <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900 p-12 text-center">

            <div className="text-6xl">
              🥋
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Belum ada jadwal latihan
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Jadwal latihan akan muncul di halaman ini
              setelah admin menambahkannya melalui dashboard.
            </p>

          </div>
        ) : (
          /* =========================
             TRAINING CARDS
          ========================== */
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {sortedSessions.map((session) => {
              const hadir = getHadirCount(session.id);

              const isHighlighted =
                session.id === highlightedSessionId;

              return (
                <Link
                  key={session.id}
                  href={`/presensi/${session.id}`}
                  className={`group relative rounded-3xl p-6 transition duration-300 hover:-translate-y-1 ${
                    isHighlighted
                      ? "border-2 border-red-500 bg-gradient-to-br from-red-950/60 via-zinc-900 to-zinc-900 shadow-[0_0_35px_rgba(220,38,38,0.15)]"
                      : "border border-zinc-800 bg-zinc-900 hover:border-red-600 hover:bg-zinc-900/80"
                  }`}
                >

                  {/* =========================
                      HIGHLIGHT LABEL
                  ========================== */}
                  {isHighlighted && (
                    <div className="absolute -top-3 left-5">

                      <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                        <span>★</span>
                        Jadwal Terbaru
                      </span>

                    </div>
                  )}

                  {/* =========================
                      TOP
                  ========================== */}
                  <div
                    className={`flex items-center justify-between gap-3 ${
                      isHighlighted ? "mt-2" : ""
                    }`}
                  >

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                        session.status
                      )}`}
                    >
                      {session.status}
                    </span>

                    <span
                      className={`text-lg transition ${
                        isHighlighted
                          ? "text-red-500 group-hover:text-red-400"
                          : "text-zinc-600 group-hover:text-red-500"
                      }`}
                    >
                      →
                    </span>

                  </div>

                  {/* =========================
                      DATE
                  ========================== */}
                  <div className="mt-6">

                    <p
                      className={`text-sm font-bold ${
                        isHighlighted
                          ? "text-red-400"
                          : "text-red-500"
                      }`}
                    >
                      {formatTanggal(session.tanggal)}
                    </p>

                    <h3 className="mt-2 text-2xl font-black text-white">
                      {session.judul}
                    </h3>

                    <p className="mt-2 text-sm font-medium text-zinc-400">
                      Mulai pukul{" "}
                      <span className="font-bold text-zinc-300">
                        {formatWaktu(session.waktu_mulai)} WIB
                      </span>
                    </p>

                  </div>

                  {/* =========================
                      MATERI
                  ========================== */}
                  {session.materi && (
                    <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">

                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                        Materi
                      </p>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
                        {session.materi}
                      </p>

                    </div>
                  )}

                  {/* =========================
                      FOOTER CARD
                  ========================== */}
                  <div className="mt-6 border-t border-zinc-800 pt-5">

                    <div className="flex items-end justify-between">

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Sudah Hadir
                        </p>

                        <p
                          className={`mt-1 text-3xl font-black ${
                            isHighlighted
                              ? "text-red-400"
                              : "text-white"
                          }`}
                        >
                          {hadir}
                        </p>

                        <p className="text-xs text-zinc-500">
                          anggota
                        </p>
                      </div>

                      <div className="text-right">

                        <p className="text-xs text-zinc-600">
                          Presensi
                        </p>

                        <p
                          className={`mt-1 text-sm font-bold ${
                            isHighlighted
                              ? "text-red-500"
                              : "text-zinc-400 group-hover:text-red-500"
                          }`}
                        >
                          Buka →
                        </p>

                      </div>

                    </div>

                  </div>

                </Link>
              );
            })}

          </div>
        )}

        {/* =========================
            INFO
        ========================== */}
        {!loading && activeSessions.length > 0 && (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">

            <div className="flex items-start gap-3">

              <div className="text-lg">
                ★
              </div>

              <div>
                <p className="text-sm font-bold text-zinc-300">
                  Jadwal terbaru ditandai
                </p>

                <p className="mt-1 text-xs leading-6 text-zinc-500">
                  Kartu dengan tanda{" "}
                  <span className="font-bold text-red-500">
                    Jadwal Terbaru
                  </span>{" "}
                  merupakan jadwal latihan terbaru yang tersedia.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="border-t border-zinc-800 bg-black">

        <div className="mx-auto max-w-7xl px-6 py-10 text-center">

          <p className="text-lg font-black tracking-wider text-white">
            KARATE SMALSA
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Karate SMA Al Islam 1 Surakarta
          </p>

          <p className="mt-6 text-xs text-zinc-600">
            © 2026 Karate Smalsa. All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}