//posts router

const express = require("express")
const router = express.Router()

const q2m = require("query-to-mongo")

const Post = require("../schemas/posts")

router.get("/", async(req,res,next) => {

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

router.put("/:id", async(req,res,next) => {
    try {
        
    } catch (error) {
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