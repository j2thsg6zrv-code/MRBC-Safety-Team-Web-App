// Shown right away while a page's data loads, so taps on the menu feel instant.
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 rounded-md bg-slate-200" />
      <div className="h-40 rounded-lg border border-slate-200 bg-white shadow-sm" />
      <div className="h-24 rounded-lg border border-slate-200 bg-white shadow-sm" />
    </div>
  );
}
