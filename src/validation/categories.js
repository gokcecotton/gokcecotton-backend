import Joi from 'joi';

export const createCategorySchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    slug: Joi.string().min(3).max(50).required(),
    parentId: Joi.string().hex().length(24), // Optional, checks for valid ObjectId format if present
});
