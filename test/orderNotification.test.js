import assert from "node:assert/strict";
import test from "node:test";
import { formatMerchantOrderEmail } from "../src/services/orderNotification.js";

test("formats the paid order notification with shipping and products", () => {
  const message = formatMerchantOrderEmail({
    id: 123,
    name: "Test Buyer",
    email: "buyer@example.com",
    phone: "123456",
    address: "123 Test Street",
    city: "Miami",
    postalCode: "33101",
    country: "United States",
    subtotal: "12.11",
    shippingPrice: "90.00",
    totalPrice: "102.11",
    currency: "USD",
    paymentStatus: "COMPLETED",
    carts: [
      {
        productId: "wine-1",
        quantity: 2,
        product: { name: "Test Malbec" },
      },
    ],
  });

  assert.match(message.subject, /#123/);
  assert.match(message.text, /Test Malbec x 2/);
  assert.match(message.text, /123 Test Street/);
  assert.match(message.text, /Shipping: USD 90\.00/);
  assert.match(message.text, /Total paid: USD 102\.11/);
});
