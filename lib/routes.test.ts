import { describe, expect, it } from "vitest";
import { he } from "@/lib/strings/he";
import { isActivePath, isPublicPath, NAV_ITEMS } from "./routes";

describe("isPublicPath", () => {
  it("allows the sign-in page and the auth callback", () => {
    expect(isPublicPath("/sign-in")).toBe(true);
    expect(isPublicPath("/auth/callback")).toBe(true);
  });

  it("protects everything else, including look-alike paths", () => {
    expect(isPublicPath("/")).toBe(false);
    expect(isPublicPath("/roadmap")).toBe(false);
    expect(isPublicPath("/sign-in-other")).toBe(false);
    expect(isPublicPath("/authx")).toBe(false);
  });
});

describe("isActivePath", () => {
  it("matches the home link only on the home page", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/", "/lab")).toBe(false);
  });

  it("matches nested pages", () => {
    expect(isActivePath("/journal", "/journal/123")).toBe(true);
    expect(isActivePath("/lab", "/labs")).toBe(false);
  });
});

describe("navigation", () => {
  it("has a Hebrew label for every item", () => {
    for (const { key } of NAV_ITEMS) expect(he.nav[key]).toMatch(/[֐-׿]/);
  });
});
