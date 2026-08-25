const shippingRates = [
  { country: "chile", max: 30, rates: [[2, 75], [4, 100], [6, 130], [12, 185], [18, 240], [24, 295], [30, 350]] },
  { country: "Peru", max: 12, rates: [[2, 75], [4, 100], [6, 130], [12, 185]] },
  { country: "Colombia", max: 6, rates: [[2, 75], [4, 100], [6, 130]] },
  { country: "United States", max: 30, rates: [[2, 90], [4, 110], [6, 140], [12, 220], [18, 295], [24, 325], [30, 415]] },
  { country: "Switzerland", max: 30, rates: [[2, 90], [4, 130], [6, 160], [12, 240], [18, 325], [24, 360], [30, 420]] },
  { country: "Norway", max: 30, rates: [[2, 90], [4, 130], [6, 160], [12, 240], [18, 325], [24, 360], [30, 420]] },
  { country: "Netherlands", max: 30, rates: [[2, 90], [4, 130], [6, 160], [12, 240], [18, 325], [24, 360], [30, 420]] },
  { country: "United Kingdom", max: 12, rates: [[2, 90], [4, 130], [6, 160], [12, 240]] },
  { country: "Germany", max: 12, rates: [[2, 90], [4, 130], [6, 160], [12, 240]] },
  { country: "Italy", max: 6, rates: [[2, 90], [4, 130], [6, 160]] },
  { country: "France", max: 5, rates: [[2, 90], [4, 130], [6, 160]] },
  { country: "Hong Kong", max: 30, rates: [[2, 150], [4, 190], [6, 220], [12, 300], [18, 385], [24, 420], [30, 480]] },
  { country: "Singapore", max: 12, rates: [[2, 150], [4, 190], [6, 220], [12, 300]] },
  { country: "Australia", max: 12, rates: [[2, 150], [4, 190], [6, 220], [12, 300]] },
  { country: "South Africa", max: 12, rates: [[2, 150], [4, 190], [6, 220], [12, 300]] },
  { country: "Austria", max: 12, rates: [[2, 150], [4, 190], [6, 220], [12, 300]] },
  { country: "Israel", max: 12, rates: [[2, 150], [4, 190], [6, 220], [12, 300]] },
  { country: "New Zealand", max: 12, rates: [[2, 150], [4, 190], [6, 220], [12, 300]] },
];

const countryCodes = {
  chile: "CL",
  peru: "PE",
  colombia: "CO",
  "united states": "US",
  switzerland: "CH",
  norway: "NO",
  netherlands: "NL",
  "united kingdom": "GB",
  germany: "DE",
  italy: "IT",
  france: "FR",
  "hong kong": "HK",
  singapore: "SG",
  australia: "AU",
  "south africa": "ZA",
  austria: "AT",
  israel: "IL",
  "new zealand": "NZ",
};

export function getShippingQuote(countryName, bottleCount) {
  const normalizedCountry = String(countryName || "").trim().toLowerCase();
  const destination = shippingRates.find(
    ({ country }) => country.toLowerCase() === normalizedCountry
  );

  if (!destination) {
    throw new Error("COUNTRY_NOT_SUPPORTED");
  }

  if (!Number.isInteger(bottleCount) || bottleCount <= 0) {
    throw new Error("INVALID_BOTTLE_COUNT");
  }

  if (bottleCount > destination.max) {
    throw new Error("BOTTLE_LIMIT_EXCEEDED");
  }

  const rate = destination.rates.find(([maxBottles]) => maxBottles >= bottleCount);
  if (!rate) {
    throw new Error("SHIPPING_RATE_NOT_FOUND");
  }

  return {
    country: destination.country,
    countryCode: countryCodes[destination.country.toLowerCase()],
    bottleCount,
    maxBottles: destination.max,
    shippingCents: Math.round(rate[1] * 100),
  };
}

export { shippingRates };
