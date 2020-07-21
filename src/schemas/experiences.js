//experiences

const mongoose = require("mongoose")
const { Schema } = require("mongoose")
const ProfileModel = require("../services/profiles")

// const v = require("validator")

const experiencesSchema = new Schema({
    role: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    description: {
        type: String
    },
    area: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false,
        default: "https://via.placeholder.com/150"

    },

    profileId: { type: Schema.Types.ObjectId, ref: ProfileModel }


},

    { timestamps: true }
)


experiencesSchema.static("findStudentExperiences", async function (id) {
    const experience = await experiencesModel.findOne({ _id: id }).populate("profile")/////////////<--profile/id
    return experience
})

experiencesSchema.post("validate", function (error, doc, next) {
    if (error) {
        error.httpStatusCode = 400
        next(error)
    } else {
        next()
    }
})

experiencesSchema.post("save", function (error, doc, next) {
    if (error.name === "MongoError" && error.code === 11000) {
        next(new Error("Error"))
    } else {
        next()
    }
})

const experiencesModel = mongoose.model("Experiences", experiencesSchema)
module.exports = { experiencesModel, experiencesSchema }
