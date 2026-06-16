const categoryDefinitions = {
  streaming: {
    label: "Streaming",
    defaultTiers: ["Essential", "Standard", "Premium", "Family"],
    defaultCycle: "MONTHLY"
  },
  sports: {
    label: "Sports",
    defaultTiers: ["Essential", "Premium", "Family", "Annual"],
    defaultCycle: "MONTHLY"
  },
  music: {
    label: "Music",
    defaultTiers: ["Individual", "Duo", "Family", "Student"],
    defaultCycle: "MONTHLY"
  },
  software: {
    label: "Software",
    defaultTiers: ["Free", "Plus", "Pro", "Team", "Business"],
    defaultCycle: "MONTHLY"
  },
  gaming: {
    label: "Gaming",
    defaultTiers: ["Essential", "Extra", "Premium", "Ultimate"],
    defaultCycle: "MONTHLY"
  },
  cloud: {
    label: "Cloud",
    defaultTiers: ["100 GB", "200 GB", "2 TB", "Business"],
    defaultCycle: "MONTHLY"
  },
  ai: {
    label: "AI",
    defaultTiers: ["Free", "Plus", "Pro", "Team", "Enterprise"],
    defaultCycle: "MONTHLY"
  },
  telecom: {
    label: "Telecom",
    defaultTiers: ["Mobile", "Fiber", "Box", "Family"],
    defaultCycle: "MONTHLY"
  },
  insurance: {
    label: "Insurance",
    defaultTiers: ["Basic", "Comfort", "Premium"],
    defaultCycle: "MONTHLY"
  },
  fitness: {
    label: "Fitness",
    defaultTiers: ["Basic", "Premium", "Duo", "Coach"],
    defaultCycle: "MONTHLY"
  },
  press: {
    label: "Press",
    defaultTiers: ["Digital", "Weekend", "Full Access", "Student"],
    defaultCycle: "MONTHLY"
  },
  professional: {
    label: "Professional",
    defaultTiers: ["Starter", "Pro", "Business", "Enterprise"],
    defaultCycle: "MONTHLY"
  },
  education: {
    label: "Education",
    defaultTiers: ["Monthly", "Annual", "Pro", "Team"],
    defaultCycle: "MONTHLY"
  },
  productivity: {
    label: "Productivity",
    defaultTiers: ["Personal", "Pro", "Team", "Business"],
    defaultCycle: "MONTHLY"
  },
  finance: {
    label: "Finance",
    defaultTiers: ["Standard", "Premium", "Metal", "Business"],
    defaultCycle: "MONTHLY"
  },
  niche: {
    label: "Niche",
    defaultTiers: ["Basic", "Plus", "Premium"],
    defaultCycle: "MONTHLY"
  }
};

