"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";

import {
  createDocument,
  DocumentData,
  importDocument,
  listDocuments,
  listUsers,
  UserData,
} from "@/lib/api/documents";
import { getDemoUserId, setDemoUserId } from "@/lib/demo-user";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function Home() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [userId, setUserId] = useState(getDemoUserId);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const nextUsers = await listUsers(userId);
        setUsers(nextUsers);

        if (!nextUsers.some((user) => user.id === userId)) {
          setDocuments([]);
          setError("No valid demo user is selected. Check the users table.");
          return;
        }

        setDocuments(await listDocuments(userId));
      } catch {
        setError("Could not load your documents.");
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, [userId]);

  async function handleCreate() {
    if (!users.some((user) => user.id === userId)) {
      setError("Select a valid demo user before creating a document.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const document = await createDocument(userId);
      window.location.assign(`/documents/${document.id}`);
    } catch {
      setError("Could not create the document.");
      setCreating(false);
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setImporting(true);
    setError("");

    try {
      const document = await importDocument(userId, file);
      window.location.assign(`/documents/${document.id}`);
    } catch {
      setError("Could not import the file. Use a .txt or .md file under 200 KB.");
      setImporting(false);
    }
  }

  function handleUserChange(nextUserId: string) {
    setDemoUserId(nextUserId);
    setUserId(nextUserId);
    setLoading(true);
    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-5xl">
      <header className="mb-10 flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Ajaia Docs
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Your documents
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor="demo-user">
            Current demo user
          </label>
          <select
            id="demo-user"
            value={userId}
            onChange={(event) => handleUserChange(event.target.value)}
            className="max-w-52 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
          >
            {users.length === 0 && (
              <option value={userId}>No demo users available</option>
            )}
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50">
              {importing ? "Importing..." : "Import .txt/.md"}
              <input
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                onChange={handleImport}
                disabled={importing || users.length === 0}
                className="sr-only"
              />
            </label>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || users.length === 0}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Creating..." : "New document"}
            </button>
          </div>
        </div>
      </header>

      {error && (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">Loading documents...</p>
      ) : documents.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            No documents yet
          </h2>
          <p className="mt-2 text-slate-500">
            Create your first document to start writing.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <Link
              key={document.id}
              href={`/documents/${document.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <h2 className="truncate text-lg font-semibold text-slate-900">
                {document.title}
              </h2>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                {document.is_shared ? "Shared with you" : "Owned by you"}
              </p>
              <p className="mt-8 text-sm text-slate-500">
                Updated {formatDate(document.updated_at)}
              </p>
            </Link>
          ))}
        </section>
      )}
      </div>
    </main>
  );
}
