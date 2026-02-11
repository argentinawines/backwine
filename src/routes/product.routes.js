import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductID,
  editProduct,
  productDelete,
  getProductsByName,
  getProductsByQuery,
} from "../controllers/Product.js";

const router = Router();

/**
 * LISTADO / BUSQUEDA POR NOMBRE
 * - GET /product
 * - GET /products
 * Si viene ?name= o ?q= llama a getProductsByName, si no llama a getProducts
 */
router.get(["/product", "/products"], (req, res, next) => {
  const name = (req.query?.name ?? "").toString().trim();
  const q = (req.query?.q ?? "").toString().trim();

  if (name || q) return getProductsByName(req, res, next);
  return getProducts(req, res, next);
});

/**
 * SEARCH (mejor que esté ANTES que :id para evitar choques)
 * - GET /search
 * - GET /product/search
 * - GET /products/search
 */
router.get(["/search", "/product/search", "/products/search"], getProductsByQuery);

/**
 * POR ID
 */
router.get(["/product/:id", "/products/:id"], getProductID);

/**
 * CRUD
 */
router.post(["/product", "/products"], createProduct);
router.put(["/product/:id", "/products/:id"], editProduct);
router.delete(["/product/:id", "/products/:id"], productDelete);

export default router;
