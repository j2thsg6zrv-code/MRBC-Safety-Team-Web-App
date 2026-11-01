import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Button, Card, Field } from "@/components/ui";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";
import { finish, text } from "@/lib/forms";
import { cleanSourceUrl } from "@/lib/intel";
import { createClient } from "@/lib/supabase/server";

/** Wishlist: equipment the team needs or would like. Anyone can ask; equipment managers act on it. */
type WishlistItem = {
  id: string;
  description: string;
  quantity: number;
  notes: string | null;
  buy_url: string | null;
  price: number | null;
  created_by: string | null;
  created_at: string;
  profiles: { full_name: string } | null;
};

function money(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function readForm(formData: FormData) {
  const description = text(formData, "description");
  const quantity = Number(text(formData, "quantity"));
  const notes = text(formData, "notes");
  const buy_url = cleanSourceUrl(text(formData, "buy_url"));
  const priceText = text(formData, "price")?.replace(/[$,\s]/g, "") ?? null;
  const price = priceText === null ? null : Number(priceText);
  if (!description) return { problem: "Add a description of what's needed." } as const;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000)
    return { problem: "Quantity needed must be a whole number (1 or more)." } as const;
  if (buy_url === undefined) return { problem: "The link doesn't look like a web address." } as const;
  if (price !== null && (!Number.isFinite(price) || price < 0 || price > 99999999))
    return { problem: "Price must be a dollar amount, like 24.99." } as const;
  return { values: { description, quantity, notes, buy_url, price: price === null ? null : Math.round(price * 100) / 100 } } as const;
}

async function saveWish(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const user = id ? await requirePermission("manage_equipment") : await getCurrentUser();
  const form = readForm(formData);
  const back = id ? `/equipment?wish=${id}` : "/equipment";
  if (form.problem) finish(back, { message: form.problem });
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("equipment_wishlist").update({ ...form.values, updated_at: new Date().toISOString() }).eq("id", id)
    : await supabase.from("equipment_wishlist").insert({ ...form.values, created_by: user.id });
  revalidatePath("/equipment");
  finish(error ? back : "/equipment", error, id ? "Wishlist item updated." : "Added to the wishlist.");
}

async function removeWish(formData: FormData) {
  "use server";
  await getCurrentUser();
  const supabase = await createClient();
  // The database only lets equipment managers, or the person who asked, remove it.
  const { error } = await supabase.from("equipment_wishlist").delete().eq("id", String(formData.get("id")));
  revalidatePath("/equipment");
  finish("/equipment", error, "Removed from the wishlist.");
}

/** Bought it: add it to the inventory and take it off the wishlist. */
async function moveToInventory(formData: FormData) {
  "use server";
  await requirePermission("manage_equipment");
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const { data: wish, error: readError } = await supabase
    .from("equipment_wishlist")
    .select("description, quantity")
    .eq("id", id)
    .single();
  if (readError || !wish) finish("/equipment", readError ?? { message: "That wishlist item is gone." });
  const { error } = await supabase.from("equipment_items").insert({ description: wish.description, quantity: wish.quantity });
  if (error) finish("/equipment", error);
  const { error: deleteError } = await supabase.from("equipment_wishlist").delete().eq("id", id);
  revalidatePath("/equipment");
  finish("/equipment", deleteError, "Moved to the inventory. Add its expiration date there if it has one.");
}

