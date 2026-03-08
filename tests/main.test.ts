import { it, describe } from "vitest";
import { db } from "./mocks/db";

describe("group", () => {
  it("should", () => {
    const product = db.product.create({ name: "Apple" });
    db.product.create({ name: "Apple2" });

    console.log(db.product.delete({ where: { id: { equals: product.id } } }));
  });
});
