import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import { navigateTo } from "./utils";
import { db } from "./mocks/db";

describe("Router", () => {
  it("should render the home page for /", () => {
    navigateTo("/");

    const heading = screen.getByRole("heading", { name: /home/i });
    expect(heading).toBeInTheDocument();
  });

  it("should render the products page for /products", () => {
    navigateTo("/products");

    const heading = screen.getByRole("heading", { name: /products/i });
    expect(heading).toBeInTheDocument();
  });

  it("should render the product details page for /products/:id", async () => {
    const product = db.product.create();
    navigateTo(`/products/${product.id}`);

    const heading = await screen.findByRole("heading", {
      name: product.name,
    });
    expect(heading).toBeInTheDocument();

    db.product.delete({ where: { id: { equals: product.id } } });
  });

  it("should render the not found page when route is not found", () => {
    navigateTo("/invalid-route");

    const heading = screen.getByRole("heading", { name: /oops/i });
    expect(heading).toBeInTheDocument();
  });

  it("should render the admin home page for /admin", () => {
    navigateTo("/admin");

    const heading = screen.getByRole("heading", { name: /admin/i });
    expect(heading).toBeInTheDocument();
  });

  it("should render the admin products page for /admin/products", () => {
    navigateTo("/admin/products");

    const heading = screen.getByRole("heading", { name: /products/i });
    expect(heading).toBeInTheDocument();
  });

  it("should render the admin new product page for /admin/products/new", () => {
    navigateTo("/admin/products/new");

    const heading = screen.getByRole("heading", { name: /new product/i });
    expect(heading).toBeInTheDocument();
  });

  it("should render the admin new product page for /admin/products/:id/edit", async () => {
    const product = db.product.create();
    navigateTo(`/admin/products/${product.id}/edit`);

    const heading = await screen.findByRole("heading", {
      name: /edit product/i,
    });

    expect(heading).toBeInTheDocument();

    db.product.delete({ where: { id: { equals: product.id } } });
  });
});
