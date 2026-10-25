import { Button } from "@/components/ui";
import { formatDate, formatTimeRange } from "@/lib/dates";

export type DayEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  buildings: { name: string } | null;
  event_positions: {
    id: string;
    slots: number;
    positions: { name: string; description: string | null; required_qualification_id: string | null; qualifications: { name: string } | null } | null;
    signups: { id: string; profile_id: string; profiles: { full_name: string; email: string } | null }[];
  }[];
};

type Actions = {
  signUp: (formData: FormData) => Promise<void>;
  cancel: (formData: FormData) => Promise<void>;
  assign: (formData: FormData) => Promise<void>;
};

export function DayPanel({
  date,
  events,
  userId,
  isPast,
  canManage,
  myQualifications,
  members,
  actions,
  returnTo,
}: {
  date: string;
  events: DayEvent[];
  userId: string;
  isPast: boolean;
  canManage: boolean;
  myQualifications: Set<string>;
  members: { id: string; name: string }[];
  actions: Actions;
  returnTo: string;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{formatDate(date)}</h2>
      {events.length === 0 && <p className="text-sm text-slate-600">No events scheduled on this day.</p>}
      <div className="space-y-4">
        {events.map((event) => {
          const myEventSignup = event.event_positions.some((ep) => ep.signups.some((s) => s.profile_id === userId));
          return (
            <div key={event.id} className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-slate-500">
                  {formatTimeRange(event.start_time, event.end_time)}
                  {event.buildings && ` · ${event.buildings.name}`}
                </p>
                {event.description && <p className="mt-1 text-sm text-slate-700">{event.description}</p>}
              </div>
              <ul className="divide-y divide-slate-100">
                {event.event_positions.map((ep) => {
                  const open = ep.slots - ep.signups.length;
                  const mine = ep.signups.find((s) => s.profile_id === userId);
                  const needsQual = ep.positions?.required_qualification_id;
                  const qualified = !needsQual || myQualifications.has(needsQual) || canManage;
                  return (
                    <li key={ep.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{ep.positions?.name}</p>
                          <p className="text-xs text-slate-500">
                            {ep.signups.length} of {ep.slots} filled
                            {ep.positions?.qualifications && ` · Requires ${ep.positions.qualifications.name}`}
                          </p>
                        </div>
                        {!isPast && !mine && open > 0 && !myEventSignup && (
                          qualified ? (
                            <form action={actions.signUp}>
                              <input type="hidden" name="event_position_id" value={ep.id} />
                              <input type="hidden" name="return_to" value={returnTo} />
                              <Button type="submit" className="px-3 py-1.5">Sign up</Button>
                            </form>
                          ) : (
                            <span className="text-xs text-slate-500">Needs {ep.positions?.qualifications?.name}</span>
                          )
                        )}
                        {open <= 0 && !mine && <span className="text-xs font-medium text-slate-500">Full</span>}
                      </div>
                      {ep.signups.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {ep.signups.map((s) => (
                            <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                              <span className={s.profile_id === userId ? "font-medium text-green-800" : ""}>
                                {s.profile_id === userId ? "You" : s.profiles?.full_name || s.profiles?.email}
                              </span>
                              {!isPast && (s.profile_id === userId || canManage) && (
                                <form action={actions.cancel}>
                                  <input type="hidden" name="signup_id" value={s.id} />
                                  <input type="hidden" name="return_to" value={returnTo} />
                                  <button className="text-xs text-red-700 underline">
                                    {s.profile_id === userId ? "Cancel" : "Remove"}
                                  </button>
                                </form>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                      {canManage && !isPast && open > 0 && (
                        <form action={actions.assign} className="mt-2 flex gap-2">
                          <input type="hidden" name="event_position_id" value={ep.id} />
                          <input type="hidden" name="return_to" value={returnTo} />
                          <select name="profile_id" required className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm">
                            <option value="">Assign someone…</option>
                            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                          <Button type="submit" variant="secondary" className="px-3 py-1">Assign</Button>
                        </form>
                      )}
                    </li>
                  );
                })}
                {event.event_positions.length === 0 && (
                  <li className="px-4 py-3 text-sm text-slate-500">No positions set up for this event.</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
