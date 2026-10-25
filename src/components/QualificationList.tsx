export type MemberQualification = {
  id: string;
  earned_on: string;
  expires_on: string | null;
  qualifications: { name: string } | null;
};

export function expiryStatus(expiresOn: string | null) {
  if (!expiresOn) return { label: "Does not expire", className: "text-slate-500" };
  const days = Math.ceil((new Date(expiresOn).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: `Expired ${expiresOn}`, className: "text-red-700 font-medium" };
  if (days <= 60) return { label: `Expires ${expiresOn}`, className: "text-amber-700 font-medium" };
  return { label: `Expires ${expiresOn}`, className: "text-slate-500" };
}

export function QualificationList({
  items,
  action,
}: {
  items: MemberQualification[];
  action?: (id: string) => React.ReactNode;
}) {
  if (items.length === 0) return <p className="text-sm text-slate-500">No qualifications recorded.</p>;
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((q) => {
        const status = expiryStatus(q.expires_on);
        return (
          <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
            <div>
              <p className="font-medium">{q.qualifications?.name}</p>
              <p className="text-xs text-slate-500">
                Earned {q.earned_on} · <span className={status.className}>{status.label}</span>
              </p>
            </div>
            {action?.(q.id)}
          </li>
        );
      })}
    </ul>
  );
}
