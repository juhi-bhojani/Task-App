const mongoose = require("mongoose")
const validator = require("validator")
const bcrpyt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require("./task")
require('dotenv').config({ path: '/home/juhi/Techs/node/task-manager/config/dev.env' })


const secretKey = process.env.SECRETKEY

// a mongoose schema defines the structure of the document
// a mongoose model is a wrapper on schema, it bascially provides an interface to perform crud operations in DB

// creating userSchema
const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number,
        validate(value){
            if(value<0){
                throw new Error("Age must be a positive integer")
            }
        }
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        index:{
            unique:true
        },
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email Address")
            }
        }
    },
    password:{
        type:String,
        required:true,
        minLength:7,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("Password can't contain the word 'password'")
            }
        }
    },
    avatar:{
        type:Buffer,
        required:false
    }
},{
    // adds created at and updated at fields in database
    timestamps:true
})


// adding a virtual relationship between user and task
// not stored in database
// used to easily obtain data automatically
userSchema.virtual('tasks',{
    ref:'Task',
    localField:"_id",
    foreignField:"owner"
}) 


// methods are available on instance of models as well
userSchema.methods.generateAuthToken = async function(){
    const user = this
    // first argument is payload, second is secret  
    const accessToken= jwt.sign({id:user._id.toString()},secretKey,{expiresIn:"1h"})
    const refreshToken= jwt.sign({id:user._id.toString()},secretKey,{expiresIn:"1 week"})
    return {accessToken,refreshToken}

}

// method to return just specific properties back to user
userSchema.methods.getPublicProfile = function () {
    const {name,email,age}= this
    return {name,email,age}
    
}



// static method are available on models
// adding a static method to verify credentials
userSchema.statics.findByCredentials = async(email,password) =>{
    const user = await User.findOne({"email":email})
    if(!user){
        throw new Error("Unable to login")
    }
    const isValidPassword = await bcrpyt.compare(password,user.password)
    if(!isValidPassword){
        throw new Error("Unable to login")
    }
    return user
}


// adding middleware in order to store hashed password in database
// first arguement is name of event
userSchema.pre('save',async function(next){
    // this refers to the user which will now be saved in database
    const user = this

    // only updating password in case it is being modified or saved
    if(user.isModified('password')){
        user.password = await bcrpyt.hash(user.password,8)
    }

    // calling next ensures that data gets saved
    next()
})

// delete user tasks when user is deleted
userSchema.pre("deleteOne",async function(next){
    const user = this
    await Task.deleteMany({"owner":user._id})
    next()
})


// creating user model
const User = mongoose.model('User',userSchema)

module.exports = User