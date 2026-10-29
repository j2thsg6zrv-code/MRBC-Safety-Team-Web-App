import { addCredential, removeCredential, type CredentialKind } from "@/app/(app)/credential-actions";
import { QualificationList, type MemberQualification } from "@/components/QualificationList";
import { Button, Card, Field, Select } from "@/components/ui";
import { today } from "@/lib/dates";

/** A member's qualifications or certifications, with add/renew and remove when allowed. */
export function CredentialCard({
  kind,
  title,
  profileId,
  items,
  choices,
  canEdit,
  returnTo,
}: {
  kind: CredentialKind;
  title: string;
  profileId: string;
  items: MemberQualification[];
  choices: { id: string; name: string }[];
  canEdit: boolean;
  returnTo: string;
}) {
  const word = kind === "certification" ? "certification" : "qualification";
  const hidden = (
    <>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="profile_id" value={profileId} />
      <input type="hidden" name="return_to" value={returnTo} />
    </>
  );
  return (
    <Card>
      <h2 className="mb-2 font-semibold">{title}</h2>
      <QualificationList
        items={items}
        empty={`No ${word}s recorded.`}
        action={
          canEdit
            ? (heldId) => (
                <form action={removeCredential}>
                  {hidden}
                  <input type="hidden" name="held_id" value={heldId} />
                  <Button type="submit" variant="secondary" className="px-2 py-1 text-xs">Remove</Button>
                </form>
              )
            : undefined
        }
      />
      {canEdit && choices.length > 0 && (
        <form action={addCredential} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold">Add or renew a {word}</h3>
          {hidden}
          <Select label={word === "certification" ? "Certification" : "Qualification"} name="item_id" required>
            {choices.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Field label="Date earned" name="earned_on" type="date" defaultValue={today()} required />
          <Field label="Expires on" name="expires_on" type="date" hint={`Leave blank to work it out from how long the ${word} lasts.`} />
          <Button type="submit">Add {word}</Button>
        </form>
      )}
    </Card>
  );
}
