import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubscriptionLogo } from "./SubscriptionLogo.jsx";
import {
  getServiceDomain,
  getServiceFallback,
  getServiceSuggestions,
  getSubscriptionInitial,
  getSubscriptionLogo
} from "../utils/subscriptionLogos.js";

describe("subscription logos", () => {
  it("maps known subscription names to Logo.dev domains", () => {
    expect(getSubscriptionLogo("Netflix Premium")).toEqual(expect.objectContaining({ brand: "Netflix", domain: "netflix.com" }));
    expect(getSubscriptionLogo("Spotify Duo")).toEqual(expect.objectContaining({ brand: "Spotify", domain: "spotify.com" }));
    expect(getSubscriptionLogo("Basic Fit Club")).toEqual(expect.objectContaining({ brand: "Basic-Fit", domain: "basic-fit.com" }));
    expect(getSubscriptionLogo("Canal+ Series")).toEqual(expect.objectContaining({ brand: "Canal+", domain: "canalplus.com" }));
    expect(getSubscriptionLogo("Disney+")).toEqual(expect.objectContaining({ brand: "Disney+", domain: "disneyplus.com" }));
    expect(getSubscriptionLogo("Credit Agricole")).toEqual(expect.objectContaining({ brand: "Crédit Agricole", domain: "credit-agricole.fr" }));
  });

  it("resolves expected domains for common services", () => {
    expect(getServiceDomain("Netflix")).toBe("netflix.com");
    expect(getServiceDomain("Spotify")).toBe("spotify.com");
    expect(getServiceDomain("Disney+")).toBe("disneyplus.com");
    expect(getServiceDomain("Amazon Prime")).toBe("amazon.com");
    expect(getServiceDomain("BNP Paribas")).toBe("bnpparibas.fr");
    expect(getServiceDomain("Credit Agricole")).toBe("credit-agricole.fr");
  });

  it("handles accents, spaces and unknown services safely", () => {
    expect(getServiceDomain("  Credit   Agricole  ")).toBe("credit-agricole.fr");
    expect(getServiceDomain("Cr\u00e9dit Agricole")).toBe("credit-agricole.fr");
    expect(getServiceDomain("Local Gym")).toBeNull();
    expect(getSubscriptionLogo("Local Gym")).toEqual(expect.objectContaining({ hasLogo: false, domain: null, initials: "LG" }));
  });

  it("suggests canonical services from aliases and partial names", () => {
    expect(getServiceSuggestions("net").map((service) => service.name)).toContain("Netflix");
    expect(getServiceSuggestions("oner")[0]).toEqual(expect.objectContaining({ name: "Oney", domain: "oney.fr" }));
    expect(getServiceSuggestions("Basic Fit")[0]).toEqual(expect.objectContaining({ name: "Basic-Fit", domain: "basic-fit.com" }));
    expect(getServiceSuggestions("Credit Agricole")[0]).toEqual(expect.objectContaining({ name: "Crédit Agricole", domain: "credit-agricole.fr" }));
    expect(getServiceSuggestions("Crédit Agricole")[0]).toEqual(expect.objectContaining({ name: "Crédit Agricole", domain: "credit-agricole.fr" }));
    expect(getServiceSuggestions("unknown-service")).toEqual([]);
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
    expect(screen.getByLabelText("Local Gym fallback logo")).toHaveTextContent("LG");
  });

  it("falls back to the initial if every image source fails to load", () => {
    render(<SubscriptionLogo name="Netflix Premium" />);

    fireEvent.error(screen.getByAltText("Netflix logo"));
    fireEvent.error(screen.getByAltText("Netflix logo"));

    expect(screen.queryByAltText("Netflix logo")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Netflix Premium fallback logo")).toHaveTextContent("N");
  });

  it("generates a stable colored fallback from the service name", () => {
    expect(getServiceFallback("Local Gym")).toEqual(getServiceFallback("Local Gym"));
    expect(getServiceFallback("Local Gym").style.backgroundColor).toContain("hsl(");
  });

  it("returns a safe initial when the subscription name is empty", () => {
    expect(getSubscriptionInitial("")).toBe("?");
  });
});
