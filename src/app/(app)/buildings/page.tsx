import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { finish, text, type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

function fields(formData: FormData) {
  return {
    name: text(formData, "name") ?? "",
    address: text(formData, "address"),
    notes: text(formData, "notes"),
  };
}

async function createBuilding(formData: FormData) {
  "use server";
  await requirePermission("manage_buildings");
  const supabase = await createClient();
  const { error } = await supabase.from("buildings").insert(fields(formData));
  finish("/buildings", error, "Building added.");
}

async function updateBuilding(formData: FormData) {
  "use server";
  await requirePermission("manage_buildings");
  const supabase = await createClient();
  const { error } = await supabase
    .from("buildings")
    .update(fields(formData))
    .eq("id", String(formData.get("id")));
  finish("/buildings", error);
}

async function deleteBuilding(formData: FormData) {
  "use server";
  await requirePermission("manage_buildings");
  const supabase = await createClient();
  const { error } = await supabase.from("buildings").delete().eq("id", String(formData.get("id")));
  finish("/buildings", error, "Building deleted.");
}

function BuildingFields({ building }: { building?: { name: string; address: string | null; notes: string | null } }) {
  return (
    <>
      <Field label="Name" name="name" defaultValue={building?.name} required />
      <Field label="Address" name="address" defaultValue={building?.address ?? ""} />
      <Field label="Notes" name="notes" defaultValue={building?.notes ?? ""} hint="Door codes, AED location, meeting points…" />
    </>
  );
}

export default async function BuildingsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const canManage = user.can("manage_buildings");
  const supabase = await createClient();
  const { data: buildings } = await supabase.from("buildings").select("*").order("name");

  return (
    <>
      <PageHeader title="Buildings" />
      <Status searchParams={searchParams} />
      <div className="space-y-4">
        {(buildings ?? []).map((b) =>
          canManage ? (
            <Card key={b.id}>
              <form action={updateBuilding} className="grid gap-3 sm:grid-cols-3">
                <input type="hidden" name="id" value={b.id} />
                <BuildingFields building={b} />
                <div className="flex gap-2 sm:col-span-3">
                  <Button type="submit">Save</Button>
                  <Button type="submit" variant="danger" formAction={deleteBuilding}>Delete</Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card key={b.id}>
              <p className="font-medium">{b.name}</p>
              {b.address && <p className="text-sm text-slate-600">{b.address}</p>}
              {b.notes && <p className="mt-1 text-sm text-slate-600">{b.notes}</p>}
            </Card>
          ),
        )}
        {canManage && (
          <Card>
            <h2 className="mb-3 font-semibold">Add a building</h2>
            <form action={createBuilding} className="grid gap-3 sm:grid-cols-3">
              <BuildingFields />
              <div className="sm:col-span-3">
                <Button type="submit">Add building</Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
