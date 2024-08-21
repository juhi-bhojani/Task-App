const request = require("supertest")
const app = require("../src/app")
const User = require("../src/models/user")
const {userOne,userOneId,userOneToken,setUpDatabase} = require("./fixtures/db")


// runs before each and every test suite
beforeEach(setUpDatabase)

// afterEach(()=>{
//     console.log("After Each")
// })

test("Should sign up a new user",async()=>{
    // logs the response 
    const response = await request(app).post("/users").send({
        name:"Juhi",
        email:"juhibhojani.jb@gmail.com",
        password:"12345678"
    }).expect(201)

    // assert that database is changed correctly
    const user = await User.findOne({"email":response._body.user.email})
    expect(user).not.toBeNull()

    // assert that appropriate response is obtained
    expect(response._body).toMatchObject({
        user:{
            name:"Juhi",
            email:"juhibhojani.jb@gmail.com"
        }
    })

    // assert encrypted password is stored
    expect(user.password).not.toBe("12345678")
})

test("Should login existing user",async()=>{
    await request(app).post("/users/login").send({
        email:userOne.email,
        password:userOne.password
    }).expect(200)
})

test("Should not login nonexistent user",async()=>{
    await request(app).post("/users/login").send({
        email:userOne.email,
        password:"12345678"
    }).expect(400)
})

test("Should get profile for user",async()=>{
    await request(app)
        .get("/users/me")
        .set('Authorization',`Bearer ${userOneToken}`)
        .send()
        .expect(200)
})

test("Should not get profile for unauthenticated user",async()=>{
    await request(app)
        .get("/users/me")
        .send()
        .expect(400)
})

test("Should delete account for user",async()=>{
    const response = await request(app)
        .delete("/users/me")
        .set('Authorization',`Bearer ${userOneToken}`)
        .send()
        .expect(200)

    const user = await User.findOne({"email":response._body.email})
    expect(user).toBeNull()
})

test("Should not delete account for unauthenticated user",async()=>{
    await request(app)
        .delete("/users/me")
        .send()
        .expect(400)
})

test("Should upload avatar image",async()=>{
    await request(app)
        .post("/users/me/avatar") 
        .set('Authorization',`Bearer ${userOneToken}`)
        .attach("avatar","tests/fixtures/Untitled.png")
        .expect(200)

    const user = await User.findOne({"_id":userOneId})
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test("Should update valid user fields",async()=>{
    await request(app)
        .patch("/users/me")
        .set('Authorization',`Bearer ${userOneToken}`)
        .send({name:"Mike-2"})
        .expect(200)

    const user = await User.findOne({"_id":userOneId})
    expect(user.name).toBe("Mike-2")
})

test("Should not update invalid user fields",async()=>{
    await request(app)
        .patch("/users/me")
        .set('Authorization',`Bearer ${userOneToken}`)
        .send({location:"Gandhinagar"})
        .expect(400)

})