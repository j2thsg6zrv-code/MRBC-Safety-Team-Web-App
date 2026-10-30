import Link from "next/link";
import QRCode from "qrcode";
import { revalidatePath } from "next/cache";
import { AutomaticMessages } from "@/components/AutomaticMessages";
import { JoinInterestList } from "@/components/JoinInterestList";
import { ShareLink } from "@/components/ShareLink";
import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";
import { finish, text, type SearchParams } from "@/lib/forms";
import { PERMISSIONS } from "@/lib/permissions";
import { siteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  is_default: boolean;
  is_admin: boolean;
};

function fields(formData: FormData) {
  return {
    name: text(formData, "name") ?? "",
    description: text(formData, "description"),
    permissions: PERMISSIONS.map((p) => p.key).filter((key) => formData.get(key) === "on"),
  };
}

async function createRole(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("roles").insert(fields(formData));
  finish("/admin", error, "Role added.");
}

async function updateRole(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { data: role } = await supabase.from("roles").select("is_admin").eq("id", id).single();
  const values = fields(formData);
  // The Admin role always has full access, so only its name and description change.
  const { error } = await supabase
    .from("roles")
    .update(role?.is_admin ? { name: values.name, description: values.description } : values)
    .eq("id", id);
  revalidatePath("/", "layout");
  finish("/admin", error);
}

async function makeDefault(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("roles").update({ is_default: false }).eq("is_default", true);
  const { error } = await supabase
    .from("roles")
    .update({ is_default: true })
    .eq("id", String(formData.get("id")))
    .eq("is_admin", false);
  finish("/admin", error, "New members will now get this role.");
}

