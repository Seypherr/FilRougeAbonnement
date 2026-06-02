const brandDomains = [
  { brand: "Netflix", domain: "netflix.com", keywords: ["netflix"] },
  { brand: "Spotify", domain: "spotify.com", keywords: ["spotify"] },
  { brand: "Basic-Fit", domain: "basic-fit.com", keywords: ["basicfit", "basic fit", "basic-fit"] },
  { brand: "Oney", domain: "oney.fr", keywords: ["oney"] },
  { brand: "Adobe", domain: "adobe.com", keywords: ["adobe", "creative cloud", "adobe cc"] },
  { brand: "Figma", domain: "figma.com", keywords: ["figma"] },
  { brand: "YouTube", domain: "youtube.com", keywords: ["youtube", "you tube"] },
  { brand: "Uber", domain: "uber.com", keywords: ["uber", "uber eats", "uber eat"] },
  { brand: "Canal+", domain: "canalplus.com", keywords: ["canal", "canal+"] },
  { brand: "Disney+", domain: "disneyplus.com", keywords: ["disney", "disney+"] }
];

function normalizeName(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w+\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSubscriptionLogo(name) {
  const normalized = normalizeName(name);
  const match = brandDomains.find((brand) =>
    brand.keywords.some((keyword) => normalized.includes(normalizeName(keyword)))
  );

  if (!match) return null;

  return {
    ...match,
    url: `https://img.logo.dev/${match.domain}?size=128&format=png`,
    fallbackUrl: `https://www.google.com/s2/favicons?sz=128&domain=${match.domain}`
  };
}

export function getSubscriptionInitial(name = "") {
  const trimmed = name.toString().trim();
  return trimmed ? trimmed[0].toUpperCase() : "?";
}
