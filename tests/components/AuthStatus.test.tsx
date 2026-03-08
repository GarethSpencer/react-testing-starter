import { render, screen } from "@testing-library/react";
import AuthStatus from "../../src/components/AuthStatus";
import { mockAuthState } from "../utils";

describe("AuthStatus", () => {
  it("should render loading message on initializing component", () => {
    mockAuthState({
      isLoading: true,
      isAuthenticated: false,
      user: undefined,
    });

    render(<AuthStatus />);

    const message = screen.getByText(/loading/i);
    expect(message).toBeInTheDocument();
  });

  it("should render user name for authenticated user", () => {
    mockAuthState({
      isLoading: false,
      isAuthenticated: true,
      user: { name: "Bob Smith" },
    });

    render(<AuthStatus />);

    const message = screen.getByText(/bob smith/i);
    expect(message).toBeInTheDocument();
    const logoutButton = screen.getByRole("button", {
      name: /log out/i,
    });
    expect(logoutButton).toBeInTheDocument();
    const loginButton = screen.queryByRole("button", { name: /log in/i });
    expect(loginButton).not.toBeInTheDocument();
  });

  it("should render login button when user is not authenticated", () => {
    mockAuthState({
      isLoading: false,
      isAuthenticated: false,
      user: undefined,
    });

    render(<AuthStatus />);

    const loginButton = screen.getByRole("button", {
      name: /log in/i,
    });
    expect(loginButton).toBeInTheDocument();
    const logoutButton = screen.queryByRole("button", {
      name: /log out/i,
    });
    expect(logoutButton).not.toBeInTheDocument();
  });
});
