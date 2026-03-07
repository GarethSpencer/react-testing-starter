/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { render, screen } from "@testing-library/react";
import ProductForm from "../../src/components/ProductForm";
import AllProviders from "../AllProviders";
import { Category, Product } from "../../src/entities";
import { db } from "../mocks/db";
import userEvent from "@testing-library/user-event";
import { Toaster } from "react-hot-toast";

describe("ProductForm", () => {
  const categories: Category[] = [];
  beforeAll(() => {
    const category = db.category.create({ name: "Test Category" });
    categories.push(category);
  });
  afterAll(() => {
    const categoryIds = categories.map((c) => c.id);
    db.category.deleteMany({ where: { id: { in: categoryIds } } });
  });

  it("should render form fields", async () => {
    const { waitForFormToLoad } = renderComponent();
    const inputs = await waitForFormToLoad();

    expect(inputs.textbox).toBeInTheDocument();
    expect(inputs.price).toBeInTheDocument();
    expect(inputs.combobox).toBeInTheDocument();
  });

  it("should render with initial data when editing a product", async () => {
    const product: Product = {
      id: 1,
      name: "Test",
      price: 50,
      categoryId: categories[0].id,
    };

    const { waitForFormToLoad } = renderComponent(product);
    const inputs = await waitForFormToLoad();

    expect(inputs.textbox).toHaveValue(product.name);
    expect(inputs.price).toHaveValue(product.price.toString());
    expect(inputs.combobox).toHaveTextContent(categories[0].name);
  });

  it("should render the component with focussed textbox input", async () => {
    const { waitForFormToLoad } = renderComponent();
    const { textbox } = await waitForFormToLoad();

    expect(textbox).toHaveFocus();
  });

  it.each([
    {
      scenario: "missing",
      errorMessage: /required/i,
    },
    {
      scenario: "blank",
      name: " ",
      errorMessage: /required/i,
    },
    {
      scenario: "longer than 255 characters",
      name: "a".repeat(256),
      errorMessage: /255/i,
    },
  ])(
    "should display an error if the name is $scenario",
    async ({ name, errorMessage }) => {
      const { waitForFormToLoad, expectErrorToBeInTheDocument } =
        renderComponent();
      const form = await waitForFormToLoad();

      await form.fill({
        ...form.validData,
        name,
      });

      expectErrorToBeInTheDocument(errorMessage);
    },
  );

  it.each([
    {
      scenario: "missing",
      errorMessage: /required/i,
    },
    {
      scenario: "0",
      price: 0,
      errorMessage: /greater than/i,
    },
    {
      scenario: "negative",
      price: -1,
      errorMessage: /greater than/i,
    },
    {
      scenario: "1001",
      price: 1001,
      errorMessage: /1000/i,
    },
    {
      scenario: "not a number",
      price: NaN,
      errorMessage: /required/i,
    },
  ])(
    "should display an error if the value is $scenario",
    async ({ price, errorMessage }) => {
      const { waitForFormToLoad, expectErrorToBeInTheDocument } =
        renderComponent();
      const form = await waitForFormToLoad();

      await form.fill({
        ...form.validData,
        price,
      });

      expectErrorToBeInTheDocument(errorMessage);
    },
  );

  it("should submit the correct information", async () => {
    const { waitForFormToLoad, onSubmit } = renderComponent();
    const form = await waitForFormToLoad();

    await form.fill(form.validData);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
    const { id, ...formData } = form.validData;

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(formData);
  });

  it("should show toast popup when submission fails", async () => {
    const { waitForFormToLoad, onSubmit } = renderComponent();
    onSubmit.mockRejectedValue("error");
    const form = await waitForFormToLoad();

    await form.fill(form.validData);

    const popup = await screen.findByRole("status");
    expect(popup).toHaveTextContent(/error/i);
  });

  it("should disable button when form is submitted", async () => {
    const { waitForFormToLoad, onSubmit } = renderComponent();
    onSubmit.mockReturnValue(new Promise(() => {}));

    const form = await waitForFormToLoad();
    await form.fill(form.validData);

    expect(form.submitButton).toBeDisabled();
  });

  it("should re-enable button after submission", async () => {
    const { waitForFormToLoad, onSubmit } = renderComponent();
    onSubmit.mockReturnValue({});

    const form = await waitForFormToLoad();
    await form.fill(form.validData);

    expect(form.submitButton).not.toBeDisabled();
  });

  it("should re-enable button after submission", async () => {
    const { waitForFormToLoad, onSubmit } = renderComponent();
    onSubmit.mockRejectedValue("error");

    const form = await waitForFormToLoad();
    await form.fill(form.validData);

    expect(form.submitButton).not.toBeDisabled();
  });

  const renderComponent = (product?: Product) => {
    const onSubmit = vi.fn();
    render(
      <>
        <ProductForm onSubmit={onSubmit} product={product} />
        <Toaster />
      </>,
      {
        wrapper: AllProviders,
      },
    );

    const expectErrorToBeInTheDocument = (message: RegExp | string) => {
      const error = screen.getByRole("alert");
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent(message);
    };

    const waitForFormToLoad = async () => {
      await screen.findByRole("form");

      const textbox = screen.getByPlaceholderText(/name/i);
      const price = screen.getByPlaceholderText(/price/i);
      const combobox = screen.getByRole("combobox", { name: /category/i });
      const submitButton = screen.getByRole("button");

      type FormData = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [K in keyof Product]: any;
      };

      const validData: FormData = {
        id: 1,
        name: "Test Product",
        price: 10,
        categoryId: categories[0].id,
      };

      const fill = async (product: FormData) => {
        const user = userEvent.setup();

        if (product.name !== undefined) {
          await user.type(textbox, product.name);
        }

        if (product.price !== undefined) {
          await user.type(price, product.price.toString());
        }

        await user.tab();
        await user.click(combobox);
        const options = screen.getAllByRole("option");
        await user.click(options[0]);
        await user.click(submitButton);
      };

      return {
        textbox,
        price,
        combobox,
        submitButton,
        fill,
        validData,
      };
    };
    return { waitForFormToLoad, expectErrorToBeInTheDocument, onSubmit };
  };
});
