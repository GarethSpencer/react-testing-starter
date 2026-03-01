import { render, screen } from "@testing-library/react";
import ProductDetail from "../../src/components/ProductDetail";
import { products } from "../mocks/data";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

describe("ProductDetail", () => {
  it("should return the correct product matching the input id", async () => {
    render(<ProductDetail productId={1} />);

    const name = await screen.findByText(new RegExp(products[0].name));
    expect(name).toBeInTheDocument();

    const price = await screen.findByText(
      new RegExp(products[0].price.toString()),
    );
    expect(price).toBeInTheDocument();
  });

  it("should not find a product outside the array", async () => {
    server.use(http.get("/products/4", () => HttpResponse.json(null)));

    render(<ProductDetail productId={4} />);

    const message = await screen.findByText(/not found/i);
    expect(message).toBeInTheDocument();
  });

  it("should return error with invalid product id", async () => {
    render(<ProductDetail productId={0} />);

    const message = await screen.findByText(/invalid/i);
    expect(message).toBeInTheDocument();
  });
});
