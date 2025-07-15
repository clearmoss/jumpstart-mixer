import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
    expect(cn("foo", undefined, "bar", null, false, "")).toBe("foo bar");
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn(["foo", "bar"], "boo")).toBe("foo bar boo");
    expect(cn({ foo: true, bar: false, boo: true })).toBe("foo boo");
  });
});
