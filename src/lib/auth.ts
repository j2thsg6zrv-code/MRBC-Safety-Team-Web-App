import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Permission } from "@/lib/permissions";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  roleName: string | null;
  /** False until an admin approves the account. */
  active: boolean;
  /** Has the Admin role: every permission, plus roles and choosing admins. */
  isAdmin: boolean;
  permissions: Permission[];
  can: (permission: Permission) => boolean;
};

// Cached so the layout and the page share one lookup per page load.
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const supabase = await createClient();
  // getClaims checks the sign-in token's signature without a separate trip to
  // the sign-in server (the middleware has already refreshed it).
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/login");
  const user = { id: claims.sub, email: claims.email };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, active, roles(name, permissions, is_admin)")
    .eq("id", user.id)
    .single();

  const role = profile?.roles as unknown as { name: string; permissions: Permission[]; is_admin: boolean } | null;
  const isAdmin = !!profile?.active && !!role?.is_admin;
  const permissions = profile?.active ? (role?.permissions ?? []) : [];

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? "",
    fullName: profile?.full_name ?? "",
    roleName: role?.name ?? null,
    active: !!profile?.active,
    isAdmin,
    permissions,
    can: (permission) => isAdmin || permissions.includes(permission),
  };
});

export async function requirePermission(permission: Permission) {
  const user = await getCurrentUser();
  if (!user.can(permission)) redirect("/");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user.isAdmin) redirect("/");
  return user;
}
