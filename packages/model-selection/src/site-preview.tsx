import { useState } from "react";
import { OpenInput } from "@nucleux/open-input";
import { ModelSelection, type ModelOption } from "./index";

const MODELS: ModelOption[] = [
  { value: "opus", label: "Opus", description: "Best quality · multi-step reasoning", speed: "Slower", cost: "$$$" },
  { value: "sonnet", label: "Sonnet", description: "Balanced · most tasks", speed: "Medium", cost: "$$" },
  { value: "haiku", label: "Haiku", description: "Fast · quick lookups", speed: "Fastest", cost: "$" },
];

/** ModelSelection as nucleux.in's live preview shows it: auto-route on, the tradeoff list, and the composer's model chip. */
export function SitePreview() {
  const [model, setModel] = useState("sonnet");
  const [auto, setAuto] = useState(true);
  const [value, setValue] = useState("");
  const choose = (next: string) => {
    setModel(next);
    setAuto(false);
  };

  return (
    <div className="flex w-[446px] max-w-full flex-col gap-2.5">
      <ModelSelection
        variant="auto-route"
        picker="list"
        agentName="Aria"
        routedModel="Sonnet"
        models={MODELS}
        value={model}
        onValueChange={setModel}
        autoRoute={auto}
        onAutoRouteChange={setAuto}
      />
      <OpenInput
        aria-label="Message Aria"
        placeholder="Ask Aria…"
        value={value}
        onValueChange={setValue}
        onSubmit={() => setValue("")}
        onAdd={() => {}}
        model={<ModelSelection trigger="chip" menuSide="top" models={MODELS} value={model} onValueChange={choose} />}
        onVoice={() => {}}
      />
    </div>
  );
}
