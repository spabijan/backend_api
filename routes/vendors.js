const express = require("express")
const Vendor = require("../models/vendors");
const vendorRouter = new express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {auth, vendorAuth} = require("../middleware/auth");
const User = require("../models/user");

vendorRouter.post('/api/v2/vendor/signup', async (req, res) => {
    try {
        const {fullName, email, password, storeName, storeImage, storeDescription} = req.body;
        const existingEmail = await Vendor.findOne({email})
        if (existingEmail) {
            return res.status(400).json({msg: "Email already exists"})
        } else {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            let vendor = new Vendor({fullName, email, storeName, storeImage, storeDescription, password: hash});
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
                const token = jwt.sign({id: vendor._id}, "passwordKey", {expiresIn: "1h"});
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

vendorRouter.delete('/api/vendors/:id', auth, vendorAuth, async (req, res) => {
    try {
        const {id} = req.params;
        let userToDelete = await Vendor.findById(id)
        if (!userToDelete) {
            return res.status(400).json({msg: "Vendor not found"})
        }
        Vendor.findByIdAndDelete(id)
        return res.status(200).json({msg: "Vendor deleted"})
    }catch (e) {
        res.status(500).json({error: e})
    }
})

vendorRouter.post('/api/vendors/token-validation', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.json(false)
        }
        const verified = jwt.verify(token, 'passwordKey')
        if (!verified) {
            return res.json(false)
        }
        const user = await Vendor.findById(verified.id);
        if (!user) {
            return res.json(false)
        }
        return res.json(true)
    } catch (error) {
        return res.json(false)
    }
})

vendorRouter.get('/vendor/', auth, vendorAuth, async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.user) // do not confuse. 'user' is request field!!!
        const {password, ...vendorWithoutPassword} = vendor._doc
        return res.json({vendor: vendorWithoutPassword, token: req.token})
    } catch (e) {
        return res.status(500).json({error: e})
    }
})

module.exports = vendorRouter