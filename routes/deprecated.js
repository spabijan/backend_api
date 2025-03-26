const express = require("express")
const vendorRouter = new express.Router();

vendorRouter.post('/api/vendor/signup', async (req, res) => {
    res.status(404).json({error: "deprecated api"})
})

module.exports = vendorRouter