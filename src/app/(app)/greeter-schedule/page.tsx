import QRCode from "qrcode";
import { Status } from "@/components/Status";
import { Button, Card, PageHeader } from "@/components/ui";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { finish, type SearchParams } from "@/lib/forms";
import { publicGreetersUrl, SERVICES, upcomingSundays, type GreeterSignup } from "@/lib/greeters";
import { createClient } from "@/lib/supabase/server";

async function removeSignup(formData: FormData) {
  "use server";
  await requirePermission("manage_events");
  const supabase = await createClient();
  const id = String(formData.get("id"));
  // Take them off this one service; drop the sign-up once no service is left.
  const service = SERVICES.find((s) => s.key === formData.get("service"))?.key ?? "first_service";
  const other = service === "first_service" ? "second_service" : "first_service";
  const { data: signup } = await supabase.from("greeter_signups").select(other).eq("id", id).single();
  const { error } = (signup as Record<string, boolean> | null)?.[other]
    ? await supabase.from("greeter_signups").update({ [service]: false }).eq("id", id)
    : await supabase.from("greeter_signups").delete().eq("id", id);
  finish("/greeter-schedule", error, "Sign-up removed.");
}

export default async function GreeterSchedulePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const canManage = user.can("manage_events");
  const sundays = upcomingSundays();
  const supabase = await createClient();
  const { data } = await supabase
    .from("greeter_signups")
    .select("id, sunday, name, phone, first_service, second_service")
    .gte("sunday", sundays[0])
    .order("sunday")
    .order("created_at");
  const signups = (data ?? []) as GreeterSignup[];
  const allSundays = [...new Set([...sundays, ...signups.map((s) => s.sunday)])].sort();

  const url = publicGreetersUrl();
  const qr = await QRCode.toString(url, { type: "svg", margin: 1 });

  return (
    <>
      <PageHeader title="Greeters" />
      <Status searchParams={searchParams} />
      <div className="space-y-4">
        <Card className="flex flex-wrap items-center gap-4">
          <div
            className="fixed-colors h-32 w-32 shrink-0 bg-white [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qr }}
          />
          <div className="min-w-0 space-y-1 text-sm">
            <p className="font-medium">Public sign-up page</p>
            <p className="text-slate-600">
              Anyone can sign up here without logging in. They see first names only, never phone numbers, and
              can&apos;t open any other page.
            </p>
            <a href={url} className="break-all text-blue-700 underline">{url}</a>
            <p className="text-slate-600">
              Sunday events with &ldquo;Greeter&rdquo; in the title show that day&apos;s greeters on the calendar too.
            </p>
          </div>
        </Card>

        {allSundays.map((sunday) => {
          const day = signups.filter((s) => s.sunday === sunday);
          return (
            <Card key={sunday}>
              <h2 className="mb-2 font-semibold">{formatDate(sunday)}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {SERVICES.map((service) => {
                  const people = day.filter((s) => s[service.key]);
                  return (
                    <div key={service.key}>
                      <p className="mb-1 text-sm font-medium text-slate-600">{service.label}</p>
                      {people.length === 0 ? (
                        <p className="text-sm text-slate-500">No one yet</p>
                      ) : (
                        <ul className="space-y-1 text-sm">
                          {people.map((p) => (
                            <li key={p.id} className="flex flex-wrap items-center gap-x-3">
                              <span>{p.name}</span>
                              <a href={`tel:${p.phone}`} className="text-blue-700 underline">{p.phone}</a>
                              <a href={`sms:${p.phone}`} className="text-blue-700 underline">Text</a>
                              {canManage && (
                                <form action={removeSignup}>
                                  <input type="hidden" name="id" value={p.id} />
                                  <input type="hidden" name="service" value={service.key} />
                                  <Button type="submit" variant="secondary" className="px-2 py-0.5 text-xs">
                                    Remove
                                  </Button>
                                </form>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
