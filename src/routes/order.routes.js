import {Router} from 'express';
import { getOrderID, getOrders, createOrder, cancelOrder   } from '../controllers/order.js';


const router = Router();

router.get('/order', getOrders) 
router.get('/order/:id', getOrderID)
router.post('/order',  createOrder)
router.put('/order/:id', cancelOrder)







export default router;