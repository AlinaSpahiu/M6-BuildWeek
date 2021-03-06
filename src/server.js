const express = require("express")
const cors = require("cors")
const path = require("path")

const dotenv = require("dotenv")
dotenv.config()


const postsService = require("./services/posts")
const profilesService = require("./services/profiles")

const experiencesService = require("./services/experiences")

const { notFoundHandler,forbiddenHandler, 
  unauthorizedHandler, badRequestHandler, genericErrorHandler} = require("./errorsHandler")
const server = express()



server.use(express.json())
server.use(cors())

server.use(
  express.static(
    path.join(__dirname, '../public')
  )
)

const listEndpoints = require("express-list-endpoints")
const mongoose = require("mongoose")



//const publicPath = path.join(__dirname, "../public")
server.use(
  express.static(
      path.join(__dirname, '../public')
  )
)

server.use("/posts", postsService)
server.use("/profiles", profilesService)
server.use("/experiences", experiencesService)
server.use("/download", experiencesService)

//error Handlers
server.use(notFoundHandler)
server.use(badRequestHandler)
server.use(genericErrorHandler)
server.use(forbiddenHandler)
server.use(unauthorizedHandler)
console.log(listEndpoints(server))

const port = process.env.PORT || 5000;


mongoose
  .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@teama.aklwd.gcp.mongodb.net/linkedin?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(
    server.listen(port, () => {
      console.log("Running on port", port)
    })
  )
  .catch((err) => console.log(err))