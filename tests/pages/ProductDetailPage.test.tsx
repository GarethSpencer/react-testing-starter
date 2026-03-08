import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import { db } from "../mocks/db";
import { navigateTo } from "../utils";
import { Product } from "../../src/entities";

describe("ProductDetailPage", () => {
  let product: Product;

  beforeAll(() => {
    product = db.product.create();
  });
  afterAll(() => {
    db.product.delete({ where: { id: { equals: product.id } } });
  });

  it("should initially load the page", async () => {
    navigateTo(`/products/${product.id}`);

    const loading = await screen.findByText(/loading/i);
    expect(loading).toBeInTheDocument();
  });

  it("should render product details", async () => {
    navigateTo(`/products/${product.id}`);

    await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

    const heading = screen.getByRole("heading", {
      name: product.name,
    });
    expect(heading).toBeInTheDocument();

    const price = await screen.findByText("$" + product.price);
    expect(price).toBeInTheDocument();
  });

  it("should show a not found message when the product is not found", async () => {
    navigateTo(`/products/0`);

    await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

    const message = await screen.findByText(/not found/i);
    expect(message).toBeInTheDocument();
  });
});
