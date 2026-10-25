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

async function saveMessages(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  const by = String(formData.get("notify_by"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      notify_by: by === "none" ? "none" : "email",
      notify_open_spots: formData.get("notify_open_spots") === "on",
      notify_thanks: formData.get("notify_thanks") === "on",
      notify_chat_direct: formData.get("notify_chat_direct") === "on",
      notify_chat_team: formData.get("notify_chat_team") === "on",
    })
    .eq("id", user.id);
  finish("/profile", error, "Message settings saved.");
}

const MESSAGE_OPTIONS = [
  { value: "email", label: "Email me" },
  { value: "none", label: "Don't send me anything" },
];

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
            <h2 className="mb-1 font-semibold">Messages from the team</h2>
            <p className="mb-3 text-sm text-slate-600">
              Reminders and thank-yous come by email to the address on your account.
            </p>
            <form action={saveMessages} className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {MESSAGE_OPTIONS.map((o) => (
                  <label
                    key={o.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 p-3 text-sm font-medium has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50"
                  >
                    <input type="radio" name="notify_by" value={o.value} defaultChecked={(profile?.notify_by ?? "email") === o.value} />
                    {o.label}
                  </label>
                ))}
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="notify_open_spots" defaultChecked={profile?.notify_open_spots ?? true} className="mt-0.5" />
                <span>Remind me 48 and 24 hours before an event that still has open spots</span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="notify_thanks" defaultChecked={profile?.notify_thanks ?? true} className="mt-0.5" />
                <span>Send me a thank-you when I sign up for a spot</span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="notify_chat_direct" defaultChecked={profile?.notify_chat_direct ?? true} className="mt-0.5" />
                <span>Email me when a teammate sends me a message in Team Chat</span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="notify_chat_team" defaultChecked={profile?.notify_chat_team ?? false} className="mt-0.5" />
                <span>Email me when someone posts in the whole-team chat</span>
              </label>
              <p className="text-xs text-slate-500">
                Chat emails come once per conversation until you open it, so a busy chat won&apos;t fill your inbox.
              </p>
              <Button type="submit" variant="secondary">Save message settings</Button>
            </form>
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
