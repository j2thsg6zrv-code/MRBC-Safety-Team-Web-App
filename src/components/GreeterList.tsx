import Link from "next/link";
import { GreeterReminder } from "@/components/GreeterReminder";
import { formatDate } from "@/lib/dates";
import { SERVICES, type GreeterSignup } from "@/lib/greeters";

const TIMES = { first_service: "8:30", second_service: "11:00" } as const;

/** A Sunday's greeters from the public sign-up page, with phone numbers. */
export function GreeterList({ signups }: { signups: GreeterSignup[] }) {
  return (
    <div className="px-4 py-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">Greeters signed up online</p>
        <Link href="/greeter-schedule" className="text-xs text-blue-700 underline">All greeters</Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SERVICES.map((service) => {
          const people = signups.filter((s) => s[service.key]);
          const phones = people.flatMap((p) => (p.phone ? [p.phone] : []));
          const noPhone = people.length - phones.length;
          const message = people[0]
            ? `Hi! This is a reminder that you're signed up to greet before the ${TIMES[service.key]} service on ${formatDate(people[0].sunday)}. Thank you for serving! - MRBC Safety Team`
            : "";
          return (
            <div key={service.key}>
              <p className="text-xs text-slate-500">{service.label}</p>
              {people.length === 0 ? (
                <p className="text-sm text-slate-500">No one yet</p>
              ) : (
                <ul className="space-y-0.5 text-sm">
                  {people.map((p) => (
                    <li key={p.id}>
                      {p.name}
                      {p.phone && (
                        <> · <a href={`tel:${p.phone}`} className="text-blue-700 underline">{p.phone}</a></>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {phones.length > 0 && <GreeterReminder phones={phones} message={message} />}
              {noPhone > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  {noPhone === people.length ? "No phone numbers to text." : `${noPhone} without a phone number won't get the text.`}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
