// experiences router 

const express = require("express")
const experiencesRouter = express.Router()

const { experiencesModel } = require("../schemas/experiences")



const multer = require('multer');
const upload = multer({})
const path = require("path")
const { writeFile, mkdir } = require("fs-extra")


experiencesRouter.post("/:id/upload", upload.single("image"), async (req, res, next) => {
    try {
        const publicDir = path.join(__dirname, '..', '..', 'public')
        let relDirPath = 'experiences'
        let absDirPath = path.join(publicDir, relDirPath)
        let ext = req.file.originalname.split('.').pop()
        let filename = req.params.id + '.' + ext
        let relFilePath = path.join(relDirPath, filename)
        let absFilePath = path.join(publicDir, relFilePath)

        mkdir(absDirPath, { recursive: true }, (err) => {
            if (err) throw err;
        });
        await writeFile(
            absFilePath,
            req.file.buffer
        )
        const updatedExperience = await experiencesModel.findByIdAndUpdate(req.params.id, { image: relFilePath })
        if (updatedExperience) {
            res.send("Ok")
        } else {
            const error = new Error(`Experience with id ${req.params.id} not found`)
            error.httpStatusCode = 404
            next(error)
        }
    }
    catch (error) {
        error.httpStatusCode = 500
        next(error)
    }

})
experiencesRouter.get("/", async (req, res, next) => {
    try {
        const experiences = await experiencesModel.find({
            profileId: req.profileId
        }).populate("profile?")/////<--profile o id 
        res.send(experiences)
    } catch (error) {
        next(error)
    }
})
const userController = require("../controllers/userController")
experiencesRouter.get('/download', userController.download);

experiencesRouter.get("/:id", async (req, res, next) => {
    try {
        const id = req.params.id
        const experience = await experiencesModel.findStudentExperiences(id)
        res.send(experience)
    } catch
    (error) {
        next(error)
    }
})

experiencesRouter.post("/", async (req, res, next) => {
    try {
        delete req.body.username
        const newexperience = new experiencesModel({
            ...req.body,
            username: 'admin',
            profileId: req.profileId
        })
        const { _id } = await newexperience.save()

        res.status(201).send(_id)
    } catch (error) {
        next(error)
    }
})

experiencesRouter.put("/:id", async (req, res, next) => {
    try {
        const experience = await experiencesModel.findByIdAndUpdate(req.params.id, req.body)
        if (experience) {
            res.send("Ok")
        } else {
            const error = new Error(`Experience with id ${req.params.id} not found`)
            error.httpStatusCode = 404
            next(error)
        }
    } catch (error) {
        error.httpStatusCode = 400
        next(error)
    }
})

experiencesRouter.delete("/:id", async (req, res, next) => {
    try {
        const experience = await experiencesModel.findByIdAndDelete(req.params.id)
        if (experience) {
            res.send("Deleted")
        } else {
            const error = new Error(`Experience with id ${req.params.id} not found`)
            error.httpStatusCode = 404
            next(error)
        }
    } catch (error) {
        next(error)
    }
})

module.exports = experiencesRouter