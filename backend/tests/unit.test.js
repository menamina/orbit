import { describe, it, expect } from "@jest/globals";
import {
  validateAndNormalizeDate,
  shouldCreateNewCycle,
} from "../controls/cycleControl.js";

describe("validateAndNormalizeDate", () => {
  it("should normalize a valid date to midnight", () => {
    const inputDate = new Date("2024-03-15T14:30:00");
    const result = validateAndNormalizeDate(inputDate.toISOString());

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(15);
    expect(result.getMonth()).toBe(2);
    expect(result.getFullYear()).toBe(2024);
  });

  it("should throw error if date is missing", () => {
    expect(() => validateAndNormalizeDate(null)).toThrow("Date is required");
    expect(() => validateAndNormalizeDate(undefined)).toThrow(
      "Date is required",
    );
  });

  it("should throw error if date format is invalid", () => {
    expect(() => validateAndNormalizeDate("invalid-date")).toThrow(
      "Invalid date format",
    );
    expect(() => validateAndNormalizeDate("not a date")).toThrow(
      "Invalid date format",
    );
  });

  it("should throw error if date is in the future", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Tomorrow

    expect(() => validateAndNormalizeDate(futureDate.toISOString())).toThrow(
      "Cannot track beyond today's date",
    );
  });

  it("should accept today's date", () => {
    const today = new Date();
    const result = validateAndNormalizeDate(today.toISOString());

    expect(result.getDate()).toBe(today.getDate());
    expect(result.getMonth()).toBe(today.getMonth());
    expect(result.getFullYear()).toBe(today.getFullYear());
  });

  it("should accept past dates", () => {
    const pastDate = new Date("2023-01-15T12:00:00");
    const result = validateAndNormalizeDate(pastDate.toISOString());

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(0);
  });
});

describe("shouldCreateNewCycle", () => {
  it("should return true if there is no previous cycle", () => {
    const result = shouldCreateNewCycle(null, new Date());
    expect(result).toBe(true);
  });

  it("should return true if new date is before the last cycle (negative days)", () => {
    const lastCycle = {
      startDate: new Date("2024-03-15"),
    };
    const newDate = new Date("2024-03-10"); // 5 days before

    const result = shouldCreateNewCycle(lastCycle, newDate);
    expect(result).toBe(true);
  });

  it("should return true if more than 10 days have passed", () => {
    const lastCycle = {
      startDate: new Date("2024-03-01"),
    };
    const newDate = new Date("2024-03-15");

    const result = shouldCreateNewCycle(lastCycle, newDate);
    expect(result).toBe(true);
  });

  it("should return false if 10 days or fewer have passed", () => {
    const lastCycle = {
      startDate: new Date("2024-03-01"),
    };

    const tenDaysLater = new Date("2024-03-11");
    expect(shouldCreateNewCycle(lastCycle, tenDaysLater)).toBe(false);

    const fiveDaysLater = new Date("2024-03-06");
    expect(shouldCreateNewCycle(lastCycle, fiveDaysLater)).toBe(false);

    const oneDayLater = new Date("2024-03-02");
    expect(shouldCreateNewCycle(lastCycle, oneDayLater)).toBe(false);
  });

  it("should return false for same day tracking", () => {
    const lastCycle = {
      startDate: new Date("2024-03-15"),
    };
    const sameDate = new Date("2024-03-15");

    const result = shouldCreateNewCycle(lastCycle, sameDate);
    expect(result).toBe(false);
  });

  it("should handle edge case at exactly 11 days (should create new cycle)", () => {
    const lastCycle = {
      startDate: new Date("2024-03-01"),
    };
    const elevenDaysLater = new Date("2024-03-12");

    const result = shouldCreateNewCycle(lastCycle, elevenDaysLater);
    expect(result).toBe(true);
  });
});
