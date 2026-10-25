import { revalidatePath } from "next/cache";
import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { requirePermission } from "@/lib/auth";
import { finish, text, type SearchParams } from "@/lib/forms";
import { PERMISSIONS } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

function fields(formData: FormData) {
  return {
    name: text(formData, "name") ?? "",
    description: text(formData, "description"),
    permissions: PERMISSIONS.map((p) => p.key).filter((key) => formData.get(key) === "on"),
  };
}

async function createRole(formData: FormData) {
  "use server";
  await requirePermission("manage_roles");
  const supabase = await createClient();
  const { error } = await supabase.from("roles").insert(fields(formData));
  finish("/roles", error, "Role added.");
}

async function updateRole(formData: FormData) {
  "use server";
  const user = await requirePermission("manage_roles");
  const id = String(formData.get("id"));
  const values = fields(formData);
  const supabase = await createClient();

  // Stop people from locking themselves out of this page.
  const { data: me } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();
  if (me?.role_id === id && !values.permissions.includes("manage_roles")) {
    finish("/roles", { message: "You can't remove Manage roles & permissions from your own role." });
  }

  const { error } = await supabase.from("roles").update(values).eq("id", id);
  revalidatePath("/", "layout");
  finish("/roles", error);
}

async function makeDefault(formData: FormData) {
  "use server";
  await requirePermission("manage_roles");
  const supabase = await createClient();
  await supabase.from("roles").update({ is_default: false }).eq("is_default", true);
  const { error } = await supabase
    .from("roles")
    .update({ is_default: true })
    .eq("id", String(formData.get("id")));
  finish("/roles", error, "New members will now get this role.");
}

async function deleteRole(formData: FormData) {
  "use server";
  await requirePermission("manage_roles");
  const supabase = await createClient();
  const { error } = await supabase.from("roles").delete().eq("id", String(formData.get("id")));
  finish("/roles", error, "Role deleted. Members who had it now have no role.");
}

function PermissionChecklist({ selected = [] }: { selected?: string[] }) {
  return (
    <fieldset className="grid gap-2 sm:grid-cols-2">
      <legend className="mb-2 text-sm font-medium text-slate-700">Permissions</legend>
      {PERMISSIONS.map((p) => (
        <label key={p.key} className="flex gap-2 text-sm">
          <input type="checkbox" name={p.key} defaultChecked={selected.includes(p.key)} className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <span className="font-medium">{p.label}</span>
            <span className="block text-xs text-slate-500">{p.description}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

export default async function RolesPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePermission("manage_roles");
  const supabase = await createClient();
  const { data: roles } = await supabase.from("roles").select("*").order("name");

  return (
    <>
      <PageHeader title="Roles & Permissions" />
      <p className="mb-4 text-sm text-slate-600">
        Every member can see the calendar, sign up for positions, file incident reports and edit their own profile.
        Roles add the extra abilities below.
      </p>
      <Status searchParams={searchParams} />
      <div className="space-y-4">
        {(roles ?? []).map((role) => (
          <Card key={role.id}>
            <form action={updateRole} className="space-y-4">
              <input type="hidden" name="id" value={role.id} />
              <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
                <Field label="Role name" name="name" defaultValue={role.name} required />
                <Field label="Description" name="description" defaultValue={role.description ?? ""} />
              </div>
              {role.is_default && (
                <p className="text-sm font-medium text-blue-700">New members get this role when they sign up.</p>
              )}
              <PermissionChecklist selected={role.permissions} />
              <div className="flex flex-wrap gap-2">
                <Button type="submit">Save</Button>
                {!role.is_default && (
                  <>
                    <Button type="submit" variant="secondary" formAction={makeDefault}>Make default for new members</Button>
                    <Button type="submit" variant="danger" formAction={deleteRole}>Delete</Button>
                  </>
                )}
              </div>
            </form>
          </Card>
        ))}
        <Card>
          <h2 className="mb-3 font-semibold">Add a role</h2>
          <form action={createRole} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
              <Field label="Role name" name="name" required />
              <Field label="Description" name="description" />
            </div>
            <PermissionChecklist />
            <Button type="submit">Add role</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
