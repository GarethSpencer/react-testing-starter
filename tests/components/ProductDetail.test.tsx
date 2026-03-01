import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import ProductDetail from "../../src/components/ProductDetail";
import { server } from "../mocks/server";
import { http, HttpResponse, delay } from "msw";
import { db } from "../mocks/db";
import AllProviders from "../AllProviders";

describe("ProductDetail", () => {
  const productIds: number[] = [];
  beforeAll(() => {
    [1, 2, 3].forEach(() => {
      const product = db.product.create();
      productIds.push(product.id);
    });
  });
  afterAll(() => {
    db.product.deleteMany({ where: { id: { in: productIds } } });
  });

  it("should return the correct product matching the input id", async () => {
    render(<ProductDetail productId={productIds[0]} />, {
      wrapper: AllProviders,
    });

    const product = db.product.findFirst({
      where: { id: { equals: productIds[0] } },
    });

    const name = await screen.findByText(new RegExp(product!.name));
    expect(name).toBeInTheDocument();

    const price = await screen.findByText(
      new RegExp(product!.price.toString()),
    );
    expect(price).toBeInTheDocument();
  });

  it("should not find a product outside the array", async () => {
    server.use(http.get("/products/4", () => HttpResponse.json(null)));

    render(<ProductDetail productId={4} />, {
      wrapper: AllProviders,
    });

    const message = await screen.findByText(/not found/i);
    expect(message).toBeInTheDocument();
  });

  it("should render error message when there is an error", async () => {
    server.use(http.get("/products/1", () => HttpResponse.error()));

    render(<ProductDetail productId={1} />, {
      wrapper: AllProviders,
    });

    const message = await screen.findByText(/error/i);
    expect(message).toBeInTheDocument();
  });

  it("should render invalid message with invalid product id", async () => {
    render(<ProductDetail productId={0} />, {
      wrapper: AllProviders,
    });

    const message = await screen.findByText(/not found/i);
    expect(message).toBeInTheDocument();
  });

  it("should render a loading indicator when fetching data", async () => {
    server.use(
      http.get("/products/1", async () => {
        await delay();
        return HttpResponse.json(null);
      }),
    );

    render(<ProductDetail productId={1} />, {
      wrapper: AllProviders,
    });
    const message = await screen.findByText(/loading/i);
    expect(message).toBeInTheDocument();
  });

  it("should remove the loading indicator after the data is fetched", async () => {
    render(<ProductDetail productId={productIds[0]} />, {
      wrapper: AllProviders,
    });

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });

  it("should remove the loading indicator if data fetching fails", async () => {
    server.use(http.get("/products/4", () => HttpResponse.error()));

    render(<ProductDetail productId={4} />, {
      wrapper: AllProviders,
    });
    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });
});
