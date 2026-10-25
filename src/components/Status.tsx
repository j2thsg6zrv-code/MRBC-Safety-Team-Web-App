import { ErrorMessage, SuccessMessage } from "@/components/ui";
import type { SearchParams } from "@/lib/forms";

export async function Status({ searchParams }: { searchParams: SearchParams }) {
  const { saved, error } = await searchParams;
  return (
    <div className="mb-4 empty:hidden">
      <ErrorMessage message={error} />
      <SuccessMessage message={saved} />
    </div>
  );
}
