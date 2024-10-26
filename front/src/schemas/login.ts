"use client";

import { z } from "zod";

export const loginFormSchema = z.object({
  identity: z.string().email(),
  password: z.coerce.string().min(8),
});
