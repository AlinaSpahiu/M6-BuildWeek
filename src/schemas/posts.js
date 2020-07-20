//posts

const mongoose = require("mongoose")
const { Schema } = require("mongoose")

// const v = require("validator")

const Post = new Schema()

const PostModel = mongoose.model("posts", Post)
module.exports = PostModel 
