import { actionClient } from "./action-client";

export const authActionClient = actionClient.use(async ({ next }) => {
  // Add auth check here when needed
  return next();
});
