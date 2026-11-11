import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  getUserId,
  isDocumentContent,
  isUuid,
  normalizeTitle,
  readJson,
} from "@/lib/server-validation";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(request);

  if (!userId) {
    return NextResponse.json(
      { error: "A valid user is required" },
      { status: 400 }
    );
  }

  const { id } = await context.params;

  if (!isUuid(id)) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
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

  const { data: document, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !document) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  if (document.owner_id !== userId) {
    const { data: share, error: shareError } = await supabase
      .from("document_shares")
      .select("id")
      .eq("document_id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (shareError) {
      return NextResponse.json({ error: "Could not verify access" }, { status: 500 });
    }

    if (!share) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
  }

  return NextResponse.json(document);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(request);

  if (!userId) {
    return NextResponse.json(
      { error: "A valid user is required" },
      { status: 400 }
    );
  }

  const { id } = await context.params;

  if (!isUuid(id)) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
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

  const body = await readJson(request);
  if (!body || (!("title" in body) && !("content" in body))) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const { data: document, error: fetchError } = await supabase
    .from("documents")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (fetchError || !document) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  if (document.owner_id !== userId) {
    return NextResponse.json(
      { error: "Only the owner can edit this document" },
      { status: 403 }
    );
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof body.title === "string") {
    updates.title = normalizeTitle(body.title);
  } else if ("title" in body) {
    return NextResponse.json({ error: "Invalid title" }, { status: 400 });
  }

  if (body.content !== undefined && !isDocumentContent(body.content)) {
    return NextResponse.json({ error: "Invalid document content" }, { status: 400 });
  }

  if (body.content !== undefined) {
    updates.content = body.content;
  }

  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not save document" }, { status: 500 });
  }

  return NextResponse.json(data);
}
