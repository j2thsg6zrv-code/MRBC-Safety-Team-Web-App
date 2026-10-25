"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "./actions";
import { Button, Card, ErrorMessage, Field, SuccessMessage } from "@/components/ui";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState(mode === "login" ? login : signup, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold">MRBC Safety Team</h1>
        <p className="mb-4 text-sm text-slate-600">
          {mode === "login" ? "Sign in to your account." : "Create your account."}
        </p>
        <form action={action} className="space-y-3">
          {mode === "signup" && <Field label="Full name" name="full_name" required />}
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
            required
          />
          {mode === "signup" && (
            <Field label="Confirm password" name="confirm" type="password" minLength={8} required />
          )}
          <ErrorMessage message={state?.error} />
          <SuccessMessage message={state?.message} />
          <Button
            type="submit"
            disabled={pending}
            className="w-full"
            pendingLabel={mode === "login" ? "Signing in…" : "Creating account…"}
          >
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          {mode === "login" ? (
            <>New to the team? <Link className="text-blue-700 underline" href="/signup">Create an account</Link></>
          ) : (
            <>Already have an account? <Link className="text-blue-700 underline" href="/login">Sign in</Link></>
          )}
        </p>
      </Card>
    </main>
  );
}
