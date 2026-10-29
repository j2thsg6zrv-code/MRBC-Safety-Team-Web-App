import Link from "next/link";
import { expiryStatus } from "@/components/QualificationList";
import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { finish, text, type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

// Admin › Certifications: admins set up the kinds of certification and see
// who holds each. Members add them to themselves under My Certifications, and
// admins can add them to anyone from that member's page.

function fields(formData: FormData) {
  const months = text(formData, "valid_months");
  return {
    name: text(formData, "name") ?? "",
    description: text(formData, "description"),
    valid_months: months ? Number(months) : null,
  };
}

async function createCertification(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("certifications").insert(fields(formData));
  finish("/admin/certifications", error, "Certification added.");
}

async function updateCertification(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("certifications")
    .update(fields(formData))
    .eq("id", String(formData.get("id")));
  finish("/admin/certifications", error);
}

async function deleteCertification(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("certifications").delete().eq("id", String(formData.get("id")));
  finish("/admin/certifications", error, "Certification deleted.");
}

type Holder = { certification_id: string; expires_on: string | null; profiles: { full_name: string; email: string } | null };

function Holders({ holders }: { holders: Holder[] }) {
  if (holders.length === 0) return <p className="text-xs text-slate-500">Nobody has this yet.</p>;
  return (
    <ul className="space-y-0.5 text-sm">
      {holders.map((h, i) => {
        const status = expiryStatus(h.expires_on);
        return (
          <li key={i}>
            {h.profiles?.full_name || h.profiles?.email} · <span className={`text-xs ${status.className}`}>{status.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default async function CertificationSetupPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: certs }, { data: held }] = await Promise.all([
    supabase.from("certifications").select("*").order("name"),
    supabase.from("member_certifications").select("certification_id, expires_on, profiles(full_name, email)").order("expires_on"),
  ]);
  const holdersOf = (id: string) =>
    ((held ?? []) as unknown as Holder[])
      .filter((h) => h.certification_id === id)
      .sort((a, b) => (a.profiles?.full_name ?? "").localeCompare(b.profiles?.full_name ?? ""));

  return (
    <>
      <PageHeader title="Certifications" />
      <p className="mb-6 text-sm text-slate-600">
        <Link href="/admin" className="text-blue-700 underline">Admin</Link> &rsaquo; Certifications. The certifications
        members can hold. Members add them to themselves under My Certifications; you can add them to anyone from their
        page under Safety Team Members.
      </p>
      <Status searchParams={searchParams} />
      <div className="space-y-4">
        {(certs ?? []).length === 0 && <p className="text-sm text-slate-600">No certifications yet. Add the first one below.</p>}
        {(certs ?? []).map((c) => (
          <Card key={c.id}>
            <form action={updateCertification} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
              <input type="hidden" name="id" value={c.id} />
              <Field label="Name" name="name" defaultValue={c.name} required />
              <Field label="Description" name="description" defaultValue={c.description ?? ""} />
              <Field label="Valid for (months)" name="valid_months" type="number" min={1} defaultValue={c.valid_months ?? ""} hint="Blank = never expires" />
              <div className="flex gap-2 sm:col-span-3">
                <Button type="submit">Save</Button>
                <Button type="submit" variant="danger" formAction={deleteCertification}>Delete</Button>
              </div>
            </form>
            <div className="mt-3 border-t border-slate-100 pt-3">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Who has it</h3>
              <Holders holders={holdersOf(c.id)} />
            </div>
          </Card>
        ))}
        <Card>
          <h2 className="mb-3 font-semibold">Add a certification</h2>
          <form action={createCertification} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
            <Field label="Name" name="name" required />
            <Field label="Description" name="description" />
            <Field label="Valid for (months)" name="valid_months" type="number" min={1} hint="Blank = never expires" />
            <div className="sm:col-span-3">
              <Button type="submit">Add certification</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
