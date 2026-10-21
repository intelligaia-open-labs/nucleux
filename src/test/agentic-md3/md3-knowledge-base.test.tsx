import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Md3KnowledgeBase as KnowledgeBase, Md3KnowledgeBaseSources as KnowledgeBaseSources, Md3KnowledgeBaseCoverage as KnowledgeBaseCoverage } from "@nucleux/md3-knowledge-base";

describe("KnowledgeBase review", () => {
  it("chips, source list and coverage pass axe", async () => {
    const { container } = render(
      <div>
        <KnowledgeBase
          variant="chips"
          heading="Grounded in"
          defaultValue={["docs"]}
          onAdd={() => {}}
          sources={[
            { id: "docs", name: "Product docs", count: 412 },
            { id: "playbook", name: "Sales playbook", count: 38 },
          ]}
        />
        <KnowledgeBaseSources sources={[{ id: "1", name: "Renewal Playbook v3", section: "§4.1" }, { id: "2", name: "Sales Ops FAQ" }]} />
        <KnowledgeBaseCoverage level="high" matches={14} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("chips toggle selection and the add control fires", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onAdd = vi.fn();
    render(
      <KnowledgeBase
        variant="chips"
        heading="Grounded in"
        onValueChange={onValueChange}
        onAdd={onAdd}
        sources={[{ id: "docs", name: "Product docs", count: 412 }]}
      />,
    );
    const chip = screen.getByRole("checkbox", { name: /Product docs/ });
    await user.click(chip);
    expect(chip).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenCalledWith(["docs"]);
    await user.click(screen.getByRole("button", { name: "Add a base" }));
    expect(onAdd).toHaveBeenCalled();
  });

  it("says readiness in words and puts the recovery on the failed row", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    render(
      <KnowledgeBase
        onRefresh={onRefresh}
        sources={[
          { id: "drive", name: "Google Drive", status: "stale" },
          { id: "msa", name: "MSA Template.pdf", status: "error" },
          { id: "crm", name: "CRM records", status: "ready" },
        ]}
      />,
    );
    expect(screen.getByRole("checkbox", { name: /Google Drive Needs refresh/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry MSA Template.pdf" }));
    expect(onRefresh).toHaveBeenCalledWith("msa");
    expect(screen.queryByRole("button", { name: /CRM records/ })).toBeNull();
  });
});

describe("Md3KnowledgeBase extra", () => {
  it("list with statuses, reading sources and all coverage levels pass axe", async () => {
    const { container } = render(
      <div>
        <KnowledgeBase
          heading="Active knowledge"
          defaultValue={["crm"]}
          onRefresh={() => {}}
          onAdd={() => {}}
          sources={[
            { id: "crm", name: "CRM records", status: "ready", count: 18240, meta: "Live" },
            { id: "drive", name: "Google Drive", status: "stale", meta: "Captured 12 Sep" },
            { id: "slack", name: "Slack history", status: "processing" },
            { id: "msa", name: "MSA Template.pdf", status: "error", meta: "Password-protected" },
          ]}
        />
        <KnowledgeBaseSources reading baseName="Sales playbook" sources={[]} />
        <KnowledgeBaseSources baseName="Sales playbook" sources={[{ id: "1", name: "Renewal Playbook v3", section: "§4.1", href: "#a" }]} />
        <KnowledgeBaseCoverage level="partial" matches={3} />
        <KnowledgeBaseCoverage level="low" matches={0} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
    expect(screen.getByText(/Used 1 source from Sales playbook/)).toBeInTheDocument();
  });
});