const baseServices = [
  ["Netflix", "netflix.com", "streaming", 7.99, ["netflix"]],
  ["Disney+", "disneyplus.com", "streaming", 5.99, ["disney", "disney plus"]],
  ["Amazon Prime", "amazon.com", "streaming", 6.99, ["prime video", "amazon video"]],
  ["YouTube Premium", "youtube.com", "streaming", 12.99, ["youtube", "yt"]],
  ["Canal+", "canalplus.com", "streaming", 19.99, ["canal plus", "canal"]],
  ["Apple TV+", "apple.com", "streaming", 9.99, ["apple tv"]],
  ["Paramount+", "paramountplus.com", "streaming", 7.99, ["paramount"]],
  ["Max", "max.com", "streaming", 9.99, ["hbo max"]],
  ["Crunchyroll", "crunchyroll.com", "streaming", 4.99, ["anime"]],
  ["Twitch", "twitch.tv", "streaming", 4.99, ["twitch sub"]],
  ["Molotov", "molotov.tv", "streaming", 6.99, ["molotov tv"]],
  ["DAZN", "dazn.com", "sports", 14.99, ["sport streaming", "football", "boxing"]],
  ["GMProno", "gmprono.com", "sports", null, ["gm prono", "gmprono", "prono foot", "pronostic football"], "/gmprono-favicon.png", [
    { plan: "Premium 30 jours", defaultPrice: 14.99, keywords: ["premium 30 jours", "30 jours", "mensuel"] },
    { plan: "Premium 90 jours", defaultPrice: 34.99, keywords: ["premium 90 jours", "90 jours", "trimestriel"] }
  ]],
  ["RMC Sport", "rmcsport.tv", "sports", 19, ["rmc", "rmc sports", "sport tv", "champions league"]],
  ["beIN Sports", "beinsports.com", "sports", 15, ["bein", "bein sport", "be in sports", "football"]],
  ["Eurosport", "eurosport.fr", "sports", 6.99, ["euro sport", "cyclisme", "tennis"]],
  ["L'Equipe", "lequipe.fr", "sports", 9.99, ["lequipe", "l equipe", "journal sport"]],
  ["NBA League Pass", "nba.com", "sports", 17.99, ["nba", "league pass", "basket"]],
  ["NFL Game Pass", "nfl.com", "sports", 13.99, ["nfl", "game pass nfl", "football americain"]],
  ["F1 TV", "formula1.com", "sports", 7.99, ["formula 1", "f1", "formule 1"]],
  ["UFC Fight Pass", "ufcfightpass.com", "sports", 9.99, ["ufc", "mma", "fight pass"]],
  ["WWE Network", "wwe.com", "sports", 9.99, ["wwe", "catch"]],
  ["Tennis TV", "tennistv.com", "sports", 14.99, ["tennis", "atp"]],
  ["Discovery+", "discoveryplus.com", "sports", 5.99, ["discovery plus", "sport documentaire"]],
  ["OCS", "ocs.fr", "streaming", 10.99, ["ocs go"]],
  ["Spotify", "spotify.com", "music", 11.12, ["spotify premium"]],
  ["Deezer", "deezer.com", "music", 11.99, ["deezer premium"]],
  ["Apple Music", "apple.com", "music", 10.99, ["applemusic"]],
  ["YouTube Music", "music.youtube.com", "music", 10.99, ["youtube music", "yt music", "youtubemusic"]],
  ["SoundCloud", "soundcloud.com", "music", 5.99, ["sound cloud"]],
  ["Tidal", "tidal.com", "music", 10.99, ["tidal hifi"]],
  ["Qobuz", "qobuz.com", "music", 12.5, ["qobuz sublime"]],
  ["Adobe", "adobe.com", "software", 19.99, ["creative cloud", "adobe cc"]],
  ["Figma", "figma.com", "software", 12, ["figma pro"]],
  ["Canva", "canva.com", "software", 11.99, ["canva pro"]],
  ["Microsoft 365", "microsoft.com", "software", 7, ["office 365", "office", "ms 365"]],
  ["Notion", "notion.so", "productivity", 9.5, ["notion plus"]],
  ["Dropbox", "dropbox.com", "cloud", 11.99, ["dropbox plus"]],
  ["Google One", "one.google.com", "cloud", 1.99, ["google storage", "google drive"]],
  ["iCloud+", "icloud.com", "cloud", 0.99, ["icloud"]],
  ["OneDrive", "onedrive.live.com", "cloud", 2, ["microsoft onedrive"]],
  ["Box", "box.com", "cloud", 13.5, ["box cloud"]],
  ["ChatGPT", "chatgpt.com", "ai", 20, ["openai", "chat gpt"]],
  ["Claude", "claude.ai", "ai", 20, ["anthropic"]],
  ["Perplexity", "perplexity.ai", "ai", 20, ["perplexity pro"]],
  ["Midjourney", "midjourney.com", "ai", 10, ["mid journey"]],
  ["Mistral", "mistral.ai", "ai", 14.99, ["le chat"]],
  ["GitHub", "github.com", "software", 4, ["github copilot", "copilot"]],
  ["Cursor", "cursor.com", "ai", 20, ["cursor ai"]],
  ["Vercel", "vercel.com", "professional", 20, ["vercel pro"]],
  ["Linear", "linear.app", "productivity", 8, ["linear app"]],
  ["Slack", "slack.com", "professional", 8.75, ["slack pro"]],
  ["Zoom", "zoom.us", "professional", 13.99, ["zoom pro"]],
  ["Calendly", "calendly.com", "professional", 10, ["calendar booking"]],
  ["HubSpot", "hubspot.com", "professional", 18, ["crm"]],
  ["Salesforce", "salesforce.com", "professional", 25, ["sales cloud"]],
  ["Mailchimp", "mailchimp.com", "professional", 12.5, ["email marketing"]],
  ["Brevo", "brevo.com", "professional", 19, ["sendinblue"]],
  ["Airtable", "airtable.com", "productivity", 20, ["air table"]],
  ["Trello", "trello.com", "productivity", 5, ["trello premium"]],
  ["Asana", "asana.com", "productivity", 10.99, ["asana premium"]],
  ["Todoist", "todoist.com", "productivity", 4, ["todo list"]],
  ["Evernote", "evernote.com", "productivity", 8.33, ["ever note"]],
  ["1Password", "1password.com", "software", 2.99, ["one password"]],
  ["NordVPN", "nordvpn.com", "software", 3.99, ["vpn"]],
  ["ExpressVPN", "expressvpn.com", "software", 8.32, ["express vpn"]],
  ["PlayStation Plus", "playstation.com", "gaming", 8.99, ["ps plus", "psn"]],
  ["Xbox Game Pass", "xbox.com", "gaming", 9.99, ["game pass", "xbox ultimate"]],
  ["Nintendo Switch Online", "nintendo.com", "gaming", 3.99, ["nintendo online"]],
  ["GeForce Now", "nvidia.com", "gaming", 10.99, ["nvidia geforce"]],
  ["EA Play", "ea.com", "gaming", 5.99, ["electronic arts"]],
  ["Ubisoft+", "ubisoft.com", "gaming", 14.99, ["ubisoft plus"]],
  ["Apple Arcade", "apple.com", "gaming", 6.99, ["arcade"]],
  ["Orange", "orange.fr", "telecom", 29.99, ["orange mobile", "orange fibre"]],
  ["Free", "free.fr", "telecom", 19.99, ["freebox", "free mobile"]],
  ["SFR", "sfr.fr", "telecom", 29.99, ["sfr fibre", "red sfr"]],
  ["Bouygues Telecom", "bouyguestelecom.fr", "telecom", 29.99, ["bouygues", "bbox"]],
  ["Sosh", "sosh.fr", "telecom", 15.99, ["sosh mobile"]],
  ["RED by SFR", "red-by-sfr.fr", "telecom", 12.99, ["red sfr"]],
  ["Basic-Fit", "basic-fit.com", "fitness", 24.99, ["basic fit"]],
  ["Fitness Park", "fitnesspark.fr", "fitness", 29.95, ["fitnesspark"]],
  ["Neoness", "neoness.fr", "fitness", 29.99, ["neoness gym"]],
  ["Keepcool", "keepcool.fr", "fitness", 29.99, ["keep cool"]],
  ["Strava", "strava.com", "fitness", 6.67, ["strava premium"]],
  ["Freeletics", "freeletics.com", "fitness", 12.99, ["fitness app"]],
  ["Lemonade", "lemonade.com", "insurance", 8, ["insurance"]],
  ["Alan", "alan.com", "insurance", 35, ["mutuelle"]],
  ["MAIF", "maif.fr", "insurance", 12, ["assurance", "assurance auto", "assurance habitation"]],
  ["AXA", "axa.fr", "insurance", 15, ["axa assurance"]],
  ["Luko", "luko.eu", "insurance", 9, ["home insurance"]],
  ["Macif", "macif.fr", "insurance", 12, ["assurance auto", "assurance habitation", "mutuelle"]],
  ["Matmut", "matmut.fr", "insurance", 13, ["assurance auto", "assurance habitation"]],
  ["MMA", "mma.fr", "insurance", 14, ["assurance", "mma assurance"]],
  ["MAAF", "maaf.fr", "insurance", 13, ["assurance", "maaf assurance"]],
  ["GMF", "gmf.fr", "insurance", 12, ["assurance", "gmf assurance"]],
  ["Allianz", "allianz.fr", "insurance", 16, ["allianz assurance"]],
  ["Generali", "generali.fr", "insurance", 15, ["generali assurance"]],
  ["Groupama", "groupama.fr", "insurance", 13, ["groupama assurance"]],
  ["Direct Assurance", "direct-assurance.fr", "insurance", 10, ["direct assurance auto"]],
  ["Lovys", "lovys.com", "insurance", 9, ["assurance habitation", "assurance mobile"]],
  ["Acheel", "acheel.com", "insurance", 8, ["assurance habitation", "assurance sante"]],
  ["April", "april.fr", "insurance", 18, ["mutuelle", "assurance sante"]],
  ["Harmonie Mutuelle", "harmonie-mutuelle.fr", "insurance", 24, ["mutuelle sante", "complementaire sante"]],
  ["MGEN", "mgen.fr", "insurance", 25, ["mutuelle", "sante"]],
  ["Swiss Life", "swisslife.fr", "insurance", 22, ["assurance vie", "mutuelle"]],
  ["Credit Agricole Assurances", "ca-assurances.com", "insurance", 14, ["predica", "pacifica", "assurance credit agricole"]],
  ["Le Monde", "lemonde.fr", "press", 9.99, ["newspaper"]],
  ["Mediapart", "mediapart.fr", "press", 11, ["media part"]],
  ["Courrier International", "courrierinternational.com", "press", 6.99, ["courrier"]],
  ["The New York Times", "nytimes.com", "press", 4, ["nyt"]],
  ["Financial Times", "ft.com", "press", 35, ["ft"]],
  ["The Economist", "economist.com", "press", 19, ["economist"]],
  ["LinkedIn Premium", "linkedin.com", "professional", 29.99, ["linkedin"]],
  ["Doctolib", "doctolib.fr", "professional", 0, ["medical booking"]],
  ["Qonto", "qonto.com", "finance", 9, ["business bank"]],
  ["Revolut", "revolut.com", "finance", 3.99, ["revolut premium"]],
  ["N26", "n26.com", "finance", 4.9, ["n26 smart"]],
  ["Boursobank", "boursobank.com", "finance", 0, ["boursorama"]],
  ["PayPal", "paypal.com", "finance", 0, ["paypal business"]],
  ["Coursera", "coursera.org", "education", 49, ["online courses"]],
  ["Udemy", "udemy.com", "education", 16.58, ["courses"]],
  ["Skillshare", "skillshare.com", "education", 13.99, ["creative courses"]],
  ["Duolingo", "duolingo.com", "education", 7.49, ["language learning"]],
  ["Brilliant", "brilliant.org", "education", 12.49, ["math learning"]],
  ["MasterClass", "masterclass.com", "education", 10, ["master class"]],
  ["Patreon", "patreon.com", "niche", 5, ["creator membership"]],
  ["Substack", "substack.com", "niche", 5, ["newsletter"]],
  ["Medium", "medium.com", "press", 5, ["medium membership"]],
  ["Audible", "audible.com", "niche", 9.95, ["audio books"]],
  ["Blinkist", "blinkist.com", "education", 8.34, ["book summaries"]],
  ["Headspace", "headspace.com", "niche", 5.83, ["meditation"]],
  ["Calm", "calm.com", "niche", 6.67, ["meditation app"]],
  ["Todo Math", "todomath.com", "education", 6.99, ["kids learning"]]
];

