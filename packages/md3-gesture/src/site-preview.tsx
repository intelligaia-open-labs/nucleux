import { useState } from "react";
import { LassoSelect } from "lucide-react";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3OpenInput, Md3OpenInputModelChip } from "@nucleux/md3-open-input";
import { Md3GestureInput, type GestureInputAction } from "./index";

const ACTIONS: GestureInputAction[] = [{ gesture: "circle", label: "Ask about this" }];
const TILES = [
  { label: "Sign-ups", value: "12,480", change: "+4% vs Aug" },
  { label: "Activation", value: "32%", change: "−9 pts", down: true },
  { label: "Revenue", value: "£418k", change: "+12%" },
];
const FUNNEL = [["Visit", "100%"], ["Sign up", "18%"], ["Activate", "6.1%"], ["Pay", "2.9%"]];
const CONVERSION = "0,40 30,36 60,38 90,33 120,35 150,31 180,34 200,52 220,62 250,66 275,64 300,68";
const panel = "flex flex-col rounded-md-lg bg-md-surface-container-low p-3 text-md-on-surface";

/** Md3GestureInput as nucleux.in's live preview shows it: the September dashboard, ready to circle, above the composer. */
export function SitePreview() {
  const [value, setValue] = useState("");
  const [selecting, setSelecting] = useState(false);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <Md3GestureInput
        variant="circle-to-select"
        actions={ACTIONS}
        showActions={false}
        hint={null}
        label="Self-serve analytics, September"
        onGesture={() => setSelecting(false)}
        className="rounded-md-xl border border-md-outline-variant bg-md-surface-container-lowest p-3"
        contentClassName="grid gap-3"
      >
        <div className="grid grid-cols-3 gap-3">
          {TILES.map((t) => (
            <div key={t.label} className={panel}>
              <span className="text-sm text-md-on-surface-variant">{t.label}</span>
              <span className="text-2xl font-medium">{t.value}</span>
              <span className={t.down ? "text-sm text-md-error" : "text-sm text-md-on-surface-variant"}>{t.change}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_12.5rem] gap-3">
          <div className={panel}>
            <span className="text-sm font-medium text-md-on-surface-variant">Conversion · last 30 days</span>
            <svg viewBox="0 0 300 96" preserveAspectRatio="none" aria-hidden="true" className="mt-2 h-24 w-full">
              {[24, 56, 88].map((y) => (
                <line key={y} x1="0" x2="300" y1={y} y2={y} className="stroke-md-outline-variant" />
              ))}
              <polyline points={CONVERSION} className="fill-none stroke-md-primary" strokeWidth={2.5} />
            </svg>
            <span className="flex justify-between text-sm text-md-on-surface-variant">
              <span>1 Sep</span>
              <span>14 Sep</span>
              <span>30 Sep</span>
            </span>
          </div>
          <dl className={`${panel} grid grid-cols-[1fr_auto] content-start gap-x-4 gap-y-1 text-sm`}>
            <dt className="col-span-2 mb-2 font-medium text-md-on-surface-variant">Funnel</dt>
            {FUNNEL.map(([step, share]) => [
              <dt key={step}>{step}</dt>,
              <dd key={`${step}-v`} className="text-right font-medium">{share}</dd>,
            ])}
          </dl>
        </div>
      </Md3GestureInput>
      <Md3OpenInput
        aria-label="Message Aria"
        placeholder="Ask Aria about what you select…"
        value={value}
        onValueChange={setValue}
        onSubmit={() => setValue("")}
        onAdd={() => {}}
        model={<Md3OpenInputModelChip name="Balanced" detail="High" />}
        actions={
          <Md3IconButton aria-label="Select on screen" aria-pressed={selecting} onClick={() => setSelecting(!selecting)} className="[&_svg]:size-5">
            <LassoSelect aria-hidden="true" />
          </Md3IconButton>
        }
        onVoice={() => {}}
      />
    </div>
  );
}
