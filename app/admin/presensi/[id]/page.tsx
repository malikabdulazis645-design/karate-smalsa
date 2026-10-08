"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  status: string | null;
};

type AttendanceRecord = {
  id: string;
  training_session_id: string;
  member_id: string;
  status: "Hadir" | "Izin" | "Sakit";
  device_token: string;
  created_at: string;
  updated_at: string;
};

type FilterStatus = "Semua" | "Hadir" | "Izin" | "Sakit" | "Belum";

export default function AdminPresensiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const id = params.id as string;

  const [session, setSession] = useState<TrainingSession | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingMember, setSavingMember] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("Semua");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    const [
      { data: sessionData, error: sessionError },
      { data: memberData, error: memberError },
      { data: attendanceData, error: attendanceError },
    ] = await Promise.all([
      supabase
        .from("training_sessions")
        .select("*")
        .eq("id", id)
        .single(),

      supabase
        .from("members")
        .select(
          "id,nama_lengkap,kelas,warna_sabuk,foto,status"
        )
        .eq("status", "Aktif")
        .order("nama_lengkap", {
          ascending: true,
        }),

      supabase
        .from("attendance_records")
        .select("*")
        .eq("training_session_id", id),
    ]);

    if (sessionError || !sessionData) {
      setError("Jadwal latihan tidak ditemukan.");
      setLoading(false);
      return;
    }

    if (memberError) {
      console.error(memberError);
      setError("Gagal memuat data anggota.");
      setLoading(false);
      return;
    }

    if (attendanceError) {
      console.error(attendanceError);
      setError("Gagal memuat data presensi.");
      setLoading(false);
      return;
    }

    setSession(sessionData as TrainingSession);
    setMembers((memberData ?? []) as Member[]);
    setAttendance((attendanceData ?? []) as AttendanceRecord[]);

    setLoading(false);
  }

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();

    attendance.forEach((item) => {
      map.set(item.member_id, item);
    });

    return map;
  }, [attendance]);

  const stats = useMemo(() => {
    let hadir = 0;
    let izin = 0;
    let sakit = 0;

    attendance.forEach((item) => {
      if (item.status === "Hadir") hadir++;
      if (item.status === "Izin") izin++;
      if (item.status === "Sakit") sakit++;
    });

    return {
      hadir,
      izin,
      sakit,
      belum: Math.max(members.length - attendance.length, 0),
      total: members.length,
    };
  }, [members, attendance]);

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return members.filter((member) => {
      const record = attendanceMap.get(member.id);

      let status: FilterStatus = "Belum";

      if (record) {
        status = record.status;
      }

      const matchesFilter =
        filter === "Semua" || status === filter;

      const matchesSearch =
        !keyword ||
        member.nama_lengkap.toLowerCase().includes(keyword) ||
        (member.kelas ?? "").toLowerCase().includes(keyword);

      return matchesFilter && matchesSearch;
    });
  }, [members, attendanceMap, search, filter]);

  function formatTanggal(value: string) {
    return new Date(`${value}T00:00:00`).toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }

  function formatJam(value: string) {
    return value.slice(0, 5);
  }

  function getCloseTime(value: string) {
    const [hourString, minute] = value
      .slice(0, 5)
      .split(":");

    const hour = Number(hourString);
    const closeHour = (hour + 2) % 24;

    return `${String(closeHour).padStart(2, "0")}:${minute}`;
  }

  function getStatusColor(status: string | null) {
    if (status === "Hadir") {
      return "border-green-700/40 bg-green-950/30 text-green-300";
    }

    if (status === "Izin") {
      return "border-yellow-700/40 bg-yellow-950/30 text-yellow-300";
    }

    if (status === "Sakit") {
      return "border-blue-700/40 bg-blue-950/30 text-blue-300";
    }

    return "border-zinc-700 bg-zinc-900 text-zinc-400";
  }

  function getInitial(name: string) {
    return name.trim().charAt(0).toUpperCase();
  }

  async function changeAttendance(
    member: Member,
    newStatus: "Hadir" | "Izin" | "Sakit"
  ) {
    setSavingMember(member.id);
    setError("");
    setSuccess("");

    const existing = attendanceMap.get(member.id);

    if (existing) {
      const { error } = await supabase
        .from("attendance_records")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        console.error(error);
        setError(
          `Gagal mengubah presensi ${member.nama_lengkap}.`
        );
        setSavingMember(null);
        return;
      }

      setAttendance((current) =>
        current.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : item
        )
      );

      setSuccess(
        `Presensi ${member.nama_lengkap} diubah menjadi ${newStatus}.`
      );
    } else {
      const { data, error } = await supabase
        .from("attendance_records")
        .insert({
          training_session_id: id,
          member_id: member.id,
          status: newStatus,
          device_token: `admin-${crypto.randomUUID()}`,
        })
        .select("*")
        .single();

      if (error) {
        console.error(error);
        setError(
          `Gagal menambahkan presensi ${member.nama_lengkap}.`
        );
        setSavingMember(null);
        return;
      }

      setAttendance((current) => [
        ...current,
        data as AttendanceRecord,
      ]);

      setSuccess(
        `Presensi ${member.nama_lengkap} berhasil ditambahkan sebagai ${newStatus}.`
      );
    }

    setSavingMember(null);
  }

  async function removeAttendance(member: Member) {
    const existing = attendanceMap.get(member.id);

    if (!existing) {
      return;
    }

    const confirmed = window.confirm(
      `Hapus presensi ${member.nama_lengkap} dari latihan ini?`
    );

    if (!confirmed) {
      return;
    }

    setSavingMember(member.id);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("attendance_records")
      .delete()
      .eq("id", existing.id);

    if (error) {
      console.error(error);
      setError(
        `Gagal menghapus presensi ${member.nama_lengkap}.`
      );
      setSavingMember(null);
      return;
    }

    setAttendance((current) =>
      current.filter((item) => item.id !== existing.id)
    );

    setSuccess(
      `Presensi ${member.nama_lengkap} berhasil dihapus.`
    );

    setSavingMember(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-zinc-400">
            Memuat data presensi...
          </p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-black px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-900/50 bg-zinc-950 p-6">
            <h1 className="text-xl font-bold">
              Jadwal Tidak Ditemukan
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Jadwal latihan yang dipilih tidak ditemukan.
            </p>

            <button
              onClick={() => router.push("/admin/presensi")}
              className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-500"
            >
              Kembali ke Presensi
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin/presensi")}
            className="mb-4 text-sm text-zinc-400 hover:text-white"
          >
            ← Kembali ke Presensi
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full border border-red-900/50 bg-red-950/30 px-3 py-1 text-xs font-semibold text-red-300">
                Admin Presensi
              </div>

              <h1 className="text-2xl font-black sm:text-3xl">
                {session.judul}
              </h1>

              <p className="mt-2 text-sm capitalize text-zinc-400">
                {formatTanggal(session.tanggal)}
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                {formatJam(session.waktu_mulai)} WIB
                {" — "}
                tutup {getCloseTime(session.waktu_mulai)} WIB
              </p>
            </div>

            <button
              onClick={() =>
                router.push(`/admin/presensi/${id}/edit`)
              }
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-500"
            >
              ✏️ Edit Jadwal
            </button>
          </div>
        </div>

        {/* INFO */}
        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Materi Latihan
              </p>

              <p className="mt-1 text-sm text-zinc-200">
                {session.materi || "Tidak ada materi yang dicatat."}
              </p>
            </div>

            <div
              className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                session.status === "Terjadwal"
                  ? "border-green-700/40 bg-green-950/30 text-green-300"
                  : session.status === "Selesai"
                    ? "border-zinc-700 bg-zinc-900 text-zinc-300"
                    : "border-red-700/40 bg-red-950/30 text-red-300"
              }`}
            >
              {session.status}
            </div>
          </div>
        </div>

        {/* STATISTIK */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">
              Total Anggota
            </p>
            <p className="mt-1 text-2xl font-black">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-green-900/40 bg-green-950/20 p-4">
            <p className="text-xs text-green-400">
              Hadir
            </p>
            <p className="mt-1 text-2xl font-black text-green-300">
              {stats.hadir}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-900/40 bg-yellow-950/20 p-4">
            <p className="text-xs text-yellow-400">
              Izin
            </p>
            <p className="mt-1 text-2xl font-black text-yellow-300">
              {stats.izin}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 p-4">
            <p className="text-xs text-blue-400">
              Sakit
            </p>
            <p className="mt-1 text-2xl font-black text-blue-300">
              {stats.sakit}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">
              Belum
            </p>
            <p className="mt-1 text-2xl font-black text-zinc-300">
              {stats.belum}
            </p>
          </div>
        </div>

        {/* PESAN */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-900/50 bg-green-950/40 px-4 py-3 text-sm text-green-300">
            {success}
          </div>
        )}

        {/* SEARCH + FILTER */}
        <div className="mb-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau kelas..."
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-red-500"
            />

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:w-auto">
              {(
                [
                  "Semua",
                  "Hadir",
                  "Izin",
                  "Sakit",
                  "Belum",
                ] as FilterStatus[]
              ).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    filter === item
                      ? "bg-red-600 text-white"
                      : "border border-zinc-700 bg-black text-zinc-400 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MEMBER LIST */}
        <div className="space-y-3">
          {filteredMembers.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
              <p className="text-sm text-zinc-400">
                Tidak ada anggota yang sesuai.
              </p>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const record = attendanceMap.get(member.id);
              const isSaving = savingMember === member.id;

              return (
                <div
                  key={member.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* MEMBER */}
                    <div className="flex min-w-0 items-center gap-3">
                      {member.foto ? (
                        <img
                          src={member.foto}
                          alt={member.nama_lengkap}
                          className="h-12 w-12 shrink-0 rounded-full border border-zinc-700 object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-lg font-black text-red-500">
                          {getInitial(member.nama_lengkap)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-bold text-white">
                          {member.nama_lengkap}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                          {member.kelas && (
                            <span>{member.kelas}</span>
                          )}

                          {member.warna_sabuk && (
                            <span>
                              • {member.warna_sabuk}
                            </span>
                          )}
                        </div>

                        <div className="mt-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusColor(
                              record?.status ?? null
                            )}`}
                          >
                            {record?.status ?? "Belum Presensi"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="grid grid-cols-3 gap-2 lg:w-[330px]">
                      <button
                        disabled={isSaving}
                        onClick={() =>
                          changeAttendance(member, "Hadir")
                        }
                        className={`rounded-xl px-3 py-3 text-xs font-bold transition ${
                          record?.status === "Hadir"
                            ? "bg-green-600 text-white"
                            : "border border-green-800/50 bg-green-950/20 text-green-300 hover:bg-green-950/50"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        ✓ Hadir
                      </button>

                      <button
                        disabled={isSaving}
                        onClick={() =>
                          changeAttendance(member, "Izin")
                        }
                        className={`rounded-xl px-3 py-3 text-xs font-bold transition ${
                          record?.status === "Izin"
                            ? "bg-yellow-600 text-white"
                            : "border border-yellow-800/50 bg-yellow-950/20 text-yellow-300 hover:bg-yellow-950/50"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        Izin
                      </button>

                      <button
                        disabled={isSaving}
                        onClick={() =>
                          changeAttendance(member, "Sakit")
                        }
                        className={`rounded-xl px-3 py-3 text-xs font-bold transition ${
                          record?.status === "Sakit"
                            ? "bg-blue-600 text-white"
                            : "border border-blue-800/50 bg-blue-950/20 text-blue-300 hover:bg-blue-950/50"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        Sakit
                      </button>
                    </div>
                  </div>

                  {/* DELETE */}
                  {record && (
                    <div className="mt-3 flex justify-end border-t border-zinc-900 pt-3">
                      <button
                        disabled={isSaving}
                        onClick={() => removeAttendance(member)}
                        className="text-xs font-semibold text-zinc-600 hover:text-red-400 disabled:opacity-50"
                      >
                        Hapus Presensi
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <footer className="mt-10 pb-6 text-center text-xs text-zinc-600">
          Karate Smalsa • Admin Presensi
        </footer>
      </div>
    </main>
  );
}