function normalizeCatalogValue(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w+\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return normalizeCatalogValue(value).replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}

function formatLogo(domain, logoUrl = null) {
  if (logoUrl) {
    return {
      url: logoUrl,
      fallbackUrl: domain ? `https://www.google.com/s2/favicons?sz=128&domain=${domain}` : null
    };
  }

  if (!domain) {
    return { url: null, fallbackUrl: null };
  }

  return {
    url: `https://img.logo.dev/${domain}?size=128&format=png`,
    fallbackUrl: `https://www.google.com/s2/favicons?sz=128&domain=${domain}`
  };
}

function buildPriceHints(basePrice, index) {
  if (!basePrice) {
    return [];
  }

  const factors = [1, 1.35, 1.85, 2.6, 4.2];
  return [Number((basePrice * (factors[index] ?? 1)).toFixed(2))];
}

function buildCatalog() {
  return baseServices.flatMap(([name, domain, categoryId, basePrice, aliases, logoUrl, customPlans]) => {
    const category = categoryDefinitions[categoryId] ?? categoryDefinitions.niche;
    const tiers = category.defaultTiers;
    const canonical = {
      id: slugify(name),
      name,
      brand: name,
      domain,
      categoryId,
      category: category.label,
      plan: null,
      aliases,
      keywords: [name, ...aliases, category.label],
      priceHints: basePrice ? [basePrice] : [],
      defaultPrice: basePrice || null,
      billingCycle: category.defaultCycle,
      tags: [categoryId, category.label.toLowerCase()],
      popularity: 100,
      ...formatLogo(domain, logoUrl)
    };

    if (Array.isArray(customPlans) && customPlans.length > 0) {
      return customPlans.map((customPlan, index) => {
        const defaultPrice = customPlan.defaultPrice ?? null;
        const priceHints = defaultPrice !== null && defaultPrice !== undefined ? [defaultPrice] : [];

        return {
          ...canonical,
          id: `${canonical.id}-${slugify(customPlan.plan)}`,
          name: `${name} ${customPlan.plan}`,
          plan: customPlan.plan,
          keywords: [name, `${name} ${customPlan.plan}`, customPlan.plan, ...(customPlan.keywords ?? []), ...aliases, category.label],
          priceHints,
          defaultPrice,
          billingCycle: customPlan.billingCycle ?? category.defaultCycle,
          popularity: 105 - index
        };
      });
    }

    const monthlyPlans = tiers.map((tier, index) => {
      const priceHints = buildPriceHints(basePrice, index);
      return {
        ...canonical,
        id: `${canonical.id}-${slugify(tier)}`,
        name: `${name} ${tier}`,
        plan: tier,
        keywords: [name, `${name} ${tier}`, tier, ...aliases, category.label],
        priceHints,
        defaultPrice: priceHints[0] ?? null,
        popularity: 90 - index
      };
    });

    const annualPlans = monthlyPlans.map((plan) => {
      const annualPriceHints = plan.priceHints.map((price) => Number((price * 10).toFixed(2)));
      return {
        ...plan,
        id: `${plan.id}-annual`,
        name: `${plan.name} Annual`,
        plan: `${plan.plan} Annual`,
        keywords: [...plan.keywords, "annual", "yearly", "annuel"],
        priceHints: annualPriceHints,
        defaultPrice: annualPriceHints[0] ?? null,
        billingCycle: "ANNUAL",
        popularity: plan.popularity - 8
      };
    });

    return [canonical, ...monthlyPlans, ...annualPlans];
  });
}

