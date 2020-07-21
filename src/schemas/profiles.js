//profiles

const mongoose = require("mongoose")
const { Schema } = require("mongoose")
const v = require("validator")

const Profile = new Schema({
    name:{
        type: String,
        required: true,
    },
    surname:{
        type: String,
        required: true,
     },
    email:{
        type: String,
        required: true,
        lowercase: true, //this is sanitization
        validate:{
         validator: async(value) =>{
           if(!v.isEmail(value)){
             throw new Error("Email not valid!")
           } else {
             // read in the db if the email is in use
             const checkEmail = await ProfileModel.findOne({email:value})
             if(checkEmail){
               throw new Error("email already in use!")
             }
           }
         }
    },
    },
    bio:{
        type: String,
        required: true,
    },
    title:{
        type: Array,
        required: true,
    },
    area:{
        type: String,
        required: true,
    },
    image:{
        type: String
    },
    username:{
        type: String,
        required: true,
    }
})
Profile.set('timestamps', true);


const ProfileModel = mongoose.model("profiles", Profile)
module.exports = ProfileModel 
