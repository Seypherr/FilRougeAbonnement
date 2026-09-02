export const SUPPORTED_CURRENCIES = [
  "EUR", "USD", "GBP", "CAD", "AUD", "NZD", "CHF", "JPY", "KRW", "CNY",
  "INR", "BRL", "MXN", "AED", "SGD", "HKD", "SEK", "NOK", "DKK", "PLN",
  "TRY", "ZAR", "IDR"
];

const regionCurrencies = {
  AU: "AUD", BR: "BRL", CA: "CAD", CH: "CHF", CN: "CNY", DK: "DKK", GB: "GBP",
  HK: "HKD", ID: "IDR", IN: "INR", JP: "JPY", KR: "KRW", MX: "MXN", NO: "NOK",
  NZ: "NZD", PL: "PLN", SE: "SEK", SG: "SGD", TR: "TRY", US: "USD", ZA: "ZAR",
  AE: "AED"
};

export function getBrowserCurrency() {
  const locale = navigator.language ?? "en";
  const region = new Intl.Locale(locale).region;
  return regionCurrencies[region] ?? "EUR";
}

export function getBrowserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
}

export function getCurrencyLabel(currency, language = "en") {
  try {
    return new Intl.DisplayNames([language], { type: "currency" }).of(currency) ?? currency;
  } catch {
    return currency;
  }
}
