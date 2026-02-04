import { getAllCategories, createCategory } from '../services/categories.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getCategoriesController = async (req, res) => {
    const categories = await getAllCategories();

    res.json({
        status: 200,
        message: 'Categories retrieved successfully',
        data: categories,
    });
};

export const createCategoryController = async (req, res) => {
    let photoUrl;

    if (req.file) {
        photoUrl = await saveFileToCloudinary(req.file);
    }

    const category = await createCategory({
        ...req.body,
        image: photoUrl,
    });

    res.status(201).json({
        status: 201,
        message: 'Category created successfully',
        data: category,
    });
};
