import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "@/components/ui/toaster";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Toast",
  component: Toast,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {},
  decorators: [
    (Story) => (
      <div>
        <Story />
        <Toaster />
      </div>
    ),
  ],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Template: Story = () => {
  const { toast } = useToast();
  return (
    <>
      <Button
        onClick={() => {
          toast({
            title: "Template titl",
            description: "Template description",
          });
        }}
      >
        Show Toast
      </Button>
    </>
  );
};
