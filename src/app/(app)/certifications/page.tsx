import Link from "next/link";
import { CredentialCard } from "@/components/CredentialCard";
import type { MemberQualification } from "@/components/QualificationList";
import { Status } from "@/components/Status";
import { PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

// The signed-in member's own certifications, which they add and renew here.
// Admins set up the list of certifications under Admin › Certifications.
export default async function MyCertificationsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const [{ data: certs }, { data: mine }] = await Promise.all([
    supabase.from("certifications").select("id, name").order("name"),
    supabase
      .from("member_certifications")
      .select("id, earned_on, expires_on, certifications(name)")
      .eq("profile_id", user.id)
      .order("expires_on"),
  ]);

  return (
    <>
      <PageHeader title="My Certifications" />
      <Status searchParams={searchParams} />
      <div className="max-w-2xl space-y-4">
        <CredentialCard
          kind="certification"
          title="Certifications I've earned"
          profileId={user.id}
          items={(mine ?? []) as unknown as MemberQualification[]}
          choices={certs ?? []}
          canEdit
          returnTo="/certifications"
        />
        {(certs ?? []).length === 0 && (
          <p className="text-sm text-slate-600">
            {user.isAdmin ? (
              <>
                No certifications are set up yet.{" "}
                <Link href="/admin/certifications" className="text-blue-700 underline">Add them under Admin</Link>.
              </>
            ) : (
              "No certifications are set up yet. An admin can add them."
            )}
          </p>
        )}
      </div>
    </>
  );
}
