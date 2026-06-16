import { describe, expect, it } from "vitest";
import {
  catalogCategories,
  searchSubscriptionCatalog,
  subscriptionCatalog
} from "../src/data/subscriptionCatalog.js";

describe("subscription catalog", () => {
  it("exposes a large predefined subscription database", () => {
    expect(subscriptionCatalog.length).toBeGreaterThan(600);
    expect(catalogCategories.map((category) => category.id)).toEqual(
      expect.arrayContaining(["streaming", "software", "gaming", "ai", "telecom", "insurance", "fitness"])
    );
  });

  it("searches canonical names, aliases and compact queries", () => {
    expect(searchSubscriptionCatalog({ search: "netflix", limit: 1 }).services[0]).toEqual(
      expect.objectContaining({ brand: "Netflix", category: "Streaming" })
    );
    expect(searchSubscriptionCatalog({ search: "yt", limit: 1 }).services[0]).toEqual(
      expect.objectContaining({ brand: "YouTube Premium" })
    );
    expect(searchSubscriptionCatalog({ search: "applemusic", limit: 1 }).services[0]).toEqual(
      expect.objectContaining({ brand: "Apple Music" })
    );
  });

  it("returns exact brands before plan variants", () => {
    expect(searchSubscriptionCatalog({ search: "free", limit: 1 }).services[0]).toEqual(
      expect.objectContaining({ brand: "Free", domain: "free.fr" })
    );
  });

  it("includes sports, music and insurance services requested by users", () => {
    expect(searchSubscriptionCatalog({ search: "rmc sport", limit: 1 }).services[0]).toEqual(
      expect.objectContaining({ brand: "RMC Sport", category: "Sports" })
    );
    expect(searchSubscriptionCatalog({ search: "gmprono", limit: 1 }).services[0]).toEqual(
      expect.objectContaining({ brand: "GMProno", domain: "gmprono.com", plan: "Premium 30 jours", defaultPrice: 14.99, url: "/gmprono-favicon.png" })
    );
    expect(searchSubscriptionCatalog({ search: "gmprono", limit: 3 }).services.map((service) => ({
      name: service.name,
      plan: service.plan,
      defaultPrice: service.defaultPrice
    }))).toEqual([
      { name: "GMProno Premium 30 jours", plan: "Premium 30 jours", defaultPrice: 14.99 },
      { name: "GMProno Premium 90 jours", plan: "Premium 90 jours", defaultPrice: 34.99 }
    ]);
    expect(searchSubscriptionCatalog({ search: "youtube music", limit: 1 }).services[0]).toEqual(
      expect.objectContaining({ brand: "YouTube Music", category: "Music" })
    );
    expect(searchSubscriptionCatalog({ search: "assurance auto", categoryId: "insurance", limit: 5 }).services).toEqual(
      expect.arrayContaining([expect.objectContaining({ categoryId: "insurance" })])
    );
  });

  it("does not return weak false positives for unknown short queries", () => {
    expect(searchSubscriptionCatalog({ search: "zfz", limit: 8 }).services).toEqual([]);
  });

  it("filters by category and caps result limits", () => {
    const result = searchSubscriptionCatalog({ categoryId: "ai", limit: 100 });

    expect(result.services).toHaveLength(50);
    expect(result.services.every((service) => service.categoryId === "ai")).toBe(true);
    expect(result.total).toBe(subscriptionCatalog.length);
  });
});
