import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Alert,
  Button,
  CardContainer,
  CardContent,
  CardDivider,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Progress,
  Radio,
  RadioGroup,
  NativeSelect,
} from "@nucleux/react";

const STEPS = ["Workspace", "Team size", "Review"] as const;

interface Answers {
  workspace: string;
  url: string;
  size: string;
  role: string;
}

/**
 * Multi-step form (onboarding, checkout, setup wizard): one card, a step
 * counter + Progress, one group of fields per step, Back/Next in a fixed
 * footer, validation per step before advancing, and a review step that lists
 * every answer before the final submit.
 */
export default function MultiStepFormExample({ onFinish = () => undefined }: { onFinish?: (a: Answers) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ workspace: "", url: "", size: "2-10", role: "manager" });
  const [tried, setTried] = useState(false);
  const set = (key: keyof Answers, value: string) => setAnswers((a) => ({ ...a, [key]: value }));

  const stepValid = step !== 0 || (answers.workspace.trim() !== "" && /^[a-z0-9-]+$/.test(answers.url));
  const last = step === STEPS.length - 1;

  const next = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!stepValid) return;
    setTried(false);
    if (last) onFinish(answers);
    else setStep((s) => s + 1);
  };

  return (
    <main className="mx-auto max-w-xl p-4 sm:p-8">
      <CardContainer>
        <form noValidate onSubmit={next}>
          <CardHeader className="flex-col items-stretch gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </p>
            <Progress value={((step + 1) / STEPS.length) * 100} size="sm" aria-label="Setup progress" />
            <CardTitle role="heading" aria-level={1} className="text-xl">
              {["Name your workspace", "Tell us about your team", "Review and create"][step]}
            </CardTitle>
          </CardHeader>
          <CardDivider />
          <CardContent className="space-y-4">
            {tried && !stepValid && (
              <Alert variant="destructive" title="Check the highlighted fields" role="alert">
                Fix them to continue.
              </Alert>
            )}

            {step === 0 && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="ws-name" required>Workspace name</Label>
                  <Input
                    id="ws-name"
                    value={answers.workspace}
                    invalid={tried && !answers.workspace.trim()}
                    onChange={(e) => set("workspace", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ws-url" required>Workspace URL</Label>
                  <Input
                    id="ws-url"
                    value={answers.url}
                    invalid={tried && !/^[a-z0-9-]+$/.test(answers.url)}
                    aria-describedby="ws-url-hint"
                    onChange={(e) => set("url", e.target.value.toLowerCase())}
                  />
                  <p id="ws-url-hint" className="text-xs text-muted-foreground">
                    Lowercase letters, numbers and dashes: acme.app/{answers.url || "your-team"}
                  </p>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="team-size">Team size</Label>
                  <NativeSelect id="team-size" value={answers.size} onChange={(e) => set("size", e.target.value)}>
                    <option value="1">Just me</option>
                    <option value="2-10">2–10</option>
                    <option value="11-50">11–50</option>
                    <option value="51+">51 or more</option>
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Your role</p>
                  <RadioGroup label="Your role" value={answers.role} onValueChange={(v) => set("role", v)}>
                    {[["manager", "Project manager"], ["engineer", "Engineer"], ["designer", "Designer"]].map(([v, l]) => (
                      <label key={v} className="flex items-center gap-2 text-sm text-foreground">
                        <Radio value={v} /> {l}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}

            {step === 2 && (
              <dl className="divide-y divide-border text-sm">
                {[
                  ["Workspace", answers.workspace],
                  ["URL", `acme.app/${answers.url}`],
                  ["Team size", answers.size],
                  ["Role", answers.role],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                variant="ghost"
                leftIcon={<ArrowLeft className="size-4" />}
                disabled={step === 0}
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </Button>
              <Button type="submit" variant="cta" rightIcon={last ? undefined : <ArrowRight className="size-4" />}>
                {last ? "Create workspace" : "Next"}
              </Button>
            </div>
          </CardContent>
        </form>
      </CardContainer>
    </main>
  );
}
