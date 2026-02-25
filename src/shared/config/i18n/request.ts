import { getRequestConfig } from "next-intl/server";
import { messages } from "@/shared/messages";

export default getRequestConfig(async () => {
  // Static for now, we'll change this later
  const locale = "en";

  return {
    locale,
    messages: messages[locale],
  };
});
