"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import DocumentEditor from "@/components/editor/DocumentEditor";
import { getDemoUserId } from "@/lib/demo-user";
import {
  DocumentShare,
  DocumentContent,
  listDocumentShares,
  listUsers,
  getDocument,
  shareDocument,
  updateDocument,
  UserData,
} from "@/lib/api/documents";

type Props = {
  documentId: string;
};

export default function DocumentPageClient({ documentId }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<DocumentContent | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [sharing, setSharing] = useState(false);
  const [userId] = useState(getDemoUserId);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function loadDocument() {
      try {
        const [document, availableUsers, documentShares] = await Promise.all([
          getDocument(documentId, userId),
          listUsers(userId),
          listDocumentShares(documentId, userId),
        ]);

        setTitle(document.title);
        setContent(document.content);
        setIsOwner(document.owner_id === userId);
        setUsers(availableUsers.filter((user) => user.id !== userId));
        setShares(documentShares);
      } catch {
        setMessage("Could not load document.");
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [documentId, userId]);

  async function handleSave() {
    if (!content) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await updateDocument(documentId, userId, {
        title,
        content,
      });

      setMessage("Saved");
    } catch {
      setMessage("Could not save document.");
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    if (!selectedUserId) {
      return;
    }

    setSharing(true);
    setMessage("");

    try {
      const share = await shareDocument(documentId, userId, selectedUserId);
      setShares((currentShares) =>
        currentShares.some((currentShare) => currentShare.user_id === share.user_id)
          ? currentShares
          : [...currentShares, share]
      );
      setSelectedUserId("");
      setMessage("Document shared");
    } catch {
      setMessage("Could not share document.");
    } finally {
      setSharing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-600">
        Loading document...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <span aria-hidden="true">←</span> Back to documents
        </Link>

      <div className="mb-5 flex flex-wrap items-center gap-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          readOnly={!isOwner}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-2xl font-bold text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-400"
          aria-label="Document title"
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isOwner}
          className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {isOwner && (
        <section className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/70 p-5">
          <h2 className="text-sm font-bold text-indigo-950">Share document</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="min-w-64 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-700"
              aria-label="User to share with"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleShare}
              disabled={!selectedUserId || sharing}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sharing ? "Sharing..." : "Share"}
            </button>
          </div>
          {shares.length > 0 && (
            <p className="mt-3 text-sm text-indigo-800">
              Shared with {shares.length} {shares.length === 1 ? "person" : "people"}.
            </p>
          )}
        </section>
      )}

      {!isOwner && (
        <p className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900">
          You have view access to this shared document.
        </p>
      )}

      {message && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {message}
        </p>
      )}

      {content && (
        <DocumentEditor
          initialContent={content}
          onChange={setContent}
          editable={isOwner}
        />
      )}
      </div>
    </main>
  );
}
