import { KeyRound, Lock, Mail } from "lucide-react";
import { Md3Button, Md3Checkbox, Md3TextField } from "@nucleux/react";

/**
 * A Material Design 3 sign-in page built from Nucleux md3-* components. Shared by
 * the Storybook example and the SSR artifact render (scripts/render-login.mjs).
 */
export function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-md-surface p-6">
      <div className="w-full max-w-sm rounded-md-xl bg-md-surface-container-low p-8 shadow-md-1">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <span className="grid size-12 place-items-center rounded-md-lg bg-md-primary text-lg font-semibold text-md-on-primary">
            N
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl text-md-on-surface">Sign in</h1>
            <p className="text-sm text-md-on-surface-variant">Welcome back to Nucleux</p>
          </div>
        </div>

        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <Md3TextField label="Email" variant="outlined" type="email" leadingIcon={<Mail />} />
          <Md3TextField label="Password" variant="outlined" type="password" leadingIcon={<Lock />} />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1 text-sm text-md-on-surface">
              <Md3Checkbox aria-label="Remember me" />
              Remember me
            </label>
            <a href="#" className="text-sm font-medium text-md-primary hover:underline">
              Forgot password?
            </a>
          </div>

          <Md3Button type="submit" variant="filled" className="w-full">
            Sign in
          </Md3Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-md-on-surface-variant">
          <span className="h-px flex-1 bg-md-outline-variant" />
          or
          <span className="h-px flex-1 bg-md-outline-variant" />
        </div>

        <Md3Button variant="outlined" icon={<KeyRound />} className="w-full">
          Continue with SSO
        </Md3Button>

        <p className="mt-7 text-center text-sm text-md-on-surface-variant">
          Don&apos;t have an account?{" "}
          <a href="#" className="font-medium text-md-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
