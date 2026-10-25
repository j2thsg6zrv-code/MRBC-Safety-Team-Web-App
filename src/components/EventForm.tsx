import { Button, Field, Select, TextArea } from "@/components/ui";

type Option = { id: string; name: string };

export type EventFormValues = {
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  building_id: string | null;
  series_id: string | null;
  positions: Record<string, number>; // position id → slots
};

export function EventForm({
  action,
  event,
  buildings,
  positions,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  event?: EventFormValues & { id: string };
  buildings: Option[];
  positions: Option[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-4">
      {event && <input type="hidden" name="id" value={event.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" name="title" defaultValue={event?.title} placeholder="Sunday Morning Service" required />
        <Select label="Building" name="building_id" defaultValue={event?.building_id ?? ""}>
          <option value="">Not set</option>
          {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
        <Field label="Date" name="event_date" type="date" defaultValue={event?.event_date} required />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start time" name="start_time" type="time" defaultValue={event?.start_time?.slice(0, 5)} required />
          <Field label="End time" name="end_time" type="time" defaultValue={event?.end_time?.slice(0, 5) ?? ""} />
        </div>
      </div>
      <TextArea label="Notes for the team" name="description" rows={2} defaultValue={event?.description ?? ""} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">Positions needed</legend>
        {positions.length === 0 && <p className="text-sm text-slate-500">Add positions on the Positions page first.</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          {positions.map((p) => {
            const slots = event?.positions[p.id];
            return (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={`pos_${p.id}`} defaultChecked={event ? slots !== undefined : true} className="h-4 w-4" />
                  {p.name}
                </label>
                <label className="flex items-center gap-1 text-xs text-slate-600">
                  People
                  <input
                    type="number"
                    name={`slots_${p.id}`}
                    min={1}
                    max={20}
                    defaultValue={slots ?? 1}
                    className="w-14 rounded border border-slate-300 px-2 py-1 text-sm"
                  />
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      {!event && (
        <Field
          label="Repeat weekly for how many more weeks?"
          name="repeat_weeks"
          type="number"
          min={0}
          max={52}
          defaultValue={0}
          hint="0 = just this one date. For example, 12 adds this event every week for the next 12 weeks too."
        />
      )}
      {event?.series_id && (
        <fieldset className="space-y-1 text-sm">
          <legend className="mb-1 font-medium text-slate-700">This event repeats weekly. Apply changes to:</legend>
          <label className="flex items-center gap-2">
            <input type="radio" name="scope" value="one" defaultChecked /> Only this date
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="scope" value="following" /> This and all following dates
            <span className="text-xs text-slate-500">(date changes only apply to this one)</span>
          </label>
        </fieldset>
      )}
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}

/** Reads the event fields and chosen positions out of a submitted EventForm. */
export function readEventForm(formData: FormData, positionIds: string[]) {
  const value = (name: string) => {
    const v = String(formData.get(name) ?? "").trim();
    return v === "" ? null : v;
  };
  const positions: Record<string, number> = {};
  for (const id of positionIds) {
    if (formData.get(`pos_${id}`) === "on") {
      positions[id] = Math.max(1, Number(formData.get(`slots_${id}`)) || 1);
    }
  }
  return {
    fields: {
      title: value("title") ?? "",
      description: value("description"),
      start_time: value("start_time") ?? "",
      end_time: value("end_time"),
      building_id: value("building_id"),
    },
    eventDate: value("event_date") ?? "",
    positions,
  };
}
