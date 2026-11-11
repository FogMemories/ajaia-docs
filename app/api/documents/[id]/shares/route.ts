import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { getUserId, isUuid, readJson } from "@/lib/server-validation";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: Context) {
  const userId = getUserId(request);
  const { id } = await context.params;

  if (!userId || !isUuid(id)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: document } = await supabase
    .from("documents")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const isOwner = document.owner_id === userId;

  if (!isOwner) {
    const { data: access, error: accessError } = await supabase
      .from("document_shares")
      .select("id")
      .eq("document_id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (accessError) {
      return NextResponse.json({ error: "Could not verify access" }, { status: 500 });
    }

    if (!access) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from("document_shares")
    .select("id, document_id, user_id")
    .eq("document_id", id);

  if (error) {
    return NextResponse.json({ error: "Could not load shares" }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest, context: Context) {
  const ownerId = getUserId(request);
  const { id } = await context.params;

  if (!ownerId || !isUuid(id)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: document } = await supabase
    .from("documents")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (document.owner_id !== ownerId) {
    return NextResponse.json({ error: "Only the owner can share" }, { status: 403 });
  }

  const body = await readJson(request);
  const userId = body?.userId;

  if (!isUuid(userId) || userId === ownerId) {
    return NextResponse.json({ error: "Choose another user" }, { status: 400 });
  }

  const { data: targetUser, error: targetUserError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (targetUserError) {
    return NextResponse.json({ error: "Could not verify target user" }, { status: 500 });
  }

  if (!targetUser) {
    return NextResponse.json({ error: "Target user not found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("document_shares")
    .select("id, document_id, user_id")
    .eq("document_id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(existing);
  }

  const { data, error } = await supabase
    .from("document_shares")
    .insert({ document_id: id, user_id: userId })
    .select("id, document_id, user_id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not create share" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
