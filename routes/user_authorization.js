const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

require('dotenv').config();

const router = express.Router();

router.post("/signup", async (req, res) => {
    const {username, pasword} = req.body;

    try{
        const newUser = newUser({ username, password });

        await newUser.save();
        res.status(201).json({message: "congrats on making a new account. don't lose the password"})
    }catch(e){
        return res.status(500).json({message: 'there was an error in creating the user: ', error: e.message})
    }
})

const auth = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.status(403).json({ message: 'No token provided, so no access.' });
    }
    else if (token.startsWith('Bearer ')) { // just to get the actual token
        token = token.split(' ')[1];
    }

    jwt.verify(token, process.env.JWT_SECRET, (e, user) => {
        if (e){
            return res.status(401).json({message: 'token invalid lol'})
        }
        req.user = user;
        next()
    })
}

router.get("/protected", auth, (req, res) => {
    res.status(200).json({message: "access granted"})
})

router.post("/login", async (req, res) => {
    const {username, password} = req.body;

    try{
        const user = await User.findOne({username});

        if (user != false && password == user.password) {
            const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '24h'});
            res.status(200).json({token})
        }
    }
    catch(e){
        return res.status(500).json({message: 'there was an error in logging in: ', error: e.message})
    }
})

module.exports = router;
