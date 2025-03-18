const express = require("express");
const Category = require("../models/Category");

const categoryRouter = express.Router();

categoryRouter.post("/api/categories", async (req, res) => {
    try {
        const {name, image, banner} = req.body;
        const category = new Category({name, image, banner})
        await category.save();
        return res.status(201).send(category);
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})
categoryRouter.get("/api/categories", async (req, res) => {
    try {
        const banners = await Category.find()
        return res.status(200).send(banners)
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

module.exports = categoryRouter;