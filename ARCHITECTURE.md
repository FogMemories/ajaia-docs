# Architecture note

## Product slice

Ajaia Docs is a small document workspace with a dashboard, a document editor, a Supabase-backed API, and a simple sharing model.

## Layers

- `app/page.tsx`: dashboard, demo-user switcher, document creation, and file import.
- `app/documents/[id]/page.tsx`: dynamic route shell for a document.
- `components/documents/DocumentPageClient.tsx`: editor-page state, save, permissions, and sharing UI.
- `components/editor/DocumentEditor.tsx`: TipTap editor and formatting toolbar.
- `app/api/**`: server-side authorization checks and persistence operations.
- `lib/api/documents.ts`: typed browser-side HTTP client.
- `lib/server-validation.ts`: shared server input validation and limits.
- `supabase/schema.sql`: reproducible database schema and demo seed data.

## Priorities and tradeoffs

The implementation prioritizes an end-to-end workflow over breadth. `.txt` and `.md` import was selected because it is useful, deterministic, and does not require a paid parser or binary storage service. Sharing uses seeded demo users instead of real authentication so the reviewer can switch identities and demonstrate owner/read-only behavior quickly.

The API enforces ownership and validates ids, payload shape, title length, and content size. The `x-user-id` mechanism is only a test harness: it is forgeable and must be replaced by Supabase Auth for production.

## Deferred work

Real-time collaboration, comments, document history, DOCX import, role-based permissions, and production authentication were deferred to stay inside the 4–6 hour timebox.
