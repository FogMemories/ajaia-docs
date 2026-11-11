# AI workflow note

## Tools used

- Codex in VS Code for repository inspection, implementation, refactoring, and review.
- Next.js, TipTap, Supabase, and Playwright/Vitest documentation for framework guidance.

## Where AI helped

AI accelerated repetitive scaffolding, route wiring, type-level organization, defensive validation, and the first pass of the dashboard/editor UI. It was also useful for auditing missing assignment deliverables and turning them into a focused checklist.

## What required human judgment

The scope was deliberately reduced to `.txt`/`.md` import, seeded demo users, owner/read-only sharing, and a focused editor. Real authentication, real-time collaboration, and DOCX parsing were rejected for this timebox because they would increase risk without improving the core evaluation flow enough.

Generated code was reviewed against the actual repository structure and the installed Next.js conventions. API behavior was checked for missing users, missing documents, unauthorized access, malformed JSON, oversized content, and invalid share targets.

## Verification plan

- Run `npm run lint`.
- Run `npm run test`.
- Run `npm run build`.
- Manually walk through create → edit → save → import → share → read-only access.
- Verify deployment with the seeded demo accounts.
