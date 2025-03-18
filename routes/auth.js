const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const authRouter = express.Router();
const jwt = require('jsonwebtoken');

authRouter.put('/api/users/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {state, city, locality} = req.body;
        const user = await User.findByIdAndUpdate(id, {state, city, locality}, {new: true});

        if (!user) {
            return res.status(400).json({msg: "User not found"})
        }
        return res.status(200).json({user})
    } catch (e) {
        res.status(500).json({error: e})
    }
})

authRouter.post('/api/signup', async (req, res) => {
    try {
        const {fullName, email, password} = req.body;
        const existingEmail = await User.findOne({email})
        if (existingEmail) {
            return res.status(400).json({msg: "Email already exists"})
        } else {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            let user = new User({fullName, email, password: hash});
            user = await user.save()
            res.json({user})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

authRouter.post('/api/signIn', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({msg: "User not found"})
        } else {
            let isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({msg: "Password not match"})
            } else {
                const token = jwt.sign({id: user._id}, "passwordKey")

                const {password, ...userWithoutPassword} = user._doc
                res.status(200).json({token, user: userWithoutPassword})
            }
        }
    } catch (e) {
        res.status(500).json({error: e})
    }
})


module.exports = authRouter
