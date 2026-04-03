import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_TEST: process.env.DATABASE_URL_TEST,
    DB_TEST_ISOLATION_STRATEGY: process.env.DB_TEST_ISOLATION_STRATEGY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  server: {
    DATABASE_URL: z.string().optional(),
    DATABASE_URL_TEST: z.string().optional(),
    DB_TEST_ISOLATION_STRATEGY: z
      .enum(["noop", "sqlite-file-reset"])
      .optional(),
    NODE_ENV: z.enum(["development", "production", "test"]),
  },
});
