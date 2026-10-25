import { revalidatePath } from "next/cache";
import { QualificationList, type MemberQualification } from "@/components/QualificationList";
import { Status } from "@/components/Status";
import { Button, Card, Field, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { finish, text, type SearchParams } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { parseTheme, setThemeCookie, type Theme } from "@/lib/theme";

async function saveProfile(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: text(formData, "full_name") ?? "",
      phone: text(formData, "phone"),
      emergency_contact_name: text(formData, "emergency_contact_name"),
      emergency_contact_phone: text(formData, "emergency_contact_phone"),
    })
    .eq("id", user.id);
  revalidatePath("/", "layout");
  finish("/profile", error, "Your profile was saved.");
}

async function saveTheme(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  const theme = parseTheme(formData.get("theme"));
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ theme }).eq("id", user.id);
  if (!error) await setThemeCookie(theme);
  finish("/profile", error, "Appearance saved.");
}

const THEME_OPTIONS: { value: Theme; label: string; hint: string }[] = [
  { value: "system", label: "Match my device", hint: "Follows your phone or computer's setting" },
  { value: "light", label: "Light", hint: "Always light" },
  { value: "dark", label: "Dark", hint: "Always dark, easier on the eyes in a dim room" },
];

async function changePassword(formData: FormData) {
  "use server";
  const password = String(formData.get("password"));
  if (password !== formData.get("confirm")) finish("/profile", { message: "Passwords do not match." });
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  finish("/profile", error, "Your password was changed.");
}

export default async function ProfilePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const [{ data: profile }, { data: quals }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("member_qualifications")
      .select("id, earned_on, expires_on, qualifications(name)")
      .eq("profile_id", user.id)
      .order("expires_on"),
  ]);

  return (
    <>
      <PageHeader title="My Profile" />
      <Status searchParams={searchParams} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Contact details</h2>
          <form action={saveProfile} className="space-y-3">
            <Field label="Full name" name="full_name" defaultValue={profile?.full_name} required />
            <Field label="Email" value={profile?.email ?? ""} disabled hint="Contact an admin to change your email." />
            <Field label="Phone" name="phone" type="tel" defaultValue={profile?.phone ?? ""} />
            <Field label="Emergency contact name" name="emergency_contact_name" defaultValue={profile?.emergency_contact_name ?? ""} />
            <Field label="Emergency contact phone" name="emergency_contact_phone" type="tel" defaultValue={profile?.emergency_contact_phone ?? ""} />
            <Button type="submit">Save profile</Button>
          </form>
        </Card>
        <div className="space-y-6">
          <Card>
            <h2 className="mb-1 font-semibold">Role</h2>
            <p className="text-slate-700">{user.roleName ?? "No role assigned"}</p>
          </Card>
          <Card>
            <h2 className="mb-2 font-semibold">My qualifications</h2>
            <QualificationList items={(quals ?? []) as unknown as MemberQualification[]} />
          </Card>
          <Card>
            <h2 className="mb-3 font-semibold">Appearance</h2>
            <form action={saveTheme} className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-3">
                {THEME_OPTIONS.map((t) => (
                  <label
                    key={t.value}
                    className="flex cursor-pointer gap-2 rounded-md border border-slate-300 p-3 text-sm has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50"
                  >
                    <input type="radio" name="theme" value={t.value} defaultChecked={parseTheme(profile?.theme) === t.value} className="mt-0.5" />
                    <span>
                      <span className="block font-medium">{t.label}</span>
                      <span className="block text-xs text-slate-500">{t.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              <Button type="submit" variant="secondary">Save appearance</Button>
            </form>
          </Card>
          <Card>
            <h2 className="mb-3 font-semibold">Change password</h2>
            <form action={changePassword} className="space-y-3">
              <Field label="New password" name="password" type="password" minLength={8} autoComplete="new-password" required />
              <Field label="Confirm new password" name="confirm" type="password" minLength={8} required />
              <Button type="submit" variant="secondary">Change password</Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
