import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Permission } from "@/lib/permissions";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  roleName: string | null;
  permissions: Permission[];
  can: (permission: Permission) => boolean;
};

export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, active, roles(name, permissions)")
    .eq("id", user.id)
    .single();

  const role = profile?.roles as unknown as { name: string; permissions: Permission[] } | null;
  const permissions = profile?.active ? (role?.permissions ?? []) : [];

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? "",
    fullName: profile?.full_name ?? "",
    roleName: role?.name ?? null,
    permissions,
    can: (permission) => permissions.includes(permission),
  };
}

export async function requirePermission(permission: Permission) {
  const user = await getCurrentUser();
  if (!user.can(permission)) redirect("/");
  return user;
}
