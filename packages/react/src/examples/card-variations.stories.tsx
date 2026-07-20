import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ArrowUpRight, ImageIcon, Play } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Chip,
  LinkButton,
  MediaCard,
} from "../index";

/**
 * The **Card Variation** family from Figma ("Card Variation 1…33") — every one
 * of them is the same anatomy: a media area with an overlaid *label*, a
 * *heading*, and a *description*. Rather than ship 22+ near-identical packages,
 * the whole family is expressed with a single {@link MediaCard} primitive via
 * its `media` slot, `orientation`, `footer`, and `title`/`description` props.
 *
 * This gallery reproduces the Figma pattern and then walks through the
 * meaningful, real-world permutations you get for free.
 */
const meta = {
  title: "Examples/Card Variations",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A gradient "poster" with an optional overlaid label — the Figma media area. */
function Poster({
  label,
  labelVariant,
  icon,
  from = "from-slate-700",
  to = "to-slate-950",
}: {
  label?: ReactNode;
  labelVariant?: "chip" | "info" | "success" | "default";
  icon?: ReactNode;
  from?: string;
  to?: string;
}) {
  return (
    <div className={`relative flex size-full items-center justify-center bg-gradient-to-br ${from} ${to}`}>
      {icon && <span className="text-background/90">{icon}</span>}
      {label != null &&
        (labelVariant && labelVariant !== "chip" ? (
          <Badge variant={labelVariant} className="absolute left-3 top-3 shadow-sm">
            {label}
          </Badge>
        ) : (
          <Chip className="absolute left-3 top-3 shadow-sm">{label}</Chip>
        ))}
    </div>
  );
}

/** Small captioned frame so each variation is self-describing in the gallery. */
function Cell({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{caption}</p>
      {children}
    </div>
  );
}

export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <Cell caption="Canonical (label overlay)">
        <MediaCard
          media={<Poster label="Label" icon={<Play className="size-8 fill-current" />} />}
          title="Heading"
          description="Description"
        />
      </Cell>

      <Cell caption="Info label">
        <MediaCard
          media={<Poster label="New" labelVariant="info" from="from-indigo-600" to="to-violet-900" />}
          title="Model comparison"
          description="Claude Opus 4.8 vs. Sonnet on reasoning benchmarks."
        />
      </Cell>

      <Cell caption="Success label">
        <MediaCard
          media={<Poster label="Live" labelVariant="success" from="from-emerald-600" to="to-teal-900" />}
          title="Deployment ready"
          description="All checks passed. Ship when you are."
        />
      </Cell>

      <Cell caption="No label">
        <MediaCard
          media={<Poster icon={<ImageIcon className="size-8" />} />}
          title="Untitled asset"
          description="Uploaded just now · 2.4 MB"
        />
      </Cell>

      <Cell caption="Text only (no media)">
        <MediaCard
          title="Weekly summary"
          description="12 conversations · 3 flagged for follow-up. Your agent handled routing automatically."
        />
      </Cell>

      <Cell caption="With footer action">
        <MediaCard
          media={<Poster label="Guide" icon={<Play className="size-8 fill-current" />} />}
          title="Getting started"
          description="A 5-minute tour of the agent workspace."
          footer={<LinkButton rightIcon={<ArrowUpRight className="size-4" />}>Open guide</LinkButton>}
        />
      </Cell>

      <Cell caption="Real image">
        <MediaCard
          image="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=640&q=60"
          imageAlt="Abstract data visualization"
          title="Telemetry dashboard"
          description="Latency and token usage across all sessions."
        />
      </Cell>

      <Cell caption="CTA footer">
        <MediaCard
          media={<Poster label="Beta" labelVariant="default" from="from-fuchsia-600" to="to-purple-900" />}
          title="Try agent memory"
          description="Persist context across conversations automatically."
          footer={
            <Button size="sm" className="w-full">
              Enable memory
            </Button>
          }
        />
      </Cell>

      <Cell caption="Contributor footer">
        <MediaCard
          media={<Poster label="Draft" icon={<ImageIcon className="size-8" />} />}
          title="Q3 planning doc"
          description="Shared workspace · edited 2h ago"
          footer={
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["Ada Lin", "Sam Poe", "Zoe Ray"].map((n) => (
                  <Avatar key={n} name={n} className="size-6 ring-2 ring-background" />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">+4 editing</span>
            </div>
          }
        />
      </Cell>

      <Cell caption="Horizontal">
        <MediaCard
          orientation="horizontal"
          media={<Poster label="45:00" icon={<Play className="size-6 fill-current" />} />}
          title="CPQ scope review"
          description="Recorded meeting · summarized by agent."
        />
      </Cell>

      <Cell caption="Horizontal + action">
        <MediaCard
          orientation="horizontal"
          media={<Poster icon={<ImageIcon className="size-6" />} from="from-sky-600" to="to-blue-900" />}
          title="Design handoff"
          description="14 frames ready for review."
          footer={<LinkButton rightIcon={<ArrowUpRight className="size-4" />}>Review</LinkButton>}
        />
      </Cell>

      <Cell caption="Body badge">
        <MediaCard
          media={<Poster label="Report" from="from-slate-600" to="to-slate-900" />}
          title="Usage report"
          description="Generated for July 2026."
        >
          <Badge variant="success" className="mt-1 w-fit">
            +12% vs. June
          </Badge>
        </MediaCard>
      </Cell>
    </div>
  ),
};
