import { describe, expect, it } from "vitest";
import { dayjs } from "./dayjs";

describe("dayjs", () => {
  it("parses and formats a date", () => {
    const date = dayjs("2025-01-01");
    expect(date.isValid()).toBe(true);
    expect(date.format("YYYY-MM-DD")).toBe("2025-01-01");
  });

  it("extends the utc plugin", () => {
    const date = dayjs.utc("2025-01-01T00:00:00Z");
    expect(date.isValid()).toBe(true);
    expect(date.isUTC()).toBe(true);
  });

  it("extends the timezone plugin and defaults to Asia/Bangkok", () => {
    const date = dayjs.utc("2025-01-01T00:00:00Z").tz();
    expect(date.isValid()).toBe(true);
    expect(date.format("Z")).toBe("+07:00");
  });

  it("extends the buddhistEra plugin", () => {
    const date = dayjs("2025-01-01");
    expect(date.format("BBBB")).toBe("2568");
  });

  it("extends the customParseFormat plugin", () => {
    const date = dayjs("01-01-2025", "DD-MM-YYYY");
    expect(date.isValid()).toBe(true);
    expect(date.format("YYYY-MM-DD")).toBe("2025-01-01");
  });

  it("uses Thai locale by default", () => {
    expect(dayjs.locale()).toBe("th");
  });
});
