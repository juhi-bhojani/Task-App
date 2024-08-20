const express = require("express")
const User = require("../models/user")
const auth = require("../middleware/auth")
const {sendWelcomeEmail,sendCancellationEmail} = require("../emails/account")

// setting up multer to get file uploads
const multer = require("multer")
//library for handling images resizing and reformatting
const sharp = require("sharp")

const router = new express.Router()


// post method to create user
router.post("/users",async (req,res)=>{
    const user = new User(req.body)
    
    try{
        const data = await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user:user.getPublicProfile(),...token})
    }
    catch(err){
        res.status(400)
        res.send(`Error occured! ${err}`)
    }
})

// post method for user to login
router.post("/users/login",async(req,res)=>{
    try{
        // defining method to find user by credentials
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user:user.getPublicProfile(),...token})
    }
    catch(err){
        res.status(400).send(`${err}`)
    }
})

// post method to logout user
router.post("/users/logout",auth,async(req,res)=>{
    res.send("Logged out successfully")
})

// get method to get profile information of user
// adding auth middleware at only required paths
router.get("/users/me",auth ,async (req,res)=>{
    res.send(req.user)
})

// get method to get user based on user ID
// this route isnt needed anymore
// router.get("/users/:id",async (req,res)=>{
//     try{
//         const id = req.params.id
//         console.log(id)
//         const data = await User.find({"_id":id})
//         if(!data.length){
//             return res.status(404).send()
//         }
//         res.send(data)
//     }
//     catch(err){
//         res.status(500).send("Server Error!")
//     }
// })

// patch method in order to update user information
// patch only your own information
router.patch("/users/me",auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']

    const isValidOperation = updates.every((val)=>allowedUpdates.includes(val))
    
    if(!isValidOperation){
        return res.status(400).send({"error":"Invalid Updates!"})
    }

    try{
        // won't send error in case the user property we are trying to update doesn't exist
        updates.forEach((update)=>req.user[update] = req.body[update])
        const updatedUser = await new User(req.user).save()
        res.send(updatedUser)
    }   
    catch(err){
        console.log(err)
        res.status(400).send(err)
    }
})

// delete method in order to delete a user by ID
router.delete("/users/me",auth,async (req,res)=>{
    try{
        const id = req.user._id
        const user = await User.findByIdAndDelete(id)
        sendCancellationEmail(user.email,user.name)
        res.send(user)
    }
    catch(err){
        res.status(500).send(err)
    }
})

// configuring endpoint to add profile picture

const upload = multer({
    // destination where images must be stored
    // dest:"avatars",
    limits:{
        // number of bytes , 1MB = 1000000B
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            // sends an error
            return cb(new Error("Please upload appropriate file format. Allowed formats are: .jpg, .jpeg and .png"))
        }
        
        // callback in case we want to allow upload  
        cb(undefined,true)
    }
})

// here upload.single is a middleware provided by multer
router.post("/users/me/avatar",auth,upload.single('avatar'),async (req,res)=>{
    // using sharp to modify existing image
    const buffer =await sharp(req.file.buffer).resize({
        width:250,
        height:250
    }).png().toBuffer()

    // to access uploaded file
    req.user.avatar =  buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    // callback to handle errors
    res.status(400).send({error: error.message})
})

// endpoint to delete the avatar
router.delete("/users/me/avatar",auth,async (req,res)=>{
    req.user.avatar= undefined
    await req.user.save()
    res.send()
})

// endpoint to fetch the avatar
router.get("/users/:id/avatar",async(req,res)=>{
    try{
        const user = await User.findOne({"_id":req.params.id})

        if(!user || !user.avatar){
            throw new Error()
        }

        // setting up response header
        res.setHeader("content-type","image/png")
        res.send(user.avatar)
    }
    catch(err){
        res.status(404).send(`${err}`)
    }
})

module.exports = router
