import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubscriptionLogo } from "./SubscriptionLogo.jsx";
import {
  getPaymentMethodLogo,
  getPaymentMethodSuggestions,
  getServiceDomain,
  getServiceFallback,
  getServicePlanSuggestion,
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
    expect(getSubscriptionLogo("Credit Agricole")).toEqual(expect.objectContaining({ brand: "Credit Agricole", domain: "credit-agricole.fr" }));
    expect(getSubscriptionLogo("ChatGPT Plus")).toEqual(expect.objectContaining({ brand: "ChatGPT", domain: "chatgpt.com" }));
    expect(getSubscriptionLogo("Fitness Park")).toEqual(expect.objectContaining({ brand: "Fitness Park", domain: "fitnesspark.fr" }));
  });

  it("resolves expected domains for common services", () => {
    expect(getServiceDomain("Netflix")).toBe("netflix.com");
    expect(getServiceDomain("Spotify")).toBe("spotify.com");
    expect(getServiceDomain("Disney+")).toBe("disneyplus.com");
    expect(getServiceDomain("Amazon Prime")).toBe("amazon.com");
    expect(getServiceDomain("BNP Paribas")).toBe("bnpparibas.fr");
    expect(getServiceDomain("Credit Agricole")).toBe("credit-agricole.fr");
    expect(getServiceDomain("Apple TV+")).toBe("apple.com");
    expect(getServiceDomain("Microsoft 365")).toBe("microsoft.com");
  });

  it("handles accents, spaces and unknown services safely", () => {
    expect(getServiceDomain("  Credit   Agricole  ")).toBe("credit-agricole.fr");
    expect(getServiceDomain("Crédit Agricole")).toBe("credit-agricole.fr");
    expect(getServiceDomain("Local Gym")).toBeNull();
    expect(getSubscriptionLogo("Local Gym")).toEqual(expect.objectContaining({ hasLogo: false, domain: null, initials: "LG" }));
  });

  it("suggests canonical services from aliases and partial names", () => {
    expect(getServiceSuggestions("net").map((service) => service.name)).toContain("Netflix");
    expect(getServiceSuggestions("oner")[0]).toEqual(expect.objectContaining({ name: "Oney", domain: "oney.fr" }));
    expect(getServiceSuggestions("Basic Fit")[0]).toEqual(expect.objectContaining({ name: "Basic-Fit", domain: "basic-fit.com" }));
    expect(getServiceSuggestions("Credit Agricole")[0]).toEqual(expect.objectContaining({ name: "Credit Agricole", domain: "credit-agricole.fr" }));
    expect(getServiceSuggestions("Crédit Agricole")[0]).toEqual(expect.objectContaining({ name: "Credit Agricole", domain: "credit-agricole.fr" }));
    expect(getServiceSuggestions("rmc sport")[0]).toEqual(expect.objectContaining({ name: "RMC Sport", domain: "rmcsport.tv" }));
    expect(getServiceSuggestions("gmprono")[0]).toEqual(expect.objectContaining({ name: "GMProno", domain: "gmprono.com", url: "/gmprono-favicon.png" }));
    expect(getServiceSuggestions("youtube music")[0]).toEqual(expect.objectContaining({ name: "YouTube Music", domain: "music.youtube.com" }));
    expect(getServiceSuggestions("assurance auto").map((service) => service.name)).toContain("Direct Assurance");
    expect(getServiceSuggestions("unknown-service")).toEqual([]);
  });

  it("ranks exact, compact and acronym matches before loose matches", () => {
    expect(getServiceSuggestions("disney")[0]).toEqual(expect.objectContaining({ name: "Disney+" }));
    expect(getServiceSuggestions("applemusic")[0]).toEqual(expect.objectContaining({ name: "Apple Music" }));
    expect(getServiceSuggestions("ms")[0]).toEqual(expect.objectContaining({ name: "Microsoft 365" }));
    expect(getServiceSuggestions("yt")[0]).toEqual(expect.objectContaining({ name: "YouTube Premium" }));
    expect(getServiceSuggestions("cursor")[0]).toEqual(expect.objectContaining({ name: "Cursor" }));
    expect(getServiceSuggestions("free")[0]).toEqual(expect.objectContaining({ name: "Free" }));
  });

  it("provides category and average price hints for known services", () => {
    expect(getServicePlanSuggestion("Netflix")).toEqual(expect.objectContaining({ category: "Streaming", priceHints: [7.99, 14.99], defaultPrice: 7.99 }));
    expect(getServicePlanSuggestion("Spotify")).toEqual(expect.objectContaining({ category: "Music", priceHints: [11.12], defaultPrice: 11.12 }));
    expect(getServicePlanSuggestion("Disney+")).toEqual(expect.objectContaining({ category: "Streaming", priceHints: [5.99, 9.99], defaultPrice: 5.99 }));
    expect(getServicePlanSuggestion("Canva Pro")).toEqual(expect.objectContaining({ category: "Software", priceHints: [11.99], defaultPrice: 11.99 }));
    expect(getServicePlanSuggestion("RMC Sport")).toEqual(expect.objectContaining({ category: "Sports", priceHints: [19], defaultPrice: 19 }));
    expect(getServicePlanSuggestion("GMProno")).toEqual(expect.objectContaining({ category: "Sports", priceHints: [14.99, 34.99], defaultPrice: 14.99 }));
    expect(getServicePlanSuggestion("YouTube Music")).toEqual(expect.objectContaining({ category: "Music", priceHints: [10.99], defaultPrice: 10.99 }));
    expect(getServicePlanSuggestion("Unknown")).toBeNull();
  });

  it("suggests payment methods and resolves payment logos with fallback", () => {
    expect(getPaymentMethodSuggestions("credit")[0]).toEqual(expect.objectContaining({ name: "Credit Agricole", domain: "credit-agricole.fr" }));
    expect(getPaymentMethodSuggestions("paypal")[0]).toEqual(expect.objectContaining({ name: "PayPal", domain: "paypal.com" }));
    expect(getPaymentMethodSuggestions("amex")[0]).toEqual(expect.objectContaining({ name: "American Express", domain: "americanexpress.com" }));
    expect(getPaymentMethodLogo("Visa 4242")).toEqual(expect.objectContaining({ brand: "Visa", domain: "visa.com", hasLogo: true }));
    expect(getPaymentMethodLogo("Local Bank")).toEqual(expect.objectContaining({ domain: null, hasLogo: false, initials: "LB" }));
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
