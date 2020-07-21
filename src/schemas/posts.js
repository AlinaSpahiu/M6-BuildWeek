//posts

const mongoose = require("mongoose")
const { Schema } = require("mongoose")
const ProfileModel = require("./profiles")
const autopopulate = require("mongoose-autopopulate")

// const v = require("validator")

const Like = new Schema ({
        from: {
            type: Schema.Types.ObjectId,
            ref: ProfileModel,
            required: true,
            autopopulate: {select: 'name surname -_id'}
        } 
    },
    {
        _id: false
    }
)

Like.plugin(autopopulate)

const Comment = new Schema ({
    from: {
        type: Schema.Types.ObjectId,
        ref: ProfileModel,
        required: true,
        autopopulate: {select: 'name surname -_id'}
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
        autopopulate: {select: 'name surname -_id'}
    },
    text: {
        type: String,
        required: [function() { return !this.img }, 'Posts need either a message or an image.']
    },
    img: {
        type: String,
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
const LikeModel = mongoose.model("likes", Like)
module.exports = { PostModel, LikeModel, Comment } 
