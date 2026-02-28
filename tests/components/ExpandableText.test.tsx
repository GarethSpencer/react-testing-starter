import { render, screen } from "@testing-library/react";
import ExpandableText from "../../src/components/ExpandableText";
import userEvent from "@testing-library/user-event";

describe("ExpandableText", () => {
  const limit = 255;
  const longTestString = "A".repeat(limit + 1);
  const truncatedTestString = longTestString.substring(0, 255) + "...";

  it("should render full test input when length is under 255 characters", () => {
    const testString = "This is my short test string.";
    render(<ExpandableText text={testString} />);
    const text = screen.getByText(testString);
    expect(text).toBeInTheDocument();
  });

  it("should render truncated input when length is over 255 characters", () => {
    render(<ExpandableText text={longTestString} />);

    const text = screen.getByText(truncatedTestString);
    expect(text).toBeInTheDocument();

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/more/i);
  });

  it("should render full input when button is clicked", async () => {
    render(<ExpandableText text={longTestString} />);

    const button = screen.getByRole("button");
    const user = userEvent.setup();
    await user.click(button);

    const text = screen.getByText(longTestString);
    expect(text).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/less/i);
  });

  it("should collapse text when show less button is clicked", async () => {
    render(<ExpandableText text={longTestString} />);
    const showMoreButton = screen.getByRole("button", { name: /more/i });
    const user = userEvent.setup();
    await user.click(showMoreButton);

    const showLessButton = screen.getByRole("button", { name: /less/i });
    await user.click(showLessButton);

    const text = screen.getByText(truncatedTestString);
    expect(text).toBeInTheDocument();
    expect(showLessButton).toBeInTheDocument();
    expect(showLessButton).toHaveTextContent(/more/i);
  });
});
