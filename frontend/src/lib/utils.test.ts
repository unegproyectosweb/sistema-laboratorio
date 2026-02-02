import { describe, expect, it } from "vitest";
import { getInitials } from "./utils";

describe("utils", () => {
  describe("getInitials", () => {
    it("should return initials for a name", () => {
      expect(getInitials("John Doe")).toBe("JD");
    });

    it("should return initials for a single name", () => {
      expect(getInitials("John")).toBe("J");
    });

    it("should return at most 2 initials", () => {
      expect(getInitials("John Doe Smith")).toBe("JD");
    });

    it("should return empty string for empty input", () => {
      expect(getInitials("")).toBe("");
    });
  });
});