async function deleteRole(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("roles").delete().eq("id", String(formData.get("id")));
  finish("/admin", error, "Role deleted. Members who had it now have no role.");
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

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: roleData }, { data: profiles }, { data: inviteData }, { data: errorData, count: openErrors }] = await Promise.all([
    supabase.from("roles").select("*").order("is_admin", { ascending: false }).order("name"),
    supabase.from("profiles").select("id, full_name, email, active, role_id").order("full_name"),
    supabase.from("member_invites").select("email").is("accepted_at", null).order("email"),
    supabase
      .from("error_log")
      .select("id, code, message, last_seen_at", { count: "exact" })
      .is("fixed_at", null)
      .order("last_seen_at", { ascending: false })
      .limit(3),
  ]);
  const latestErrors = (errorData ?? []) as { id: number; code: string; message: string; last_seen_at: string }[];
  const pendingInvites = (inviteData ?? []) as { email: string }[];
  const roles = (roleData ?? []) as Role[];
  const adminRoleIds = new Set(roles.filter((r) => r.is_admin).map((r) => r.id));
  const admins = (profiles ?? []).filter((p) => p.active && p.role_id && adminRoleIds.has(p.role_id));

  const signupUrl = siteUrl("/signup");
  const appUrl = siteUrl("/");
  const [qrSvg, qrPng, appQrSvg, appQrPng] = await Promise.all([
    QRCode.toString(signupUrl, { type: "svg", margin: 1 }),
    QRCode.toDataURL(signupUrl, { width: 800, margin: 2 }),
    QRCode.toString(appUrl, { type: "svg", margin: 1 }),
    QRCode.toDataURL(appUrl, { width: 800, margin: 2 }),
  ]);

  return (
    <>
      <PageHeader title="Admin" />
      <Status searchParams={searchParams} />
      <div className="space-y-6">
        <JoinInterestList />

        <AutomaticMessages />

        <Card>
          <h2 className="mb-1 font-semibold">
            Bug console
            {!!openErrors && (
              <span className="ml-2 rounded bg-red-50 px-1.5 text-sm font-medium text-red-700">{openErrors} not fixed</span>
            )}
          </h2>
          <p className="mb-3 text-sm text-slate-600">
            Whenever something doesn&apos;t work in the app, it&apos;s saved here with an error code and the details
            needed to fix it.
          </p>
          {latestErrors.length > 0 && (
            <ul className="mb-3 space-y-1 text-sm">
              {latestErrors.map((e) => (
                <li key={e.id} className="truncate">
                  <span className="font-mono font-semibold">{e.code}</span>{" "}
                  <span className="text-slate-500">{formatDateTime(e.last_seen_at)}</span> {e.message}
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/errors"
            className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-onaccent hover:brightness-90"
          >
            Open bug console
          </Link>
        </Card>

        <Card>
          <h2 className="mb-1 font-semibold">Reports</h2>
          <p className="mb-3 text-sm text-slate-600">
            See how many times each member (and each greeter) signed up over the last 30, 90 and 180 days, year to date
            and month by month. Download it as a PDF or CSV.
          </p>
          <Link
            href="/admin/reports"
            className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-onaccent hover:brightness-90"
          >
            Open sign-up reports
          </Link>
        </Card>

        <Card>
          <h2 className="mb-1 font-semibold">Qualifications and certifications</h2>
          <p className="mb-3 text-sm text-slate-600">
            Set up the qualifications and certifications members can hold, and see who has each certification.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/qualifications"
              className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-onaccent hover:brightness-90"
            >
              Qualifications
            </Link>
            <Link
              href="/admin/certifications"
              className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-onaccent hover:brightness-90"
            >
              Certifications
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 font-semibold">Sign-up QR code for invited members</h2>
          <p className="mb-4 text-sm text-slate-600">
            People you&apos;ve invited scan this code (or open the link) to create their account. Only email
            addresses you&apos;ve sent an invite to can sign up; anyone else is turned away. Send invites on the{" "}
            <Link href="/members" className="text-blue-700 underline">Safety Team Members</Link> page.{" "}
            {pendingInvites.length > 0 ? (
              <>Invited, not signed up yet: {pendingInvites.map((i) => i.email).join(", ")}.</>
            ) : (
              <>Everyone you&apos;ve invited has signed up.</>
            )}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className="w-48 shrink-0 rounded-md bg-white p-2 [&_svg]:h-auto [&_svg]:w-full"
              style={{ colorScheme: "light", background: "#fff" }}
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <div className="min-w-0 space-y-3">
              <p className="break-all font-mono text-sm">{signupUrl}</p>
              <ShareLink
                url={signupUrl}
                title="Join the MRBC Safety Team app"
                message="You're invited! Create your MRBC Safety Team account here, using the email address your invite was sent to:"
                qrPng={qrPng}
                qrFileName="mrbc-safety-team-sign-up-qr.png"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 font-semibold">Link to the app</h2>
          <p className="mb-4 text-sm text-slate-600">
            For members who already have an account: scan this code (or open the link) to go straight to the app and
            sign in. On a phone, use &ldquo;Add to Home Screen&rdquo; to keep it like an app.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className="w-48 shrink-0 rounded-md bg-white p-2 [&_svg]:h-auto [&_svg]:w-full"
              style={{ colorScheme: "light", background: "#fff" }}
              dangerouslySetInnerHTML={{ __html: appQrSvg }}
            />
            <div className="min-w-0 space-y-3">
              <p className="break-all font-mono text-sm">{appUrl}</p>
              <ShareLink
                url={appUrl}
                title="MRBC Safety Team app"
                message="Open the MRBC Safety Team app here:"
                qrPng={appQrPng}
                qrFileName="mrbc-safety-team-app-qr.png"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 font-semibold">Admins</h2>
          <p className="mb-3 text-sm text-slate-600">
            Admins can do everything, and only they can see this page, change roles, or make someone an admin. To add
            or remove an admin, open the person on the Safety Team Members page and change their role. There must
            always be at least one admin.
          </p>
          <ul className="space-y-1 text-sm">
            {admins.map((a) => (
              <li key={a.id}>
                <Link href={`/members/${a.id}`} className="text-blue-700 underline">{a.full_name || a.email}</Link>
              </li>
            ))}
          </ul>
        </Card>

        <section>
          <h2 className="mb-1 text-lg font-semibold">Roles &amp; Permissions</h2>
          <p className="mb-4 text-sm text-slate-600">
            Every member can see the calendar, sign up for positions, file incident reports and edit their own
            profile. Roles add the extra abilities below.
          </p>
          <div className="space-y-4">
            {roles.map((role) => (
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
                  {role.is_admin ? (
                    <p className="text-sm text-slate-700">Full access to everything. This role can&apos;t be deleted.</p>
                  ) : (
                    <PermissionChecklist selected={role.permissions} />
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit">Save</Button>
                    {!role.is_default && !role.is_admin && (
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
              <h3 className="mb-3 font-semibold">Add a role</h3>
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
        </section>
      </div>
    </>
  );
}
