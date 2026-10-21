import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Md3SideSheet, Md3SideSheetHeader, Md3SideSheetBody, Md3SideSheetActions } from "./index";
import { Md3Button } from "@nucleux/md3-button";

const meta = {
  title: "Material 3/SideSheet",
  component: Md3SideSheet,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Md3SideSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const filters = ["In stock", "On sale", "Free shipping", "New arrivals"];

function FilterList() {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-sm font-medium text-md-on-surface">Show only</legend>
      {filters.map((f) => (
        <label key={f} className="flex items-center gap-3 text-md-on-surface">
          <input type="checkbox" className="size-4 accent-md-primary" />
          {f}
        </label>
      ))}
    </fieldset>
  );
}

export const Standard: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="flex h-[480px] bg-md-surface">
        <main className="flex-1 p-6 text-md-on-surface">
          <h1 className="mb-4 text-2xl">Products</h1>
          <Md3Button variant="tonal" onClick={() => setOpen((o) => !o)}>
            {open ? "Hide filters" : "Show filters"}
          </Md3Button>
        </main>
        <Md3SideSheet open={open} onOpenChange={setOpen} divider className="w-80">
          <Md3SideSheetHeader>Filters</Md3SideSheetHeader>
          <Md3SideSheetBody>
            <FilterList />
          </Md3SideSheetBody>
        </Md3SideSheet>
      </div>
    );
  },
};

export const Modal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="h-[480px] bg-md-surface p-6">
        <Md3Button onClick={() => setOpen(true)}>Edit filters</Md3Button>
        <Md3SideSheet variant="modal" open={open} onOpenChange={setOpen}>
          <Md3SideSheetHeader>Filters</Md3SideSheetHeader>
          <Md3SideSheetBody>
            <FilterList />
          </Md3SideSheetBody>
          <Md3SideSheetActions>
            <Md3Button onClick={() => setOpen(false)}>Apply</Md3Button>
            <Md3Button variant="outlined" onClick={() => setOpen(false)}>
              Cancel
            </Md3Button>
          </Md3SideSheetActions>
        </Md3SideSheet>
      </div>
    );
  },
};

export const ModalLeftWithBack: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"list" | "detail">("list");
    return (
      <div className="h-[480px] bg-md-surface p-6">
        <Md3Button onClick={() => setOpen(true)}>Open settings</Md3Button>
        <Md3SideSheet variant="modal" side="left" open={open} onOpenChange={setOpen}>
          <Md3SideSheetHeader onBack={step === "detail" ? () => setStep("list") : undefined}>
            {step === "list" ? "Settings" : "Notifications"}
          </Md3SideSheetHeader>
          <Md3SideSheetBody>
            {step === "list" ? (
              <Md3Button variant="text" onClick={() => setStep("detail")}>
                Notifications
              </Md3Button>
            ) : (
              <p>Choose which updates you want to hear about.</p>
            )}
          </Md3SideSheetBody>
        </Md3SideSheet>
      </div>
    );
  },
};
