import { GestureInput, type GestureInputAction } from "./index";

const ACTIONS: GestureInputAction[] = [
  { gesture: "circle", label: '"What spiked here?"', showButton: false },
  { gesture: "swipe-left", label: "Swipe to summarise", icon: "←" },
  { gesture: "pinch-out", label: "Pinch to zoom + ask", icon: "🤏" },
];

const ACTUAL = "30,200 90,160 150,175 210,110 270,140 330,90 390,115 450,95";
const FORECAST = "30,230 90,210 150,220 210,190 270,200 330,175 390,185 450,165";

/** GestureInput as nucleux.in's live preview shows it: the spike circled on the chart, waiting to be asked about. */
export function SitePreview() {
  return (
    <div className="w-[30rem] max-w-full rounded-lg border border-border bg-background p-4 shadow-sm">
      <GestureInput
        variant="circle-to-select"
        actions={ACTIONS}
        defaultCaptured={{ gesture: "circle", bounds: { x: 173.25, y: 50.85, width: 102.5, height: 58.5 } }}
        feedbackPlacement="overlay"
        overlayDismiss={false}
        showKeys={false}
        hint={null}
        label="Revenue chart — circle a point to ask about it"
        onGesture={() => {}}
        contentClassName="aspect-video from-[hsl(149_80%_90%)] to-[hsl(152_76%_80%)] [background-image:linear-gradient(135deg,var(--tw-gradient-stops))]"
      >
        <svg viewBox="0 0 480 270" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 size-full">
          <polyline points={ACTUAL} className="fill-none stroke-[hsl(164_86%_20%)]" strokeWidth={2} strokeLinejoin="round" />
          <polyline points={FORECAST} className="fill-none stroke-[hsl(158_64%_52%)]" strokeWidth={1.5} strokeLinejoin="round" strokeDasharray="4 3" />
        </svg>
      </GestureInput>
    </div>
  );
}
