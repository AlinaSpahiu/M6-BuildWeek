//posts router

const express = require("express")
const router = express.Router()

const q2m = require("query-to-mongo")
const { body, validationResult } = require("express-validator")

const { PostModel, CommentModel }  = require("../schemas/posts")

const Post = PostModel
const Comment = CommentModel

const mongoose = require("mongoose")
const ProfileSchema = require("../schemas/profiles")
const Profile = mongoose.model("profiles", ProfileSchema)

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

router.post("/",
    body('profileId')
        .custom( async pID => { 
            let profile = await Profile.findById(pID) 
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
            delete req.body.likes
            delete req.body.comments

            let newPost = new Post(req.body)
            await newPost.save()
            res.status(200).send(newPost)
        } catch (error) {
            error.httpStatusCode = 500
            next(error)
        }
    }
)

const multer = require('multer');
const upload = multer({})
const path = require("path")
const { writeFile, mkdir } = require("fs-extra")


router.post("/:id/upload", upload.array("images"), async (req, res, next) => {
    try {
        const publicDir = path.join(__dirname, '..', '..', 'public')
        let relDirPath = path.join('posts', req.params.id)
        let absDirPath = path.join(publicDir, relDirPath)
        // let ext = req.file.originalname.split('.').pop()
        let relFilePaths = []

        mkdir(absDirPath, { recursive: true }, (err) => {
            if (err) throw err;
        });
        
        const arrayOfPromises = req.files.map(async (file) => {
            // fs.writeFile(path.join(productsFolderPath, file.originalname), file.buffer)
            let absFilePath = path.join(absDirPath, file.originalname)
            await writeFile(
                absFilePath,
                file.buffer
            )
            relFilePaths.push(relDirPath + '/' + file.originalname)
        })

        await Promise.all(arrayOfPromises)
        
        console.log(relFilePaths)
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, { images: relFilePaths })
        if (updatedPost) {
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

router.get("/:id/likes", async(req,res,next) => {
    try {
        let post = await Post.findById(req.params.id)
        res.status(200).send(post.likes)
    } catch (error) {
        error.httpStatusCode = 404
        next(error)
    }
})

router.get("/:id/comments", async(req,res,next) => {
    try {
        let post = await Post.findById(req.params.id)
        res.status(200).send(post.comments)
    } catch (error) {
        error.httpStatusCode = 404
        next(error)
    }
})

router.get("/:id/comments/:cid", async(req,res,next) => {
    try {
        let post = await Post.findById(req.params.id)
        let comment = post.comments.find( comment => comment._id.toString() === req.params.id)

        if (comment) {
            res.status(200).send(comment)
        } else throw new Error ("Comment not found")
    } catch (error) {
        error.httpStatusCode = 404
        next(error)
    }
})

router.post(
    "/:id/likes", 
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
                let liking = !post.likes.some ( like => 
                    like._id.toString() === likeAuthor.toString()
                )

                likes = post.likes.map(like => like._id) //...because it's getting autopopulated.

                likes = liking ?
                    [...likes, likeAuthor] :
                    likes.filter( like => like.toString() !== likeAuthor.toString() )                    

                let updatedPost = await Post.findByIdAndUpdate(req.params.id, { likes })

                if (updatedPost) {
                    res.status(200).send(liking ? "Liked!" : "Unliked")
                } else throw new Error("Didn't update. Try again later.")

            } else throw new Error("Invalid ID")
        } catch (error) {
            error.httpStatusCode = 400
            next(error)
        }
    }
)

router.post(
    "/:id/comments", 
    [body('profileId')
        .custom( async pID => { 
            let profile = 
            await Profile.findById(pID) 
            if (profile) return true
            else throw new Error("No profile with this ID")
        }),
    body('text').exists().withMessage("Text is required")
    ],
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

                let comment = new Comment({
                    from: req.body.profileId,
                    text: req.body.text
                })

                post.comments.push(comment)

                let updatedPost = await Post.findByIdAndUpdate(req.params.id, post)

                if (updatedPost) {
                    res.status(200).send("Commented")
                } else throw new Error("Didn't update. Try again later.")

            } else throw new Error("Invalid ID")
        } catch (error) {
            error.httpStatusCode = 400
            next(error)
        }
    }
)



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

router.put("/:id/comments/:cid", async(req,res,next)=> {
    try {
        let post = await Post.findById(req.params.id)
        let comments = post.comments

        let editIx = 
            post.comments.findIndex( comment => 
                comment._id.toString() === req.params.cid 
            )

        comments[editIx].text = req.body.text
        
        let updatedPost = await Post.findByIdAndUpdate(req.params.id, { comments })
        
        if (updatedPost) {
            res.status(201).send("Updated comment.")
        } else throw new Error("Invalid comment ID or post ID.")
    } catch (error) {
        error.httpStatusCode = 400
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

router.delete("/:id/comments/:cid", async(req,res,next)=> {
    try {
        let post = await Post.findById(req.params.id)
        post.comments = post.comments.filter( comment => 
            comment._id.toString() !== req.params.cid 
        )
        
        let updatedPost = await Post.findByIdAndUpdate(req.params.id, post)
        
        if (updatedPost) {
            res.status(201).send("Deleted comment.")
        } else throw new Error("Invalid comment ID or post ID.")
    } catch (error) {
        error.httpStatusCode = 400
        next(error)
    }
    
}) 



module.exports = router