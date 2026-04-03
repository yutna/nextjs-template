import { beforeAll, beforeEach } from "vitest";

import { dbIsolation } from "@/shared/lib/db-isolation";

beforeAll(async function prepareDbStateForTestProcess(): Promise<void> {
  await dbIsolation.prepare?.();
});

beforeEach(async function resetDbStateForTest(): Promise<void> {
  await dbIsolation.reset();
});
