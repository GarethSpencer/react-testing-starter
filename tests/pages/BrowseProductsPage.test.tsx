import { Theme } from "@radix-ui/themes";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Category, Product } from "../../src/entities";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import { CartProvider } from "../../src/providers/CartProvider";
import { db, getProductsByCategory } from "../mocks/db";
import { simulateDelay, simulateError } from "../utils";
import AllProviders from "../AllProviders";

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

  it("should filter products from the selected category", async () => {
    const { selectCategory, expectProductsToBeInTheDocument } =
      renderComponent();

    const selectedCategory = categories[0];
    await selectCategory(selectedCategory.name);

    const products = getProductsByCategory(selectedCategory.id);
    expectProductsToBeInTheDocument(products);
  });

  it("should not filter products when the selected category is all", async () => {
    const { selectCategory, expectProductsToBeInTheDocument } =
      renderComponent();

    await selectCategory(/all/i);

    const products = db.product.getAll();
    expectProductsToBeInTheDocument(products);
  });
});

const renderComponent = () => {
  render(
    <CartProvider>
      <Theme>
        <BrowseProducts />
      </Theme>
    </CartProvider>,
    {
      wrapper: AllProviders,
    },
  );

  const getProductsSkeleton = () =>
    screen.queryByRole("progressbar", { name: /products/i });

  const getCategoriesSkeleton = () =>
    screen.queryByRole("progressbar", { name: /categories/i });

  const getCategoriesComboBox = () => screen.queryByRole("combobox");

  const getCategoryOption = (category: RegExp | string) =>
    screen.getByRole("option", { name: category });

  const getDataRows = () => screen.getAllByRole("row").slice(1);

  const selectCategory = async (name: RegExp | string) => {
    await waitForElementToBeRemoved(getCategoriesSkeleton);
    const dropdown = getCategoriesComboBox();
    const user = userEvent.setup();
    await user.click(dropdown!);
    const option = getCategoryOption(name);
    await user.click(option);
  };

  const expectProductsToBeInTheDocument = (products: Product[]) => {
    const dataRows = getDataRows();
    expect(dataRows).toHaveLength(products.length);
    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  };

  return {
    getProductsSkeleton,
    getCategoriesSkeleton,
    getCategoriesComboBox,
    selectCategory,
    expectProductsToBeInTheDocument,
  };
};
