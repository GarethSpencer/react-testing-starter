import { render, screen } from "@testing-library/react";
import SearchBox from "../../src/components/SearchBox";
import userEvent from "@testing-library/user-event";

describe("SearchBox", () => {
  const renderSearchBox = () => {
    const onChange = vi.fn();
    render(<SearchBox onChange={onChange} />);
    return {
      input: screen.getByPlaceholderText(/search/i),
      user: userEvent.setup(),
      onChange: onChange,
    };
  };

  it("should render an empty input field", () => {
    const { input } = renderSearchBox();

    expect(input).toBeInTheDocument();
  });

  it("should call onChange when enter is pressed after typing", async () => {
    const { onChange, input, user } = renderSearchBox();

    const searchTerm = "Hello";
    await user.type(input, `${searchTerm}{enter}`);

    expect(onChange).toHaveBeenCalledWith(searchTerm);
  });

  it("should not call onChange when enter is pressed with empty input", async () => {
    const { onChange, input, user } = renderSearchBox();

    await user.type(input, "{enter}");

    expect(onChange).not.toHaveBeenCalled();
  });
});
