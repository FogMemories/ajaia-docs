import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import {
  getUserId,
  MAX_CONTENT_BYTES,
  normalizeTitle,
} from "@/lib/server-validation";

const ALLOWED_EXTENSIONS = new Set([".txt", ".md"]);

function extensionOf(name: string) {
  const extension = name.toLowerCase().slice(name.lastIndexOf("."));
  return ALLOWED_EXTENSIONS.has(extension) ? extension : null;
}

function textToDocument(text: string) {
  return {
    type: "doc",
    content: text.split(/\r?\n/).map((line) => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : undefined,
    })),
  };
}

export async function POST(request: NextRequest) {
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

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form" }, { status: 400 });
  }

  const entry = formData.get("file");
  if (!(entry instanceof File)) {
    return NextResponse.json({ error: "A file is required" }, { status: 400 });
  }

  const extension = extensionOf(entry.name);
  if (!extension) {
    return NextResponse.json(
      { error: "Only .txt and .md files are supported" },
      { status: 415 }
    );
  }

  if (entry.size > MAX_CONTENT_BYTES) {
    return NextResponse.json(
      { error: "The file must be smaller than 200 KB" },
      { status: 413 }
    );
  }

  const text = await entry.text();
  const title = normalizeTitle(entry.name.slice(0, -extension.length));

  const { data, error } = await supabase
    .from("documents")
    .insert({
      title,
      content: textToDocument(text),
      owner_id: userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not import document" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
