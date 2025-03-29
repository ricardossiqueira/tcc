"use client";

import { z } from "zod";

import { useForm, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const postRequestPayloadSchema = z.object({
  payload: z.array(
    z.object({
      key: z.string(),
      value: z.any().nullable(),
    }),
  ),
});

export type PostRequestPayloadSchema = z.infer<
  typeof postRequestPayloadSchema
>["payload"][number];

export const basePayload: PostRequestPayloadSchema[] = [
  {
    key: "",
    value: null,
  },
];

export function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
    schema: TSchema;
  },
) {
  const form = useForm<TSchema["_input"]>({
    ...props,
    resolver: zodResolver(props.schema, undefined, {
      // This makes it so we can use `.transform()`s on the schema without same transform getting applied again when it reaches the server
      raw: true,
    }),
  });

  return form;
}

// JSON free input field
export const postRequestRawJSONSchema = z
  .object({
    payload: z.string(),
  })
  .superRefine(({ payload }, ctx) => {
    try {
      JSON.parse(payload as string);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Payload must be a valid JSON",
        path: ["payload"],
      });
    }
  });

export type PostRequestRawJSONSchema = z.infer<typeof postRequestRawJSONSchema>;
