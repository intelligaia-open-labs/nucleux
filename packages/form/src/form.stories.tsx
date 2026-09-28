import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./index";

const meta = {
  title: "Data/Form",
  component: Form,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Form>;

export default meta;
// Loose story type: Form is FormProvider (needs a full useForm() return), so the
// story wires it up in `render` rather than via serializable `args`.
type Story = StoryObj;

const schema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters."),
});

function FormDemo() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { username: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})} className="w-72 space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <input
                  {...field}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Submit
        </button>
      </form>
    </Form>
  );
}

export const WithValidation: Story = { render: () => <FormDemo /> };
