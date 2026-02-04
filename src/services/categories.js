import { CategoriesCollection } from '../db/models/category.js';

export const getAllCategories = async () => {
    return await CategoriesCollection.find().populate('parentId');
};

export const createCategory = async (payload) => {
    return await CategoriesCollection.create(payload);
};
