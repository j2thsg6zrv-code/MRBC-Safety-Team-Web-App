import { Button, Field, Select, TextArea } from "@/components/ui";

export const CATEGORIES = [
  "Medical",
  "Suspicious person",
  "Disruptive person",
  "Watch list sighting",
  "Theft or property damage",
  "Lost or missing child",
  "Vehicle / parking lot",
  "Fire or facility hazard",
  "Other",
];

export const SEVERITIES = {
  low: { label: "Low", className: "bg-slate-100 text-slate-700" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-900" },
  high: { label: "High", className: "bg-red-100 text-red-800" },
} as const;

type Option = { id: string; name: string };

export type IncidentValues = {
  id: string;
  incident_date: string;
  incident_time: string | null;
  category: string;
  severity: keyof typeof SEVERITIES;
  building_id: string | null;
  location: string | null;
  event_id: string | null;
  description: string;
  people_involved: string | null;
  actions_taken: string | null;
  police_called: boolean;
  ems_called: boolean;
  watch_list_id: string | null;
};

export function IncidentForm({
  action,
  incident,
  defaultDate,
  buildings,
  events,
  watchList,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  incident?: IncidentValues;
  defaultDate: string;
  buildings: Option[];
  events: Option[];
  watchList: Option[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-4">
      {incident && <input type="hidden" name="id" value={incident.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date" name="incident_date" type="date" defaultValue={incident?.incident_date ?? defaultDate} required />
        <Field label="Time" name="incident_time" type="time" defaultValue={incident?.incident_time?.slice(0, 5) ?? ""} />
        <Select label="Type of incident" name="category" defaultValue={incident?.category ?? ""} required>
          <option value="" disabled>Choose one…</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Select label="Severity" name="severity" defaultValue={incident?.severity ?? "low"}>
          {Object.entries(SEVERITIES).map(([value, s]) => <option key={value} value={value}>{s.label}</option>)}
        </Select>
        <Select label="Building" name="building_id" defaultValue={incident?.building_id ?? ""}>
          <option value="">Not set</option>
          {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
        <Field label="Where exactly?" name="location" defaultValue={incident?.location ?? ""} placeholder="e.g. North parking lot" />
        {events.length > 0 && (
          <Select label="During event" name="event_id" defaultValue={incident?.event_id ?? ""}>
            <option value="">None</option>
            {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </Select>
        )}
        {watchList.length > 0 && (
          <Select label="Person on the watch list" name="watch_list_id" defaultValue={incident?.watch_list_id ?? ""}>
            <option value="">None</option>
            {watchList.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </Select>
        )}
      </div>
      <TextArea label="What happened?" name="description" rows={5} defaultValue={incident?.description ?? ""} required />
      <TextArea label="People involved (names, descriptions, witnesses)" name="people_involved" rows={3} defaultValue={incident?.people_involved ?? ""} />
      <TextArea label="Actions taken" name="actions_taken" rows={3} defaultValue={incident?.actions_taken ?? ""} />
      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="police_called" defaultChecked={incident?.police_called} className="h-4 w-4" /> Police called
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="ems_called" defaultChecked={incident?.ems_called} className="h-4 w-4" /> EMS / ambulance called
        </label>
      </div>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}

export function readIncidentForm(formData: FormData) {
  const value = (name: string) => {
    const v = String(formData.get(name) ?? "").trim();
    return v === "" ? null : v;
  };
  const severity = value("severity");
  return {
    incident_date: value("incident_date") ?? "",
    incident_time: value("incident_time"),
    category: value("category") ?? "Other",
    severity: severity && severity in SEVERITIES ? severity : "low",
    building_id: value("building_id"),
    location: value("location"),
    event_id: value("event_id"),
    watch_list_id: value("watch_list_id"),
    description: value("description") ?? "",
    people_involved: value("people_involved"),
    actions_taken: value("actions_taken"),
    police_called: formData.get("police_called") === "on",
    ems_called: formData.get("ems_called") === "on",
  };
}
