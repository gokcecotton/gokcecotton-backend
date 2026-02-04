import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
    getCategoriesController,
    createCategoryController,
} from '../controllers/categories.js';
import { upload } from '../utils/upload.js';
import { authenticate } from '../middlewares/authenticate.js';
import { checkRoles } from '../middlewares/checkRoles.js';

const categoriesRouter = Router();

categoriesRouter.get('/', ctrlWrapper(getCategoriesController));

categoriesRouter.post(
    '/',
    authenticate,
    checkRoles('admin'),
    upload.single('image'),
    ctrlWrapper(createCategoryController),
);

export default categoriesRouter;
