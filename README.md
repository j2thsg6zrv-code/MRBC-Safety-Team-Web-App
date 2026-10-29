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
| Watch List, Incident Reports | Done |
| Light / dark mode (My Profile) | Done |
| Greeters: public sign-up at `/greeters` (no login) and the team's list with phone numbers | Done |
| Training: classes with lessons and a quiz; admins build and approve them, and passing adds the certification to the member's qualifications | Done |
| Training slides: read aloud (with mute), Next unlocks when the reading is done, videos, practice questions, saved progress, and PowerPoint import for admins | Done |
| Slide pictures: upload or replace a picture on any slide, or have the app create matching cartoons (needs an OpenAI API key) | Done |

## First-time setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In Supabase, open **SQL Editor**, paste the contents of each file in
   `supabase/migrations/` in order, and run it.
3. In **Authentication → URL Configuration**, set the Site URL to the app's
   address (for example `https://your-app.vercel.app`) and add
   `https://your-app.vercel.app/auth/confirm` to the Redirect URLs.
4. Import this repository at [vercel.com/new](https://vercel.com/new) and add
   the environment variables from `.env.example` (Supabase values are under
   **Project Settings → API**). Optional: `OPENAI_API_KEY` lets admins have
   the app create a picture for each training slide. Vercel uses a new or
   changed variable from the next deploy on.
5. Open the app and create your account. **The first person to sign up becomes
   the Admin** and is approved automatically. Everyone after that gets the
   default role (Team Member) and waits on the **Safety Team Members** page
   until an admin approves them.

## Running locally

Needs Docker for the local database.

```bash
npm install
npm run db:start             # local Supabase; prints the URL and anon key
cp .env.example .env.local   # then fill in the values it printed
npm run dev
```
