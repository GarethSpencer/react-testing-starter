import { render, screen } from "@testing-library/react";
import UserAccount from "../../src/components/UserAccount";
import { User } from "../../src/entities";

describe("UserAccount", () => {
  it("should render a user profile heading and the user name", () => {
    const testUser: User = {
      id: 1,
      name: "Gareth",
    };
    render(<UserAccount user={testUser} />);
    const heading = screen.getByRole("heading");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/user profile/i);

    const name = screen.getByText(testUser.name);
    expect(name).toBeInTheDocument();
  });

  it("should render an edit button when user is an admin", () => {
    const testUser: User = {
      id: 1,
      name: "Gareth",
      isAdmin: true,
    };
    render(<UserAccount user={testUser} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/edit/i);
  });

  it("should not render an edit button when user is not an admin", () => {
    const testUser: User = {
      id: 1,
      name: "Gareth",
      isAdmin: false,
    };
    render(<UserAccount user={testUser} />);
    const button = screen.queryByRole("button");
    expect(button).not.toBeInTheDocument();
  });
});
