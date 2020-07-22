const express = require("express")
const cors = require("cors")
const path = require("path")

const dotenv = require("dotenv")
dotenv.config()


const postsService = require("./services/posts")
const profilesService = require("./services/profiles")

const experiencesService = require("./services/experiences")

const errorsHandler = require("./errorsHandler")
const server = express()

server.use(express.json())
server.use(cors())

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

server.use(errorsHandler)
console.log(listEndpoints(server))

const port = process.env.PORT || 5000;


mongoose
  .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@teama.aklwd.gcp.mongodb.net/linkedin?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    server.listen(port, () => {
      console.log("Running on port", port)
    })
  )
  .catch((err) => console.log(err))