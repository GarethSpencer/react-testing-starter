import { it, expect, describe } from "vitest";

describe("group", () => {
  it("should", async () => {
    const response = await fetch("/categories");
    const data = await response.json();
    expect(data).toHaveLength(3);
  });
});
