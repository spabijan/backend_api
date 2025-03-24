const express = require("express");
const orderRouter = express.Router();
const Order = require("../models/order");
const stripe = require('stripe')("sk_test_51R6BoOLJimGM8VvQ2AKgsYifxUVQw4Aqyr1rTYPsZuPHDC45Auor3toMXdLw0lovl3BuGRSecLjXJh7kDa8uws0200QSbHaszH");
const {auth, vendorAuth} = require("../middleware/auth");
const {json} = require("express");

orderRouter.post("/api/orders", auth, async (req, res) => {
    try {
        const {
            fullName,
            email,
            productName,
            productPrice,
            quantity,
            category,
            image,
            buyerId,
            vendorId,
            city,
            state,
            locality
        } = req.body;

        const order = new Order({
            fullName,
            email,
            productName,
            productPrice,
            quantity,
            category,
            image,
            buyerId,
            vendorId,
            city,
            state,
            locality
        })

        await order.save();
        res.status(201).json(order);
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

orderRouter.get("/api/orders/:buyerId", auth, async (req, res) => {
    try {
        const {buyerId} = req.params;
        const orders = await Order.find({buyerId: buyerId});
        if (orders == null || orders.length === 0) {
            return res.status(200).json([])
        }
        return res.status(200).json(orders);
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

orderRouter.get("/api/orders/vendor/:vendorId", auth, vendorAuth, async (req, res) => {
    try {
        const {vendorId} = req.params;
        const orders = await Order.find({vendorId: vendorId});
        if (orders == null || orders.length === 0) {
            return res.status(200).json([])
        }
        return res.status(200).json(orders);
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

//delete
orderRouter.delete("/api/orders/:id", auth, async (req, res) => {
    try {
        const {id} = req.params;
        const deleted = await Order.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({msg: "Order not found!"});
        } else {
            res.status(200).json(deleted);
        }
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

orderRouter.patch("/api/orders/:id/delivered", async (req, res) => {
    try {
        const {id} = req.params;
        const order = await Order.findByIdAndUpdate(id, {delivered: true, processing: false}, {new: true});
        if (!order) {
            res.status(404).json({msg: "Order not found!"});
        } else {
            res.status(200).json(order);
        }
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

orderRouter.patch("/api/orders/:id/processing", async (req, res) => {
    try {
        const {id} = req.params;
        const order = await Order.findByIdAndUpdate(id, {processing: false}, {new: true});
        if (!order) {
            res.status(404).json({msg: "Order not found!"});
        } else {
            res.status(200).json(order);
        }
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

orderRouter.get("/api/orders", async (req, res) => {
    try {
        const orders = await Order.find()
        return res.status(200).send(orders)
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

// simple payment api for development
orderRouter.post("/api/payment-intent", async (req, res) => {
    try {
        const {amount, currency} = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount, currency
        })
        return res.status(201).json(paymentIntent);
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

// payment api
orderRouter.post("/api/payment", async (req, res) => {
    try {
        const {orderId, paymentMethodId, currency = 'usd'} = req.body;
        if (!orderId || !paymentMethodId || !currency) {
            return res.status(400).json({msg: 'missing required field'})
        }
        const order = await Order.findById(orderId)
        if (!order) {
            console.log('order not found', orderId);
            return res.status(404).json({msg: 'order not found'})
        }
        const totalAmount = order.productPrice * order.quantity;
        const minimumAmount = 0.50 //min transaction is 0.5 USD - for payment provider
        if (totalAmount < minimumAmount) {
            return res.status(400).json({msg: 'Minimal order amount is $0.50 USD'})
        }
        const amountCents = Math.round(totalAmount * 100) // payment provider requires payment in cents

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountCents,
            currency: currency,
            payment_method: paymentMethodId,
            automatic_payment_methods: {enabled: true}
        });
        return res.json({
            status: "success",
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,

        });
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

module.exports = orderRouter;