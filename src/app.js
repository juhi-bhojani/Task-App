const express = require("express")
// in order to connect to db, requiring the mongoose file
require("./db/mongoose")

const userRouter = require("./routers/user")
const taskRouter = require("./routers/task")

const app = express()

//adding a middleware in application
// app.use((req,res,next)=>{
//     console.log(req.method)
//     next()
// })

// middleware for maintainence mode
// app.use((req,res,next)=>{
//     res.status(503).send("Site under maintainece, please try again later!")
// })


// parse incoming JSON to an object
app.use(express.json())

// register user router
app.use(userRouter)

// register task router
app.use(taskRouter)

module.exports = app