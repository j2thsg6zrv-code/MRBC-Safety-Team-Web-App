import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { addDays, today } from "@/lib/dates";
import { finish, text } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { Wishlist } from "./Wishlist";

/** Equipment inventory: what the team has, how many, when it expires and when it was last checked. */
type EquipmentItem = {
  id: string;
  description: string;
  quantity: number;
  expiration_date: string | null;
  date_checked: string | null;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** "Mar 5, 2027": expiration dates can be years out, so always show the year. */
function showDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });
}

type FormResult =
  | { problem: string }
  | { problem?: never; values: Omit<EquipmentItem, "id"> };

function readForm(formData: FormData): FormResult {
  const description = text(formData, "description");
  const quantityText = text(formData, "quantity");
  const expiration_date = text(formData, "expiration_date");
  const date_checked = text(formData, "date_checked");
  const quantity = Number(quantityText);
  if (!description) return { problem: "Add a description." };
  if (quantityText === null || !Number.isInteger(quantity) || quantity < 0 || quantity > 100000)
    return { problem: "Quantity must be a whole number (0 or more)." };
  if (expiration_date && !DATE.test(expiration_date)) return { problem: "The expiration date isn't a valid date." };
  if (date_checked && !DATE.test(date_checked)) return { problem: "The date checked isn't a valid date." };
  return { values: { description, quantity, expiration_date, date_checked } };
}

async function save(formData: FormData) {
  "use server";
  await requirePermission("manage_equipment");
  const form = readForm(formData);
  const id = String(formData.get("id") ?? "");
  const back = id ? `/equipment?edit=${id}` : "/equipment";
  if (form.problem !== undefined) finish(back, { message: form.problem });
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("equipment_items").update({ ...form.values, updated_at: new Date().toISOString() }).eq("id", id)
    : await supabase.from("equipment_items").insert(form.values);
  revalidatePath("/equipment");
  finish(error ? back : "/equipment", error, id ? "Item updated." : "Item added.");
}

async function markChecked(formData: FormData) {
  "use server";
  await requirePermission("manage_equipment");
  const supabase = await createClient();
  const { error } = await supabase
    .from("equipment_items")
    .update({ date_checked: today(), updated_at: new Date().toISOString() })
    .eq("id", String(formData.get("id")));
  revalidatePath("/equipment");
  finish("/equipment", error, "Marked as checked today.");
}

async function remove(formData: FormData) {
  "use server";
  await requirePermission("manage_equipment");
  const supabase = await createClient();
  const { error } = await supabase.from("equipment_items").delete().eq("id", String(formData.get("id")));
  revalidatePath("/equipment");
  finish("/equipment", error, "Item removed.");
}

/** How soon an item expires, for the colored label in the table. */
function expiry(date: string | null, now: string) {
  if (!date) return null;
  if (date < now) return { label: "Expired", className: "bg-red-100 text-red-800 border-red-300" };
  if (date <= addDays(now, 30)) return { label: "Expires soon", className: "bg-amber-100 text-amber-800 border-amber-300" };
  return null;
}

function ItemFields({ item }: { item?: EquipmentItem }) {
  return (
    <>
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
        <Field label="Quantity" name="quantity" type="number" inputMode="numeric" min={0} max={100000} step={1} required defaultValue={item?.quantity ?? 1} />
        <Field label="Description" name="description" required maxLength={500} defaultValue={item?.description} placeholder="e.g. First aid kit (large), Building B lobby" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Expiration date (optional)" name="expiration_date" type="date" defaultValue={item?.expiration_date ?? ""} />
        <Field label="Date checked (optional)" name="date_checked" type="date" defaultValue={item?.date_checked ?? ""} />
      </div>
    </>
  );
}

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; wish?: string; saved?: string; error?: string }>;
}) {
  const { edit, wish } = await searchParams;
  const user = await getCurrentUser();
  const canManage = user.can("manage_equipment");
  const supabase = await createClient();
  const { data } = await supabase
    .from("equipment_items")
    .select("id, description, quantity, expiration_date, date_checked")
    .order("description")
    .limit(1000);
  const items = (data ?? []) as EquipmentItem[];
  const editing = canManage && edit ? items.find((i) => i.id === edit) : undefined;
  const now = today();
  const expired = items.filter((i) => i.expiration_date && i.expiration_date < now).length;
  const soon = items.filter((i) => expiry(i.expiration_date, now)?.label === "Expires soon").length;

  return (
    <>
      <PageHeader title="Equipment" />
      <Status searchParams={searchParams} />
      {canManage && (
        <Card className="mb-6">
          <h2 className="mb-3 font-semibold">{editing ? "Edit item" : "Add an item"}</h2>
          <form action={save} className="space-y-3" key={editing?.id ?? "new"}>
            <ItemFields item={editing} />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" pendingLabel="Saving…">{editing ? "Save changes" : "Add item"}</Button>
              {editing && <Link href="/equipment" className="text-sm text-blue-700 underline">Cancel</Link>}
            </div>
          </form>
          {editing && (
            <form action={remove} className="mt-4 border-t border-slate-200 pt-4">
              <input type="hidden" name="id" value={editing.id} />
              <Button type="submit" variant="danger">Delete item</Button>
            </form>
          )}
        </Card>
      )}

      {(expired > 0 || soon > 0) && (
        <p className="mb-3 text-sm text-slate-700">
          {expired > 0 && <span className="font-semibold text-red-700">{expired} expired</span>}
          {expired > 0 && soon > 0 && " · "}
          {soon > 0 && <span className="font-semibold text-amber-700">{soon} expiring in the next 30 days</span>}
        </p>
      )}

      {items.length === 0 ? (
        <Card><p className="text-slate-600">No equipment has been added yet.</p></Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-right font-medium">Qty</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium">Expires</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium">Last checked</th>
                {canManage && <th className="px-3 py-2"><span className="sr-only">Actions</span></th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const status = expiry(item.expiration_date, now);
                return (
                  <tr key={item.id} className={`border-b border-slate-200 last:border-0 ${item.id === editing?.id ? "bg-blue-50" : ""}`}>
                    <td className="px-3 py-2 text-right tabular-nums">{item.quantity}</td>
                    <td className="min-w-[12rem] px-3 py-2">{item.description}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {item.expiration_date ? showDate(item.expiration_date) : <span className="text-slate-400">—</span>}
                      {status && (
                        <span className={`ml-2 rounded border px-1.5 py-0.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {item.date_checked ? showDate(item.date_checked) : <span className="text-slate-400">Never</span>}
                    </td>
                    {canManage && (
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {item.date_checked !== now && (
                            <form action={markChecked}>
                              <input type="hidden" name="id" value={item.id} />
                              <button type="submit" className="text-blue-700 underline">Checked today</button>
                            </form>
                          )}
                          <Link href={`/equipment?edit=${item.id}`} className="text-blue-700 underline">Edit</Link>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
      <Wishlist editId={wish} />
    </>
  );
}