export async function Wishlist({ editId }: { editId?: string }) {
  const user = await getCurrentUser();
  const canManage = user.can("manage_equipment");
  const supabase = await createClient();
  const { data } = await supabase
    .from("equipment_wishlist")
    .select("id, description, quantity, notes, buy_url, price, created_by, created_at, profiles:created_by(full_name)")
    .order("created_at", { ascending: false })
    .limit(500);
  const items = (data ?? []) as unknown as WishlistItem[];
  const editing = canManage && editId ? items.find((i) => i.id === editId) : undefined;
  const priced = items.filter((i) => i.price !== null);
  const total = priced.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const showActions = canManage || items.some((i) => i.created_by === user.id);

  return (
    <section id="wishlist" className="mt-10 scroll-mt-4">
      <h2 className="mb-1 text-xl font-semibold">Wishlist</h2>
      <p className="mb-4 text-sm text-slate-600">Equipment the team needs or would like to have. Anyone on the team can add to it.</p>

      <Card className="mb-4">
        <h3 className="mb-3 font-semibold">{editing ? "Edit wishlist item" : "Add something we need"}</h3>
        <form action={saveWish} className="space-y-3" key={editing?.id ?? "new"}>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
            <Field label="Quantity needed" name="quantity" type="number" inputMode="numeric" min={1} max={100000} step={1} required defaultValue={editing?.quantity ?? 1} />
            <Field label="Description" name="description" required maxLength={500} defaultValue={editing?.description} placeholder="e.g. Two-way radios" />
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
            <Field label="Link to where it can be bought (optional)" name="buy_url" type="text" inputMode="url" maxLength={2000} defaultValue={editing?.buy_url ?? ""} placeholder="https://" />
            <Field label="Price each (optional)" name="price" type="text" inputMode="decimal" maxLength={12} defaultValue={editing?.price ?? ""} placeholder="$0.00" />
          </div>
          <Field label="Why we need it (optional)" name="notes" maxLength={2000} defaultValue={editing?.notes ?? ""} placeholder="e.g. Not enough radios for Sunday parking team" />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" pendingLabel="Saving…">{editing ? "Save changes" : "Add to wishlist"}</Button>
            {editing && <Link href="/equipment#wishlist" className="text-sm text-blue-700 underline">Cancel</Link>}
          </div>
        </form>
      </Card>

      {priced.length > 0 && (
        <p className="mb-3 text-sm text-slate-700">
          Estimated cost: <span className="font-semibold">{money(total)}</span>
          {priced.length < items.length && ` (${items.length - priced.length} item${items.length - priced.length === 1 ? "" : "s"} without a price)`}
        </p>
      )}
      {items.length === 0 ? (
        <Card><p className="text-slate-600">Nothing on the wishlist yet.</p></Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-right font-medium">Qty</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 text-right font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Why</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium">Asked by</th>
                {showActions && <th className="px-3 py-2"><span className="sr-only">Actions</span></th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const canRemove = canManage || item.created_by === user.id;
                return (
                  <tr key={item.id} className={`border-b border-slate-200 last:border-0 ${item.id === editing?.id ? "bg-blue-50" : ""}`}>
                    <td className="px-3 py-2 text-right tabular-nums">{item.quantity}</td>
                    <td className="min-w-[10rem] px-3 py-2">
                      {item.description}
                      {item.buy_url && (
                        <a href={item.buy_url} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-700 underline">
                          Where to buy ({new URL(item.buy_url).hostname.replace(/^www\./, "")})
                        </a>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                      {item.price === null ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <>
                          {money(Number(item.price))}
                          {item.quantity > 1 && <span className="block text-xs text-slate-500">{money(Number(item.price) * item.quantity)} total</span>}
                        </>
                      )}
                    </td>
                    <td className="min-w-[10rem] px-3 py-2 text-slate-700">{item.notes ?? <span className="text-slate-400">—</span>}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                      {item.profiles ? item.profiles.full_name : "Former member"}
                      <span className="block text-xs text-slate-500">{formatDateTime(item.created_at)}</span>
                    </td>
                    {showActions && (
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {canManage && (
                            <form action={moveToInventory}>
                              <input type="hidden" name="id" value={item.id} />
                              <button type="submit" className="text-blue-700 underline">Got it → inventory</button>
                            </form>
                          )}
                          {canManage && <Link href={`/equipment?wish=${item.id}#wishlist`} className="text-blue-700 underline">Edit</Link>}
                          {canRemove && (
                            <form action={removeWish}>
                              <input type="hidden" name="id" value={item.id} />
                              <button type="submit" className="text-red-700 underline">Remove</button>
                            </form>
                          )}
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
    </section>
  );
}
