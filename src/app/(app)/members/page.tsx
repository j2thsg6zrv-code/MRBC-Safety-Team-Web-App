import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Status } from "@/components/Status";
import { Button, Card, PageHeader, TextArea } from "@/components/ui";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { finish, type SearchParams } from "@/lib/forms";
import { formatDate, localDate } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

async function approve(formData: FormData) {
  "use server";
  await requirePermission("manage_members");
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ active: true }).eq("id", String(formData.get("id")));
  revalidatePath("/", "layout");
  finish("/members", error, "Approved. They can now see the schedule.");
}

async function invite(formData: FormData) {
  "use server";
  await requirePermission("manage_members");
  // One address per line, or separated by commas, spaces or semicolons.
  const emails = String(formData.get("emails") ?? "").split(/[\s,;]+/).filter(Boolean);
  if (emails.length === 0) finish("/members", { message: "Type at least one email address." });
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("invite_members", { p_emails: emails });
  if (error) finish("/members", error);
  const results = (data ?? []) as { email: string; result: string }[];
  const invited = results.filter((r) => r.result === "invited").length;
  const problems = results.filter((r) => r.result !== "invited").map((r) => `${r.email} ${r.result}`);
  const summary = [
    invited > 0 ? `Invite${invited > 1 ? "s" : ""} sent to ${invited} ${invited > 1 ? "people" : "person"}.` : "",
    problems.length > 0 ? `Not sent: ${problems.join("; ")}.` : "",
  ].filter(Boolean).join(" ");
  revalidatePath("/members");
  finish("/members", invited === 0 ? { message: summary } : null, summary);
}

async function cancelInvite(formData: FormData) {
  "use server";
  await requirePermission("manage_members");
  const supabase = await createClient();
  const { error } = await supabase.from("member_invites").delete().eq("email", String(formData.get("email")));
  finish("/members", error, "Invite cancelled.");
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
  const [{ data }, { data: inviteData }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, phone, active, roles(name)").order("full_name"),
    user.can("manage_members")
      ? supabase.from("member_invites").select("email, created_at").is("accepted_at", null).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);
  const members = (data ?? []) as unknown as Member[];
  const invites = (inviteData ?? []) as { email: string; created_at: string }[];
  const active = members.filter((m) => m.active);
  const inactive = members.filter((m) => !m.active);

  return (
    <>
      <PageHeader title="Safety Team Members" />
      <Status searchParams={searchParams} />
      {user.can("manage_members") && (
        <Card className="mb-6">
          <h2 className="mb-1 font-semibold">Invite by email</h2>
          <p className="mb-3 text-sm text-slate-600">
            Each person gets an email with the sign-up link. When they sign up with that address, their account is
            approved automatically.
          </p>
          <form action={invite} className="space-y-3">
            <TextArea
              label="Email addresses (one per line, or separated by commas)"
              name="emails"
              rows={3}
              required
              placeholder={"jane@example.com\njohn@example.com"}
            />
            <Button type="submit" pendingLabel="Sending…">Send invites</Button>
          </form>
          {invites.length > 0 && (
            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="mb-1 text-sm font-medium">Invited, not signed up yet</p>
              <ul className="space-y-1 text-sm">
                {invites.map((i) => (
                  <li key={i.email} className="flex flex-wrap items-center gap-x-3">
                    <span>{i.email}</span>
                    <span className="text-slate-500">{formatDate(localDate(i.created_at), "short")}</span>
                    <form action={cancelInvite}>
                      <input type="hidden" name="email" value={i.email} />
                      <Button type="submit" variant="secondary" className="px-2 py-0.5 text-xs">Cancel</Button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
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
