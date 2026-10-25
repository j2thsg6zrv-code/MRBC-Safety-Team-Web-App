import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Status } from "@/components/Status";
import { Button, Card, PageHeader } from "@/components/ui";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { finish, type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

async function approve(formData: FormData) {
  "use server";
  await requirePermission("manage_members");
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ active: true }).eq("id", String(formData.get("id")));
  revalidatePath("/", "layout");
  finish("/members", error, "Approved. They can now see the schedule.");
}

type Member = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  active: boolean;
  roles: { name: string } | null;
};

function MemberRow({ m }: { m: Member }) {
  return (
    <Link href={`/members/${m.id}`} className="flex flex-1 flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50">
      <div>
        <p className="font-medium">{m.full_name || m.email}</p>
        <p className="text-sm text-slate-500">{[m.email, m.phone].filter(Boolean).join(" · ")}</p>
      </div>
      <span className="text-sm text-slate-600">{m.roles?.name ?? "No role"}</span>
    </Link>
  );
}

export default async function MembersPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, active, roles(name)")
    .order("full_name");
  const members = (data ?? []) as unknown as Member[];
  const active = members.filter((m) => m.active);
  const inactive = members.filter((m) => !m.active);

  return (
    <>
      <PageHeader title="Safety Team Members" />
      <Status searchParams={searchParams} />
      {user.can("manage_members") && inactive.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 font-semibold">Waiting for approval or inactive</h2>
          <Card className="p-0">
            <ul className="divide-y divide-slate-100">
              {inactive.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center">
                  <MemberRow m={m} />
                  <form action={approve} className="px-4 py-2">
                    <input type="hidden" name="id" value={m.id} />
                    <Button type="submit" className="px-3 py-1.5">Approve</Button>
                  </form>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
      <Card className="p-0">
        <ul className="divide-y divide-slate-100">
          {active.map((m) => (
            <li key={m.id} className="flex">
              <MemberRow m={m} />
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
