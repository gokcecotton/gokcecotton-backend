import Joi from 'joi';

export const createProductSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().min(0).default(0),
    brand: Joi.string().max(50),
    categoryId: Joi.string().hex().length(24).required(),
    attributes: Joi.object().pattern(Joi.string(), Joi.string()), // e.g., { "Size": "M" }
});

export const updateProductSchema = Joi.object({
    title: Joi.string().min(3).max(100),
    description: Joi.string().min(10),
    price: Joi.number().min(0),
    stock: Joi.number().min(0),
    brand: Joi.string().max(50),
    categoryId: Joi.string().hex().length(24),
    attributes: Joi.object().pattern(Joi.string(), Joi.string()),
});
