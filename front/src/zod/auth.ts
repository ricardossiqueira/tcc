"use client";

import { z } from "zod";

export const loginFormSchema = z.object({
  identity: z.string().email(),
  password: z.coerce.string().min(8),
});

export const registerFormSchema = z
  .object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.coerce.string().min(8),
    passwordConfirm: z.string().min(8),
  })
  .superRefine(({ passwordConfirm, password }, ctx) => {
    if (password !== passwordConfirm) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["passwordConfirm"],
      });
    }
  });
