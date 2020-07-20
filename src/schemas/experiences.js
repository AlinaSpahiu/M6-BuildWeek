//experiences

const mongoose = require("mongoose")
const { Schema } = require("mongoose")

// const v = require("validator")

const Experience = new Schema()

const ExperienceModel = mongoose.model("experiences", Experience)
module.exports = ExperienceModel 
