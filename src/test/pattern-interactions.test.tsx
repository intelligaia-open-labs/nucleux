import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AppShellExample from "../../knowledge/patterns/app-shell/example";
import ListPageExample, { ProjectListPage, SAMPLE_PROJECTS } from "../../knowledge/patterns/list-page/example";
import { AsyncContent } from "../../knowledge/patterns/page-states/example";
import DetailPageExample from "../../knowledge/patterns/detail-page/example";
import FormDialogExample from "../../knowledge/patterns/form-dialog/example";
import MultiStepFormExample from "../../knowledge/patterns/multi-step-form/example";
import SignInExample from "../../knowledge/patterns/auth-sign-in/example";
import SettingsPageExample from "../../knowledge/patterns/settings-page/example";
import TaskBoardExample from "../../knowledge/patterns/task-board/example";
import AnalyticsChartsExample from "../../knowledge/patterns/analytics-charts/example";
import DashboardOverviewExample from "../../knowledge/patterns/dashboard-overview/example";

// Behaviour of each curated pattern example, driven the way a user would:
// patterns.test.tsx proves they mount and pass axe; this proves they work.

const bodyRows = () => screen.getAllByRole("row").slice(1);

describe("app-shell", () => {
  it("marks the current link and navigates from the sidebar", async () => {
    const user = userEvent.setup();
    render(<AppShellExample />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");

    await user.click(within(nav).getByRole("link", { name: "Projects" }));
    expect(within(nav).getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("collapses on desktop and toggles with Ctrl+B", async () => {
    const user = userEvent.setup();
    const { container } = render(<AppShellExample />);
    const sidebar = () => container.querySelector('[data-slot="sidebar"]')!;
    expect(sidebar()).toHaveAttribute("data-state", "expanded");
    await user.click(screen.getByRole("button", { name: "Toggle navigation" }));
    expect(sidebar()).toHaveAttribute("data-state", "collapsed");
    expect(sidebar()).toHaveAttribute("data-collapsible", "icon");
    await user.keyboard("{Control>}b{/Control}");
    expect(sidebar()).toHaveAttribute("data-state", "expanded");
  });

  it("opens as a sheet on phones and closes after navigating", async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ ...original(query), matches: query.includes("max-width: 767px") })) as typeof window.matchMedia;
    try {
      const user = userEvent.setup();
      render(<AppShellExample />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Toggle navigation" }));
      const sheet = await screen.findByRole("dialog");
      await user.click(within(sheet).getByRole("link", { name: "Team" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      await user.click(screen.getByRole("button", { name: "Toggle navigation" }));
      expect(within(await screen.findByRole("dialog")).getByRole("link", { name: "Team" })).toHaveAttribute("aria-current", "page");
    } finally {
      window.matchMedia = original;
    }
  });
});

describe("list-page", () => {
  it("filters by search and status, and shows the empty message", async () => {
    const user = userEvent.setup();
    render(<ListPageExample />);
    expect(bodyRows()).toHaveLength(4);

    await user.type(screen.getByRole("searchbox", { name: "Search projects" }), "luis");
    expect(bodyRows()).toHaveLength(1);
    expect(screen.getByText("Mobile onboarding")).toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox", { name: "Search projects" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Filter by status" }), "done");
    expect(bodyRows()).toHaveLength(1);
    expect(screen.getByText("Q3 analytics report")).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: "Search projects" }), "nothing like this");
    expect(screen.getByText("No projects match these filters.")).toBeInTheDocument();
  });

  it("calls onCreate from the header action", async () => {
    const onCreate = vi.fn();
    render(<ProjectListPage projects={SAMPLE_PROJECTS} onCreate={onCreate} />);
    await userEvent.click(screen.getByRole("button", { name: "New project" }));
    expect(onCreate).toHaveBeenCalledOnce();
  });
});

