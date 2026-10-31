import { CertificationsCard, type OutsideCertification, type TrainingCertification } from "@/components/CertificationsCard";
import { Status } from "@/components/Status";
import { PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

// The signed-in member's certifications in one list. Ones from our training
// classes are added automatically when they pass a class; members type in the
// ones they earned outside the app (CPR and so on).
export default async function MyCertificationsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const [{ data: training }, { data: outside }] = await Promise.all([
    supabase.from("member_certifications").select("id, earned_on, expires_on, certifications(name)").eq("profile_id", user.id),
    supabase.from("outside_certifications").select("id, name, issued_by, earned_on, expires_on").eq("profile_id", user.id),
  ]);

  return (
    <>
      <PageHeader title="My Certifications" />
      <Status searchParams={searchParams} />
      <div className="max-w-2xl space-y-4">
        <CertificationsCard
          title="Certifications I've earned"
          profileId={user.id}
          training={(training ?? []) as unknown as TrainingCertification[]}
          outside={(outside ?? []) as OutsideCertification[]}
          canEdit
          returnTo="/certifications"
        />
      </div>
    </>
  );
}
