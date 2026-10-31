import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CredentialCard } from "@/components/CredentialCard";
import { CertificationsCard, type OutsideCertification } from "@/components/CertificationsCard";
import type { MemberQualification } from "@/components/QualificationList";
import { Status } from "@/components/Status";
import { Button, Card, PageHeader, Select } from "@/components/ui";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { finish, text, type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

async function updateMembership(formData: FormData) {
  "use server";
  await requirePermission("manage_members");
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role_id: text(formData, "role_id"), active: formData.get("active") === "on" })
    .eq("id", id);
  revalidatePath("/members");
  finish(`/members/${id}`, error);
}

export default async function MemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const canManage = user.can("manage_members");
  const supabase = await createClient();

  const [{ data: member }, { data: quals }, { data: roles }, { data: allQuals }, { data: certs }, { data: allCerts }, { data: outside }] = await Promise.all([
    supabase.from("profiles").select("*, roles(name, is_admin)").eq("id", id).maybeSingle(),
    supabase
      .from("member_qualifications")
      .select("id, earned_on, expires_on, qualifications(name)")
      .eq("profile_id", id)
      .order("expires_on"),
    supabase.from("roles").select("id, name, is_admin").order("name"),
    supabase.from("qualifications").select("id, name").order("name"),
    supabase
      .from("member_certifications")
      .select("id, earned_on, expires_on, certifications(name)")
      .eq("profile_id", id)
      .order("expires_on"),
    supabase.from("certifications").select("id, name").order("name"),
    supabase
      .from("outside_certifications")
      .select("id, name, issued_by, earned_on, expires_on")
      .eq("profile_id", id)
      .order("name"),
  ]);
  if (!member) notFound();
  const memberIsAdmin = !!(member.roles as { is_admin: boolean } | null)?.is_admin;
  // Only admins can make someone an admin or change an admin's role or status.
  const canEditRole = canManage && (user.isAdmin || !memberIsAdmin);
  const roleChoices = (roles ?? []).filter((r) => user.isAdmin || !r.is_admin);
  // Members keep their own qualifications and outside certifications up to
  // date; training certifications come from passing a class (or a manager).
  const canEditCredentials = canManage || id === user.id;

  return (
    <>
      <Link href="/members" className="mb-2 inline-block text-sm text-blue-700 underline">
        ← All members
      </Link>
      <PageHeader title={member.full_name || member.email} />
      <Status searchParams={searchParams} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-2 font-semibold">Contact</h2>
            <dl className="space-y-1 text-sm">
              <div><dt className="inline text-slate-500">Email: </dt><dd className="inline">{member.email}</dd></div>
              <div><dt className="inline text-slate-500">Phone: </dt><dd className="inline">{member.phone ?? "Not given"}</dd></div>
              <div>
                <dt className="inline text-slate-500">Emergency contact: </dt>
                <dd className="inline">
                  {[member.emergency_contact_name, member.emergency_contact_phone].filter(Boolean).join(" · ") || "Not given"}
                </dd>
              </div>
            </dl>
          </Card>
          {canEditRole ? (
            <Card>
              <h2 className="mb-3 font-semibold">Role and status</h2>
              <form action={updateMembership} className="space-y-3">
                <input type="hidden" name="id" value={id} />
                <Select label="Role" name="role_id" defaultValue={member.role_id ?? ""}>
                  <option value="">No role</option>
                  {roleChoices.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </Select>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="active" defaultChecked={member.active} className="h-4 w-4" />
                  Approved and active (unapproved or inactive members can sign in but see nothing)
                </label>
                <Button type="submit">Save</Button>
              </form>
            </Card>
          ) : (
            <Card>
              <h2 className="mb-1 font-semibold">Role</h2>
              <p>{(member.roles as { name: string } | null)?.name ?? "No role"}</p>
              {canManage && memberIsAdmin && (
                <p className="mt-1 text-xs text-slate-500">Only an admin can change an admin&apos;s role or status.</p>
              )}
            </Card>
          )}
        </div>
        <div className="space-y-6">
          <CredentialCard
            kind="qualification"
            title="Qualifications"
            profileId={id}
            items={(quals ?? []) as unknown as MemberQualification[]}
            choices={allQuals ?? []}
            canEdit={canEditCredentials}
            returnTo={`/members/${id}`}
          />
          <CredentialCard
            kind="certification"
            title="Certifications from training"
            profileId={id}
            items={(certs ?? []) as unknown as MemberQualification[]}
            choices={allCerts ?? []}
            canEdit={canManage}
            returnTo={`/members/${id}`}
          />
          <CertificationsCard
            title="Outside certifications"
            profileId={id}
            training={[]}
            outside={(outside ?? []) as OutsideCertification[]}
            canEdit={canEditCredentials}
            returnTo={`/members/${id}`}
          />
        </div>
      </div>
    </>
  );
}
