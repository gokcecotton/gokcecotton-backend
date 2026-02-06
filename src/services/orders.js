import { startPaymentProcess } from './payment.js';
import { OrdersCollection } from '../db/models/order.js';
import { CartsCollection } from '../db/models/cart.js';
import { ProductsCollection } from '../db/models/product.js';
import { PAYMENT_METHODS } from '../constants/index.js';
import createHttpError from 'http-errors';
import { sendOrderSuccessEmails } from './mailService.js';

export const createOrder = async (userId, payload) => {
    // 1. Get the user's cart
    const cart = await CartsCollection.findOne({ userId });

    if (!cart || cart.items.length === 0) {
        throw createHttpError(400, 'Cart is empty');
    }

    // 2. Fetch products to get current prices and validate stock
    const productIds = cart.items.map((item) => item.productId);
    const products = await ProductsCollection.find({ _id: { $in: productIds } });

    const productMap = {};
    products.forEach((p) => {
        productMap[p._id.toString()] = p;
    });

    // 3. Build Order Items and Calculate Total
    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
        const product = productMap[item.productId.toString()];

        if (!product) {
            throw createHttpError(404, `Product not found: ${item.productId}`);
        }

        if (product.stock < item.quantity) {
            throw createHttpError(400, `Insufficient stock for product: ${product.title}`);
        }

        const itemTotal = product.price * item.quantity;
        totalPrice += itemTotal;

        orderItems.push({
            productId: item.productId,
            quantity: item.quantity,
            price: product.price, // Freeze price
        });
    }

    // 4. Create Order
    const order = await OrdersCollection.create({
        userId,
        items: orderItems,
        totalPrice,
        ...payload,
    });

    // 5. Deduct Stock (Simple approach)
    // In a real app, you might want to use transactions (startSession) for atomicity
    for (const item of orderItems) {
        await ProductsCollection.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
        });
    }

    // 6. Handle Payment Method
    if (payload.paymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
        // Fetch user to pass to Iyzico
        const user = await import('../db/models/user.js').then(m => m.UsersCollection.findById(userId));
        const ip = payload.ip || '127.0.0.1';

        // Note: We need to pass populated items or names. 
        // The current order.items only has IDs. 
        // Let's populate manually or rely on service to fetch names (service uses simple 'Product' name for now).
        const htmlContent = await startPaymentProcess(order, user, ip);

        // Clear cart
        cart.items = [];
        await cart.save();

        return { order, paymentHtml: htmlContent };
    }

    // 7. Clear Cart (for non-CC)
    cart.items = [];
    await cart.save();

    // Send emails for non-CC orders (e.g. cash on delivery if implemented later)
    sendOrderSuccessEmails(order._id);

    return { order };
};

export const getUserOrders = async (userId) => {
    return await OrdersCollection.find({ userId })
        .sort({ createdAt: -1 })
        .populate('items.productId', 'title image');
};

export const getOrderById = async (orderId) => {
    const order = await OrdersCollection.findById(orderId).populate(
        'items.productId',
    );
    if (!order) throw createHttpError(404, 'Order not found');
    return order;
};

export const updateOrderStatus = async (orderId, status) => {
    const order = await OrdersCollection.findByIdAndUpdate(
        orderId,
        { status },
        { new: true },
    );
    if (!order) throw createHttpError(404, 'Order not found');
    return order;
};
