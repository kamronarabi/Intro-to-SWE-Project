import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("recruiter_interests")
    .select(`
      id, message, seen, created_at,
      recruiter:profiles!recruiter_interests_recruiter_id_fkey(
        name,
        company:companies(name)
      )
    `)
    .eq("student_id", user.id)
    .eq("seen", false)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { student_id, message } = body;

  if (!student_id) {
    return NextResponse.json({ error: "student_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("recruiter_interests")
    .insert({ recruiter_id: user.id, student_id, message: message || null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
