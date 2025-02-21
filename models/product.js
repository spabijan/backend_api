const mongoose = require('mongoose')

const productsSchema = mongoose.Schema({
    productName: {
        type: String, required: true, trim: true
    }, productPrice: {
        type: Number, required: true,
    }, quantity: {
        type: Number, required: true,
    }, description: {
        type: String, required: true,
    }, category: {
        type: String, required: true,
    }, subcategory: {
        type: String, required: true,
    }, images: [{
        type: String, required: true
    }], popular: {
        type: Boolean, default: false
    }, recommend: {
        type: Boolean, default: false
    }
})

const Product = mongoose.model("Product", productsSchema)
module.exports = Product