// experiences router 

const express = require("express")
const experiencesRouter = express.Router()

const { experiencesModel } = require("../schemas/experiences")

/////////MULTER //////////////////////// DA VERIFICARE E FINIRE /////////////////////

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }).single("demo_image");

experiencesRouter.post("/image", (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(400).send("Image not uploaded");
        }
        res.send(req.file);
    });
});
//////////////////////MULTER////////////////// DA VERIFICARE E FINIRE//////////////////

experiencesRouter.get("/", async (req, res, next) => {
    try {
        const experiences = await experiencesModel.find(req.query).populate("profile?")/////<--profile o id 
        res.send(experiences)
    } catch (error) {
        next(error)
    }
})

experiencesRouter.get("/:id", async (req, res, next) => {
    try {
        const id = req.params.id
        const experience = await experiencesModel.findStudentExperiences(id)
        res.send(experience)
    } catch (error) {
        next(error)
    }
})

experiencesRouter.post("/", async (req, res, next) => {
    try {
        const newexperience = new experiencesModel(req.body)
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