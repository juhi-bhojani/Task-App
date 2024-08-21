const request = require("supertest")
const Task = require("../src/models/task")
const app = require("../src/app")
const {userOne,userOneId,userOneToken,setUpDatabase,userTwoToken} = require("./fixtures/db")

// runs before each and every test suite
beforeEach(setUpDatabase)

test("Should create task for user",async()=>{
    const response = await request(app)
        .post("/tasks")
        .set("Authorization",`Bearer ${userTwoToken}`)
        .send({
            description:"From my Test"
        })
        .expect(201)

    // console.log(response)
    const task = await Task.findById(response._body._id)
    expect(task).not.toBeNull()

})

test("Should return all tasks for user",async()=>{
    const response = await request(app)
        .get("/tasks")
        .set("Authorization",`Bearer ${userOneToken}`)
        .send()
        .expect(200)
    
    const tasks = await Task.find({owner:userOneId})
    expect(tasks.length).toBe(2)
})