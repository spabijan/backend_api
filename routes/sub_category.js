const express = require('express');
const SubCategory = require("../models/sub_category");
const subCategoryRouter = express.Router();

subCategoryRouter.post("/api/subcategories", async (req, res) => {
    try {
        const {categoryId, categoryName, image, subCategoryName} = req.body;
        const subCategory = new SubCategory({categoryId, categoryName, image, subCategoryName});
        await subCategory.save();
        res.status(201).send(subCategory)
    } catch (e) {
        res.status(500).send({error: e});
    }
})

subCategoryRouter.get("/api/subcategories", async (req, res) => {
    try {
        const subcategories = await SubCategory.find();
        if (!subcategories || subcategories.length === 0) {
            res.status(404).send({msg: "SubCategory not found"});
        } else {
            res.status(200).send(subcategories)
        }
    } catch (e) {
        res.status(500).send({error: e});
    }
})

subCategoryRouter.get("/api/category/:categoryName/subcategories", async (req, res) => {
    try {
        const {categoryName} = req.params;
        const subcategories = await SubCategory.find({categoryName: categoryName});
        if (!subcategories || subcategories.length === 0) {
            res.status(204).send([]);
        } else {
            res.status(200).send(subcategories)
        }
    } catch (e) {
        res.status(500).send({error: e});

    }
})

module.exports = subCategoryRouter;