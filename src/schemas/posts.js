//posts

const mongoose = require("mongoose")
const { Schema } = require("mongoose")
const Profile = require("./profiles")
const ProfileModel = mongoose.model("profiles", Profile)

const autopopulate = require("mongoose-autopopulate")

const Comment = new Schema ({
    from: {
        type: Schema.Types.ObjectId,
        ref: ProfileModel,
        required: true,
        autopopulate: {select: '_id name surname'}
    },
    text: {
        type: String,
        required: true
    }
})

Comment.plugin(autopopulate)

const Post = new Schema({
    profileId: {
        type: Schema.Types.ObjectId,
        ref: ProfileModel,
        required: true,
        autopopulate: {select: '_id name surname'}
    },
    username: {
        type: String,
        required: false
    },
    text: {
        type: String,
        required: [function() { return !this.img }, 'Posts need either a message or an image.']
    },
    images: {
        type: [ String ],
        required: [function() { return !this.text }, 'Posts need either an image or a message.']
    },
    likes: {
        type: [Schema.Types.ObjectId],
        autopopulate: {select: '_id name surname'},
        ref: ProfileModel,
        default: []
    },
    comments: {
        type: [Comment],
        default: []
    }
}, {
    timestamps: true
})

Post.plugin(autopopulate)

const PostModel = mongoose.model("posts", Post)
const CommentModel = mongoose.model("comments", Comment)
module.exports = { PostModel, CommentModel } 
