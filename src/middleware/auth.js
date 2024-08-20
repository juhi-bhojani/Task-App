const jwt = require("jsonwebtoken")
const User = require("../models/user")
require('dotenv').config()

const secretKey = process.env.SECRETKEY

const auth = async (req,res,next) => {
    try{
        const token = req.header("Authorization").replace("Bearer ","")
        const decoded = jwt.verify(token,secretKey)
        const user = await User.findOne({"_id":decoded.id})
        if(!user){
            throw new Error()
        }
        req.user = user
        next()
    }
    catch(e){
        res.status(400).send(`Please authenticate!!!`)
    }
}

module.exports = auth