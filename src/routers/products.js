import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { UPLOAD_LIMITS } from '../constants/index.js';
import {
    getProductsController,
    getProductByIdController,
    createProductController,
    updateProductController,
    deleteProductController,
} from '../controllers/products.js';
import { upload } from '../utils/upload.js';
import { authenticate } from '../middlewares/authenticate.js';
import { checkRoles } from '../middlewares/checkRoles.js';
import validateBody from '../middlewares/validateBody.js';
// TODO: Add Validation Schemas for Product (createProductSchema, updateProductSchema)

const productsRouter = Router();

productsRouter.get('/', ctrlWrapper(getProductsController));

productsRouter.get('/:productId', ctrlWrapper(getProductByIdController));

productsRouter.post(
    '/',
    authenticate,
    checkRoles('admin'),
    upload.array('images', UPLOAD_LIMITS.MAX_COUNT),
    // validateBody(createProductSchema),
    ctrlWrapper(createProductController),
);

productsRouter.patch(
    '/:productId',
    authenticate,
    checkRoles('admin'),
    // validateBody(updateProductSchema),
    ctrlWrapper(updateProductController),
);

productsRouter.delete(
    '/:productId',
    authenticate,
    checkRoles('admin'),
    ctrlWrapper(deleteProductController),
);

export default productsRouter;
