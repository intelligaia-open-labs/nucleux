import { ArrowLeft, ZoomIn } from "lucide-react";
import { GestureInput, type GestureInputAction } from "./index";

const ACTIONS: GestureInputAction[] = [
  { gesture: "circle", label: "“What spiked here?”", showButton: false },
  { gesture: "swipe-left", label: "Swipe to summarise", icon: <ArrowLeft /> },
  { gesture: "pinch-out", label: "Pinch to zoom + ask", icon: <ZoomIn /> },
];

const ACTUAL = "30,200 90,160 150,175 210,110 270,140 330,90 390,115 450,95";
const FORECAST = "30,230 90,210 150,220 210,190 270,200 330,175 390,185 450,165";

/** GestureInput as nucleux.in's live preview shows it: the spike circled on the chart, waiting to be asked about. */
export function SitePreview() {
  return (
    <div className="w-full max-w-[30rem] rounded-xl border border-border bg-background p-4 shadow-sm">
      <GestureInput
        variant="circle-to-select"
        actions={ACTIONS}
        defaultCaptured={{ gesture: "circle", bounds: { x: 170, y: 46, width: 100, height: 56 } }}
        feedbackPlacement="overlay"
        hint={null}
        label="Revenue chart — circle a point to ask about it"
        onGesture={() => {}}
        contentClassName="aspect-video bg-gradient-to-br from-success/15 to-success/35"
      >
        <svg viewBox="0 0 480 270" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 size-full">
          <polyline points={ACTUAL} className="fill-none stroke-success" strokeWidth={2} strokeLinejoin="round" />
          <polyline points={FORECAST} className="fill-none stroke-success/60" strokeWidth={1.5} strokeDasharray="4 3" />
        </svg>
      </GestureInput>
    </div>
  );
}
