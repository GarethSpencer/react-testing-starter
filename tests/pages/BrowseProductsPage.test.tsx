import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import { Theme } from "@radix-ui/themes";
import userEvent from "@testing-library/user-event";
import { db } from "../mocks/db";
import { Category, Product } from "../../src/entities";
import { CartProvider } from "../../src/providers/CartProvider";
import { simulateDelay, simulateError } from "../utils";

describe("BrowseProductsPage", () => {
  const categories: Category[] = [];
  const products: Product[] = [];
  beforeAll(() => {
    [1, 2].forEach((item) => {
      const category = db.category.create({ name: "Category " + item });
      categories.push(category);
      [1, 2].forEach(() => {
        const product = db.product.create({ categoryId: category.id });
        products.push(product);
      });
    });
  });
  afterAll(() => {
    const categoryIds = categories.map((c) => c.id);
    db.category.deleteMany({ where: { id: { in: categoryIds } } });
    const productIds = products.map((p) => p.id);
    db.product.deleteMany({ where: { id: { in: productIds } } });
  });

  const renderComponent = () => {
    render(
      <CartProvider>
        <Theme>
          <BrowseProducts />
        </Theme>
      </CartProvider>,
    );

    return {
      getProductsSkeleton: () =>
        screen.queryByRole("progressbar", { name: /products/i }),
      getCategoriesSkeleton: () =>
        screen.queryByRole("progressbar", { name: /categories/i }),
      getCategoriesComboBox: () => screen.queryByRole("combobox"),
    };
  };

  it("should show loading skeletons when fetching the categories", () => {
    simulateDelay("/categories");
    const { getCategoriesSkeleton } = renderComponent();

    const skeleton = getCategoriesSkeleton();
    expect(skeleton).toBeInTheDocument();
  });

  it("should hide loading skeletons once the categories are fetched", async () => {
    simulateDelay("/categories");
    const { getCategoriesSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);
  });

  it("should show loading skeletons when fetching the products", () => {
    simulateDelay("/products");
    const { getProductsSkeleton } = renderComponent();

    const skeleton = getProductsSkeleton();
    expect(skeleton).toBeInTheDocument();
  });

  it("should hide loading skeletons once the products are fetched", async () => {
    simulateDelay("/products");
    const { getProductsSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getProductsSkeleton);
  });

  it("should not render an error when the categories cannot be fetched", async () => {
    simulateError("/categories");
    simulateDelay("/products");
    const { getCategoriesSkeleton, getCategoriesComboBox } = renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);
    const message = screen.queryByText(/error/i);
    expect(message).not.toBeInTheDocument();

    const dropdown = getCategoriesComboBox();
    expect(dropdown).not.toBeInTheDocument();
  });

  it("should render an error when the products cannot be fetched", async () => {
    simulateError("/products");
    simulateDelay("/categories");
    renderComponent();

    const message = await screen.findByText(/error/i);
    expect(message).toBeInTheDocument();
  });

  it("should render categories", async () => {
    const { getCategoriesSkeleton, getCategoriesComboBox } = renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);
    const dropdown = getCategoriesComboBox();
    expect(dropdown).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(dropdown!);

    const options = screen.getByRole("option", { name: /all/i });
    expect(options).toBeInTheDocument();

    categories.forEach((category) => {
      const option = screen.getByRole("option", { name: category.name });
      expect(option).toBeInTheDocument();
    });
  });

  it("should render products", async () => {
    const { getProductsSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getProductsSkeleton);

    products.forEach((product) => {
      const option = screen.getByText(product.name);
      expect(option).toBeInTheDocument();
    });
  });
});
