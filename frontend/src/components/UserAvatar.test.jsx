import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserAvatar, getUserInitials } from "./UserAvatar.jsx";

describe("user avatar", () => {
  it("builds initials from a full name", () => {
    expect(getUserInitials("Alex Student", "alex@test.local")).toBe("AS");
  });

  it("uses the email as a fallback source for initials", () => {
    expect(getUserInitials("", "student@test.local")).toBe("ST");
  });

  it("renders the avatar image when avatarUrl is available", () => {
    render(
      <UserAvatar
        user={{ name: "Alex Student", email: "alex@test.local", avatarUrl: "https://example.com/avatar.png" }}
      />
    );

    expect(screen.getByAltText("Profile avatar")).toHaveAttribute("src", "https://example.com/avatar.png");
  });

  it("falls back to initials if the avatar image fails", () => {
    render(
      <UserAvatar
        user={{ name: "Alex Student", email: "alex@test.local", avatarUrl: "https://example.com/avatar.png" }}
      />
    );

    fireEvent.error(screen.getByAltText("Profile avatar"));

    expect(screen.queryByAltText("Profile avatar")).not.toBeInTheDocument();
    expect(screen.getByLabelText("AS avatar fallback")).toHaveTextContent("AS");
  });

  it("does not render a broken image when no avatarUrl is provided", () => {
    render(<UserAvatar user={{ name: "Ethan Porcarro", email: "ethan@test.local" }} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByLabelText("EP avatar fallback")).toHaveTextContent("EP");
  });
});
