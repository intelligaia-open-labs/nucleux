import { Github, KeyRound, Lock, Mail } from "lucide-react";
import { Md3Button, Md3Checkbox, Md3TextField } from "@nucleux/react";

/**
 * A full Material Design 3 sign-in page: a two-panel layout (brand panel + form)
 * built from Nucleux md3-* components. Responsive — the brand panel collapses on
 * small screens. Uses only solid MD3 tonal tokens.
 */
export function LoginMui3() {
  return (
    <div className="grid min-h-screen bg-md-surface md:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between bg-md-primary p-10 text-md-on-primary md:flex">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md-md bg-md-primary-container font-semibold text-md-on-primary-container">
            N
          </span>
          <span className="text-lg font-semibold">Nucleux</span>
        </div>
        <div>
          <h2 className="text-4xl font-semibold leading-tight">Build agent UIs, faster.</h2>
          <p className="mt-4 max-w-xs text-md-on-primary">
            Material 3 components for AI products — chat, tool calls, consent, and everything in between.
          </p>
        </div>
        <p className="text-sm text-md-on-primary">© 2026 Nucleux</p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <span className="grid size-9 place-items-center rounded-md-md bg-md-primary font-semibold text-md-on-primary">
              N
            </span>
            <span className="text-lg font-semibold text-md-on-surface">Nucleux</span>
          </div>

          <h1 className="text-3xl text-md-on-surface">Welcome back</h1>
          <p className="mt-1 text-sm text-md-on-surface-variant">Sign in to continue to your workspace.</p>

          <form className="mt-8 flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
            <Md3TextField variant="outlined" label="Email" type="email" leadingIcon={<Mail />} />
            <Md3TextField variant="outlined" label="Password" type="password" leadingIcon={<Lock />} />

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
            or continue with
            <span className="h-px flex-1 bg-md-outline-variant" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Md3Button variant="outlined" icon={<Github />} className="w-full">
              GitHub
            </Md3Button>
            <Md3Button variant="outlined" icon={<KeyRound />} className="w-full">
              SSO
            </Md3Button>
          </div>

          <p className="mt-8 text-center text-sm text-md-on-surface-variant">
            Don&apos;t have an account?{" "}
            <a href="#" className="font-medium text-md-primary hover:underline">
              Create one
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
