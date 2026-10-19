import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@nucleux/button";
import { Checkbox } from "@nucleux/checkbox";
import { Input } from "@nucleux/input";
import { Textarea } from "@nucleux/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "./index";

const meta = {
  title: "Primitives/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <form className="w-[26rem]" onSubmit={(e) => e.preventDefault()}>
      <FieldSet>
        <FieldLegend>Profile</FieldLegend>
        <FieldDescription>This is shown to people you share a workspace with.</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="story-name">Full name</FieldLabel>
            <Input id="story-name" placeholder="Ada Lovelace" />
          </Field>
          <Field data-invalid="true">
            <FieldLabel htmlFor="story-email">Email</FieldLabel>
            <Input id="story-email" type="email" defaultValue="ada@" aria-invalid="true" aria-describedby="story-email-error" />
            <FieldError id="story-email-error" errors={[{ message: "Enter a valid email address." }]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="story-bio">Bio</FieldLabel>
            <Textarea id="story-bio" aria-describedby="story-bio-help" />
            <FieldDescription id="story-bio-help">A sentence or two about your work.</FieldDescription>
          </Field>
          <FieldSeparator />
          <Field orientation="horizontal">
            <Checkbox id="story-updates" aria-labelledby="story-updates-label" />
            <FieldContent>
              <FieldLabel id="story-updates-label" htmlFor="story-updates">Product updates</FieldLabel>
              <FieldDescription>A short email when something ships.</FieldDescription>
            </FieldContent>
          </Field>
          <Field orientation="horizontal">
            <Button type="submit">Save</Button>
            <Button variant="secondary">Cancel</Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  ),
};

export const Responsive: Story = {
  render: () => (
    <FieldGroup className="w-[40rem]">
      <Field orientation="responsive">
        <FieldContent>
          <FieldLabel htmlFor="story-workspace">Workspace name</FieldLabel>
          <FieldDescription>Shown in the sidebar and in invites.</FieldDescription>
        </FieldContent>
        <Input id="story-workspace" defaultValue="Research" />
      </Field>
    </FieldGroup>
  ),
};

export const MultipleErrors: Story = {
  render: () => (
    <Field data-invalid="true" className="w-[26rem]">
      <FieldLabel htmlFor="story-password">Password</FieldLabel>
      <Input id="story-password" type="password" aria-invalid="true" />
      <FieldError
        errors={[
          { message: "Use at least 12 characters." },
          { message: "Include a number." },
          { message: "Use at least 12 characters." },
        ]}
      />
    </Field>
  ),
};
