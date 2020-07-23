//profiles router

const express = require("express")
const mongoose = require("mongoose")
const q2m = require("query-to-mongo")
const { Router } = require("express")
const experiencesRouter = require("./experiences")
const multer = require("multer")
const path = require("path")
const fs = require("fs-extra")
const pdfDocument = require("pdfkit")
const pdfPath = path.join(__dirname, "../../public/pdf/profile");
const doc = new pdfDocument()
//const Experiences = require("../schemas/experiences")


const ProfileSchema = require("../schemas/profiles")
const Profile = mongoose.model("profiles", ProfileSchema)

const router = express.Router()

// profile/id/experiences/eid

router.get("/", async (req, res, next) => {
  const parsedQuery = q2m(req.query)
  console.log(parsedQuery)
  try {
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
  } catch (error) {
    error.httpStatusCode = 500
    next(error)
  }

})

// 2. GET one:
router.get("/:id", async (req, res, next) => {
  try {
    const user = await Profile.findById(req.params.id)
    if (user) { res.send(user) }
    else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
    console.log(user)

    // if we type an id that doesnt exists we get an error : "Cast to ObjectId failed for value "5f04d25ca5688104a848d0d823" at path "_id" for model "user""

  } catch (error) {
    next(error)
  }

})

// Get experiences
router.use("/:username/experiences", async function (req, res, next) {
  console.log(req.params.username)
  let profile = await Profile.findOne({
    username: req.params.username
  })
  if (profile) {
    req.profileId = profile._id.toString()
    next()
  }
}, experiencesRouter)

// 3. POST:
router.post("/", async (req, res, next) => {
  try {

    const newUser = new Profile(req.body)
    const response = await newUser.save()
    res.send(response)

  } catch (error) {
    error.httpStatusCode = 500
    next(error)

  }

})

// 4. PUT:
router.put("/:id", async (req, res, next) => {
  try {
    const user = await Profile.findByIdAndUpdate(req.params.id, req.body)
    console.log(user)
    res.send("Updated")
  } catch (error) {
    next(error)

  }

})

// 5. DELETE:
router.delete("/:id", async (req, res, next) => {
  try {
    const user = await Profile.findByIdAndDelete(req.params.id)
    console.log("Deleted!")
    res.send("Deleted!")
  } catch (error) {
    next(error)
  }

})

// 6. UploadImage

const upload = multer({})
const imagePath = path.join(__dirname, "../../public/profiles");


router.post("/:id/upload", upload.single("avatar"), async (req, res, next) => {

  try {

   
    if (req.file) {

      let absDirPath = path.join(imagePath, req.params.id)
      let absFilePath = path.join(absDirPath, req.file.originalname)

      let relFilePath = path.join('profiles', req.params.id, req.file.originalname)
      //linkedin.com/
      //profiles/aisyfa9sd8fy/filename.jpg //DB

      fs.mkdir(absDirPath, { recursive: true }, (err) => {
        if (err) throw err;
      });
  
      //fs.mkdir
      console.log(absFilePath)
      await fs.writeFile(
        absFilePath, req.file.buffer
      )

      let updatedProfile = await Profile.findByIdAndUpdate(req.params.id, {image:relFilePath})

      if (updatedProfile) {
        res.status(200).send("Updated!")
      } else throw new Error("didn't update!")

      res.send("OK")
    } else {
      const err = new Error()
      err.httpStatusCode = 400
      err.message = "Image is missing"
      next(err)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }

})


// pdf

router.get("/:_id/pdf", async (req, res, next) => {
  try{
    const profile = await Profile.findOne({
      _id: req.params._id,
    })


  console.log(req.params.username)
    doc.pipe(fs.createWriteStream(`${profile.name}${profile.surname}.pdf`))
    doc.font("Times-Roman")
    doc.fontSize(20)
    doc.text(`${profile.name} ${profile.surname}`, {
      width: 400,
      align:"center"
    })
    doc.fontSize(15)
    doc.text(` \n\n\nname: ${profile.name} \nsurname:${profile.surname} \nusername: ${profile.username} \nemail: ${profile.email}\nbio: ${profile.bio}\ntitle: ${profile.title} \narea: ${profile.area}`, {
      width: 200,
      align:"left"
    })
    doc.pipe(res)
    doc.end()
    res.send("Done")
    console.log("done")
  }catch(error) {
    next(error)
  }
})





module.exports = router