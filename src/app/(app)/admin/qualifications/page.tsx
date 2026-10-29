import Link from "next/link";
import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { finish, text, type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

function fields(formData: FormData) {
  const months = text(formData, "valid_months");
  return {
    name: text(formData, "name") ?? "",
    description: text(formData, "description"),
    valid_months: months ? Number(months) : null,
  };
}

// Admin › Qualifications: the list of qualifications members can hold.
// Members add them to themselves on My Profile.

async function createQualification(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("qualifications").insert(fields(formData));
  finish("/admin/qualifications", error, "Qualification added.");
}

async function updateQualification(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("qualifications")
    .update(fields(formData))
    .eq("id", String(formData.get("id")));
  finish("/admin/qualifications", error);
}

async function deleteQualification(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("qualifications").delete().eq("id", String(formData.get("id")));
  finish("/admin/qualifications", error, "Qualification deleted.");
}

export default async function QualificationsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: quals } = await supabase.from("qualifications").select("*").order("name");

  return (
    <>
      <PageHeader title="Qualifications" />
      <p className="mb-6 text-sm text-slate-600">
        <Link href="/admin" className="text-blue-700 underline">Admin</Link> &rsaquo; Qualifications. The qualifications
        members can hold. Members add them to themselves on My Profile; you can add them to anyone from their page under
        Safety Team Members.
      </p>
      <Status searchParams={searchParams} />
      <div className="space-y-4">
        {(quals ?? []).map((q) => (
          <Card key={q.id}>
            <form action={updateQualification} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
              <input type="hidden" name="id" value={q.id} />
              <Field label="Name" name="name" defaultValue={q.name} required />
              <Field label="Description" name="description" defaultValue={q.description ?? ""} />
              <Field label="Valid for (months)" name="valid_months" type="number" min={1} defaultValue={q.valid_months ?? ""} hint="Blank = never expires" />
              <div className="flex gap-2 sm:col-span-3">
                <Button type="submit">Save</Button>
                <Button type="submit" variant="danger" formAction={deleteQualification}>Delete</Button>
              </div>
            </form>
          </Card>
        ))}
        <Card>
          <h2 className="mb-3 font-semibold">Add a qualification</h2>
          <form action={createQualification} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
            <Field label="Name" name="name" required />
            <Field label="Description" name="description" />
            <Field label="Valid for (months)" name="valid_months" type="number" min={1} hint="Blank = never expires" />
            <div className="sm:col-span-3">
              <Button type="submit">Add qualification</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