describe("page-states", () => {
  const props = { isEmpty: (d: string[]) => d.length === 0, empty: { title: "No projects yet", description: "Create one." } };

  it("renders loading, error with retry, empty, and ready", async () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <AsyncContent {...props} state={{ status: "loading" }} onRetry={onRetry}>{() => null}</AsyncContent>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading");

    rerender(<AsyncContent {...props} state={{ status: "error", message: "Timed out." }} onRetry={onRetry}>{() => null}</AsyncContent>);
    expect(screen.getByRole("alert")).toHaveTextContent("Timed out.");
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();

    rerender(<AsyncContent {...props} state={{ status: "ready", data: [] }} onRetry={onRetry}>{() => null}</AsyncContent>);
    expect(screen.getByText("No projects yet")).toBeInTheDocument();

    rerender(
      <AsyncContent {...props} state={{ status: "ready", data: ["Alpha"] }} onRetry={onRetry}>
        {(items) => <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>}
      </AsyncContent>,
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("Alpha");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("detail-page", () => {
  it("switches tabs", async () => {
    const user = userEvent.setup();
    render(<DetailPageExample />);
    expect(screen.getByText("72%")).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Members" }));
    expect(screen.getByText("Mei Tanaka")).toBeVisible();
    expect(screen.queryByText("72%")).not.toBeInTheDocument();
  });

  it("asks before deleting; cancel keeps, confirm deletes", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<DetailPageExample onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    let dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent('Delete "Website redesign"?');
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete project" }));
    expect(onDelete).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });
});

describe("form-dialog", () => {
  it("validates, saves, closes and confirms with a toast", async () => {
    const user = userEvent.setup();
    render(<FormDialogExample />);
    await user.click(screen.getByRole("button", { name: "New task" }));
    const dialog = await screen.findByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: "Create task" }));
    expect(within(dialog).getByText("Give the task a title.")).toBeInTheDocument();
    expect(within(dialog).getByLabelText(/Title/)).toHaveAttribute("aria-invalid", "true");

    await user.type(within(dialog).getByLabelText(/Title/), "Write release notes");
    await user.selectOptions(within(dialog).getByLabelText("Priority"), "high");
    await user.click(within(dialog).getByRole("button", { name: "Create task" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(await screen.findByText("Task created")).toBeInTheDocument();
    expect(screen.getByText("Write release notes")).toBeInTheDocument();
  });

  it("cancel closes without saving", async () => {
    const user = userEvent.setup();
    render(<FormDialogExample />);
    await user.click(screen.getByRole("button", { name: "New task" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.queryByText("Task created")).not.toBeInTheDocument();
  });
});

describe("multi-step-form", () => {
  it("blocks an invalid step, goes back and forth, reviews and finishes", async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<MultiStepFormExample onFinish={onFinish} />);
    expect(screen.getByText("Step 1 of 3: Workspace")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Check the highlighted fields");
    expect(screen.getByText("Step 1 of 3: Workspace")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Workspace name/), "Acme");
    await user.type(screen.getByLabelText(/Workspace URL/), "Acme-Team");
    expect(screen.getByLabelText(/Workspace URL/)).toHaveValue("acme-team");
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Step 2 of 3: Team size")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Team size"), "11-50");
    await user.click(screen.getByRole("radio", { name: /Engineer/ }));

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText(/Workspace name/)).toHaveValue("Acme");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Step 3 of 3: Review")).toBeInTheDocument();
    expect(screen.getByText("acme.app/acme-team")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Create workspace" }));
    expect(onFinish).toHaveBeenCalledWith({ workspace: "Acme", url: "acme-team", size: "11-50", role: "engineer" });
  });
});

describe("auth-sign-in", () => {
  it("shows field errors before submitting anything", async () => {
    const onSignIn = vi.fn();
    render(<SignInExample onSignIn={onSignIn} />);
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(onSignIn).not.toHaveBeenCalled();
  });

  it("disables submit while pending and shows a form error on failure", async () => {
    const user = userEvent.setup();
    let reject!: (e: Error) => void;
    const onSignIn = vi.fn(() => new Promise<void>((_, r) => (reject = r)));
    render(<SignInExample onSignIn={onSignIn} />);

    await user.type(screen.getByLabelText(/Email/), "dana@acme.com");
    await user.type(screen.getByLabelText(/Password/), "hunter2");
    await user.click(screen.getByRole("checkbox", { name: "Keep me signed in" }));
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onSignIn).toHaveBeenCalledWith("dana@acme.com", "hunter2", false);
    expect(screen.getByRole("button", { name: "Signing in…" })).toBeDisabled();
    reject(new Error("Email or password is incorrect."));
    expect(await screen.findByRole("alert")).toHaveTextContent("Email or password is incorrect.");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });
});

