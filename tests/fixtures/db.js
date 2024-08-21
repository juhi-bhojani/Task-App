const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const User = require("../../src/models/user")
const Task = require("../../src/models/task")
require('dotenv').config()


const secretKey = process.env.SECRETKEY

const userOneId =  new mongoose.Types.ObjectId()
const userOne = {
    _id:userOneId,
    name:'Mike',
    email:"mike@example.com",
    password:"what1234!"
}
const userOneToken = jwt.sign({id:userOneId.toString()},secretKey,{expiresIn:"1h"})


const userTwoId =  new mongoose.Types.ObjectId()
const userTwo = {
    _id:userTwoId,
    name:'Grey',
    email:"grey@example.com",
    password:"what1234!"
}
const userTwoToken = jwt.sign({id:userTwoId.toString()},secretKey,{expiresIn:"1h"})

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description:"First Task",
    completed:false,
    owner:userOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description:"Second Task",
    completed:true,
    owner:userOneId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description:"Three Task",
    completed:true,
    owner:userTwoId 
}

const setUpDatabase = async() =>{
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
} 

module.exports = {
    userOneId,
    userOneToken,
    userOne,
    userTwo,
    userTwoId,
    userTwoToken,
    setUpDatabase
}