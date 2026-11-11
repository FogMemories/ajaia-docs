import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  getUserId,
  normalizeTitle,
  readJson,
} from "@/lib/server-validation";

export async function GET(request: NextRequest) {
  const userId = getUserId(request);

  if (!userId) {
    return NextResponse.json(
      { error: "A valid user is required" },
      { status: 400 }
    );
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

  const { data: ownedDocuments, error: ownedError } = await supabase
    .from("documents")
    .select("*")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (ownedError) {
    return NextResponse.json(
      { error: "Could not load documents" },
      { status: 500 }
    );
  }

  const { data: shares, error: sharesError } = await supabase
    .from("document_shares")
    .select("document_id")
    .eq("user_id", userId);

  if (sharesError) {
    return NextResponse.json(
      { error: "Could not load document access" },
      { status: 500 }
    );
  }

  const sharedIds = (shares ?? []).map((share) => share.document_id);
  const ownedDocumentRows = ownedDocuments ?? [];
  let sharedDocuments = ownedDocumentRows.slice(0, 0);

  if (sharedIds.length > 0) {
    const result = await supabase
      .from("documents")
      .select("*")
      .in("id", sharedIds)
      .order("updated_at", { ascending: false });

    if (result.error) {
      return NextResponse.json(
        { error: "Could not load shared documents" },
        { status: 500 }
      );
    }

    sharedDocuments = result.data ?? [];
  }

  const documents = [
    ...ownedDocumentRows.map((document) => ({
      ...document,
      is_shared: false,
    })),
    ...sharedDocuments.map((document) => ({
      ...document,
      is_shared: true,
    })),
  ].sort(
    (left, right) =>
      new Date(right.updated_at).getTime() -
      new Date(left.updated_at).getTime()
  );

  return NextResponse.json(documents);
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);

  if (!userId) {
    return NextResponse.json(
      { error: "A valid user is required" },
      { status: 400 }
    );
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
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = normalizeTitle(body.title);

  const { data, error } = await supabase
    .from("documents")
    .insert({
      title,
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
          },
        ],
      },
      owner_id: userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Could not create document" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
