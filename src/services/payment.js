import iyzico from '../utils/iyzico.js';
import { OrdersCollection } from '../db/models/order.js';
import createHttpError from 'http-errors';
import { env } from '../utils/env.js';
import { sendOrderSuccessEmails } from './mailService.js';

export const startPaymentProcess = async (order, user, ip) => {
    const request = {
        locale: 'tr',
        conversationId: order._id.toString(),
        price: order.totalPrice.toFixed(2),
        paidPrice: order.totalPrice.toFixed(2),
        currency: 'TRY',
        basketId: order._id.toString(),
        paymentGroup: 'PRODUCT',
        callbackUrl: `${env('APP_URL')}/api/orders/callback`, // Needs to be configured in env
        enabledInstallments: [1, 2, 3, 6, 9],
        buyer: {
            id: user._id.toString(),
            name: user.name,
            surname: user.surname,
            gsmNumber: order.contactNumber || '+905555555555',
            email: user.email,
            identityNumber: '11111111111', // Should be collected from user ideally
            lastLoginDate: '2015-10-05 12:43:35',
            registrationDate: '2013-04-21 15:12:09',
            registrationAddress: order.address.street,
            ip: ip,
            city: order.address.city,
            country: order.address.country,
            zipCode: order.address.zip,
        },
        shippingAddress: {
            contactName: `${user.name} ${user.surname}`,
            city: order.address.city,
            country: order.address.country,
            address: order.address.street,
            zipCode: order.address.zip,
        },
        billingAddress: {
            contactName: `${user.name} ${user.surname}`,
            city: order.address.city,
            country: order.address.country,
            address: order.address.street,
            zipCode: order.address.zip,
        },
        basketItems: order.items.map((item) => ({
            id: item.productId.toString(),
            name: 'Product', // Ideally fetch product name
            category1: 'General',
            itemType: 'PHYSICAL',
            price: item.price.toFixed(2),
        })),
    };

    return new Promise((resolve, reject) => {
        iyzico.checkoutFormInitialize.create(request, async (err, result) => {
            if (err) {
                return reject(err);
            }

            if (result.status !== 'success') {
                return reject(new Error(result.errorMessage));
            }

            // Save the token to verified callback later
            order.iyzicoToken = result.token;
            order.ipAddress = ip;
            await order.save();

            resolve(result.checkoutFormContent); // HTML Content
        });
    });
};

export const verifyPayment = async (token) => {
    return new Promise((resolve, reject) => {
        iyzico.checkoutForm.retrieve({
            locale: 'tr',
            token: token
        }, async (err, result) => {
            if (err) return reject(err);

            if (result.status !== 'success') {
                return reject(new Error(result.errorMessage));
            }

            if (result.paymentStatus !== 'SUCCESS') {
                return resolve({ success: false });
            }

            const order = await OrdersCollection.findOne({ iyzicoToken: token });
            if (!order) return resolve({ success: false, error: 'Order not found' });

            order.status = 'Processing'; // or 'Paid'
            order.paymentStatus = 'Success';
            order.iyzicoPaymentId = result.paymentId;
            await order.save();

            // Send Emails (Best effort, don't await blocking response if speed needed, but here usually fine)
            // Using setImmediate or not awaiting to prevent blocking response? 
            // For safety and to keep response fast, we can not await it, or handle it in background.
            // But usually Node handles async well. Let's just call it without awaiting to return response faster.
            sendOrderSuccessEmails(order._id);

            resolve({ success: true, orderId: order._id });
        });
    });
};
