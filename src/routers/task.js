const express = require("express")
const Task = require("../models/task")
const auth = require("../middleware/auth")

const router = new express.Router()


// post method to create a task
router.post("/tasks",auth,async (req,res)=>{
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })

    try{
        const data = await task.save()
        res.status(201).send(`Task Created ${task}`)
    }
    catch(err){
        res.status(400)
        res.send(`Error occured! ${err}`)
    }
})

// get method to get all tasks
// /tasks?completed=true or completed=false to get specific tasks
// implemeting pagination using limit and skip query parameter
// /tasks?sortBy=createdAt:desc
router.get("/tasks",auth,async (req,res)=>{
    try{
        // const data = await Task.find({owner:req.user._id})
        // another way of doing the same thing is using the virtual relationship

        const match = {}
        const sort = {}
        if(req.query.completed){
            match.completed = req.query.completed === "true" ? true:false
        }
        if(req.query.sortBy){
            const [sortBy, order] =  req.query.sortBy.split(":")
            sort[sortBy] = order==="asc"? 1 : -1
        }
        
        await req.user.populate({
            path:"tasks",
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip) * parseInt(req.query.limit),
                sort
            }
        })
        res.send(req.user.tasks)
    }
    catch(err){
        res.status(500).send(`${err}`)
    }
})

// get method to get task by ID
router.get("/tasks/:id",auth,async (req,res)=>{
    try{
        const id = req.params.id
        const data = await Task.findOne({"_id":id,owner:req.user._id})
        if(!data){
            return res.status(404).send()
        }
        res.send(data)
    }
    catch(err){
        res.status(500).send("Server Error!")
    }
})

// patch method in order to update tasks information
router.patch("/tasks/:id",auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']

    const isValidOperation = updates.every((val)=>allowedUpdates.includes(val))
    
    if(!isValidOperation){
        return res.status(400).send({"error":"Invalid Updates!"})
    }

    try{
        const task = await Task.findOne({"_id":req.params.id,"owner":req.user._id})
        
        updates.forEach((update)=>task[update] = req.body[update])
        const updatedTask = await new Task(task).save()
        if(!task){
            return res.status(404).send("Task Not Found")
        }
        res.send(updatedTask)
    }
    catch(err){
        res.status(400).send(err)
    }
})

// delete method in order to delete a task by ID
router.delete("/tasks/:id",auth,async (req,res)=>{
    try{
        const id = req.params.id
        const task = await Task.findOneAndDelete({"_id":id,"owner":req.user._id})

        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }
    catch(err){
        res.status(500).send(err)
    }
})


module.exports = router