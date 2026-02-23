import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient();

export const authActionClient = actionClient.use(async ({ next }) => {
  // Add auth check here when needed
  return next();
});
