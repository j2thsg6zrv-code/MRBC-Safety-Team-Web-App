import Link from "next/link";
import { redirect } from "next/navigation";
import { IncidentForm, readIncidentForm } from "@/components/IncidentForm";
import { Status } from "@/components/Status";
import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { today } from "@/lib/dates";
import { finish, type SearchParams } from "@/lib/forms";
import { incidentFormOptions } from "@/lib/incidents";
import { createClient } from "@/lib/supabase/server";

async function fileReport(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("incident_reports")
    .insert({ ...readIncidentForm(formData), reported_by: user.id })
    .select("id")
    .single();
  if (error || !data) finish("/incidents/new", error);
  redirect(`/incidents/${data.id}?saved=Report+filed.+Thank+you.`);
}

export default async function NewIncidentPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const todayDate = today();
  const options = await incidentFormOptions(supabase, user, todayDate);

  return (
    <>
      <Link href="/incidents" className="mb-2 inline-block text-sm text-blue-700 underline">← Incident reports</Link>
      <PageHeader title="File an Incident Report" />
      <Status searchParams={searchParams} />
      <Card>
        <IncidentForm action={fileReport} defaultDate={todayDate} {...options} submitLabel="File report" />
      </Card>
    </>
  );
}