describe("settings-page", () => {
  it("requires a name, saves the profile, and toggles notifications", async () => {
    const user = userEvent.setup();
    render(<SettingsPageExample />);
    const name = screen.getByLabelText(/Display name/);

    await user.clear(name);
    expect(screen.getByText("Display name is required.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();

    await user.type(name, "Dana K.");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByText("Profile saved")).toBeInTheDocument();
    await user.type(name, "!");
    expect(screen.queryByText("Profile saved")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Notifications" }));
    const digest = screen.getByRole("switch", { name: "Weekly digest" });
    expect(digest).toBeChecked();
    await user.click(digest);
    expect(digest).not.toBeChecked();
  });
});

describe("task-board", () => {
  const column = (name: RegExp) => screen.getByRole("region", { name });

  it("moves and deletes tasks from the card menu", async () => {
    const user = userEvent.setup();
    render(<TaskBoardExample />);
    expect(within(column(/^To do/)).getByText("Push notification permissions")).toBeInTheDocument();
    expect(column(/^Done/)).toHaveTextContent("Done 1");

    await user.click(screen.getByRole("button", { name: "Actions for Push notification permissions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Done" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(within(column(/^Done/)).getByText("Push notification permissions")).toBeInTheDocument();
    expect(within(column(/^To do/)).getByText("No tasks")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Actions for Invoice export" }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));
    expect(screen.queryByText("Invoice export")).not.toBeInTheDocument();
    expect(within(column(/^In review/)).getByText("No tasks")).toBeInTheDocument();
  });

  it("shows overdue as text, not only color", () => {
    render(<TaskBoardExample />);
    expect(screen.getByText("Overdue · Oct 14")).toBeInTheDocument();
  });
});

describe("analytics-charts", () => {
  it("changes the range and keeps the screen-reader summary in sync", async () => {
    const user = userEvent.setup();
    render(<AnalyticsChartsExample />);
    expect(screen.getByText("Tasks created vs completed, last 8 weeks")).toBeInTheDocument();
    expect(screen.getByText(/77 tasks completed in the last 8 weeks; most in week of Sep 28/)).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "Time range" }), "4");
    expect(screen.getByText("Tasks created vs completed, last 4 weeks")).toBeInTheDocument();
    expect(screen.getByText(/44 tasks completed in the last 4 weeks; most in week of Sep 28/)).toBeInTheDocument();
    expect(screen.getByText(/Dana: 4, Luis: 3, Mei: 5, Priya: 2 open tasks/)).toBeInTheDocument();
  });
});

describe("dashboard-overview", () => {
  it("shows every metric, progress bar and activity row", () => {
    render(<DashboardOverviewExample />);
    const metrics = screen.getByRole("region", { name: "Key metrics" });
    for (const v of ["12", "248", "7", "92%"]) expect(within(metrics).getByText(v)).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")).toHaveLength(3);
    expect(screen.getByRole("progressbar", { name: "Website redesign progress" })).toHaveAttribute("aria-valuenow", "72");
    expect(bodyRows()).toHaveLength(3);
  });
});
