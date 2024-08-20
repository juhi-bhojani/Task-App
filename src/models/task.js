const mongoose = require("mongoose")

// creating task model with validation and sanitization
// validation ensures that the input of user is as expected
// sanitization allows us to clean up user data before sending to backend

const taskSchema = mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed:{
        type:Boolean,
        required:false,
        default:false
    },
    owner:{
        type:mongoose.Schema.ObjectId,
        required:true,
        // ref is used to create a relationship between task and user and thus making the task of getting user data easier
        ref:"User"
    }
},{
    timestamps:true
})

const Task = mongoose.model("Task",taskSchema)

module.exports = Task