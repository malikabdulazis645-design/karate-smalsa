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
  status: string;
};

export default function AdminPresensiPage() {
  const supabase = createClient();

  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    const { data: sessionData, error: sessionError } =
      await supabase
        .from("training_sessions")
        .select("*")
        .order("tanggal", { ascending: false })
        .order("waktu_mulai", { ascending: false });

    if (sessionError) {
      console.error(sessionError);
      setLoading(false);
      return;
    }

    const { data: attendanceData, error: attendanceError } =
      await supabase
        .from("attendance_records")
        .select("training_session_id, status");

    if (attendanceError) {
      console.error(attendanceError);
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

  function getHadirCount(sessionId: string) {
    return attendance.filter(
      (item) =>
        item.training_session_id === sessionId &&
        item.status === "Hadir"
    ).length;
  }

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

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
              Admin
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Presensi Latihan
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Kelola jadwal latihan rutin dan presensi anggota.
            </p>
          </div>

          <Link
            href="/admin/presensi/tambah"
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            + Tambah Latihan
          </Link>
        </div>

        {/* CONTENT */}
        <section className="mt-10">

          {loading ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
              Memuat data...
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-12 text-center">

              <div className="text-5xl">🥋</div>

              <h2 className="mt-5 text-xl font-black">
                Belum ada latihan rutin
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
                Tambahkan jadwal latihan rutin untuk mulai menggunakan
                sistem presensi.
              </p>

              <Link
                href="/admin/presensi/tambah"
                className="mt-6 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-bold hover:bg-red-700"
              >
                Tambah Latihan
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {sessions.map((session) => {

                const hadir = getHadirCount(session.id);

                return (
                  <Link
                    key={session.id}
                    href={`/admin/presensi/${session.id}`}
                    className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-red-600 hover:bg-zinc-900/80"
                  >

                    {/* STATUS */}
                    <div className="flex items-center justify-between">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          session.status === "Terjadwal"
                            ? "bg-green-500/10 text-green-400"
                            : session.status === "Selesai"
                            ? "bg-zinc-800 text-zinc-300"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {session.status}
                      </span>

                      <span className="text-zinc-600 transition group-hover:text-red-500">
                        →
                      </span>
                    </div>

                    {/* DATE */}
                    <div className="mt-6">

                      <p className="text-sm font-bold text-red-500">
                        {formatTanggal(session.tanggal)}
                      </p>

                      <h2 className="mt-2 text-2xl font-black">
                        {session.judul}
                      </h2>

                      <p className="mt-2 text-sm text-zinc-400">
                        {formatWaktu(session.waktu_mulai)} WIB
                      </p>

                    </div>

                    {/* MATERI */}
                    {session.materi && (
                      <p className="mt-5 line-clamp-2 text-sm leading-6 text-zinc-500">
                        {session.materi}
                      </p>
                    )}

                    {/* ATTENDANCE */}
                    <div className="mt-6 border-t border-zinc-800 pt-5">

                      <div className="flex items-end justify-between">

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                            Hadir
                          </p>

                          <p className="mt-1 text-3xl font-black text-white">
                            {hadir}
                          </p>

                          <p className="text-xs text-zinc-500">
                            anggota
                          </p>
                        </div>

                        <div className="text-right text-xs text-zinc-500">
                          <p>Presensi</p>
                          <p className="mt-1 font-bold text-zinc-300">
                            Buka detail →
                          </p>
                        </div>

                      </div>

                    </div>

                  </Link>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}