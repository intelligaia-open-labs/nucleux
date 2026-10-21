import { Check, CheckCircle2, CloudUpload, Link2, Mic, Play } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  CardAction,
  CardContainer,
  CardContent,
  CardDescription,
  CardDivider,
  CardHeader,
  CardTitle,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "../index";

/**
 * Shared building blocks for the "Meeting dashboard" home screen, assembled
 * entirely from Nucleux primitives — a faithful implementation of the source
 * Figma design (AI-UX-Pattern). Reused by the standalone dashboard story and
 * the full app-shell story.
 */

export function RecentMeetingCard() {
  return (
    <CardContainer>
      <CardHeader>
        <div>
          <CardTitle>Recent meeting</CardTitle>
          <CardDescription>1 in your library</CardDescription>
        </div>
        <CardAction>View all</CardAction>
      </CardHeader>
      <CardDivider />
      <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Avatar shape="rounded" name="Zuora" className="size-9" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            Zuora · CPQ Q3 scope review
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            CPQ · Q3 redesign
            <span className="inline-flex items-center gap-0.5">
              <Play className="size-3" /> 45:00
            </span>
          </p>
        </div>
        <Badge variant="outline">5 action items</Badge>
        <Badge variant="success" icon={<CheckCircle2 className="size-3.5" />}>
          Summarized
        </Badge>
        <span className="text-xs text-muted-foreground">2h ago</span>
      </CardContent>
    </CardContainer>
  );
}

export function CaptureAnotherMeeting() {
  return (
    <section className="rounded-2xl bg-brand-muted p-6">
      <h2 className="text-base font-semibold text-foreground">Capture another meeting</h2>
      <ItemGroup className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: <Mic />, title: "Record a meeting", description: "Capture live from your browser." },
          { icon: <CloudUpload />, title: "Upload a recording", description: "From your desktop or Google Drive — audio or video file." },
          { icon: <Link2 />, title: "Paste a link", description: "A Zoom/Meet recording URL, a Drive file, or a YouTube link." },
        ].map((tile) => (
          <Item key={tile.title} asChild variant="outline" className="h-full flex-col items-start bg-background">
            <button type="button">
              <ItemMedia variant="icon" className="bg-brand-muted text-brand">
                {tile.icon}
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{tile.title}</ItemTitle>
                <ItemDescription className="line-clamp-none">{tile.description}</ItemDescription>
              </ItemContent>
            </button>
          </Item>
        ))}
      </ItemGroup>
    </section>
  );
}

export function FirstWinCard() {
  return (
    <CardContainer className="overflow-hidden">
      <div className="p-5">
        <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 to-slate-950">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md">
            <Play className="size-5 translate-x-0.5 fill-current" />
          </span>
        </div>
        <div className="mt-5 flex items-start justify-between gap-3">
          <div>
            <CardTitle>Your first win plan</CardTitle>
            <CardDescription>Three steps to real value</CardDescription>
          </div>
          <Badge variant="default">1/3 Done</Badge>
        </div>
      </div>
      <CardDivider />
      <ItemGroup className="p-2">
        {[
          { done: true, title: "Capture your first meeting", description: "Upload or record — your first AI summary in under a minute." },
          { title: "Connect Google Calendar", description: "Let AI discover, join, and summarize meetings.", action: <Button variant="cta" size="sm">Connect</Button> },
          { title: "Invite a teammate", description: "Keep everyone aligned on decisions and next steps.", action: <Button variant="secondary" size="sm">Invite</Button> },
        ].map((step) => (
          <Item key={step.title} size="sm">
            <ItemMedia
              aria-label={step.done ? "Done" : "Not done"}
              role="img"
              className={step.done ? "size-5 rounded-full bg-success text-success-foreground" : "size-5 rounded-full border border-border"}
            >
              {step.done && <Check className="size-3" strokeWidth={3} />}
            </ItemMedia>
            <ItemContent>
              <ItemTitle className={step.done ? "text-muted-foreground line-through" : undefined}>{step.title}</ItemTitle>
              <ItemDescription>{step.description}</ItemDescription>
            </ItemContent>
            {step.action && <ItemActions>{step.action}</ItemActions>}
          </Item>
        ))}
      </ItemGroup>
    </CardContainer>
  );
}

/** The centered dashboard content (header + two-column grid), without app chrome. */
export function MeetingDashboardBody() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Good to see you, Eric
        </h1>
        <p className="mt-1 text-base text-muted-foreground">Your first summary is ready 🎉</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_376px]">
        <div className="flex flex-col gap-6">
          <RecentMeetingCard />
          <CaptureAnotherMeeting />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Get started with your first win
          </h2>
          <FirstWinCard />
        </div>
      </div>
    </div>
  );
}
