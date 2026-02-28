import { render, screen } from "@testing-library/react";
import ToastDemo from "../../src/components/ToastDemo";
import userEvent from "@testing-library/user-event";
import { Toaster } from "react-hot-toast";

describe("ToastDemo", () => {
  it("should popup a notification when clicked", async () => {
    render(
      <>
        <ToastDemo />
        <Toaster />
      </>,
    );
    const button = screen.getByRole("button", { name: /show/i });
    const user = userEvent.setup();
    await user.click(button);

    const popup = await screen.findByText(/success/i);
    expect(popup).toBeInTheDocument();
  });
});
