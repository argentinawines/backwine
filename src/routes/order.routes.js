import {Router} from 'express';
import { getOrderID, getOrders, cancelOrder } from '../controllers/order.js';
import { tokenVerify } from '../utils/jwt.js';


const router = Router();

router.get('/order', tokenVerify, getOrders)
router.get('/order/:id', tokenVerify, getOrderID)
router.post('/order', (req, res) => {
  res.status(410).json({
    message: "Direct order creation is disabled. Use the verified payment checkout.",
  });
})
router.put('/order/:id', tokenVerify, cancelOrder)







export default router;
