import { revalidatePath } from "next/cache";
import { CredentialCard } from "@/components/CredentialCard";
import type { MemberQualification } from "@/components/QualificationList";
import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { getCurrentUser, requirePermission } from "@/lib/auth";
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

// Any approved member can add a qualification to the list; changing or
// deleting one stays with qualification managers.
async function createQualification(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user.active) finish("/qualifications", { message: "Your account is waiting for approval." });
  const supabase = await createClient();
  const { error } = await supabase.from("qualifications").insert(fields(formData));
  revalidatePath("/qualifications");
  finish("/qualifications", error, "Qualification added.");
}

async function updateQualification(formData: FormData) {
  "use server";
  await requirePermission("manage_qualifications");
  const supabase = await createClient();
  const { error } = await supabase
    .from("qualifications")
    .update(fields(formData))
    .eq("id", String(formData.get("id")));
  finish("/qualifications", error);
}

async function deleteQualification(formData: FormData) {
  "use server";
  await requirePermission("manage_qualifications");
  const supabase = await createClient();
  const { error } = await supabase.from("qualifications").delete().eq("id", String(formData.get("id")));
  finish("/qualifications", error, "Qualification deleted.");
}

export default async function QualificationsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const canManage = user.can("manage_qualifications");
  const supabase = await createClient();
  const [{ data: quals }, { data: mine }] = await Promise.all([
    supabase.from("qualifications").select("*").order("name"),
    supabase
      .from("member_qualifications")
      .select("id, earned_on, expires_on, qualifications(name)")
      .eq("profile_id", user.id)
      .order("expires_on"),
  ]);

  return (
    <>
      <PageHeader title="Qualifications" />
      <Status searchParams={searchParams} />
      <div className="space-y-4">
        <CredentialCard
          kind="qualification"
          title="My qualifications"
          profileId={user.id}
          items={(mine ?? []) as unknown as MemberQualification[]}
          choices={(quals ?? []).map((q) => ({ id: q.id, name: q.name }))}
          canEdit
          returnTo="/qualifications"
        />
        <h2 className="pt-2 text-lg font-semibold">All qualifications</h2>
        {(quals ?? []).map((q) =>
          canManage ? (
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
          ) : (
            <Card key={q.id}>
              <p className="font-medium">{q.name}</p>
              {q.description && <p className="text-sm text-slate-600">{q.description}</p>}
              <p className="text-xs text-slate-500">
                {q.valid_months ? `Valid for ${q.valid_months} months` : "Does not expire"}
              </p>
            </Card>
          ),
        )}
        <Card>
          <h2 className="mb-1 font-semibold">Add a qualification</h2>
          <p className="mb-3 text-sm text-slate-600">
            Don&apos;t see yours? Add it here, then add it to yourself under My qualifications.
          </p>
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
