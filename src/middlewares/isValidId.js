import { isValidObjectId } from 'mongoose';
import createHttpError from 'http-errors';

export const isValidId = (req, res, next) => {
    const { id, productId, itemId } = req.params;
    const idToCheck = id || productId || itemId;

    if (idToCheck && !isValidObjectId(idToCheck)) {
        throw createHttpError(400, 'Invalid ID format');
    }

    next();
};
