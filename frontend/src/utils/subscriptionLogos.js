export const serviceLogoMappings = [
  { brand: "Netflix", domain: "netflix.com", keywords: ["netflix"] },
  { brand: "Spotify", domain: "spotify.com", keywords: ["spotify"] },
  { brand: "Disney+", domain: "disneyplus.com", keywords: ["disney", "disney+", "disney plus"] },
  { brand: "Amazon Prime", domain: "amazon.com", keywords: ["amazon prime", "prime video", "amazon"] },
  { brand: "YouTube", domain: "youtube.com", keywords: ["youtube premium", "youtube", "you tube"] },
  { brand: "Canal+", domain: "canalplus.com", keywords: ["canal+", "canal plus", "canal"] },
  { brand: "Basic-Fit", domain: "basic-fit.com", keywords: ["basicfit", "basic fit", "basic-fit", "basic"] },
  { brand: "Oney", domain: "oney.fr", keywords: ["oney", "oner"] },
  { brand: "Orange", domain: "orange.fr", keywords: ["orange"] },
  { brand: "Free", domain: "free.fr", keywords: ["free"] },
  { brand: "SFR", domain: "sfr.fr", keywords: ["sfr"] },
  { brand: "Bouygues Telecom", domain: "bouyguestelecom.fr", keywords: ["bouygues telecom", "bouygues"] },
  { brand: "Revolut", domain: "revolut.com", keywords: ["revolut"] },
  { brand: "Boursorama", domain: "boursobank.com", keywords: ["boursorama", "boursobank", "bourso bank"] },
  { brand: "BNP Paribas", domain: "bnpparibas.fr", keywords: ["bnp paribas", "bnpparibas", "bnp"] },
  { brand: "Crédit Agricole", domain: "credit-agricole.fr", keywords: ["credit agricole", "crédit agricole", "credit-agricole", "ca banque"] },
  { brand: "Adobe", domain: "adobe.com", keywords: ["adobe", "creative cloud", "adobe cc"] },
  { brand: "Figma", domain: "figma.com", keywords: ["figma"] },
  { brand: "Uber", domain: "uber.com", keywords: ["uber eats", "uber eat", "uber"] },
  { brand: "BNK", domain: null, keywords: ["bnk"] }
];

export const suggestedServices = serviceLogoMappings
  .filter((service) => service.domain)
  .map(({ brand, domain, keywords }) => ({
    name: brand,
    domain,
    aliases: keywords.filter((keyword) => normalizeServiceName(keyword) !== normalizeServiceName(brand))
  }));

export function normalizeServiceName(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w+\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasKeyword(normalizedName, keyword) {
  const normalizedKeyword = normalizeServiceName(keyword);
  if (!normalizedKeyword) return false;
  if (normalizedKeyword.length <= 3) {
    return new RegExp(`(^|\\s)${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`).test(normalizedName);
  }
  return normalizedName.includes(normalizedKeyword);
}

function getBrandMatch(name) {
  const normalized = normalizeServiceName(name);
  if (!normalized) return null;
  return serviceLogoMappings.find((brand) => brand.keywords.some((keyword) => hasKeyword(normalized, keyword))) ?? null;
}

export function getServiceSuggestions(query = "", limit = 6) {
  const normalized = normalizeServiceName(query);

  if (!normalized) {
    return suggestedServices.slice(0, limit);
  }

  return suggestedServices
    .map((service) => {
      const searchable = [service.name, ...service.aliases].map(normalizeServiceName);
      const startsWith = searchable.some((value) => value.startsWith(normalized));
      const includes = searchable.some((value) => value.includes(normalized));
      return { service, score: startsWith ? 2 : includes ? 1 : 0 };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.service.name.localeCompare(b.service.name))
    .slice(0, limit)
    .map((item) => item.service);
}

export function getServiceDomain(serviceName) {
  const match = getBrandMatch(serviceName);
  return match?.domain ?? null;
}

function hashName(name = "") {
  return Array.from(name.toString()).reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) >>> 0;
  }, 7);
}

export function getServiceFallback(name = "") {
  const hash = hashName(normalizeServiceName(name));
  const hue = hash % 360;
  return {
    initials: getSubscriptionInitial(name),
    style: {
      backgroundColor: `hsl(${hue} 88% 96%)`,
      color: `hsl(${hue} 72% 42%)`
    }
  };
}

export function getServiceLogo(name) {
  const match = getBrandMatch(name);
  const fallback = getServiceFallback(name);

  if (!match?.domain) {
    return {
      brand: match?.brand ?? name?.toString().trim() ?? "Service",
      domain: null,
      hasLogo: false,
      url: null,
      fallbackUrl: null,
      ...fallback
    };
  }

  return {
    ...match,
    hasLogo: true,
    url: `https://img.logo.dev/${match.domain}?size=128&format=png`,
    fallbackUrl: `https://www.google.com/s2/favicons?sz=128&domain=${match.domain}`,
    ...fallback
  };
}

export function getSubscriptionInitial(name = "") {
  const trimmed = name.toString().trim();
  if (!trimmed) return "?";
  const words = normalizeServiceName(trimmed).split(" ").filter(Boolean);
  if (words.length > 1) return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  return words[0]?.[0]?.toUpperCase() ?? trimmed[0].toUpperCase();
}

export const getSubscriptionLogo = getServiceLogo;
