# Museum Tools

A web app for managing display case bookings: which case is assigned to
which project, for which dates, with no double-bookings.

Stack: Next.js (App Router) + Supabase (Postgres) + Vercel, all on free tiers.

## Data model

- **cases** — the physical display cases available to book.
- **projects** — an exhibit/show that runs over a date range.
- **bookings** — assigns one case to one project for a date range. This is
  where double-booking is prevented.

Double-booking is enforced in the database itself, not just in application
code: `bookings` has a PostgreSQL `EXCLUDE USING gist` constraint that
rejects any insert/update creating two overlapping, non-cancelled bookings
for the same case. This holds even under concurrent requests or direct SQL,
which a simple "check then insert" in application code can't guarantee. A
trigger separately keeps each booking's dates inside its project's date
range. See `supabase/migrations/0001_init.sql` for the full schema and
comments.

Bookings are soft-cancelled (`status = 'cancelled'`) rather than deleted, so
case pages can show full booking history, not just current bookings.

## Setup

1. Create a free [Supabase](https://supabase.com) project.
2. In the Supabase SQL editor, run each file in `supabase/migrations/` in
   order (0001, 0002, ...). Optionally run `supabase/seed.sql` for sample
   data. See "Automated migrations" below for a way to skip doing this by
   hand going forward.
3. Copy `.env.local.example` to `.env.local` and fill in your project's URL
   and keys from Project Settings -> API.
4. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Where it's used | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | public, read-only under RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | server only (API routes) | secret — bypasses RLS, never expose to the browser |

## Access model (v1)

There's no end-user auth yet. Row Level Security is enabled with public
`SELECT` policies (anyone can read cases/projects/bookings), and all writes
go through Next.js API routes using the service role key. When staff
accounts are added, replace the service-role write path with RLS policies
scoped to authenticated users.

## Automated migrations

`.github/workflows/supabase-migrate.yml` applies everything in
`supabase/migrations/` automatically whenever a migration file is pushed,
using the Supabase CLI running on GitHub's infrastructure — no local
network access or MCP connector required. To enable it, add these repo
secrets (Settings -> Secrets and variables -> Actions):

| Secret | Where to get it |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | supabase.com/dashboard/account/tokens (create a personal access token) |
| `SUPABASE_PROJECT_REF` | The project ref from its URL, e.g. `yyuwzpiskqorzyrhdgul` |
| `SUPABASE_DB_PASSWORD` | Project Settings -> Database (reset it there if you don't have it saved) |

Without these secrets set, the workflow will fail — that's expected until
you add them, and it doesn't block anything else.

## Deployment

Deploy from this repo on [Vercel](https://vercel.com/new), setting the same
three environment variables in the Vercel project settings.

## Project structure

```
src/app/                    Pages (App Router)
  cases/                    Browse cases, see availability + booking history
  projects/                 List/create projects, assign cases to a project
  api/                      Route Handlers used for mutations (POST/PATCH)
src/components/             Client components (forms, search, buttons)
src/lib/supabase/           Supabase client factories (browser/server/admin)
src/lib/types.ts            Shared TypeScript types matching the DB schema
supabase/migrations/        SQL schema, including the no-double-booking constraint
supabase/seed.sql           Optional sample data for local dev
```

## Regenerating types from the live schema (optional)

Once your Supabase project is set up, you can generate typed definitions
directly from it instead of maintaining `src/lib/types.ts` by hand:

```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/lib/database.types.ts
```
