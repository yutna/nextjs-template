import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
  },
  client: {
    // NEXT_PUBLIC_* env vars go here
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },
});
