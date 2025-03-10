import React, { useState } from "react";

import { Input } from "../../components/ui/input";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { Button } from "../../components/ui/button";
import { useFieldArray } from "react-hook-form";
import {
  basePayload,
  type PostRequestPayloadSchema,
  postRequestPayloadSchema,
  useZodForm,
} from "../../zod/postRequestPayload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "../../components/ui/form";
import { z } from "zod";
import { POST } from "../Drawers/POST";
import Drawer from "../Drawers";
import { useParams } from "next/navigation";

export default function PostRequestPayloadForm() {
  const { id } = useParams();

  const [payload, setPayload] = useState<PostRequestPayloadSchema[]>(
    () => basePayload,
  );

  const form = useZodForm({
    schema: postRequestPayloadSchema,
    defaultValues: { payload },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    name: "payload",
    control: form.control,
  });

  const isSubmittable = !!form.formState.isDirty && !!form.formState.isValid;

  const onSubmit = (values: z.infer<typeof postRequestPayloadSchema>) => {
    setPayload(values.payload);
    form.reset(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <div key={field.id} className="w-full">
            <FormField
              control={form.control}
              name={`payload.${index}.key`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Key" />
                  </FormControl>
                </FormItem>
              )}
            />
            <span>:</span>
            <FormField
              control={form.control}
              name={`payload.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Value" />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              onClick={() => remove(index)}
              variant="ghost"
              className="hover:bg-destructive"
            >
              <TrashIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Remove Field</span>
            </Button>
          </div>
        ))}
        <Button
          onClick={() => append({ ...basePayload })}
          variant="outline"
          className="w-full"
        >
          <PlusIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">New Field</span>
        </Button>

        <Drawer
          content={
            <POST containerId={id as string} payload={form.getValues()} />
          }
          disabled={!isSubmittable}
        >
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={!isSubmittable}
          >
            Submit
          </Button>
        </Drawer>
      </form>
    </Form>
  );
}
