const express = require('express');
const ProductReview = require('../models/product_review');

const productReviewRouter = express.Router();

productReviewRouter.post("/api/product-review", async (req, res) => {
    try {
        const {buyerId, email, fullName, rating, review, productId} = req.body;
        const newReview = new ProductReview({buyerId, email, fullName, rating, review, productId})
        await newReview.save()
        res.status(201).json(newReview)
    } catch (err) {
        res.status(500).send({error: err.message});
    }
})

productReviewRouter.get("/api/product-review", async (req, res) => {
    try {
        const reviews = await ProductReview.find()
        if (reviews.length > 0) {
            res.status(200).json(reviews)
        } else {
            res.status(404).send({msg: 'Not Found'})
        }
    } catch (err) {
        res.status(500).send({error: err.message});
    }
})
module.exports = productReviewRouter;