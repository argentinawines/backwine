import { Op } from "sequelize";
import { Product } from "../models/Product.js";
import { getShippingQuote } from "./shipping.js";

function parsePriceToCents(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("INVALID_PRODUCT_PRICE");
  }
  return Math.round(amount * 100);
}

export function normalizeCheckoutItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("EMPTY_CART");
  }

  const quantitiesByProduct = new Map();
  for (const item of items) {
    const productId = String(item?.productId || "").trim();
    const quantity = Number(item?.quantity);
    if (!productId || !Number.isInteger(quantity) || quantity <= 0 || quantity > 100) {
      throw new Error("INVALID_CART_ITEM");
    }
    quantitiesByProduct.set(
      productId,
      (quantitiesByProduct.get(productId) || 0) + quantity
    );
  }

  return [...quantitiesByProduct].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export function calculateCheckoutQuote({ items, products, country }) {
  const productsById = new Map(products.map((product) => [product.id, product]));
  let subtotalCents = 0;
  let bottleCount = 0;

  const lines = items.map(({ productId, quantity }) => {
    const product = productsById.get(productId);
    if (!product || product.isActive === false) {
      throw new Error("PRODUCT_NOT_AVAILABLE");
    }

    const unitPriceCents = parsePriceToCents(product.price);
    subtotalCents += unitPriceCents * quantity;
    bottleCount += quantity * (product.offer === true ? 6 : 1);

    return {
      productId,
      quantity,
      name: String(product.name || "Wine").slice(0, 127),
      unitPriceCents,
    };
  });

  const shipping = getShippingQuote(country, bottleCount);
  const totalCents = subtotalCents + shipping.shippingCents;
  if (totalCents <= 0) {
    throw new Error("INVALID_ORDER_TOTAL");
  }

  return {
    currency: "USD",
    lines,
    subtotalCents,
    shippingCents: shipping.shippingCents,
    totalCents,
    bottleCount,
    country: shipping.country,
    countryCode: shipping.countryCode,
  };
}

export async function buildCheckoutQuote({ items, country, transaction }) {
  const normalizedItems = normalizeCheckoutItems(items);
  const products = await Product.findAll({
    attributes: ["id", "name", "price", "offer", "isActive"],
    where: { id: { [Op.in]: normalizedItems.map(({ productId }) => productId) } },
    transaction,
  });

  if (products.length !== normalizedItems.length) {
    throw new Error("PRODUCT_NOT_AVAILABLE");
  }

  return calculateCheckoutQuote({
    items: normalizedItems,
    products: products.map((product) => product.get({ plain: true })),
    country,
  });
}

export function centsToUsd(cents) {
  return (cents / 100).toFixed(2);
}
