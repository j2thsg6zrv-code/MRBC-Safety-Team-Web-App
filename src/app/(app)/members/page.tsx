import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, active, roles(name)")
    .order("full_name");

  return (
    <>
      <PageHeader title="Safety Team Members" />
      <Card className="p-0">
        <ul className="divide-y divide-slate-100">
          {(members ?? []).map((m) => (
            <li key={m.id}>
              <Link href={`/members/${m.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50">
                <div>
                  <p className="font-medium">
                    {m.full_name || m.email}
                    {!m.active && <span className="ml-2 rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-600">Inactive</span>}
                  </p>
                  <p className="text-sm text-slate-500">{[m.email, m.phone].filter(Boolean).join(" · ")}</p>
                </div>
                <span className="text-sm text-slate-600">
                  {(m.roles as unknown as { name: string } | null)?.name ?? "No role"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
