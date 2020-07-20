//profiles

const mongoose = require("mongoose")
const { Schema } = require("mongoose")

// const v = require("validator")

const Profile = new Schema()

const ProfileModel = mongoose.model("posts", Profile)
module.exports = ProfileModel 
