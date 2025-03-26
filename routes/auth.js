const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const authRouter = express.Router();
const jwt = require('jsonwebtoken');
const sendOtpEmail = require('../helper/send_emails');
const crypto = require('crypto');
const {auth} = require('../middleware/auth');

const otpStore = new Map();
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

            const otp = crypto.randomInt(100000, 999999).toString()
            otpStore.set(email, {otp, expiresAt: Date.now() + 10 * 60 * 1000}) // Expires in 10 minutes

            let emailResponse = await sendOtpEmail(email, otp)

            res.status(201).json({msg: "Verification email send", emailResponse})
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
        }
        if (!user.isVerified) {
            return res.status(400).json({msg: "User not verified"})
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

authRouter.post('/api/verify-otp', async (req, res) => {
    try {
        const {email, otp} = req.body;
        const otpData = otpStore.get(email)
        if (!otpData) {
            return res.status(400).json({msg: "OTP not found or expired"})
        }
        if (otpData.otp !== otp) {
            return res.status(400).json({msg: "OTP invalid"})
        }
        if (otpData.expiresAt < Date.now()) {
            otpStore.delete(email)
            return res.status(400).json({msg: "OTP expired"})
        }
        const user = await User.findOneAndUpdate({email}, {isVerified: true}, {new: true})
        if (!user) {
            return res.status(400).json({msg: "invalid email"})
        }
        otpStore.delete(email)

        // TODO: send welcome mail
        return res.status(200).json({msg: "Email verification successfully", user})
    } catch (e) {
        res.status(500).json({error: e})
    }
})

// remember to exclude password!!!
authRouter.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password')
        return res.status(200).json(users)
    } catch (e) {
        res.status(500).json({error: e})
    }
})

authRouter.delete('/api/users/:id', auth,  async (req, res) => {
    try {
    const {id} = req.params;
    let userToDelete = await User.findById(id)
        if (!userToDelete) {
            return res.status(400).json({msg: "User not found"})
        }
        User.findByIdAndDelete(id)
        return res.status(200).json({msg: "User deleted successfully"})
    }catch (e) {
        res.status(500).json({error: e})
    }
})

module.exports = authRouter