export const subscriptionCatalog = buildCatalog();

export const catalogCategories = Object.entries(categoryDefinitions).map(([id, value]) => ({
  id,
  label: value.label
}));

function getCompactValue(value) {
  return value.replace(/\s+/g, "");
}

function getAcronym(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("");
}

function getWordStartsWith(value, normalized) {
  return value.split(" ").some((word) => word.startsWith(normalized));
}

function scoreService(service, normalized) {
  if (!normalized) {
    return service.popularity;
  }

  const compactSearch = getCompactValue(normalized);
  const normalizedName = normalizeCatalogValue(service.name);
  const normalizedBrand = normalizeCatalogValue(service.brand);

  if (normalizedName === normalized || getCompactValue(normalizedName) === compactSearch) {
    return 160 + Math.min(service.popularity, 20);
  }

  if (!service.plan && (normalizedBrand === normalized || getCompactValue(normalizedBrand) === compactSearch)) {
    return 155 + Math.min(service.popularity, 20);
  }

  const searchable = [service.name, service.brand, service.plan, service.category, ...service.keywords]
    .filter(Boolean)
    .map(normalizeCatalogValue);

  return searchable.reduce((bestScore, value) => {
    const compactValue = getCompactValue(value);
    const acronym = getAcronym(value);
    let score = 0;

    if (value === normalized || compactValue === compactSearch) {
      score = 120;
    } else if (value.startsWith(normalized) || compactValue.startsWith(compactSearch)) {
      score = 95;
    } else if (getWordStartsWith(value, normalized) || acronym.startsWith(compactSearch)) {
      score = 76;
    } else if (normalized.length >= 4 && (value.includes(normalized) || compactValue.includes(compactSearch))) {
      score = 45;
    }

    return Math.max(bestScore, score + Math.min(service.popularity, 20));
  }, 0);
}

export function searchSubscriptionCatalog({ search = "", categoryId = "", limit = 12 } = {}) {
  const normalized = normalizeCatalogValue(search);
  const cappedLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);

  const results = subscriptionCatalog
    .filter((service) => !categoryId || service.categoryId === categoryId)
    .map((service) => ({ service, score: scoreService(service, normalized) }))
    .filter((item) => item.score >= (normalized ? 60 : 1))
    .sort((a, b) => b.score - a.score || a.service.name.localeCompare(b.service.name))
    .slice(0, cappedLimit)
    .map((item) => item.service);

  return {
    services: results,
    total: subscriptionCatalog.length,
    categories: catalogCategories
  };
}
