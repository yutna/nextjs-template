import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { appSettings } from "./app-setting";

export type AppSetting = InferSelectModel<typeof appSettings>;
export type NewAppSetting = InferInsertModel<typeof appSettings>;
