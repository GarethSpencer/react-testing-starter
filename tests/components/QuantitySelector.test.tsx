import { render, screen } from "@testing-library/react";
import QuantitySelector from "../../src/components/QuantitySelector";
import { CartProvider } from "../../src/providers/CartProvider";
import { Product } from "../../src/entities";
import userEvent from "@testing-library/user-event";

describe("QuantitySelector", () => {
  const renderComponent = (product: Product) => {
    render(
      <CartProvider>
        <QuantitySelector product={product} />
      </CartProvider>,
    );

    const getInitialButton = () =>
      screen.getByRole("button", { name: /add to cart/i });

    const getQuantityControls = () => ({
      cartTotal: screen.queryByRole("status"),
      minusButton: screen.queryByRole("button", { name: "-" }),
      plusButton: screen.queryByRole("button", { name: "+" }),
    });

    const user = userEvent.setup();

    const addToCart = async () => {
      const button = getInitialButton();
      await user.click(button);
    };

    const increaseQuantity = async () => {
      const { plusButton } = getQuantityControls();
      await user.click(plusButton!);
    };

    const decreaseQuantity = async () => {
      const { minusButton } = getQuantityControls();
      await user.click(minusButton!);
    };

    return {
      addToCart,
      getInitialButton,
      increaseQuantity,
      decreaseQuantity,
      getQuantityControls,
    };
  };

  const testProduct: Product = {
    id: 1,
    name: "Test Product",
    price: 50,
    categoryId: 1,
  };

  it("should render the 'add to cart' button", () => {
    const { getInitialButton } = renderComponent(testProduct);

    expect(getInitialButton()).toBeInTheDocument();
  });

  it("should add product to cart and show total when button is clicked", async () => {
    const { getQuantityControls, addToCart } = renderComponent(testProduct);

    await addToCart();

    const { cartTotal, minusButton, plusButton } = getQuantityControls();
    expect(cartTotal).toHaveTextContent("1");
    expect(minusButton).toBeInTheDocument();
    expect(plusButton).toBeInTheDocument();
  });

  it("should add two products to cart and show total when + button is clicked", async () => {
    const { getQuantityControls, addToCart, increaseQuantity } =
      renderComponent(testProduct);

    await addToCart();
    await increaseQuantity();

    const { cartTotal } = getQuantityControls();
    expect(cartTotal).toHaveTextContent("2");
  });

  it("should remove product from the cart and still show one when - button is clicked", async () => {
    const {
      getQuantityControls,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
    } = renderComponent(testProduct);

    await addToCart();
    await increaseQuantity();
    await decreaseQuantity();

    const { cartTotal } = getQuantityControls();
    expect(cartTotal).toHaveTextContent("1");
  });

  it("should remove from cart and revert button when - button is clicked", async () => {
    const {
      getQuantityControls,
      addToCart,
      decreaseQuantity,
      getInitialButton,
    } = renderComponent(testProduct);

    await addToCart();
    await decreaseQuantity();

    const { cartTotal, plusButton, minusButton } = getQuantityControls();

    expect(cartTotal).not.toBeInTheDocument();
    expect(minusButton).not.toBeInTheDocument();
    expect(plusButton).not.toBeInTheDocument();
    expect(getInitialButton()).toBeInTheDocument();
  });
});
