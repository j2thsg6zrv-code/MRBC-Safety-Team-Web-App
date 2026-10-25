import { AuthForm } from "../AuthForm";

// Invite emails link here with ?email= so the invited address is filled in.
export default async function SignupPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return <AuthForm mode="signup" email={email} />;
}
