# Church Safety Team

A web app for the church safety team: a dashboard calendar for signing up to
serve, plus team members, qualifications, roles & permissions, buildings,
positions, events, a watch list and incident reports.

Built with Next.js, Supabase (database and logins) and hosted on Vercel.

## Pages

| Page | Status |
| --- | --- |
| Sign up / sign in | Done |
| My Profile | Done |
| Safety Team Members | Done |
| Qualifications | Done |
| Roles & Permissions | Done |
| Buildings, Positions, Events | Done |
| Dashboard calendar and sign-ups | Done |
| Watch List, Incident Reports | Step 4 |

## First-time setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In Supabase, open **SQL Editor**, paste the contents of each file in
   `supabase/migrations/` in order, and run it.
3. In **Authentication → URL Configuration**, set the Site URL to the app's
   address (for example `https://your-app.vercel.app`) and add
   `https://your-app.vercel.app/auth/confirm` to the Redirect URLs.
4. Import this repository at [vercel.com/new](https://vercel.com/new) and add
   the two environment variables from `.env.example` (values are under
   Supabase **Project Settings → API**).
5. Open the app and create your account. **The first person to sign up becomes
   the Admin.** Everyone after that gets the default role (Team Member).

## Running locally

```bash
cp .env.example .env.local   # then fill in the values
npm install
npm run dev
```
