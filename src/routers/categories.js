import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
    getCategoriesController,
    createCategoryController,
} from '../controllers/categories.js';
import { upload } from '../utils/upload.js';
import { authenticate } from '../middlewares/authenticate.js';
import { checkRoles } from '../middlewares/checkRoles.js';
import validateBody from '../middlewares/validateBody.js';
import { createCategorySchema } from '../validation/categories.js';

const categoriesRouter = Router();

categoriesRouter.get('/', ctrlWrapper(getCategoriesController));

categoriesRouter.post(
    '/',
    authenticate,
    checkRoles('admin'),
    upload.single('image'),
    validateBody(createCategorySchema),
    ctrlWrapper(createCategoryController),
);

export default categoriesRouter;
