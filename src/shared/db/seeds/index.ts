import { db } from "@/shared/db";
import { appSettings } from "@/shared/entities/app-setting";

async function seedDatabase(): Promise<void> {
  const now = new Date();

  await db
    .insert(appSettings)
    .values({
      createdAt: now,
      description:
        "Deterministic site name setting for the template DB scaffold.",
      key: "site_name",
      updatedAt: now,
      value: "Vibe Next Template",
    })
    .onConflictDoNothing();
}

void seedDatabase();
