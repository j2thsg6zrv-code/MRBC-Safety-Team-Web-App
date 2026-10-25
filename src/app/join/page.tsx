import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button, Card, ErrorMessage, Field } from "@/components/ui";
import { text } from "@/lib/forms";
import { BEST_TIMES } from "@/lib/joinInterest";
import { createClient } from "@/lib/supabase/server";

// Public page: no login needed. It only writes through the join_team_interest
// database function, can't read anyone's answers, and links nowhere else in
// the app.

export const metadata: Metadata = {
  title: "Join the Safety Team",
  description: "Interested in serving on the MRBC safety team? Leave your details and we'll be in touch.",
};

type SearchParams = Promise<{ thanks?: string; error?: string }>;

async function submit(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.rpc("join_team_interest", {
    p_name: text(formData, "name"),
    p_phone: text(formData, "phone"),
    p_email: text(formData, "email"),
    p_best_time: text(formData, "best_time"),
  });
  redirect(error ? `/join?${new URLSearchParams({ error: error.message })}` : "/join?thanks=1");
}

export default async function JoinPage({ searchParams }: { searchParams: SearchParams }) {
  const { thanks, error } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Join the MRBC Safety Team</h1>
          <p className="mt-1 text-slate-700">
            Thank you for your interest in helping keep our church family safe. Leave your details below and a member
            of the safety team will reach out to you.
          </p>
        </header>

        {thanks ? (
          <Card>
            <h2 className="mb-2 text-lg font-semibold">Thank you!</h2>
            <p className="text-slate-700">
              We&apos;ve received your details. Someone from the safety team will contact you soon at the time you
              chose.
            </p>
          </Card>
        ) : (
          <Card>
            <div className="mb-3 empty:hidden">
              <ErrorMessage message={error} />
            </div>
            <form action={submit} className="space-y-4">
              <Field label="Your name" name="name" autoComplete="name" required minLength={2} maxLength={80} />
              <Field label="Phone number" name="phone" type="tel" autoComplete="tel" required maxLength={30} />
              <Field label="Email" name="email" type="email" autoComplete="email" required maxLength={200} />
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-slate-700">Best time to contact you</legend>
                <div className="flex flex-wrap gap-4">
                  {BEST_TIMES.map((t, i) => (
                    <label key={t.key} className="flex items-center gap-2 text-base">
                      <input type="radio" name="best_time" value={t.key} required={i === 0} className="h-5 w-5" />
                      {t.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Button type="submit">Send</Button>
            </form>
          </Card>
        )}

        <p className="text-center text-sm text-slate-500">
          Only the safety team leaders see your details. We won&apos;t share them with anyone.
        </p>
      </div>
    </main>
  );
}
