const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        unique : true,
        trim : true
    },
     
    description : {
        type : String,
        required : true,
        trim : true
    },

    price : {
        type : Number, 
        required : true,
    },

    currencyId : {
        type : String,
        required : true,
        trim : true
    },

    currencyFormat : {
        type : String,
        required : true,
        trim : true
    },

    isFreeShipping : {
        type : Boolean,
        default : false,
        toLowerCase : true
    },

    productImage : {
        type : String,
        required : true
    },

    style : {
        type : String
    },

    availableSizes : {
        type : [String]
    },

    installement : {
        type : Number,
        default : 0
    },

    deletedAt : {
        type : Date
    },

    isDeleted : {
        type : Boolean,
        default : false
    }
}, {timestamps : true})


module.exports = new mongoose.model('product', productSchema)