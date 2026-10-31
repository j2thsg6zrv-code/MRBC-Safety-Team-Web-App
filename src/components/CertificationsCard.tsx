import { addOutsideCertification, removeOutsideCertification } from "@/app/(app)/credential-actions";
import { expiryStatus } from "@/components/QualificationList";
import { Button, Card, Field } from "@/components/ui";
import { today } from "@/lib/dates";

/** A certification earned outside the app (CPR, first aid...), typed in by the member. */
export type OutsideCertification = {
  id: string;
  name: string;
  issued_by: string | null;
  earned_on: string;
  expires_on: string | null;
};

/** A certification earned by passing one of our training classes. */
export type TrainingCertification = {
  id: string;
  earned_on: string;
  expires_on: string | null;
  certifications: { name: string } | null;
};

/**
 * One list of a member's certifications: the ones from training classes (added
 * automatically, so they can't be changed here) and the ones they earned
 * outside the app, which they add and remove themselves.
 */
export function CertificationsCard({
  title,
  profileId,
  training,
  outside,
  canEdit,
  returnTo,
}: {
  title: string;
  profileId: string;
  training: TrainingCertification[];
  outside: OutsideCertification[];
  canEdit: boolean;
  returnTo: string;
}) {
  const hidden = (
    <>
      <input type="hidden" name="profile_id" value={profileId} />
      <input type="hidden" name="return_to" value={returnTo} />
    </>
  );
  const rows = [
    ...training.map((c) => ({
      key: `t-${c.id}`,
      id: null as string | null,
      name: c.certifications?.name ?? "",
      source: "Training class",
      earned_on: c.earned_on,
      expires_on: c.expires_on,
    })),
    ...outside.map((c) => ({
      key: `o-${c.id}`,
      id: c.id,
      name: c.name,
      source: c.issued_by ?? "Outside the app",
      earned_on: c.earned_on,
      expires_on: c.expires_on,
    })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Card>
      <h2 className="mb-2 font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No certifications recorded.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((c) => {
            const status = expiryStatus(c.expires_on);
            return (
              <li key={c.key} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c.source} · Obtained {c.earned_on} · <span className={status.className}>{status.label}</span>
                  </p>
                </div>
                {canEdit && c.id && (
                  <form action={removeOutsideCertification}>
                    {hidden}
                    <input type="hidden" name="held_id" value={c.id} />
                    <Button type="submit" variant="secondary" className="px-2 py-1 text-xs">Remove</Button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {canEdit && (
        <form action={addOutsideCertification} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold">Add a certification from outside the app</h3>
          <p className="text-xs text-slate-500">
            For example CPR or First Aid. Certifications from our training classes are added automatically when you pass the class.
          </p>
          {hidden}
          <Field label="Certification name" name="name" placeholder="CPR Certification" required maxLength={120} />
          <Field label="Where you got it" name="issued_by" placeholder="American Red Cross" maxLength={120} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Date obtained" name="earned_on" type="date" defaultValue={today()} required />
            <Field label="Expiration date" name="expires_on" type="date" hint="Leave blank if it doesn't expire." />
          </div>
          <Button type="submit">Add certification</Button>
        </form>
      )}
    </Card>
  );
}
