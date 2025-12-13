import {Router} from 'express';
// import {  getCartProducts, addProductInCart, deleteProductInCart } from '../controllers/Cart.js';
import { getCartProducts,addProductInCart, deleteProductInCart, getCarts } from '../controllers/Cart.js';


const router = Router();

router.get('/cart', getCartProducts) 
router.get('/carts', getCarts) 

router.post('/cart', addProductInCart )

router.delete('/cart/:id', deleteProductInCart)






export default router;