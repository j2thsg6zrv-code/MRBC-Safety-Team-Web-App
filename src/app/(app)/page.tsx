import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <>
      <PageHeader title={`Welcome${user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}`} />
      <Card>
        <p className="text-slate-700">
          The monthly calendar for signing up to serve will appear here.
        </p>
      </Card>
    </>
  );
}
