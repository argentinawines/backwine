import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateCheckoutQuote,
  normalizeCheckoutItems,
} from "../src/services/checkout.js";

test("normalizes duplicate cart lines", () => {
  assert.deepEqual(
    normalizeCheckoutItems([
      { productId: "wine-a", quantity: 1 },
      { productId: "wine-a", quantity: 2 },
      { productId: "wine-b", quantity: 1 },
    ]),
    [
      { productId: "wine-a", quantity: 3 },
      { productId: "wine-b", quantity: 1 },
    ]
  );
});

test("calculates product, offer bottle count, shipping, and total in cents", () => {
  const quote = calculateCheckoutQuote({
    country: "United States",
    items: [
      { productId: "wine-a", quantity: 2 },
      { productId: "offer-b", quantity: 1 },
    ],
    products: [
      { id: "wine-a", name: "Wine A", price: "10.25", offer: false, isActive: true },
      { id: "offer-b", name: "Offer B", price: "25.50", offer: true, isActive: true },
    ],
  });

  assert.equal(quote.bottleCount, 8);
  assert.equal(quote.countryCode, "US");
  assert.equal(quote.subtotalCents, 4600);
  assert.equal(quote.shippingCents, 22000);
  assert.equal(quote.totalCents, 26600);
});

test("rejects unsupported destinations and inactive products", () => {
  assert.throws(
    () =>
      calculateCheckoutQuote({
        country: "Argentina",
        items: [{ productId: "wine-a", quantity: 1 }],
        products: [
          { id: "wine-a", name: "Wine A", price: "10", offer: false, isActive: true },
        ],
      }),
    /COUNTRY_NOT_SUPPORTED/
  );

  assert.throws(
    () =>
      calculateCheckoutQuote({
        country: "United States",
        items: [{ productId: "wine-a", quantity: 1 }],
        products: [
          { id: "wine-a", name: "Wine A", price: "10", offer: false, isActive: false },
        ],
      }),
    /PRODUCT_NOT_AVAILABLE/
  );
});
