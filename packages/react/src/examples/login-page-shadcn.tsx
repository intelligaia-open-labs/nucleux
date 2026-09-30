import { KeyRound } from "lucide-react";
import { Button, Checkbox, Input, Label, Separator } from "@nucleux/react";

/**
 * A shadcn/slate sign-in page built from Nucleux primitives (Input, Label,
 * Button, Checkbox, Separator). Shared by the Storybook example and the SSR
 * artifact render (scripts/render-login.mjs).
 */
export function LoginPageShadcn() {
  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid size-11 place-items-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground">
            N
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground">Welcome back to Nucleux</p>
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-sm font-medium text-info hover:underline">
                Forgot password?
              </a>
            </div>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox aria-label="Remember me" />
            Remember me
          </label>
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
          <Separator className="flex-1" />
          or
          <Separator className="flex-1" />
        </div>

        <Button variant="secondary" leftIcon={<KeyRound className="size-4" />} className="w-full">
          Continue with SSO
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="#" className="font-medium text-info hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
