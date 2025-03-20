const express = require("express");
const orderRouter = express.Router();
const Order = require("../models/order");
const {auth, vendorAuth} = require("../middleware/auth");

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

module.exports = orderRouter;