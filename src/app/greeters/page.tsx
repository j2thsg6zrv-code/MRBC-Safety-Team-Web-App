import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button, Card, ErrorMessage, Field, SuccessMessage } from "@/components/ui";
import { formatDate } from "@/lib/dates";
import { text } from "@/lib/forms";
import { SERVICES, upcomingSundays } from "@/lib/greeters";
import { createClient } from "@/lib/supabase/server";

// Public page: no login needed. It reads and writes only through the
// greeter_schedule and greeter_sign_up database functions, and links nowhere
// else in the app.

export const metadata: Metadata = {
  title: "Greeter Sign-Up",
  description: "Sign up to greet before a Sunday service.",
};

type SearchParams = Promise<{ saved?: string; error?: string; sunday?: string }>;

async function signUp(formData: FormData) {
  "use server";
  const sunday = text(formData, "sunday");
  const supabase = await createClient();
  const { error } = await supabase.rpc("greeter_sign_up", {
    p_sunday: sunday,
    p_name: text(formData, "name"),
    p_phone: text(formData, "phone"),
    p_first_service: formData.get("first_service") === "on",
    p_second_service: formData.get("second_service") === "on",
  });
  const params = new URLSearchParams(
    error ? { error: error.message, sunday: sunday ?? "" } : { saved: "Thank you for signing up to greet!" },
  );
  redirect(`/greeters?${params}#sign-up`);
}

export default async function GreetersPage({ searchParams }: { searchParams: SearchParams }) {
  const { saved, error, sunday: chosen } = await searchParams;
  const sundays = upcomingSundays();
  const supabase = await createClient();
  const { data } = await supabase.rpc("greeter_schedule", {
    from_date: sundays[0],
    to_date: sundays[sundays.length - 1],
  });
  const rows = (data ?? []) as { sunday: string; name: string; first_service: boolean; second_service: boolean }[];

  const namesFor = (sunday: string, service: (typeof SERVICES)[number]["key"]) =>
    rows.filter((r) => r.sunday === sunday && r[service]).map((r) => r.name);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Sunday Greeters</h1>
          <p className="mt-1 text-slate-700">
            Help welcome everyone on Sunday morning. Pick a Sunday, choose the 8:30 service, the 11:00 service or
            both. Leave your phone number if you&apos;d like a reminder.
          </p>
        </header>

        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-2 font-medium">Sunday</th>
                {SERVICES.map((s) => (
                  <th key={s.key} className="px-4 py-2 font-medium">{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sundays.map((sunday) => (
                <tr key={sunday} className="border-b border-slate-200 last:border-0">
                  <td className="whitespace-nowrap px-4 py-2 font-medium">{formatDate(sunday, "short")}</td>
                  {SERVICES.map((s) => {
                    const names = namesFor(sunday, s.key);
                    return (
                      <td key={s.key} className="px-4 py-2">
                        {names.length ? names.join(", ") : <span className="text-slate-500">Open</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <h2 id="sign-up" className="mb-3 text-lg font-semibold">Sign up to greet</h2>
          <div className="mb-3 space-y-2 empty:hidden">
            <ErrorMessage message={error} />
            <SuccessMessage message={saved} />
          </div>
          <form action={signUp} className="grid gap-3 sm:grid-cols-2">
            <Field label="Your name" name="name" autoComplete="name" required minLength={2} maxLength={80} />
            <Field
              label="Phone number (optional)"
              name="phone"
              type="tel"
              autoComplete="tel"
              hint="For a reminder. Only the safety team sees it."
            />
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Sunday</span>
              <select
                name="sunday"
                required
                defaultValue={chosen && sundays.includes(chosen) ? chosen : sundays[0]}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base focus:border-blue-600 focus:outline-none"
              >
                {sundays.map((sunday) => (
                  <option key={sunday} value={sunday}>{formatDate(sunday)}</option>
                ))}
              </select>
            </label>
            <fieldset className="sm:col-span-2">
              <legend className="mb-1 text-sm font-medium text-slate-700">Which service?</legend>
              <div className="flex flex-wrap gap-4">
                {SERVICES.map((s) => (
                  <label key={s.key} className="flex items-center gap-2 text-base">
                    <input type="checkbox" name={s.key} className="h-5 w-5" />
                    {s.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="sm:col-span-2">
              <Button type="submit">Sign me up</Button>
            </div>
          </form>
        </Card>

        <p className="text-center text-sm text-slate-500">
          Need to cancel or change your Sunday? Please let a member of the safety team know.
        </p>
      </div>
    </main>
  );
}
