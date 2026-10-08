"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type TrainingSession = {
  id: string;
  tanggal: string;
  waktu_mulai: string;
  judul: string;
  materi: string | null;
  status: "Terjadwal" | "Selesai" | "Dibatalkan";
};

type Member = {
  id: string;
  nama_lengkap: string;
  kelas: string | null;
  warna_sabuk: string | null;
  foto: string | null;
};

type AttendanceRecord = {
  id: string;
  member_id: string;
  status: "Hadir" | "Izin" | "Sakit";
};

type AttendanceStatus =
  | "belum"
  | "dibuka"
  | "ditutup";

export default function PresensiDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const supabase = createClient();

  const [session, setSession] =
    useState<TrainingSession | null>(null);

  const [members, setMembers] =
    useState<Member[]>([]);

  const [attendance, setAttendance] =
    useState<AttendanceRecord[]>([]);

  const [selectedMember, setSelectedMember] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState<"Hadir" | "Izin" | "Sakit">("Hadir");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"success" | "error">("success");

  /*
   * Waktu real-time WIB.
   *
   * Nilai disimpan sebagai timestamp,
   * tetapi setiap perubahan menggunakan
   * waktu Asia/Jakarta.
   */
  const [now, setNow] = useState(
    new Date()
  );

  /*
   * ==============================
   * REAL-TIME CLOCK WIB
   * ==============================
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /*
   * ==============================
   * LOAD DATA
   * ==============================
   */
  async function loadData() {
    setLoading(true);

    const [
      sessionResult,
      membersResult,
      attendanceResult,
    ] = await Promise.all([
      supabase
        .from("training_sessions")
        .select(
          "id, tanggal, waktu_mulai, judul, materi, status"
        )
        .eq("id", id)
        .single(),

      supabase
        .from("members")
        .select(
          "id, nama_lengkap, kelas, warna_sabuk, foto"
        )
        .eq("status", "Aktif")
        .order("nama_lengkap", {
          ascending: true,
        }),

      supabase
        .from("attendance_records")
        .select(
          "id, member_id, status"
        )
        .eq("training_session_id", id),
    ]);

    if (sessionResult.error) {
      console.error(sessionResult.error);
    }

    if (membersResult.error) {
      console.error(membersResult.error);
    }

    if (attendanceResult.error) {
      console.error(attendanceResult.error);
    }

    setSession(
      sessionResult.data || null
    );

    setMembers(
      membersResult.data || []
    );

    setAttendance(
      attendanceResult.data || []
    );

    setLoading(false);
  }

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  /*
   * ==============================
   * WAKTU LATIHAN WIB
   * ==============================
   */
  const waktuLatihan = useMemo(() => {
    if (!session) {
      return null;
    }

    /*
     * Database menyimpan tanggal dan waktu
     * sebagai waktu lokal WIB.
     *
     * Kita konversi secara eksplisit ke
     * Asia/Jakarta.
     */
    const waktuMulai = new Date(
      `${session.tanggal}T${session.waktu_mulai}`
    );

    return waktuMulai;
  }, [session]);

  /*
   * ==============================
   * STATUS PRESENSI REAL-TIME
   * ==============================
   */
  const attendanceStatus: AttendanceStatus =
    useMemo(() => {
      if (!waktuLatihan) {
        return "belum";
      }

      /*
       * Ambil waktu sekarang dalam
       * representasi Asia/Jakarta.
       */
      const formatter =
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Jakarta",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
        });

      const parts = formatter.formatToParts(now);

      const getPart = (type: string) =>
        parts.find(
          (part) => part.type === type
        )?.value || "0";

      const jakartaNow = new Date(
        Number(getPart("year")),
        Number(getPart("month")) - 1,
        Number(getPart("day")),
        Number(getPart("hour")),
        Number(getPart("minute")),
        Number(getPart("second"))
      );

      /*
       * Waktu latihan juga dibuat sebagai
       * waktu WIB.
       */
      const [year, month, day] =
        session!.tanggal
          .split("-")
          .map(Number);

      const [
        hour,
        minute,
        second = 0,
      ] = session!.waktu_mulai
        .split(":")
        .map(Number);

      const startWIB = new Date(
        year,
        month - 1,
        day,
        hour,
        minute,
        second
      );

      const endWIB = new Date(
        startWIB.getTime() +
          2 * 60 * 60 * 1000
      );

      if (jakartaNow < startWIB) {
        return "belum";
      }

      if (jakartaNow >= endWIB) {
        return "ditutup";
      }

      return "dibuka";
    }, [now, waktuLatihan, session]);

  /*
   * ==============================
   * FORMAT TANGGAL
   * ==============================
   */
  function formatTanggal(
    tanggal: string
  ) {
    return new Date(
      `${tanggal}T00:00:00`
    ).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  /*
   * ==============================
   * FORMAT JAM
   * ==============================
   */
  function formatWaktu(
    waktu: string
  ) {
    return waktu.slice(0, 5);
  }

  /*
   * ==============================
   * WAKTU TUTUP
   * ==============================
   */
  function getWaktuTutup() {
    if (!session) {
      return "";
    }

    const [
      hour,
      minute,
      second = 0,
    ] = session.waktu_mulai
      .split(":")
      .map(Number);

    const start = new Date(
      2026,
      0,
      1,
      hour,
      minute,
      second
    );

    start.setHours(
      start.getHours() + 2
    );

    return start
      .toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
  }

  /*
   * ==============================
   * HITUNG STATISTIK
   * ==============================
   */
  const jumlahHadir = attendance.filter(
    (item) =>
      item.status === "Hadir"
  ).length;

  const jumlahIzin = attendance.filter(
    (item) =>
      item.status === "Izin"
  ).length;

  const jumlahSakit = attendance.filter(
    (item) =>
      item.status === "Sakit"
  ).length;

  /*
   * ==============================
   * CEK ANGGOTA SUDAH PRESENSI
   * ==============================
   */
  function getAttendance(
    memberId: string
  ) {
    return attendance.find(
      (item) =>
        item.member_id === memberId
    );
  }

  /*
   * ==============================
   * SUBMIT PRESENSI
   * ==============================
   */
  async function handleSubmit() {
    setMessage("");

    if (!selectedMember) {
      setMessageType("error");
      setMessage(
        "Silakan pilih nama anggota terlebih dahulu."
      );
      return;
    }

    /*
     * Jangan izinkan submit jika
     * tampilan sudah mengetahui bahwa
     * presensi belum dibuka / sudah ditutup.
     */
    if (attendanceStatus === "belum") {
      setMessageType("error");
      setMessage(
        "Presensi belum dibuka."
      );
      return;
    }

    if (attendanceStatus === "ditutup") {
      setMessageType("error");
      setMessage(
        "Waktu presensi sudah ditutup."
      );
      return;
    }

    setSubmitting(true);

    try {
      /*
       * Device token khusus untuk
       * training session ini.
       */
      let deviceToken =
        localStorage.getItem(
          `karate-smalsa-device-${id}`
        );

      if (!deviceToken) {
        deviceToken =
          crypto.randomUUID();

        localStorage.setItem(
          `karate-smalsa-device-${id}`,
          deviceToken
        );
      }

      const { data, error } =
        await supabase.rpc(
          "submit_attendance",
          {
            p_training_session_id: id,
            p_member_id:
              selectedMember,
            p_status:
              selectedStatus,
            p_device_token:
              deviceToken,
          }
        );

      if (error) {
        console.error(error);

        setMessageType("error");
        setMessage(
          "Terjadi kesalahan saat menyimpan presensi."
        );

        return;
      }

      if (!data?.success) {
        setMessageType("error");
        setMessage(
          data?.message ||
            "Presensi gagal disimpan."
        );

        return;
      }

      setMessageType("success");
      setMessage(
        data.message ||
          "Presensi berhasil disimpan."
      );

      setSelectedMember("");

      /*
       * Refresh daftar presensi
       */
      await loadData();
    } catch (error) {
      console.error(error);

      setMessageType("error");
      setMessage(
        "Terjadi kesalahan saat menyimpan presensi."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * ==============================
   * LOADING
   * ==============================
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-zinc-400">
            Memuat data latihan...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ==============================
   * NOT FOUND
   * ==============================
   */
  if (!session) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-white">
        <div className="mx-auto max-w-4xl text-center">

          <h1 className="text-3xl font-black">
            Jadwal tidak ditemukan
          </h1>

          <Link
            href="/presensi"
            className="mt-6 inline-block rounded-xl bg-red-600 px-5 py-3 text-sm font-bold"
          >
            ← Kembali ke Presensi
          </Link>

        </div>
      </main>
    );
  }

  /*
   * ==============================
   * RENDER
   * ==============================
   */
  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* HEADER */}
      <section className="border-b border-white/10 bg-black">
        <div className="mx-auto max-w-5xl px-6 pb-10 pt-32">

          <Link
            href="/presensi"
            className="text-sm font-bold text-zinc-500 transition hover:text-red-500"
          >
            ← Kembali ke jadwal
          </Link>

          <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-red-500">
            Presensi Anggota
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            {session.judul}
          </h1>

          <p className="mt-4 text-sm text-zinc-400">
            {formatTanggal(session.tanggal)}
          </p>

          <p className="mt-1 text-sm font-bold text-zinc-300">
            {formatWaktu(
              session.waktu_mulai
            )} WIB
          </p>

        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* ==============================
            REAL-TIME STATUS
        =============================== */}
        <section
          className={`rounded-3xl border p-6 ${
            attendanceStatus === "dibuka"
              ? "border-green-500/40 bg-green-500/5"
              : attendanceStatus === "belum"
              ? "border-yellow-500/30 bg-yellow-500/5"
              : "border-zinc-700 bg-zinc-900"
          }`}
        >

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              {attendanceStatus ===
                "dibuka" && (
                <>
                  <p className="text-xs font-black uppercase tracking-wider text-green-400">
                    ● Presensi Dibuka
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Silakan lakukan presensi
                  </h2>

                  <p className="mt-2 text-sm text-zinc-400">
                    Presensi ditutup pada{" "}
                    <span className="font-bold text-zinc-200">
                      {getWaktuTutup()} WIB
                    </span>
                  </p>
                </>
              )}

              {attendanceStatus ===
                "belum" && (
                <>
                  <p className="text-xs font-black uppercase tracking-wider text-yellow-400">
                    ● Presensi Belum Dibuka
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Tunggu waktu latihan
                  </h2>

                  <p className="mt-2 text-sm text-zinc-400">
                    Presensi akan dibuka tepat pada{" "}
                    <span className="font-bold text-zinc-200">
                      {formatWaktu(
                        session.waktu_mulai
                      )} WIB
                    </span>
                  </p>
                </>
              )}

              {attendanceStatus ===
                "ditutup" && (
                <>
                  <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
                    ● Presensi Ditutup
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Waktu presensi telah berakhir
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    Presensi dibuka selama 2 jam
                    sejak waktu latihan dimulai.
                  </p>
                </>
              )}

            </div>

            {/* JAM WIB */}
            <div className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-center">

              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                Waktu WIB
              </p>

              <p className="mt-1 font-mono text-2xl font-black">
                {now.toLocaleTimeString(
                  "id-ID",
                  {
                    timeZone:
                      "Asia/Jakarta",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  }
                )}
              </p>

            </div>

          </div>

        </section>

        {/* ==============================
            MATERI
        =============================== */}
        {session.materi && (
          <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              Materi Latihan
            </p>

            <p className="mt-2 text-sm leading-7 text-zinc-400">
              {session.materi}
            </p>

          </section>
        )}

        {/* ==============================
            STATISTIK
        =============================== */}
        <section className="mt-8 grid grid-cols-3 gap-3">

          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
            <p className="text-xs font-bold text-green-400">
              HADIR
            </p>

            <p className="mt-2 text-3xl font-black">
              {jumlahHadir}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
            <p className="text-xs font-bold text-yellow-400">
              IZIN
            </p>

            <p className="mt-2 text-3xl font-black">
              {jumlahIzin}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-xs font-bold text-red-400">
              SAKIT
            </p>

            <p className="mt-2 text-3xl font-black">
              {jumlahSakit}
            </p>
          </div>

        </section>

        {/* ==============================
            FORM PRESENSI
        =============================== */}
        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

          <p className="text-xs font-bold uppercase tracking-wider text-red-500">
            Form Presensi
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Pilih Nama Anggota
          </h2>

          {/* MEMBER */}
          <div className="mt-6">

            <label className="text-sm font-bold text-zinc-300">
              Nama anggota
            </label>

            <select
              value={selectedMember}
              onChange={(event) =>
                setSelectedMember(
                  event.target.value
                )
              }
              disabled={
                attendanceStatus !==
                "dibuka"
              }
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                -- Pilih nama anggota --
              </option>

              {members.map((member) => {
                const existing =
                  getAttendance(
                    member.id
                  );

                return (
                  <option
                    key={member.id}
                    value={member.id}
                  >
                    {member.nama_lengkap}
                    {member.kelas
                      ? ` — ${member.kelas}`
                      : ""}
                    {existing
                      ? ` — ${existing.status}`
                      : ""}
                  </option>
                );
              })}
            </select>

          </div>

          {/* STATUS */}
          <div className="mt-6">

            <label className="text-sm font-bold text-zinc-300">
              Status kehadiran
            </label>

            <div className="mt-3 grid grid-cols-3 gap-3">

              {(
                [
                  "Hadir",
                  "Izin",
                  "Sakit",
                ] as const
              ).map((status) => (

                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setSelectedStatus(
                      status
                    )
                  }
                  disabled={
                    attendanceStatus !==
                    "dibuka"
                  }
                  className={`rounded-xl border px-3 py-3 text-sm font-black transition ${
                    selectedStatus ===
                    status
                      ? "border-red-500 bg-red-600 text-white"
                      : "border-zinc-700 bg-black text-zinc-400 hover:border-zinc-500"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {status}
                </button>

              ))}

            </div>

          </div>

          {/* MESSAGE */}
          {message && (
            <div
              className={`mt-5 rounded-xl border p-4 text-sm ${
                messageType === "success"
                  ? "border-green-500/20 bg-green-500/5 text-green-400"
                  : "border-red-500/20 bg-red-500/5 text-red-400"
              }`}
            >
              {message}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              submitting ||
              attendanceStatus !==
                "dibuka"
            }
            className="mt-6 w-full rounded-xl bg-red-600 px-5 py-4 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
          >
            {submitting
              ? "Menyimpan..."
              : attendanceStatus ===
                "belum"
              ? "Presensi Belum Dibuka"
              : attendanceStatus ===
                "ditutup"
              ? "Presensi Sudah Ditutup"
              : "Kirim Presensi"}
          </button>

        </section>

        {/* ==============================
            DAFTAR PRESENSI
        =============================== */}
        <section className="mt-8">

          <div className="mb-5">

            <p className="text-xs font-bold uppercase tracking-wider text-red-500">
              Daftar Kehadiran
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Anggota yang sudah presensi
            </h2>

          </div>

          {attendance.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-8 text-center">

              <p className="text-sm text-zinc-500">
                Belum ada anggota yang melakukan
                presensi.
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              {attendance.map((record) => {

                const member =
                  members.find(
                    (item) =>
                      item.id ===
                      record.member_id
                  );

                if (!member) {
                  return null;
                }

                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                  >

                    <div>

                      <p className="font-bold">
                        {member.nama_lengkap}
                      </p>

                      {member.kelas && (
                        <p className="mt-1 text-xs text-zinc-500">
                          {member.kelas}
                        </p>
                      )}

                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        record.status ===
                        "Hadir"
                          ? "bg-green-500/10 text-green-400"
                          : record.status ===
                            "Izin"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {record.status}
                    </span>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </div>

      {/* FOOTER */}
      <footer className="mt-10 border-t border-zinc-800 bg-black">

        <div className="mx-auto max-w-5xl px-6 py-10 text-center">

          <p className="text-lg font-black tracking-wider">
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