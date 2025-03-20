const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Vendor = require('../models/vendors')

const auth = async (req, res, next) => {
    try {
        const token = await req.header('x-auth-token')
        if (!token) {
            return res.status(401).send({msg: 'Token not found'})
        }
        const verified = jwt.verify(token, 'passwordKey')
        if (!verified) {
            return res.status(401).send({msg: 'Token not verified'})
        }

        const user = await User.findById(verified.id) || await Vendor.findById(verified.id)
        if (!user) {
            return res.status(401).send({msg: 'Token not verified'})
        }
        req.user = user

        req.token = token
        next()
    } catch (error) {
        res.status(500).send({error: "Error occurred"})
    }
}

const vendorAuth = async (req, res, next) => {
    try {
        if (!req.user.role || req.user.role !== 'vendor') {
            return res.status(403).send({msg: 'User is not authorized, Access denied'})
        }
        next()
    } catch (error) {
        res.status(500).send({error: "Error occurred"})
    }
}

module.exports = {auth, vendorAuth}