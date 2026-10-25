"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseTheme, setThemeCookie } from "@/lib/theme";

export type AuthState = { error?: string; message?: string } | undefined;

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) return { error: error.message };

  // Bring the member's light/dark choice to this browser.
  const { data: profile } = await supabase.from("profiles").select("theme").eq("id", data.user.id).single();
  await setThemeCookie(parseTheme(profile?.theme));
  redirect("/");
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password"));
  if (password !== formData.get("confirm")) return { error: "Passwords do not match." };

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password,
    options: {
      data: { full_name: String(formData.get("full_name")) },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/");
  return { message: "Check your email for a link to confirm your account." };
}
