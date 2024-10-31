import React, { useState } from "react";

import { Input } from "../../components/ui/input.tsx";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { Button } from "../../components/ui/button.tsx";
import { useFieldArray } from "react-hook-form";
import {
  basePayload,
  type PostRequestPayloadSchema,
  postRequestPayloadSchema,
  useZodForm,
} from "../../zod/postRequestPayload.ts";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "../../components/ui/form.tsx";
import { z } from "zod";

export default function PostRequestPayloadForm() {
  const [payload, setPayload] = useState<PostRequestPayloadSchema[]>(() =>
    basePayload
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
    console.log(values);
    setPayload(values.payload);
    form.reset(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex justify-around items-center"
          >
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
            <span className="mx-2" />
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
            <span className="mx-1" />
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
        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={!isSubmittable}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
