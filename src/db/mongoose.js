const mongoose = require("mongoose")
require('dotenv').config({ path: '/home/juhi/Techs/node/task-manager/config/dev.env' })

const connectionURL = process.env.CONNECTIONURL

// mentioning database name along with url string
mongoose.connect(connectionURL + "task-manager-api")



// saves a data and returns a promise
// me.save()
// .then((data)=>{
//     console.log(data)
// })
// .catch((err)=>{
//     console.log(err)
// })

// myTask.save()
// .then((data)=>{
//     console.log(data)
// })
// .catch((err)=>{
//     console.log(err)
// })