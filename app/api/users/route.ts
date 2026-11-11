import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/server-validation";

export async function GET(request: NextRequest) {
  const userId = getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "A valid user is required" }, { status: 400 });
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (userError) {
    return NextResponse.json({ error: "Could not verify user" }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email")
    .order("name");

  if (error) {
    return NextResponse.json(
      { error: "Could not load users" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
