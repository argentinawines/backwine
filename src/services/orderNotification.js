import nodemailer from "nodemailer";
import { Op } from "sequelize";
import { Cart } from "../models/Cart.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";

const defaultRecipient = "info@argentinawineshipping.com";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) {
    throw new Error("ORDER_EMAIL_NOT_CONFIGURED");
  }

  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host,
    port,
    // Render's free instances can resolve Gmail to IPv6 even when the
    // instance has no usable IPv6 route. Force IPv4 so SMTP remains reachable.
    family: 4,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

export function formatMerchantOrderEmail(order) {
  const items = (order.carts || []).map((cart) => {
    const productName = cart.product?.name || `Product ${cart.productId}`;
    return `- ${productName} x ${cart.quantity}`;
  });

  const subject = `New paid order #${order.id} - Argentina Wine Shipping`;
  const text = [
    `A new PayPal payment was confirmed for order #${order.id}.`,
    "",
    `Customer: ${order.name}`,
    `Email: ${order.email}`,
    `Phone: ${order.phone}`,
    `Delivery address: ${order.address}`,
    `City / ZIP: ${order.city}, ${order.postalCode}`,
    `Country: ${order.country}`,
    "",
    "Products:",
    ...(items.length ? items : ["- No product details available"]),
    "",
    `Subtotal: ${order.currency || "USD"} ${order.subtotal || order.totalPrice}`,
    `Shipping: ${order.currency || "USD"} ${order.shippingPrice || "0.00"}`,
    `Total paid: ${order.currency || "USD"} ${order.totalPrice}`,
    `Payment status: ${order.paymentStatus}`,
    "",
    "Review the order in the administration panel before arranging shipment.",
  ].join("\n");

  return { subject, text };
}

export async function notifyMerchantOfPaidOrder(orderId) {
  // Render Free blocks outbound SMTP ports. Keep email delivery opt-in so a
  // blocked SMTP connection never delays a successful PayPal capture.
  if (process.env.ORDER_EMAIL_ENABLED !== "true") return false;

  const [claimed] = await Order.update(
    { merchantNotificationStatus: "SENDING" },
    {
      where: {
        id: orderId,
        paymentStatus: "COMPLETED",
        [Op.or]: [
          { merchantNotificationStatus: null },
          { merchantNotificationStatus: "FAILED" },
        ],
      },
    }
  );

  if (!claimed) return false;

  try {
    const order = await Order.findByPk(orderId, {
      include: [{ model: Cart, include: [{ model: Product }] }],
    });
    if (!order) throw new Error("ORDER_NOT_FOUND_FOR_NOTIFICATION");

    const message = formatMerchantOrderEmail(order);
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.ORDER_NOTIFICATION_EMAIL || defaultRecipient,
      replyTo: order.email,
      ...message,
    });

    await order.update({
      merchantNotificationStatus: "SENT",
      merchantNotifiedAt: new Date(),
    });
    return true;
  } catch (error) {
    await Order.update(
      { merchantNotificationStatus: "FAILED" },
      { where: { id: orderId } }
    ).catch(() => undefined);
    throw error;
  }
}
