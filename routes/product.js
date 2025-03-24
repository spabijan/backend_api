const Product = require("../models/product");
const express = require("express");
const router = express.Router();
const {auth, vendorAuth} = require("../middleware/auth");
const res = require("express/lib/response");
const req = require("express/lib/request");

router.post("/api/add-product", auth, vendorAuth, async (req, res) => {
    try {
        const {
            productName, productPrice, quantity, description, category, subcategory, images, vendorId, fullName
        } = req.body;

        const product = new Product({
            productName, productPrice, quantity, description, category, subcategory, images, vendorId, fullName
        });
        await product.save()
        res.status(201).send(product);
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

router.get("/api/popular-products", async (req, res) => {
    await findWithFilter({popular: true}, res)
})

router.get("/api/recommended-products", async (req, res) => {
    await findWithFilter({recommended: true}, res);
})

router.get("/api/products-by-category/:category", async (req, res) => {
    const {category} = req.params;
    await findWithFilter({category: category, popular: true}, res);
})

async function findWithFilter(filter, res) {
    try {
        const popular = await Product.find(filter)
        if (popular.length > 0) {
            res.status(200).send(popular)
        } else {
            res.status(204).send([])
        }
    } catch (e) {
        res.status(500).json({error: e.message})
    }
}

router.get("/api/related-products/:productId", async (req, res) => {
    try {
        const {productId} = req.params;
        const product = await Product.findById(productId, {})
        if (!product) {
            res.status(404).send({msg: "Not Found"})
        } else {
            let relatedProducts = await Product.find({
                subcategory: product.subcategory,
                _id: {$ne: productId},
            });
            if (!relatedProducts || relatedProducts.length === 0) {
                res.status(204).send([])
            } else {
                res.status(200).send(relatedProducts)
            }
        }
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

router.get('/api/top-rated-products', async (req, res) => {
    try {
        const topRated = await Product.find({}).sort({averageRating: -1}).limit(10)    // '-1' means descending sort
        if (!topRated || topRated.length === 0) {
            return res.status(204).send([])
        } else {
            return res.status(200).send(topRated)
        }
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

router.get('/api/product/subcategory/:subcategoryId', async (req, res) => {
    try {
        const {subcategoryId} = req.params;
        const products = await Product.find({subcategory: subcategoryId})
        if (!products || products.length === 0) {
            return res.status(204).send([])
        } else {
            return res.status(200).send(products)
        }
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

router.get('/api/search-product', async (req, res) => {
    try {
        const {query} = req.query;
        if (!query) {
            return res.status(400).json({msg: "Query parameter missing"})
        }
        const products = await Product.find({
            $or: [
                {productName: {$regex: query, $options: 'i'}},
                {description: {$regex: query, $options: 'i'}}
            ]
        })
        if (!products || products.length === 0) {
            return res.status(204).send([])
        } else {
            return res.status(200).send(products)
        }
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

router.put('/api/edit-product/:productId', auth, vendorAuth, async (req, res) => {
    try {
        const {productId} = req.params;
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).send({msg: "Product not found"})
        }
        if (product.vendorId.toString() !== req.user.id.toString()) {
            return res.status(403).send({msg: "Unauthorized"})
        }
        const {vendorId, ...updateData} = req.body;
        const updated = await product.findByIdAndUpdate(productId, {$set: updateData}, {new: true})

        res.status(200).send(updated)
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

module.exports = router;