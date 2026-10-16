import { useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  CardContainer,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  LinkButton,
} from "@nucleux/react";

/**
 * Sign-in screen: one centered card, labelled fields, inline field errors,
 * a form-level error Alert for failed sign-in, and the secondary paths
 * (forgot password, sign up) as links. Submission stays disabled while pending.
 */
export default function SignInExample({
  onSignIn = async () => {
    throw new Error("Email or password is incorrect.");
  },
}: {
  onSignIn?: (email: string, password: string, remember: boolean) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailInvalid = touched && !/^\S+@\S+\.\S+$/.test(email);
  const passwordInvalid = touched && password.length === 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!/^\S+@\S+\.\S+$/.test(email) || !password) return;
    setPending(true);
    setError(null);
    try {
      await onSignIn(email, password, remember);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <CardContainer className="w-full max-w-sm">
        <CardHeader className="flex-col items-start gap-1">
          <CardTitle role="heading" aria-level={1} className="text-xl">
            Sign in to Acme
          </CardTitle>
          <CardDescription>Welcome back. Enter your work email to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={submit} className="space-y-4">
            {error && (
              <Alert variant="destructive" title="Couldn't sign you in" role="alert">
                {error}
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" required>Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                invalid={emailInvalid}
                aria-describedby={emailInvalid ? "email-error" : undefined}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailInvalid && (
                <p id="email-error" className="text-xs text-destructive">Enter a valid email address.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required>Password</Label>
                <LinkButton href="/forgot-password" className="text-xs">Forgot password?</LinkButton>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                invalid={passwordInvalid}
                aria-describedby={passwordInvalid ? "password-error" : undefined}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passwordInvalid && (
                <p id="password-error" className="text-xs text-destructive">Enter your password.</p>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox checked={remember} onCheckedChange={setRemember} aria-label="Keep me signed in" />
              Keep me signed in
            </label>
            <Button type="submit" variant="cta" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Acme? <LinkButton href="/sign-up">Create an account</LinkButton>
          </p>
        </CardContent>
      </CardContainer>
    </main>
  );
}
