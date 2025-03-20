const express = require("express")
const Vendor = require("../models/vendors");
const vendorRouter = new express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

vendorRouter.post('/api/vendor/signup', async (req, res) => {
    try {
        const {fullName, email, password} = req.body;
        const existingEmail = await Vendor.findOne({email})
        if (existingEmail) {
            return res.status(400).json({msg: "Email already exists"})
        } else {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            let vendor = new Vendor({fullName, email, password: hash});
            vendor = await vendor.save()
            res.json({vendor})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

vendorRouter.post('/api/vendor/signIn', async (req, res) => {
    try {
        const {email, password} = req.body;
        const vendor = await Vendor.findOne({email});
        if (!vendor) {
            return res.status(400).json({msg: "User not found"})
        } else {
            let isMatch = await bcrypt.compare(password, vendor.password);
            if (!isMatch) {
                return res.status(400).json({msg: "Password not match"})
            } else {
                const token = jwt.sign({id: vendor._id}, "passwordKey")

                const {password, ...vendorWithoutPassword} = vendor._doc
                res.status(200).json({token, vendor: vendorWithoutPassword})
            }
        }
    } catch (e) {
        res.status(500).json({error: e})
    }
})

// remember to exclude password!!!
vendorRouter.get('/api/vendors', async (req, res) => {
    try {
        const users = await Vendor.find().select('-password')
        return res.status(200).json(users)
    } catch (e) {
        res.status(500).json({error: e})
    }
})

module.exports = vendorRouter