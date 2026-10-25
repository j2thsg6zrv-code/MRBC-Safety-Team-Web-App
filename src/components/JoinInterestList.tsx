import { revalidatePath } from "next/cache";
import { Button, Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate, localDate } from "@/lib/dates";
import { finish } from "@/lib/forms";
import { bestTimeLabel, type JoinInterest } from "@/lib/joinInterest";
import { createClient } from "@/lib/supabase/server";

async function setContacted(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const contacted = formData.get("contacted") === "1";
  const { error } = await supabase
    .from("join_interest")
    .update({ contacted_at: contacted ? new Date().toISOString() : null })
    .eq("id", String(formData.get("id")));
  revalidatePath("/", "layout");
  finish("/admin", error, contacted ? "Marked as contacted." : "Moved back to waiting.");
}

async function remove(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("join_interest").delete().eq("id", String(formData.get("id")));
  revalidatePath("/", "layout");
  finish("/admin", error, "Removed.");
}

function Person({ person }: { person: JoinInterest }) {
  const contacted = !!person.contacted_at;
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 py-3 last:border-0">
      <div className="min-w-0 space-y-0.5 text-sm">
        <p className="font-medium">{person.name}</p>
        <p className="flex flex-wrap gap-x-3">
          <a href={`tel:${person.phone}`} className="text-blue-700 underline">{person.phone}</a>
          <a href={`sms:${person.phone}`} className="text-blue-700 underline">Text</a>
          <a href={`mailto:${person.email}`} className="break-all text-blue-700 underline">{person.email}</a>
        </p>
        <p className="text-slate-600">
          Best time: {bestTimeLabel(person.best_time)} · Sent {formatDate(localDate(person.created_at), "short")}
          {contacted && <> · Contacted {formatDate(localDate(person.contacted_at!), "short")}</>}
        </p>
      </div>
      <div className="flex gap-2">
        <form action={setContacted}>
          <input type="hidden" name="id" value={person.id} />
          <input type="hidden" name="contacted" value={contacted ? "0" : "1"} />
          <Button type="submit" variant="secondary" className="px-2 py-1 text-xs">
            {contacted ? "Not contacted yet" : "Mark contacted"}
          </Button>
        </form>
        <form action={remove}>
          <input type="hidden" name="id" value={person.id} />
          <Button type="submit" variant="danger" className="px-2 py-1 text-xs">Remove</Button>
        </form>
      </div>
    </li>
  );
}

/** Admin-only list of people who filled in the public "Join the safety team" form. */
export async function JoinInterestList() {
  const supabase = await createClient();
  const { data } = await supabase.from("join_interest").select("*").order("created_at", { ascending: false });
  const people = (data ?? []) as JoinInterest[];
  const waiting = people.filter((p) => !p.contacted_at);
  const contacted = people.filter((p) => p.contacted_at);

  return (
    <Card>
      <h2 className="mb-1 font-semibold">
        Interested in joining{waiting.length > 0 && ` (${waiting.length} to contact)`}
      </h2>
      <p className="mb-2 text-sm text-slate-600">
        People who filled in the &ldquo;Join the safety team&rdquo; form from the QR code on the Share page. Only admins
        see this list.
      </p>
      {people.length === 0 ? (
        <p className="text-sm text-slate-500">No one yet.</p>
      ) : (
        <>
          {waiting.length > 0 && (
            <ul>
              {waiting.map((p) => <Person key={p.id} person={p} />)}
            </ul>
          )}
          {contacted.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium text-slate-700">
                Already contacted ({contacted.length})
              </summary>
              <ul>
                {contacted.map((p) => <Person key={p.id} person={p} />)}
              </ul>
            </details>
          )}
        </>
      )}
    </Card>
  );
}
