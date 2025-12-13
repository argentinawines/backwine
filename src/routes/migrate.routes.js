import express from "express";
import { migrateProducts, migrateProductsOffers } from "../controllers/migrateProduct.js";
const router = express.Router();

router.get("/migrate-products", migrateProducts);
router.get("/migrate-products-offers", migrateProductsOffers);


export default router;