import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import CategoryList from "../../src/components/CategoryList";
import { Category } from "../../src/entities";
import { db } from "../mocks/db";
import { simulateDelay, simulateError } from "../utils";
import AllProviders from "../AllProviders";

describe("CategoryList", () => {
  const categories: Category[] = [];

  beforeAll(() => {
    [1, 2].forEach(() => {
      const category = db.category.create();
      categories.push(category);
    });
  });
  afterAll(() => {
    const categoryIds = categories.map((x) => x.id);
    db.category.deleteMany({ where: { id: { in: categoryIds } } });
  });

  const renderComponent = () =>
    render(<CategoryList />, { wrapper: AllProviders });

  it("should show loading indicator when component is first loaded", async () => {
    simulateDelay("/categories");
    renderComponent();

    const message = await screen.findByText(/loading/i);
    expect(message).toBeInTheDocument();
  });

  it("should show categories after they are loaded", async () => {
    renderComponent();

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

    for (const category of categories) {
      const text = await screen.findByText(category.name);
      expect(text).toBeInTheDocument();
    }

    screen.debug();
  });

  it("should show error message when there is an error", async () => {
    simulateError("/categories");
    renderComponent();

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

    const message = await screen.findByText(/error/i);
    expect(message).toBeInTheDocument();
  });
});
