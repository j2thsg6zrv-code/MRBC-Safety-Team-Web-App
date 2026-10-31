import { QrCodeLink } from "@/components/QrCodeLink";
import QRCode from "qrcode";
import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { finish, text, type SearchParams } from "@/lib/forms";
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

type GreeterContact = { id: string; name: string; email: string | null; phone: string | null; contact_name: string | null };

function contactFields(formData: FormData) {
  return {
    name: text(formData, "name") ?? "",
    email: text(formData, "email"),
    contact_name: text(formData, "contact_name"),
  };
}

async function saveContact(formData: FormData) {
  "use server";
  await requirePermission("manage_events");
  const supabase = await createClient();
  const fields = contactFields(formData);
  const id = text(formData, "id");
  const { error } = id
    ? await supabase.from("greeter_contacts").update(fields).eq("id", id)
    : await supabase.from("greeter_contacts").insert(fields);
  finish("/greeter-schedule", error, id ? "Saved." : "Group added.");
}

async function deleteContact(formData: FormData) {
  "use server";
  await requirePermission("manage_events");
  const supabase = await createClient();
  const { error } = await supabase.from("greeter_contacts").delete().eq("id", String(formData.get("id")));
  finish("/greeter-schedule", error, "Group removed.");
}

function ContactFields({ contact }: { contact?: GreeterContact }) {
  return (
    <>
      <Field label="Group name" name="name" defaultValue={contact?.name} required hint="Exactly as they sign up, e.g. Youth Group" />
      <Field label="Email for reminders" name="email" type="email" defaultValue={contact?.email ?? ""} required />
      <Field label="Whose email" name="contact_name" defaultValue={contact?.contact_name ?? ""} hint="e.g. Brennan Wolfe, youth leader" />
    </>
  );
}

export default async function GreeterSchedulePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const canManage = user.can("manage_events");
  const sundays = upcomingSundays();
  const supabase = await createClient();
  const url = publicGreetersUrl();
  const [{ data }, { data: contactData }, qr] = await Promise.all([
    supabase
      .from("greeter_signups")
      .select("id, sunday, name, email, phone, first_service, second_service")
      .gte("sunday", sundays[0])
      .order("sunday")
      .order("created_at"),
    supabase.from("greeter_contacts").select("id, name, email, phone, contact_name").order("name"),
    QRCode.toString(url, { type: "svg", margin: 1 }),
  ]);
  const signups = (data ?? []) as GreeterSignup[];
  const contacts = (contactData ?? []) as GreeterContact[];
  const allSundays = [...new Set([...sundays, ...signups.map((s) => s.sunday)])].sort();

  return (
    <>
      <PageHeader title="Greeters" />
      <Status searchParams={searchParams} />
      <div className="space-y-4">
        <Card className="flex flex-wrap items-center gap-4">
          <QrCodeLink url={url} svg={qr} className="fixed-colors h-32 w-32 shrink-0 bg-white [&_svg]:h-full [&_svg]:w-full" />
          <div className="min-w-0 space-y-1 text-sm">
            <p className="font-medium">Public sign-up page</p>
            <p className="text-slate-600">
              Anyone can sign up here without logging in. They see first names only, never contact details, and
              can&apos;t open any other page.
            </p>
            <a href={url} className="break-all text-blue-700 underline">{url}</a>
            <p className="text-slate-600">
              Sunday events with &ldquo;Greeter&rdquo; in the title show that day&apos;s greeters on the calendar too.
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 font-semibold">Group emails</h2>
          <p className="mb-3 text-sm text-slate-600">
            When a group signs up without an email, its thank-you and reminder go to its leader&apos;s email.
          </p>
          {canManage ? (
            <div className="space-y-4">
              {contacts.map((c) => (
                <form key={c.id} action={saveContact} className="grid gap-3 sm:grid-cols-3">
                  <input type="hidden" name="id" value={c.id} />
                  <ContactFields contact={c} />
                  <div className="flex gap-2 sm:col-span-3">
                    <Button type="submit">Save</Button>
                    <Button type="submit" variant="danger" formAction={deleteContact}>Remove</Button>
                  </div>
                </form>
              ))}
              <form action={saveContact} className="grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-3">
                <ContactFields />
                <div className="sm:col-span-3">
                  <Button type="submit" variant="secondary">Add group</Button>
                </div>
              </form>
            </div>
          ) : contacts.length === 0 ? (
            <p className="text-sm text-slate-500">None yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {contacts.map((c) => (
                <li key={c.id}>
                  <span className="font-medium">{c.name}</span>: {c.email ?? c.phone}
                  {c.contact_name && <span className="text-slate-500"> ({c.contact_name})</span>}
                </li>
              ))}
            </ul>
          )}
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
                              {p.email ? (
                                <a href={`mailto:${p.email}`} className="text-blue-700 underline">{p.email}</a>
                              ) : p.phone ? (
                                <>
                                  <a href={`tel:${p.phone}`} className="text-blue-700 underline">{p.phone}</a>
                                  <a href={`sms:${p.phone}`} className="text-blue-700 underline">Text</a>
                                </>
                              ) : (
                                <span className="text-slate-500">No email</span>
                              )}
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
