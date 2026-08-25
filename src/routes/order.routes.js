import {Router} from 'express';
import { getOrderID, getOrders, cancelOrder } from '../controllers/order.js';


const router = Router();

router.get('/order', getOrders) 
router.get('/order/:id', getOrderID)
router.post('/order', (req, res) => {
  res.status(410).json({
    message: "Direct order creation is disabled. Use the verified payment checkout.",
  });
})
router.put('/order/:id', cancelOrder)







export default router;
