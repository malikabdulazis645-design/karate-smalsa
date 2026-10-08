import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "malikabdulazis645@gmail.com";
const ADMIN_PASSWORD = "karatesmalsa1";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body?.password;

    if (typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Password wajib diisi." },
        { status: 400 },
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: "Password salah." },
        { status: 401 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { data, error } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: ADMIN_EMAIL,
      });

    if (error || !data.properties?.action_link) {
      console.error("Admin login error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Gagal membuat sesi admin.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      actionLink: data.properties.action_link,
    });
  } catch (error) {
    console.error("Admin login exception:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 },
    );
  }
}