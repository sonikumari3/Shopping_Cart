const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fname : {
        type : String,
        required : true,
        trim : true
    },
    lname :{
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        trim : true,
        unique: true
    },
    profileImage : {
        type : String,
    },
    password : {
        type : String,
        required : true,
        trim : true,

    },
    phone  : {
        type : String,
        required : true,
        unique : true,
        trim : true
        //should be indian
    },
    address : {
        shipping : {
            city : {
                type: String,
                required : true,
                trim : true
            },
            street : {
                type : String,
                required : true,
                trim : true
            },
            pincode : {
                type : Number,
                required : true,
                //should be valid pincode
            }
        },
        billing : {
            city : {
                type: String,
                required : true,
                trim : true
            },
            street : {
                type : String,
                required : true,
                trim : true
            },
            pincode : {
                type : Number,
                required : true,
                //should be valid pincode
            }
        }
    }
    
}, {timestamps : true})

module.exports = new mongoose.model('user', userSchema)