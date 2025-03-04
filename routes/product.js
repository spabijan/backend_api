const Product = require("../models/product");
const express = require("express");
const router = express.Router();

router.post("/api/add-product", async (req, res) => {
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
            res.status(404).send({msg: "Not Found"})
        }
    } catch (e) {
        res.status(500).json({error: e.message})
    }
}

module.exports = router;