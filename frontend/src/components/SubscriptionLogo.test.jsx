import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubscriptionLogo } from "./SubscriptionLogo.jsx";
import { getSubscriptionInitial, getSubscriptionLogo } from "../utils/subscriptionLogos.js";

describe("subscription logos", () => {
  it("maps known subscription names to Logo.dev domains", () => {
    expect(getSubscriptionLogo("Netflix Premium")).toEqual(expect.objectContaining({ brand: "Netflix", domain: "netflix.com" }));
    expect(getSubscriptionLogo("Basic Fit Club")).toEqual(expect.objectContaining({ brand: "Basic-Fit", domain: "basic-fit.com" }));
    expect(getSubscriptionLogo("Canal+ Séries")).toEqual(expect.objectContaining({ brand: "Canal+", domain: "canalplus.com" }));
    expect(getSubscriptionLogo("Disney+")).toEqual(expect.objectContaining({ brand: "Disney+", domain: "disneyplus.com" }));
  });

  it("renders a Logo.dev image for known subscriptions", () => {
    render(<SubscriptionLogo name="Spotify Family" />);

    const logo = screen.getByAltText("Spotify logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", expect.stringContaining("https://img.logo.dev/spotify.com"));
  });

  it("switches to a public favicon image if Logo.dev fails", () => {
    render(<SubscriptionLogo name="Netflix Premium" />);

    fireEvent.error(screen.getByAltText("Netflix logo"));

    expect(screen.getByAltText("Netflix logo")).toHaveAttribute("src", expect.stringContaining("https://www.google.com/s2/favicons"));
  });

  it("uses an initial fallback for unknown subscriptions", () => {
    render(<SubscriptionLogo name="Local Gym" />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Local Gym fallback logo")).toHaveTextContent("L");
  });

  it("falls back to the initial if every image source fails to load", () => {
    render(<SubscriptionLogo name="Netflix Premium" />);

    fireEvent.error(screen.getByAltText("Netflix logo"));
    fireEvent.error(screen.getByAltText("Netflix logo"));

    expect(screen.queryByAltText("Netflix logo")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Netflix Premium fallback logo")).toHaveTextContent("N");
  });

  it("returns a safe initial when the subscription name is empty", () => {
    expect(getSubscriptionInitial("")).toBe("?");
  });
});
