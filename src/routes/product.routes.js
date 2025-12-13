import {Router} from 'express';
import { createProduct, getProducts, getProductID, editProduct , productDelete , getProductsByName, getProductsByQuery} from '../controllers/Product.js';


const router = Router();

router.get('/product', getProducts) 
router.get('/product', getProductsByName) 
router.get('/product/:id', getProductID)
router.post('/product', createProduct )
router.put('/product/:id',editProduct )
router.delete('/product/:id', productDelete)
router.get('/search', getProductsByQuery)





export default router;