import { redirect } from "next/navigation";

// Qualifications setup moved under Admin; members manage theirs on My Profile.
export default function QualificationsPage() {
  redirect("/admin/qualifications");
}
