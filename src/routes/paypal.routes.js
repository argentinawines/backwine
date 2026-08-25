import { Router } from "express";
import {
  captureCheckoutOrder,
  createCheckoutOrder,
  getPayPalConfig,
  receivePayPalWebhook,
} from "../controllers/paypal.js";

const router = Router();

router.get("/paypal/config", getPayPalConfig);
router.post("/paypal/orders", createCheckoutOrder);
router.post("/paypal/orders/:paypalOrderId/capture", captureCheckoutOrder);
router.post("/paypal/webhook", receivePayPalWebhook);

export default router;
