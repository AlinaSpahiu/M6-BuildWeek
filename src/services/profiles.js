//profiles router

const express = require("express")
const Profile = require("../schemas/profiles")
const q2m = require("query-to-mongo")


const router = express.Router()

router.get("/", async (req, res, next) => {
  const parsedQuery = q2m(req.query)
  console.log(parsedQuery)
   try{
       const usersList = await Profile.find(
         parsedQuery.criteria,
         parsedQuery.options.fields
       )
       .sort(parsedQuery.options.sort)
       .skip(parsedQuery.options.skip)
       .limit(parsedQuery.options.limit)
    
       res.send(usersList)
       //http://localhost:3022/users?name=Alina
       //http://localhost:3022/users?age=26
       // mongoDB: {"age": {$gt:26}}
   } catch(error){
     next(error)
   }
   
 })

 // 2. GET one:
router.get("/:id", async (req, res, next) => {
  try{
     const user =   await Profile.findById(req.params.id)
     if(user){res.send(user)}
     else {
       const error = new Error()
       error.httpStatusCode = 404
       next(error)
     }
     console.log(user)
     
     // if we type an id that doesnt exists we get an error : "Cast to ObjectId failed for value "5f04d25ca5688104a848d0d823" at path "_id" for model "user""
  } catch(error){
    next(error)
  }

})

 
// 3. POST:
router.post("/", async (req, res, next) => {
  try{

    const newUser = new Profile(req.body)
    const response = await newUser.save()
    res.send(response)

  } catch(error){
    error.httpStatusCode = 500
    next(error)

  }
  
})

// 4. PUT:
router.put("/:id", async (req, res, next) => {
  try{
    const user =    await Profile.findByIdAndUpdate(req.params.id, req.body)
    console.log(user)
    res.send("Updated")
  }catch(error){
    next(error)

  }

})

// 5. DELETE:
router.delete("/:id", async (req, res, next) => {
  try{
    const user = await Profile.findByIdAndDelete(req.params.id)
    console.log("Deleted!")
    res.send("Deleted!")
  } catch(error){
    next(error)
  }
  
})

module.exports = router