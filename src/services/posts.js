//posts router

const express = require("express")
const router = express.Router()

const q2m = require("query-to-mongo")
const { body, validationResult } = require("express-validator")

const { PostModel, LikeModel }  = require("../schemas/posts")
const Profile = require("../schemas/profiles")

const Post = PostModel
const Like = LikeModel

const mongoose = require("mongoose")

router.get("/", async(req, res, next) => {

    let query = q2m(req.query)

    let posts = await Post
        .find(query.criteria, query.options.fields)
        .skip(query.options.skip)
        .limit(query.options.limit)

    res.status(200).send(posts)
})

router.get("/:id", async(req,res,next) => {
    try {
        let post = await Post.findById(req.params.id)

        if (post) res.status(200).send(post)
        else throw new Error("Invalid ID")
        
    } catch (error) {
        error.httpStatusCode = 404
        next(error)
    }
})

router.post("/", async(req,res,next) => {
    try {
        delete req.body.likes
        delete req.body.comments

        let newPost = new Post(req.body)
        await newPost.save()
        res.status(200).send(newPost)
    } catch (error) {
        error.httpStatusCode = 500
        next(error)
    }
})

router.get("/:id/likes", async(req,res,next) => {
    try {
        let post = await Post.findById(req.params.id)
        res.status(200).send(post.likes)
    } catch (error) {
        error.httpStatusCode = 404
        next(error)
    }
})

router.post(
    "/:id/like", 
    body('profileId')
        .custom( async pID => { 
            let profile = 
            await Profile.findById(pID) 
            if (profile) return true
            else throw new Error("No profile with this ID")
        }),
    async(req,res,next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          const error = new Error()
          error.httpStatusCode = 400
          error.message = errors
          next(error)
        } else try {
            let post = await Post.findById(req.params.id)
            if (post) { 
                let likeAuthor = mongoose.Types.ObjectId(req.body.profileId)
                let liking = !post.likes.some(like => like._id.toString() === likeAuthor.toString())

                likes = post.likes.map(like => like._id)

                likes = liking ?
                    [...likes, likeAuthor] :
                    likes.filter(like => like.toString() !== likeAuthor.toString())                    

                let updatedPost = await Post.findByIdAndUpdate(req.params.id, { likes })

                if (updatedPost) {
                    res.status(200).send(liking ? "Liked!" : "Unliked")
                } else throw new Error("No clue")

            } else throw new Error("Invalid ID")
        } catch (error) {
            error.httpStatusCode = 400
            next(error)
        }
    }
)

// router.post(
//     "/:id/like", 
//     body('profileId')
//         .custom( async pID => { 
//             let profile = 
//             await Profile.findById(pID) 
//             if (profile) return true
//             else throw new Error("No profile with this ID")
//         }),
//     async(req,res,next) => {
//         const errors = validationResult(req)
//         if (!errors.isEmpty()) {
//           const error = new Error()
//           error.httpStatusCode = 400
//           error.message = errors
//           next(error)
//         } else try {
//             let post = await Post.findById(req.params.id)
//             if (post) { 
//                 let likeAuthor = mongoose.Types.ObjectId(req.body.profileId)
//                 let liking = !post.likes.some(like => like._id.toString() === likeAuthor.toString())

//                 likes = post.likes.map(like => like._id)

//                 likes = liking ?
//                     [...likes, likeAuthor] :
//                     likes.filter(like => like.toString() !== likeAuthor.toString())                    

//                 let updatedPost = await Post.findByIdAndUpdate(req.params.id, { likes })

//                 if (updatedPost) {
//                     res.status(200).send(liking ? "Liked!" : "Unliked")
//                 } else throw new Error("No clue")

//             } else throw new Error("Invalid ID")
//         } catch (error) {
//             error.httpStatusCode = 400
//             next(error)
//         }
//     }
// )

router.put("/:id", async(req,res,next) => {
    try {
        //We don't want POST/PUT requests to interfere with actual likes/comments. 
        delete req.body.likes
        delete req.body.comments

        let updatedPost = await Post.findByIdAndUpdate(
            req.params.id, 
            {
                ...req.body,
            },
            { 
                runValidators: true 
            }
        )

        if (updatedPost) {
            res.status(201).send("Updated.")
        } else throw new Error("Invalid ID!")
    } catch (error) {
        error.httpStatusCode = 404
        next(error)
    }
})

router.delete("/:id", async(req,res,next) => {
    try {
        let deletedPost = await Post.findByIdAndDelete(req.params.id)

        if (deletedPost) res.status(201).send("Deleted.")
        else throw new Error("Invalid ID")
    } catch (error) {
        error.httpStatusCode = 400
        next(error)
    }
})



module.exports = router