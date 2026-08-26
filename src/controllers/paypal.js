import { sequelize } from "../database/database.js";
import { Cart } from "../models/Cart.js";
import { Order } from "../models/Order.js";
import { Op } from "sequelize";
import { buildCheckoutQuote, centsToUsd } from "../services/checkout.js";
import { notifyMerchantOfPaidOrder } from "../services/orderNotification.js";
import {
  capturePayPalOrder,
  createPayPalOrder,
  getPayPalPublicConfig,
  verifyPayPalWebhook,
} from "../services/paypal.js";

const requiredFields = ["name", "address", "country", "city", "postalCode", "email", "phone"];

function normalizeCustomer(body) {
  const customer = {};
  for (const field of requiredFields) {
    customer[field] = String(body?.[field] || "").trim();
    if (!customer[field] || customer[field].length > 255) {
      throw new Error("INVALID_CUSTOMER_DETAILS");
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    throw new Error("INVALID_EMAIL");
  }

  return customer;
}

function publicCheckoutError(error) {
  const clientErrors = new Set([
    "EMPTY_CART",
    "INVALID_CART_ITEM",
    "PRODUCT_NOT_AVAILABLE",
    "INVALID_PRODUCT_PRICE",
    "COUNTRY_NOT_SUPPORTED",
    "INVALID_BOTTLE_COUNT",
    "BOTTLE_LIMIT_EXCEEDED",
    "SHIPPING_RATE_NOT_FOUND",
    "INVALID_ORDER_TOTAL",
    "INVALID_CUSTOMER_DETAILS",
    "INVALID_EMAIL",
  ]);

  return clientErrors.has(error.message)
    ? { status: 400, message: error.message }
    : { status: 500, message: "CHECKOUT_COULD_NOT_BE_STARTED" };
}

function getCompletedCapture(paypalOrder) {
  return paypalOrder?.purchase_units
    ?.flatMap((unit) => unit?.payments?.captures || [])
    .find((capture) => capture.status === "COMPLETED");
}

function captureMatchesOrder(capture, order) {
  return (
    capture?.amount?.currency_code === order.currency &&
    capture?.amount?.value === Number(order.totalPrice).toFixed(2)
  );
}

export async function getPayPalConfig(req, res) {
  const config = getPayPalPublicConfig();
  res.status(config.configured ? 200 : 503).json(config);
}

export async function createCheckoutOrder(req, res) {
  let localOrder;

  try {
    if (!getPayPalPublicConfig().configured) {
      return res.status(503).json({ message: "PAYPAL_NOT_CONFIGURED" });
    }

    const customer = normalizeCustomer(req.body);
    let transaction;

    try {
      transaction = await sequelize.transaction();
      const quote = await buildCheckoutQuote({
        items: req.body.items,
        country: customer.country,
        transaction,
      });

      localOrder = await Order.create(
        {
          ...customer,
          country: quote.country,
          totalPrice: centsToUsd(quote.totalCents),
          subtotal: centsToUsd(quote.subtotalCents),
          shippingPrice: centsToUsd(quote.shippingCents),
          currency: quote.currency,
          paymentStatus: "CREATING",
          status: "pending",
          userId: req.body.userId || null,
        },
        { transaction }
      );

      await Cart.bulkCreate(
        quote.lines.map(({ productId, quantity }) => ({
          productId,
          quantity,
          orderId: localOrder.id,
          userId: req.body.userId || null,
        })),
        { transaction, validate: true }
      );

      await transaction.commit();

      const paypalOrder = await createPayPalOrder({
        localOrderId: localOrder.id,
        quote,
        customer,
      });

      await localOrder.update({
        paypalOrderId: paypalOrder.id,
        paymentStatus: paypalOrder.status || "CREATED",
      });

      return res.status(201).json({
        orderId: paypalOrder.id,
        localOrderId: localOrder.id,
        amount: {
          currency: quote.currency,
          subtotal: centsToUsd(quote.subtotalCents),
          shipping: centsToUsd(quote.shippingCents),
          total: centsToUsd(quote.totalCents),
        },
      });
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  } catch (error) {
    if (localOrder?.id) {
      await localOrder
        .update({ paymentStatus: "FAILED", status: "canceled" })
        .catch(() => undefined);
    }
    console.error("PayPal order creation failed:", {
      message: error.message,
      debugId: error?.details?.debug_id,
      issues: error?.details?.details?.map(({ issue, description, field }) => ({
        issue,
        description,
        field,
      })),
    });
    const response = publicCheckoutError(error);
    return res.status(response.status).json({ message: response.message });
  }
}

export async function captureCheckoutOrder(req, res) {
  const paypalOrderId = String(req.params.paypalOrderId || "").trim();
  const localOrderId = Number(req.body?.localOrderId);

  if (!paypalOrderId || !Number.isInteger(localOrderId)) {
    return res.status(400).json({ message: "INVALID_ORDER_REFERENCE" });
  }

  const order = await Order.findOne({
    where: { id: localOrderId, paypalOrderId },
  });
  if (!order) {
    return res.status(404).json({ message: "ORDER_NOT_FOUND" });
  }

  if (order.paymentStatus === "COMPLETED") {
    return res.status(200).json({
      status: "COMPLETED",
      orderId: order.id,
      paypalOrderId: order.paypalOrderId,
      captureId: order.paypalCaptureId,
    });
  }

  try {
    const paypalOrder = await capturePayPalOrder(paypalOrderId, order.id);
    const capture = getCompletedCapture(paypalOrder);

    if (paypalOrder.status !== "COMPLETED" || !capture) {
      await order.update({ paymentStatus: paypalOrder.status || "PENDING" });
      return res.status(409).json({ message: "PAYMENT_NOT_COMPLETED" });
    }

    if (!captureMatchesOrder(capture, order)) {
      await order.update({ paymentStatus: "AMOUNT_MISMATCH" });
      console.error(`PayPal amount mismatch for local order ${order.id}`);
      return res.status(409).json({ message: "PAYMENT_REQUIRES_REVIEW" });
    }

    await order.update({
      paypalCaptureId: capture.id,
      paymentStatus: "COMPLETED",
    });

    await notifyMerchantOfPaidOrder(order.id).catch((error) => {
      console.error(`Order ${order.id} email notification failed:`, error.message);
    });

    return res.status(200).json({
      status: "COMPLETED",
      orderId: order.id,
      paypalOrderId,
      captureId: capture.id,
    });
  } catch (error) {
    const issue = error?.details?.details?.[0]?.issue;
    console.error("PayPal capture failed:", issue || error.message);
    return res.status(error.status === 422 ? 422 : 502).json({
      message: issue === "INSTRUMENT_DECLINED" ? issue : "PAYMENT_CAPTURE_FAILED",
    });
  }
}

export async function receivePayPalWebhook(req, res) {
  try {
    const verification = await verifyPayPalWebhook({
      headers: req.headers,
      event: req.body,
    });
    if (verification.verification_status !== "SUCCESS") {
      return res.status(400).json({ message: "INVALID_WEBHOOK_SIGNATURE" });
    }

    const eventType = req.body?.event_type;
    const capture = req.body?.resource;
    const relatedIds = capture?.supplementary_data?.related_ids || {};
    const orderReferences = [];
    if (relatedIds.order_id) {
      orderReferences.push({ paypalOrderId: relatedIds.order_id });
    }
    if (relatedIds.capture_id) {
      orderReferences.push({ paypalCaptureId: relatedIds.capture_id });
    }

    if (orderReferences.length === 0) {
      return res.sendStatus(200);
    }

    const order = await Order.findOne({
      where: { [Op.or]: orderReferences },
    });
    if (!order) {
      return res.sendStatus(200);
    }

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      if (!captureMatchesOrder(capture, order)) {
        await order.update({ paymentStatus: "AMOUNT_MISMATCH" });
        return res.sendStatus(200);
      }
      await order.update({
        paypalCaptureId: capture.id,
        paymentStatus: "COMPLETED",
      });
      void notifyMerchantOfPaidOrder(order.id).catch((error) => {
        console.error(`Order ${order.id} email notification failed:`, error.message);
      });
    } else if (
      eventType === "PAYMENT.CAPTURE.DENIED" ||
      eventType === "PAYMENT.CAPTURE.DECLINED"
    ) {
      await order.update({ paymentStatus: "DENIED", status: "canceled" });
    } else if (eventType === "PAYMENT.CAPTURE.REFUNDED") {
      await order.update({ paymentStatus: "REFUNDED", status: "canceled" });
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("PayPal webhook failed:", error.message);
    return res.status(500).json({ message: "WEBHOOK_PROCESSING_FAILED" });
  }
}
