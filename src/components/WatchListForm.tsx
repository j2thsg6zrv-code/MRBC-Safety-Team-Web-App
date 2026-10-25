import { Button, Field, Select, TextArea } from "@/components/ui";
import type { WatchListEntry } from "@/lib/watchList";

export function WatchListForm({
  action,
  entry,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  entry?: WatchListEntry;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-4">
      {entry && <input type="hidden" name="id" value={entry.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" name="full_name" defaultValue={entry?.full_name} required />
        <Field label="Also known as" name="aliases" defaultValue={entry?.aliases ?? ""} />
        <Select label="Status" name="status" defaultValue={entry?.status ?? "watch"}>
          <option value="watch">Watch for</option>
          <option value="banned">Not allowed on property</option>
        </Select>
        <Field label="Banned until" name="banned_until" type="date" defaultValue={entry?.banned_until ?? ""} hint="Leave blank if there's no end date." />
      </div>
      <TextArea label="Description (appearance, age, height…)" name="description" rows={2} defaultValue={entry?.description ?? ""} />
      <TextArea label="Reason" name="reason" rows={2} defaultValue={entry?.reason ?? ""} />
      <Field label="Vehicle" name="vehicle" defaultValue={entry?.vehicle ?? ""} placeholder="Make, model, color, plate" />
      <TextArea label="What to do if seen" name="instructions" rows={2} defaultValue={entry?.instructions ?? ""} placeholder="e.g. Do not engage. Notify the team leader by radio and call 911." />
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">{entry?.photo_path ? "Replace photo" : "Photo"}</span>
        <input type="file" name="photo" accept="image/*" className="block w-full text-sm" />
      </label>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}

export function readWatchListForm(formData: FormData) {
  const value = (name: string) => {
    const v = String(formData.get(name) ?? "").trim();
    return v === "" ? null : v;
  };
  return {
    full_name: value("full_name") ?? "",
    aliases: value("aliases"),
    status: value("status") === "banned" ? "banned" : "watch",
    description: value("description"),
    reason: value("reason"),
    vehicle: value("vehicle"),
    instructions: value("instructions"),
    banned_until: value("banned_until"),
  };
}
