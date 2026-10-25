import Link from "next/link";
import { SERVICES, type GreeterSignup } from "@/lib/greeters";

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
            </div>
          );
        })}
      </div>
    </div>
  );
}
