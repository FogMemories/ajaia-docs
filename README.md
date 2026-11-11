# Ajaia Docs

A lightweight collaborative document editor built for the Ajaia product-engineering assignment.

## What works

- Create, rename, edit, save, and reopen documents.
- Rich text: bold, italic, underline, H1, bulleted lists, and numbered lists.
- Import `.txt` and `.md` files under 200 KB as editable documents.
- Share a document with another seeded user.
- Distinguish owned and shared documents in the dashboard.
- Shared users have read-only access; owners can edit and share.
- Persistence through Supabase.

Authentication is intentionally simulated with two seeded demo users because the assignment is time-boxed. The app sends the selected demo user id in `x-user-id`; this must be replaced with Supabase Auth before production use.

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project

## Setup

1. Install dependencies and start the app with one command:

   ```bash
   npm run dev
   ```

   The `predev` script runs `npm install` automatically before Next.js starts.

2. In Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql).

3. Create `.env.local` in this folder:

   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SECRET_KEY=your-server-only-secret-key
   ```

   Never expose `SUPABASE_SECRET_KEY` in client code or commit `.env.local`.

4. Open [http://localhost:3000](http://localhost:3000).

## Demo flow

1. Select **Alex Owner**.
2. Create a document, edit it, rename it, and save it.
3. Import a `.txt` or `.md` file from the dashboard.
4. Share a document with **Sam Reviewer**.
5. Return to the dashboard and select **Sam Reviewer**.
6. Open the shared document and verify that it is read-only.

## Commands

```bash
npm run dev       # installs dependencies, then starts development
npm run lint      # lint the project
npm run test      # run automated validation tests
npm run build     # production build
```

## Scope decisions

The assignment prioritizes a complete document workflow, persistence, basic access control, file import, and clear product behavior. Real-time collaboration, comments, version history, DOCX parsing, and production authentication were intentionally deferred.
