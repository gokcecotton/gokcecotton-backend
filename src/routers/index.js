import { Router } from 'express';
import categoriesRouter from './categories.js';
import cartRouter from './cart.js';
import authRouter from './auth.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/categories', categoriesRouter);
router.use('/products', productsRouter);
router.use('/cart', cartRouter);

export default router;
