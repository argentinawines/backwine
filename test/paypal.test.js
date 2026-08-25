import assert from "node:assert/strict";
import test from "node:test";

test("creates PayPal orders with server-calculated amounts", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = {
    PAYPAL_ENV: process.env.PAYPAL_ENV,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  };
  const calls = [];

  process.env.PAYPAL_ENV = "sandbox";
  process.env.PAYPAL_CLIENT_ID = "test-client";
  process.env.PAYPAL_CLIENT_SECRET = "test-secret";
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith("/v1/oauth2/token")) {
      return new Response(
        JSON.stringify({ access_token: "access-token", expires_in: 3600 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(JSON.stringify({ id: "PAYPAL-ORDER-1", status: "CREATED" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const { createPayPalOrder } = await import(`../src/services/paypal.js?test=${Date.now()}`);
    const result = await createPayPalOrder({
      localOrderId: 42,
      quote: {
        currency: "USD",
        countryCode: "US",
        subtotalCents: 2500,
        shippingCents: 9000,
        totalCents: 11500,
        lines: [
          {
            productId: "wine-a",
            name: "Wine A",
            quantity: 1,
            unitPriceCents: 2500,
          },
        ],
      },
      customer: {
        name: "Test Buyer",
        address: "123 Test Street",
        city: "Miami",
        postalCode: "33101",
      },
    });

    assert.equal(result.id, "PAYPAL-ORDER-1");
    assert.equal(calls[0].url, "https://api-m.sandbox.paypal.com/v1/oauth2/token");
    assert.equal(calls[1].url, "https://api-m.sandbox.paypal.com/v2/checkout/orders");
    const body = JSON.parse(calls[1].options.body);
    assert.equal(body.purchase_units[0].amount.value, "115.00");
    assert.equal(body.purchase_units[0].amount.breakdown.item_total.value, "25.00");
    assert.equal(body.purchase_units[0].amount.breakdown.shipping.value, "90.00");
    assert.equal(body.purchase_units[0].custom_id, "42");
    assert.equal(body.purchase_units[0].shipping.address.country_code, "US");
    assert.equal(
      body.payment_source.paypal.experience_context.shipping_preference,
      "SET_PROVIDED_ADDRESS"
    );
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
