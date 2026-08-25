const environment = (process.env.PAYPAL_ENV || "sandbox").toLowerCase();
const baseUrl =
  environment === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

let cachedToken;
let cachedTokenExpiresAt = 0;

function getCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_NOT_CONFIGURED");
  }
  return { clientId, clientSecret };
}

async function paypalFetch(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.message || "PAYPAL_REQUEST_FAILED");
      error.status = response.status;
      error.details = data;
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) {
    return cachedToken;
  }

  const { clientId, clientSecret } = getCredentials();
  const token = await paypalFetch("/v1/oauth2/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Language": "en_US",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  cachedToken = token.access_token;
  cachedTokenExpiresAt = Date.now() + Math.max(60, token.expires_in - 60) * 1000;
  return cachedToken;
}

async function authenticatedRequest(path, { requestId, ...options } = {}) {
  const accessToken = await getAccessToken();
  return paypalFetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(requestId ? { "PayPal-Request-Id": requestId } : {}),
      ...options.headers,
    },
  });
}

export function createPayPalOrder({ localOrderId, quote, customer }) {
  const checkoutBaseUrl = (
    process.env.FRONTEND_URL || "https://www.argentinawineshipping.com"
  ).replace(/\/$/, "");

  return authenticatedRequest("/v2/checkout/orders", {
    method: "POST",
    requestId: `create-order-${localOrderId}`,
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: String(localOrderId),
          custom_id: String(localOrderId),
          shipping: {
            name: { full_name: customer.name },
            address: {
              address_line_1: customer.address,
              admin_area_2: customer.city,
              postal_code: customer.postalCode,
              country_code: quote.countryCode,
            },
          },
          amount: {
            currency_code: quote.currency,
            value: (quote.totalCents / 100).toFixed(2),
            breakdown: {
              item_total: {
                currency_code: quote.currency,
                value: (quote.subtotalCents / 100).toFixed(2),
              },
              shipping: {
                currency_code: quote.currency,
                value: (quote.shippingCents / 100).toFixed(2),
              },
            },
          },
          items: quote.lines.map((line) => ({
            name: line.name,
            sku: line.productId,
            quantity: String(line.quantity),
            category: "PHYSICAL_GOODS",
            unit_amount: {
              currency_code: quote.currency,
              value: (line.unitPriceCents / 100).toFixed(2),
            },
          })),
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Argentina Wine Shipping",
            shipping_preference: "SET_PROVIDED_ADDRESS",
            user_action: "PAY_NOW",
            return_url: `${checkoutBaseUrl}/payment`,
            cancel_url: `${checkoutBaseUrl}/payment`,
          },
        },
      },
    }),
  });
}

export function capturePayPalOrder(paypalOrderId, localOrderId) {
  return authenticatedRequest(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: "POST",
    requestId: `capture-order-${localOrderId}`,
    body: "{}",
  });
}

export function verifyPayPalWebhook({ headers, event }) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error("PAYPAL_WEBHOOK_NOT_CONFIGURED");
  }

  return authenticatedRequest("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: webhookId,
      webhook_event: event,
    }),
  });
}

export function getPayPalPublicConfig() {
  return {
    clientId: process.env.PAYPAL_CLIENT_ID || null,
    environment,
    configured: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
  };
}
