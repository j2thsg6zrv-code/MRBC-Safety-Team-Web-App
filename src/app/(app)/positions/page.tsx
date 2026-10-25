import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader, Select } from "@/components/ui";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { finish, text, type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

type Option = { id: string; name: string };
type Position = {
  id: string;
  name: string;
  description: string | null;
  building_id: string | null;
  required_qualification_id: string | null;
  buildings: { name: string } | null;
  qualifications: { name: string } | null;
};

function fields(formData: FormData) {
  return {
    name: text(formData, "name") ?? "",
    description: text(formData, "description"),
    building_id: text(formData, "building_id"),
    required_qualification_id: text(formData, "required_qualification_id"),
  };
}

async function createPosition(formData: FormData) {
  "use server";
  await requirePermission("manage_positions");
  const supabase = await createClient();
  const { error } = await supabase.from("positions").insert(fields(formData));
  finish("/positions", error, "Position added.");
}

async function updatePosition(formData: FormData) {
  "use server";
  await requirePermission("manage_positions");
  const supabase = await createClient();
  const { error } = await supabase
    .from("positions")
    .update(fields(formData))
    .eq("id", String(formData.get("id")));
  finish("/positions", error);
}

async function deletePosition(formData: FormData) {
  "use server";
  await requirePermission("manage_positions");
  const supabase = await createClient();
  const { error } = await supabase.from("positions").delete().eq("id", String(formData.get("id")));
  finish("/positions", error, "Position deleted. It has been removed from every event that used it.");
}

function PositionFields({
  position,
  buildings,
  qualifications,
}: {
  position?: Position;
  buildings: Option[];
  qualifications: Option[];
}) {
  return (
    <>
      <Field label="Name" name="name" defaultValue={position?.name} required />
      <Field label="Description" name="description" defaultValue={position?.description ?? ""} />
      <Select label="Building" name="building_id" defaultValue={position?.building_id ?? ""}>
        <option value="">Any / not set</option>
        {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </Select>
      <Select label="Required qualification" name="required_qualification_id" defaultValue={position?.required_qualification_id ?? ""}>
        <option value="">None</option>
        {qualifications.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
      </Select>
    </>
  );
}

export default async function PositionsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const canManage = user.can("manage_positions");
  const supabase = await createClient();
  const [{ data: positions }, { data: buildings }, { data: qualifications }] = await Promise.all([
    supabase.from("positions").select("*, buildings(name), qualifications(name)").order("name"),
    supabase.from("buildings").select("id, name").order("name"),
    supabase.from("qualifications").select("id, name").order("name"),
  ]);
  const options = { buildings: buildings ?? [], qualifications: qualifications ?? [] };

  return (
    <>
      <PageHeader title="Positions" />
      <Status searchParams={searchParams} />
      <div className="space-y-4">
        {((positions ?? []) as Position[]).map((p) =>
          canManage ? (
            <Card key={p.id}>
              <form action={updatePosition} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input type="hidden" name="id" value={p.id} />
                <PositionFields position={p} {...options} />
                <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
                  <Button type="submit">Save</Button>
                  <Button type="submit" variant="danger" formAction={deletePosition}>Delete</Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card key={p.id}>
              <p className="font-medium">{p.name}</p>
              {p.description && <p className="text-sm text-slate-600">{p.description}</p>}
              <p className="text-xs text-slate-500">
                {[p.buildings?.name, p.qualifications && `Requires ${p.qualifications.name}`].filter(Boolean).join(" · ")}
              </p>
            </Card>
          ),
        )}
        {canManage && (
          <Card>
            <h2 className="mb-3 font-semibold">Add a position</h2>
            <form action={createPosition} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <PositionFields {...options} />
              <div className="sm:col-span-2 lg:col-span-4">
                <Button type="submit">Add position</Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
