import { createSafeActionClient } from "next-safe-action";

import { handleServerError } from "./helpers";

export const actionClient = createSafeActionClient({
  handleServerError,
});
